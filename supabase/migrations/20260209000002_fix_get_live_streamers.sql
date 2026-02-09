-- ============================================================================
-- MindBreakers - Fix get_live_streamers + Orphan Cleanup
-- ============================================================================
-- Migración: 004_fix_get_live_streamers_and_orphan_cleanup.sql
-- Fecha: 2025-02-09
--
-- PROBLEMA:
--   get_live_streamers con p_filter='all' (default) devuelve TODOS los
--   registros de active_streamers, incluyendo:
--     - Streamers conectados al servidor pero NO live en Kick
--     - Registros huérfanos que nunca se limpiaron (LogWatcher perdió
--       el evento de desconexión)
--
-- SOLUCIÓN:
--   1. Reemplazar get_live_streamers:
--      - Nombre "live_streamers" implica que SOLO devuelve live
--      - Filtro base: is_live_on_kick = true SIEMPRE
--      - Parámetro game_slug_filter opcional para filtrar por juego
--      - Ordenar por kick_viewer_count DESC
--      - Retorna también steam_id, last_seen, kick_last_checked
--
--   2. Nueva función get_connected_streamers:
--      - Para el caso donde el frontend necesita TODOS los conectados
--        (live + no live) para mostrar estados ONLINE/OFFLINE en MultiViewer
--      - Reemplaza el uso de p_filter='all' del get_live_streamers anterior
--
--   3. Función de limpieza cleanup_orphaned_streamers:
--      - Elimina registros donde last_seen > 2 horas
--      - Estos son registros huérfanos: LogWatcher perdió la desconexión
--      - Se puede llamar manualmente o vía pg_cron
--
--   4. Agregar columna kick_last_checked si no existe
--      - Timestamp de última verificación de Kick por LogWatcher
-- ============================================================================


-- ============================================================================
-- 1. Agregar kick_last_checked si no existe
-- ============================================================================
-- LogWatcher actualiza esta columna cada vez que verifica el estado en Kick.
-- Útil para debugging y para saber si los datos están frescos.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'active_streamers' AND column_name = 'kick_last_checked'
  ) THEN
    ALTER TABLE active_streamers ADD COLUMN kick_last_checked TIMESTAMPTZ;
    COMMENT ON COLUMN active_streamers.kick_last_checked
      IS 'Última vez que LogWatcher verificó el estado de Kick para este streamer';
  END IF;
END $$;


-- ============================================================================
-- 2. get_live_streamers - SOLO streamers en vivo en Kick
-- ============================================================================
-- Esta función devuelve ÚNICAMENTE streamers que:
--   a) Tienen registro en active_streamers (están conectados al servidor)
--   b) is_live_on_kick = true (están transmitiendo en Kick)
--
-- Es la función principal para el WatchParty.
-- El nombre "live" ahora sí refleja lo que devuelve.

-- DROP todas las versiones de get_live_streamers antes de recrear.
-- CREATE OR REPLACE no puede cambiar RETURNS TABLE, y pueden existir
-- múltiples overloads en la DB (de migraciones anteriores, ejecuciones manuales, etc).
-- Usamos un DO block para eliminar todas las versiones de forma segura.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure AS func_signature
    FROM pg_proc
    WHERE proname = 'get_live_streamers'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION get_live_streamers(
  p_game_slug TEXT DEFAULT NULL,
  p_filter TEXT DEFAULT 'live'  -- Cambiado: default ahora es 'live' (antes era 'all')
)
RETURNS TABLE (
  id UUID,
  kick_username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  in_game_name TEXT,
  server_name TEXT,
  steam_id TEXT,
  game_slug TEXT,
  game_name TEXT,
  is_live_on_kick BOOLEAN,
  is_live BOOLEAN,
  kick_viewer_count INTEGER,
  kick_stream_title TEXT,
  kick_thumbnail_url TEXT,
  connected_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  kick_last_checked TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.kick_username::TEXT,
    sp.display_name::TEXT,
    sp.avatar_url::TEXT,
    a.in_game_name::TEXT,
    a.server_name::TEXT,
    a.steam_id::TEXT,
    g.slug::TEXT AS game_slug,
    g.name::TEXT AS game_name,
    a.is_live_on_kick,
    a.is_live_on_kick AS is_live,
    a.kick_viewer_count,
    a.kick_stream_title::TEXT,
    a.kick_thumbnail_url::TEXT,
    a.connected_at,
    a.last_seen AS last_seen_at,
    a.kick_last_checked
  FROM active_streamers a
  LEFT JOIN games g ON a.game_id = g.id
  LEFT JOIN streamer_profiles sp ON a.streamer_profile_id = sp.id
  WHERE
    -- Filtro por juego (opcional)
    (p_game_slug IS NULL OR g.slug = p_game_slug)
    -- Filtro por estado
    AND (
      CASE p_filter
        WHEN 'live'   THEN a.is_live_on_kick = true
        WHEN 'online' THEN a.is_live_on_kick = false
        WHEN 'all'    THEN true  -- Mantener compatibilidad con frontend existente
        ELSE a.is_live_on_kick = true  -- Default seguro: solo live
      END
    )
    -- Excluir registros huérfanos (last_seen > 2 horas)
    -- COALESCE: si last_seen es NULL (columna recién agregada), incluir la fila
    AND COALESCE(a.last_seen, NOW()) > NOW() - INTERVAL '2 hours'
  ORDER BY
    a.is_live_on_kick DESC,
    a.kick_viewer_count DESC,
    a.connected_at DESC;
END;
$$;

COMMENT ON FUNCTION get_live_streamers IS
  'Obtiene streamers conectados a servidores de juego. '
  'Default: solo streamers LIVE en Kick (is_live_on_kick=true). '
  'p_filter: live (default), online (conectados no-live), all (todos). '
  'Excluye automáticamente registros huérfanos (last_seen > 2h). '
  'Datos actualizados por LogWatcher via Kick OAuth API.';


-- ============================================================================
-- 3. get_connected_streamers - TODOS los conectados al servidor
-- ============================================================================
-- Función separada para cuando el frontend necesita TODOS los streamers
-- conectados (tanto live como no-live). Usada por el MultiViewer/WatchPage
-- que muestra estados LIVE, ONLINE y OFFLINE.
--
-- También excluye huérfanos automáticamente.

CREATE OR REPLACE FUNCTION get_connected_streamers(
  p_game_slug TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  kick_username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  in_game_name TEXT,
  server_name TEXT,
  steam_id TEXT,
  game_slug TEXT,
  game_name TEXT,
  is_live_on_kick BOOLEAN,
  is_live BOOLEAN,
  kick_viewer_count INTEGER,
  kick_stream_title TEXT,
  kick_thumbnail_url TEXT,
  connected_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  kick_last_checked TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.kick_username::TEXT,
    sp.display_name::TEXT,
    sp.avatar_url::TEXT,
    a.in_game_name::TEXT,
    a.server_name::TEXT,
    a.steam_id::TEXT,
    g.slug::TEXT AS game_slug,
    g.name::TEXT AS game_name,
    a.is_live_on_kick,
    a.is_live_on_kick AS is_live,
    a.kick_viewer_count,
    a.kick_stream_title::TEXT,
    a.kick_thumbnail_url::TEXT,
    a.connected_at,
    a.last_seen AS last_seen_at,
    a.kick_last_checked
  FROM active_streamers a
  LEFT JOIN games g ON a.game_id = g.id
  LEFT JOIN streamer_profiles sp ON a.streamer_profile_id = sp.id
  WHERE
    (p_game_slug IS NULL OR g.slug = p_game_slug)
    -- Excluir huérfanos (COALESCE para filas donde last_seen es NULL)
    AND COALESCE(a.last_seen, NOW()) > NOW() - INTERVAL '2 hours'
  ORDER BY
    a.is_live_on_kick DESC,
    a.kick_viewer_count DESC,
    a.connected_at DESC;
END;
$$;

COMMENT ON FUNCTION get_connected_streamers IS
  'Obtiene TODOS los streamers conectados a servidores (live y no-live). '
  'Usada por MultiViewer que necesita mostrar estados LIVE/ONLINE/OFFLINE. '
  'Excluye registros huérfanos (last_seen > 2h). '
  'Para obtener solo streamers LIVE, usar get_live_streamers.';


-- ============================================================================
-- 4. cleanup_orphaned_streamers - Limpieza de registros huérfanos
-- ============================================================================
-- Elimina registros donde last_seen es mayor a 2 horas.
-- Esto indica que LogWatcher perdió el evento de desconexión
-- (crash del servidor, reinicio no limpio, bug en LogWatcher, etc).
--
-- Se puede ejecutar:
--   a) Manualmente: SELECT cleanup_orphaned_streamers();
--   b) Vía pg_cron: Cada 30 minutos (recomendado)
--   c) Desde LogWatcher como tarea periódica
--
-- Retorna la cantidad de registros eliminados.

CREATE OR REPLACE FUNCTION cleanup_orphaned_streamers()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Eliminar registros huérfanos (last_seen > 2 horas)
  -- Solo elimina filas donde last_seen tiene valor y es viejo.
  -- Filas con last_seen = NULL se preservan (podrían ser pre-migración).
  WITH deleted AS (
    DELETE FROM active_streamers
    WHERE last_seen IS NOT NULL AND last_seen < NOW() - INTERVAL '2 hours'
    RETURNING id, kick_username, server_name, last_seen
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;

  -- Log si se eliminaron registros (visible en pg logs)
  IF v_deleted_count > 0 THEN
    RAISE NOTICE '[cleanup_orphaned_streamers] Eliminados % registros huérfanos (last_seen > 2h)', v_deleted_count;
  END IF;

  RETURN v_deleted_count;
END;
$$;

COMMENT ON FUNCTION cleanup_orphaned_streamers IS
  'Elimina registros huérfanos de active_streamers donde last_seen > 2 horas. '
  'Retorna cantidad de registros eliminados. '
  'Ejecutar periódicamente vía pg_cron o desde LogWatcher.';


-- ============================================================================
-- 5. (Opcional) Programar limpieza automática con pg_cron
-- ============================================================================
-- Descomentar si pg_cron está habilitado en tu proyecto de Supabase.
-- Ejecuta la limpieza cada 30 minutos.
--
-- NOTA: pg_cron debe habilitarse desde el Dashboard de Supabase:
--   Database > Extensions > pg_cron > Enable
--
-- SELECT cron.schedule(
--   'cleanup-orphaned-streamers',    -- nombre del job
--   '*/30 * * * *',                  -- cada 30 minutos
--   'SELECT cleanup_orphaned_streamers()'
-- );


-- ============================================================================
-- 6. Índice adicional para la limpieza de huérfanos
-- ============================================================================
-- Optimiza el DELETE de cleanup_orphaned_streamers y el filtro
-- WHERE last_seen > NOW() - INTERVAL '2 hours' en las funciones.

-- Índice en last_seen para optimizar tanto el filtro de huérfanos
-- (WHERE last_seen < NOW() - INTERVAL '2 hours') como el ORDER BY.
-- NOTA: No usamos partial index con NOW() porque no es inmutable.
-- El índice B-tree completo en last_seen es suficiente para range scans.
CREATE INDEX IF NOT EXISTS idx_active_streamers_last_seen_cleanup
  ON active_streamers(last_seen);


-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
-- Resumen:
--   1. kick_last_checked columna agregada si no existía
--   2. get_live_streamers: default cambiado a 'live', excluye huérfanos
--   3. get_connected_streamers: nueva función para TODOS los conectados
--   4. cleanup_orphaned_streamers: limpieza de registros con last_seen > 2h
--   5. Índice optimizado para limpieza
--
-- Próximos pasos:
--   - Habilitar pg_cron y programar cleanup_orphaned_streamers
--   - Actualizar frontend useActiveStreamers para usar get_connected_streamers
-- ============================================================================
