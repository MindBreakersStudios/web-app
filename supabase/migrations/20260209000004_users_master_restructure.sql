-- ============================================================================
-- MindBreakers - Reestructuración del Schema v2 (Players como tabla central)
-- ============================================================================
-- Migración: 006_players_restructure.sql
-- Fecha: 2026-02-09
--
-- ARQUITECTURA:
--   auth.users ← users (perfiles web) ← players (jugadores servidor)
--
--   - auth.users: Sistema de Supabase Auth (usuarios logueados)
--   - users: Extiende auth.users con datos de perfil (FK obligatorio)
--   - players: TODOS los jugadores del servidor (por steam_id, sin auth requerido)
--   - connected_players: Jugadores actualmente conectados
--
-- RELACIONES:
--   - players.user_id → users.id (NULLABLE, se linkea si el jugador tiene cuenta web)
--   - connected_players.player_id → players.id
--
-- BENEFICIOS:
--   - Jugadores pueden existir sin cuenta web (solo steam_id del log)
--   - Cuando se registran en la web y vinculan Steam, se linkea automáticamente
--   - Streamers son un flag en players, no una tabla separada
-- ============================================================================


-- ============================================================================
-- 1. CREAR TABLA PLAYERS
-- ============================================================================
-- Tabla central para TODOS los jugadores que se conectan a servidores.
-- No requiere auth - se crea automáticamente cuando el LogWatcher detecta conexión.

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificador principal (del log del servidor)
  steam_id TEXT UNIQUE NOT NULL,
  
  -- Vinculación opcional con usuario autenticado
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Datos básicos del jugador
  in_game_name TEXT,                    -- Último nombre usado en servidor
  avatar_url TEXT,                       -- Avatar (puede venir de Steam o de user)
  
  -- Datos de streamer
  is_streamer BOOLEAN DEFAULT FALSE,
  streamer_verified BOOLEAN DEFAULT FALSE,
  streaming_platform TEXT,               -- kick, twitch, youtube
  kick_username TEXT,
  twitch_username TEXT,
  youtube_channel_id TEXT,
  display_name TEXT,                     -- Nombre para mostrar (override)
  
  -- Timestamps
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  streamer_registered_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT players_streaming_platform_check 
    CHECK (streaming_platform IS NULL OR streaming_platform IN ('kick', 'twitch', 'youtube'))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_players_steam_id ON players(steam_id);
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_is_streamer ON players(is_streamer) WHERE is_streamer = TRUE;
CREATE INDEX IF NOT EXISTS idx_players_kick_username ON players(kick_username) WHERE kick_username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_last_seen ON players(last_seen_at);

-- Comentarios
COMMENT ON TABLE players IS 'Todos los jugadores que se han conectado a servidores MindBreakers. Identificados por Steam ID.';
COMMENT ON COLUMN players.steam_id IS 'Steam ID 64-bit del jugador (identificador principal)';
COMMENT ON COLUMN players.user_id IS 'Referencia a users si el jugador tiene cuenta web (se linkea automáticamente por steam_id)';
COMMENT ON COLUMN players.is_streamer IS 'True si el jugador es parte del programa de streamers';
COMMENT ON COLUMN players.display_name IS 'Nombre para mostrar (override sobre in_game_name)';


-- ============================================================================
-- 2. CREAR TABLA CONNECTED_PLAYERS
-- ============================================================================
-- Jugadores actualmente conectados a un servidor.
-- Manejada por LogWatcher - INSERT on connect, DELETE on disconnect.

CREATE TABLE IF NOT EXISTS connected_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación con player
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  steam_id TEXT NOT NULL,  -- Duplicado para queries rápidas
  
  -- Datos del servidor
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  server_id UUID REFERENCES servers(id) ON DELETE SET NULL,
  server_name TEXT NOT NULL,
  in_game_name TEXT NOT NULL,
  
  -- Estado de streaming (solo relevante si player.is_streamer = true)
  is_live BOOLEAN DEFAULT FALSE,
  viewer_count INTEGER DEFAULT 0,
  stream_title TEXT,
  stream_thumbnail_url TEXT,
  streaming_platform TEXT,  -- De dónde viene el live actual
  
  -- Timestamps
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un jugador solo puede estar conectado una vez por juego
  CONSTRAINT connected_players_steam_game_unique UNIQUE(steam_id, game_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_connected_players_player ON connected_players(player_id);
CREATE INDEX IF NOT EXISTS idx_connected_players_steam ON connected_players(steam_id);
CREATE INDEX IF NOT EXISTS idx_connected_players_game ON connected_players(game_id);
CREATE INDEX IF NOT EXISTS idx_connected_players_live ON connected_players(is_live) WHERE is_live = TRUE;
CREATE INDEX IF NOT EXISTS idx_connected_players_last_seen ON connected_players(last_seen);

-- Comentarios
COMMENT ON TABLE connected_players IS 'Jugadores actualmente conectados a servidores. Manejada por LogWatcher.';
COMMENT ON COLUMN connected_players.player_id IS 'Referencia al jugador en la tabla players';
COMMENT ON COLUMN connected_players.is_live IS 'True si el jugador es streamer Y está transmitiendo en vivo';


-- ============================================================================
-- 3. RLS POLICIES
-- ============================================================================

-- Players: lectura pública, escritura solo service_role
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'players' AND policyname = 'Anyone can view players'
  ) THEN
    CREATE POLICY "Anyone can view players"
      ON players FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'players' AND policyname = 'Service role can manage players'
  ) THEN
    CREATE POLICY "Service role can manage players"
      ON players FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- Connected Players: lectura pública, escritura solo service_role
ALTER TABLE connected_players ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'connected_players' AND policyname = 'Anyone can view connected players'
  ) THEN
    CREATE POLICY "Anyone can view connected players"
      ON connected_players FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'connected_players' AND policyname = 'Service role can manage connected players'
  ) THEN
    CREATE POLICY "Service role can manage connected players"
      ON connected_players FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;


-- ============================================================================
-- 4. AUTO-LINK TRIGGER: users ↔ players
-- ============================================================================
-- Cuando un usuario actualiza su steam_id, buscar en players y linkear.
-- Cuando se crea un player, buscar si existe un user con ese steam_id.

-- Función: Linkear player cuando user actualiza steam_id
CREATE OR REPLACE FUNCTION link_player_on_user_steam_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Si el user ahora tiene steam_id
  IF NEW.steam_id IS NOT NULL THEN
    -- Buscar player con ese steam_id y linkearlo
    UPDATE players
    SET user_id = NEW.id
    WHERE steam_id = NEW.steam_id
      AND (user_id IS NULL OR user_id != NEW.id);
    
    IF FOUND THEN
      RAISE NOTICE '[auto-link] Player con steam_id % vinculado a user %', NEW.steam_id, NEW.id;
    END IF;
  END IF;
  
  -- Si el user cambió su steam_id (tenía otro antes), deslinkear el anterior
  IF OLD.steam_id IS NOT NULL AND OLD.steam_id != COALESCE(NEW.steam_id, '') THEN
    UPDATE players
    SET user_id = NULL
    WHERE steam_id = OLD.steam_id
      AND user_id = OLD.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger en users
DROP TRIGGER IF EXISTS trigger_link_player_on_user_steam_update ON users;
CREATE TRIGGER trigger_link_player_on_user_steam_update
  AFTER INSERT OR UPDATE OF steam_id ON users
  FOR EACH ROW
  EXECUTE FUNCTION link_player_on_user_steam_update();

-- Función: Buscar user cuando se crea player con steam_id
CREATE OR REPLACE FUNCTION link_user_on_player_create()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Solo si el player no tiene user_id y tiene steam_id
  IF NEW.user_id IS NULL AND NEW.steam_id IS NOT NULL THEN
    -- Buscar user con ese steam_id
    SELECT id INTO v_user_id
    FROM users
    WHERE steam_id = NEW.steam_id
    LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
      NEW.user_id := v_user_id;
      RAISE NOTICE '[auto-link] Nuevo player % vinculado a user existente %', NEW.steam_id, v_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger en players (BEFORE INSERT para poder modificar NEW)
DROP TRIGGER IF EXISTS trigger_link_user_on_player_create ON players;
CREATE TRIGGER trigger_link_user_on_player_create
  BEFORE INSERT ON players
  FOR EACH ROW
  EXECUTE FUNCTION link_user_on_player_create();


-- ============================================================================
-- 5. MIGRAR DATOS DE STREAMER_PROFILES → PLAYERS
-- ============================================================================

INSERT INTO players (
  steam_id,
  user_id,
  in_game_name,
  avatar_url,
  is_streamer,
  streamer_verified,
  streaming_platform,
  kick_username,
  display_name,
  first_seen_at,
  last_seen_at,
  streamer_registered_at
)
SELECT 
  sp.steam_id,
  u.id AS user_id,  -- Se linkea si existe user con mismo steam_id
  sp.kick_username AS in_game_name,  -- Fallback
  sp.avatar_url,
  TRUE AS is_streamer,
  TRUE AS streamer_verified,  -- Ya estaban registrados
  'kick' AS streaming_platform,
  sp.kick_username,
  sp.display_name,
  sp.created_at AS first_seen_at,
  COALESCE(sp.updated_at, sp.created_at) AS last_seen_at,
  sp.created_at AS streamer_registered_at
FROM streamer_profiles sp
LEFT JOIN users u ON u.steam_id = sp.steam_id
WHERE sp.steam_id IS NOT NULL
ON CONFLICT (steam_id) DO UPDATE SET
  is_streamer = TRUE,
  streamer_verified = TRUE,
  kick_username = EXCLUDED.kick_username,
  display_name = COALESCE(players.display_name, EXCLUDED.display_name),
  streaming_platform = COALESCE(players.streaming_platform, EXCLUDED.streaming_platform);


-- ============================================================================
-- 6. MIGRAR DATOS DE ACTIVE_STREAMERS → CONNECTED_PLAYERS
-- ============================================================================

-- Primero asegurar que existen los players
INSERT INTO players (steam_id, in_game_name, first_seen_at, last_seen_at)
SELECT DISTINCT
  a.steam_id,
  a.in_game_name,
  a.connected_at,
  COALESCE(a.last_seen, a.connected_at)
FROM active_streamers a
WHERE a.steam_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.steam_id = a.steam_id)
ON CONFLICT (steam_id) DO NOTHING;

-- Ahora migrar conexiones activas
INSERT INTO connected_players (
  player_id,
  steam_id,
  game_id,
  server_id,
  server_name,
  in_game_name,
  is_live,
  viewer_count,
  stream_title,
  stream_thumbnail_url,
  streaming_platform,
  connected_at,
  last_seen
)
SELECT 
  p.id AS player_id,
  a.steam_id,
  a.game_id,
  a.server_id,
  a.server_name,
  a.in_game_name,
  COALESCE(a.is_live_on_kick, FALSE),
  COALESCE(a.kick_viewer_count, 0),
  a.kick_stream_title,
  a.kick_thumbnail_url,
  'kick',
  a.connected_at,
  COALESCE(a.last_seen, a.connected_at)
FROM active_streamers a
JOIN players p ON p.steam_id = a.steam_id
WHERE a.last_seen > NOW() - INTERVAL '2 hours'  -- Solo conexiones recientes
ON CONFLICT (steam_id, game_id) DO NOTHING;


-- ============================================================================
-- 7. FUNCIONES RPC
-- ============================================================================

-- Limpiar funciones anteriores
DROP FUNCTION IF EXISTS get_live_streamers(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_live_streamers(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_connected_streamers() CASCADE;
DROP FUNCTION IF EXISTS get_registered_streamers(BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS get_active_streamers(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_connected_players(TEXT) CASCADE;
DROP FUNCTION IF EXISTS cleanup_orphaned_streamers() CASCADE;
DROP FUNCTION IF EXISTS cleanup_orphaned_connections() CASCADE;


-- ----------------------------------------
-- get_active_streamers: Streamers LIVE en servidor
-- ----------------------------------------
-- Para WatchParty: streamers que están conectados Y transmitiendo

CREATE OR REPLACE FUNCTION get_active_streamers(
  p_game_slug TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  player_id UUID,
  steam_id TEXT,
  user_id UUID,
  -- Datos del jugador/streamer
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  kick_username TEXT,
  twitch_username TEXT,
  streaming_platform TEXT,
  -- Datos del servidor
  game_id UUID,
  game_slug TEXT,
  game_name TEXT,
  server_name TEXT,
  in_game_name TEXT,
  -- Datos del stream
  is_live BOOLEAN,
  viewer_count INTEGER,
  stream_title TEXT,
  stream_thumbnail_url TEXT,
  -- Timestamps
  connected_at TIMESTAMPTZ,
  last_seen TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.player_id,
    cp.steam_id,
    p.user_id,
    -- Datos del jugador
    COALESCE(u.username, p.kick_username, p.in_game_name)::TEXT AS username,
    COALESCE(p.display_name, u.username, p.kick_username, p.in_game_name)::TEXT AS display_name,
    COALESCE(p.avatar_url, u.avatar_url)::TEXT AS avatar_url,
    p.kick_username,
    p.twitch_username,
    COALESCE(cp.streaming_platform, p.streaming_platform)::TEXT AS streaming_platform,
    -- Servidor
    cp.game_id,
    g.slug::TEXT AS game_slug,
    g.name::TEXT AS game_name,
    cp.server_name,
    cp.in_game_name,
    -- Stream
    cp.is_live,
    cp.viewer_count,
    cp.stream_title,
    cp.stream_thumbnail_url,
    -- Timestamps
    cp.connected_at,
    cp.last_seen
  FROM connected_players cp
  JOIN players p ON cp.player_id = p.id
  LEFT JOIN users u ON p.user_id = u.id
  LEFT JOIN games g ON cp.game_id = g.id
  WHERE 
    cp.is_live = TRUE
    AND p.is_streamer = TRUE
    AND (p_game_slug IS NULL OR g.slug = p_game_slug)
    AND cp.last_seen > NOW() - INTERVAL '2 hours'
  ORDER BY
    cp.viewer_count DESC NULLS LAST,
    cp.connected_at DESC;
END;
$$;

COMMENT ON FUNCTION get_active_streamers IS 
  'Streamers que están LIVE y conectados al servidor. Endpoint principal para WatchParty.';


-- ----------------------------------------
-- get_connected_players: TODOS los conectados
-- ----------------------------------------
-- Para Admin: todos los jugadores conectados (streamers y no-streamers)

CREATE OR REPLACE FUNCTION get_connected_players(
  p_game_slug TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  player_id UUID,
  steam_id TEXT,
  user_id UUID,
  -- Datos del jugador
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  is_streamer BOOLEAN,
  kick_username TEXT,
  -- Datos del servidor
  game_id UUID,
  game_slug TEXT,
  game_name TEXT,
  server_name TEXT,
  in_game_name TEXT,
  -- Estado de streaming
  is_live BOOLEAN,
  viewer_count INTEGER,
  stream_title TEXT,
  streaming_platform TEXT,
  -- Timestamps
  connected_at TIMESTAMPTZ,
  last_seen TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.player_id,
    cp.steam_id,
    p.user_id,
    -- Jugador
    COALESCE(u.username, p.kick_username, p.in_game_name)::TEXT AS username,
    COALESCE(p.display_name, p.in_game_name)::TEXT AS display_name,
    COALESCE(p.avatar_url, u.avatar_url)::TEXT AS avatar_url,
    p.is_streamer,
    p.kick_username,
    -- Servidor
    cp.game_id,
    g.slug::TEXT AS game_slug,
    g.name::TEXT AS game_name,
    cp.server_name,
    cp.in_game_name,
    -- Stream
    cp.is_live,
    cp.viewer_count,
    cp.stream_title,
    cp.streaming_platform,
    -- Timestamps
    cp.connected_at,
    cp.last_seen
  FROM connected_players cp
  JOIN players p ON cp.player_id = p.id
  LEFT JOIN users u ON p.user_id = u.id
  LEFT JOIN games g ON cp.game_id = g.id
  WHERE 
    (p_game_slug IS NULL OR g.slug = p_game_slug)
    AND cp.last_seen > NOW() - INTERVAL '2 hours'
  ORDER BY
    cp.is_live DESC,
    p.is_streamer DESC,
    cp.connected_at DESC;
END;
$$;

COMMENT ON FUNCTION get_connected_players IS 
  'Todos los jugadores conectados. Para panel de admin.';


-- ----------------------------------------
-- get_registered_streamers: Roster completo
-- ----------------------------------------
-- Lista de todos los streamers registrados en el programa

CREATE OR REPLACE FUNCTION get_registered_streamers(
  p_verified_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  steam_id TEXT,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  kick_username TEXT,
  twitch_username TEXT,
  youtube_channel_id TEXT,
  streaming_platform TEXT,
  is_verified BOOLEAN,
  registered_at TIMESTAMPTZ,
  -- Estado actual
  is_currently_connected BOOLEAN,
  is_currently_live BOOLEAN,
  current_game_slug TEXT,
  current_viewer_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.steam_id,
    p.user_id,
    COALESCE(u.username, p.kick_username, p.in_game_name)::TEXT AS username,
    COALESCE(p.display_name, p.kick_username, p.in_game_name)::TEXT AS display_name,
    COALESCE(p.avatar_url, u.avatar_url)::TEXT AS avatar_url,
    p.kick_username,
    p.twitch_username,
    p.youtube_channel_id,
    p.streaming_platform,
    COALESCE(p.streamer_verified, FALSE) AS is_verified,
    p.streamer_registered_at AS registered_at,
    -- Estado actual
    (cp.id IS NOT NULL) AS is_currently_connected,
    COALESCE(cp.is_live, FALSE) AS is_currently_live,
    g.slug::TEXT AS current_game_slug,
    COALESCE(cp.viewer_count, 0) AS current_viewer_count
  FROM players p
  LEFT JOIN users u ON p.user_id = u.id
  LEFT JOIN connected_players cp ON cp.player_id = p.id 
    AND cp.last_seen > NOW() - INTERVAL '2 hours'
  LEFT JOIN games g ON cp.game_id = g.id
  WHERE 
    p.is_streamer = TRUE
    AND (NOT p_verified_only OR p.streamer_verified = TRUE)
  ORDER BY
    COALESCE(cp.is_live, FALSE) DESC,
    (cp.id IS NOT NULL) DESC,
    COALESCE(cp.viewer_count, 0) DESC,
    p.display_name ASC NULLS LAST;
END;
$$;

COMMENT ON FUNCTION get_registered_streamers IS 
  'Todos los streamers registrados. Incluye estado actual (conectado/live).';


-- ----------------------------------------
-- cleanup_orphaned_connections: Limpieza
-- ----------------------------------------

CREATE OR REPLACE FUNCTION cleanup_orphaned_connections()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM connected_players
    WHERE last_seen < NOW() - INTERVAL '2 hours'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;

  IF v_deleted_count > 0 THEN
    RAISE NOTICE '[cleanup] Eliminados % registros huérfanos', v_deleted_count;
  END IF;

  RETURN v_deleted_count;
END;
$$;


-- ----------------------------------------
-- get_or_create_player: Helper para LogWatcher
-- ----------------------------------------
-- Obtiene o crea un player por steam_id

CREATE OR REPLACE FUNCTION get_or_create_player(
  p_steam_id TEXT,
  p_in_game_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_id UUID;
BEGIN
  -- Intentar obtener existente
  SELECT id INTO v_player_id
  FROM players
  WHERE steam_id = p_steam_id;
  
  -- Si no existe, crear
  IF v_player_id IS NULL THEN
    INSERT INTO players (steam_id, in_game_name, first_seen_at, last_seen_at)
    VALUES (p_steam_id, p_in_game_name, NOW(), NOW())
    RETURNING id INTO v_player_id;
  ELSE
    -- Actualizar last_seen y nombre si se proporcionó
    UPDATE players
    SET 
      last_seen_at = NOW(),
      in_game_name = COALESCE(p_in_game_name, in_game_name)
    WHERE id = v_player_id;
  END IF;
  
  RETURN v_player_id;
END;
$$;

COMMENT ON FUNCTION get_or_create_player IS 
  'Obtiene o crea un player por steam_id. Usado por LogWatcher.';


-- ============================================================================
-- 8. REALTIME
-- ============================================================================

DO $$
BEGIN
  -- Players
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE players;
  END IF;
  
  -- Connected players
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'connected_players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE connected_players;
  END IF;
END $$;


-- ============================================================================
-- 9. DEPRECAR TABLAS ANTIGUAS
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'active_streamers') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_deprecated_active_streamers') THEN
      ALTER TABLE active_streamers RENAME TO _deprecated_active_streamers;
      RAISE NOTICE 'Tabla active_streamers renombrada a _deprecated_active_streamers';
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'streamer_profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_deprecated_streamer_profiles') THEN
      ALTER TABLE streamer_profiles RENAME TO _deprecated_streamer_profiles;
      RAISE NOTICE 'Tabla streamer_profiles renombrada a _deprecated_streamer_profiles';
    END IF;
  END IF;
END $$;


-- ============================================================================
-- 10. LIMPIEZA DE FUNCIONES OBSOLETAS
-- ============================================================================

DROP FUNCTION IF EXISTS batch_update_kick_status(JSONB) CASCADE;
DROP VIEW IF EXISTS live_streamers_with_game CASCADE;


-- ============================================================================
-- 11. VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
  v_players_count INTEGER;
  v_streamers_count INTEGER;
  v_connected_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_players_count FROM players;
  SELECT COUNT(*) INTO v_streamers_count FROM players WHERE is_streamer = TRUE;
  SELECT COUNT(*) INTO v_connected_count FROM connected_players;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migración 006 completada';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Players totales: %', v_players_count;
  RAISE NOTICE 'Streamers registrados: %', v_streamers_count;
  RAISE NOTICE 'Jugadores conectados: %', v_connected_count;
  RAISE NOTICE '========================================';
END $$;


-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================