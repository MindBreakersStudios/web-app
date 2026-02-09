-- ============================================
-- MindBreakers - Active Streamers (LogWatcher)
-- ============================================
-- Migración: 003_active_streamers_logwatcher.sql
-- Descripción: Schema definitivo para active_streamers,
--   manejada completamente por LogWatcher (backend).
--   LogWatcher detecta conexiones/desconexiones del servidor
--   Y verifica estado live en Kick via OAuth API.
--   El frontend SOLO LEE datos de esta tabla.
-- ============================================


-- ============================================
-- TABLA: streamer_profiles
-- ============================================
-- Perfiles de streamers registrados en el programa.
-- Un streamer se registra una vez y puede conectarse
-- a múltiples servidores/juegos.

CREATE TABLE IF NOT EXISTS streamer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  kick_username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  steam_id TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Si la tabla ya existía, agregar columnas que podrían faltar
-- (CREATE TABLE IF NOT EXISTS no agrega columnas a tablas existentes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'streamer_profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE streamer_profiles ADD COLUMN avatar_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'streamer_profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE streamer_profiles ADD COLUMN display_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'streamer_profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE streamer_profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'streamer_profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE streamer_profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

COMMENT ON TABLE streamer_profiles IS 'Streamers registrados en el programa MindBreakers WatchParty';
COMMENT ON COLUMN streamer_profiles.kick_username IS 'Username de Kick (slug del canal)';
COMMENT ON COLUMN streamer_profiles.steam_id IS 'Steam ID 64-bit para vincular con conexiones al servidor';
COMMENT ON COLUMN streamer_profiles.is_active IS 'Si el streamer está activo en el programa';


-- ============================================
-- TABLA: active_streamers
-- ============================================
-- Manejada COMPLETAMENTE por LogWatcher.
-- Los records solo existen mientras el streamer está
-- conectado al servidor de juego (+ 15 min grace period).
--
-- LogWatcher:
--   1. INSERT cuando detecta conexión en logs del servidor
--   2. UPDATE is_live_on_kick cuando verifica Kick API (cada 60s)
--   3. DELETE cuando detecta desconexión (después de grace period)
--
-- Frontend:
--   SELECT WHERE is_live_on_kick = true  → Mostrar en WatchParty
--   SELECT WHERE is_live_on_kick = false → Conectado pero no transmitiendo

CREATE TABLE IF NOT EXISTS active_streamers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  streamer_profile_id UUID NOT NULL REFERENCES streamer_profiles(id) ON DELETE CASCADE,
  steam_id TEXT NOT NULL,
  kick_username TEXT NOT NULL,
  in_game_name TEXT NOT NULL,
  server_name TEXT NOT NULL,
  game_id UUID NOT NULL REFERENCES games(id),
  server_id UUID REFERENCES servers(id),

  -- Kick status (actualizado por LogWatcher via OAuth API)
  is_live_on_kick BOOLEAN DEFAULT FALSE,
  kick_viewer_count INTEGER DEFAULT 0,
  kick_stream_title TEXT,
  kick_thumbnail_url TEXT,

  -- Timestamps
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),

  -- Un streamer solo puede estar conectado una vez por juego
  CONSTRAINT active_streamers_steam_game_unique UNIQUE(steam_id, game_id)
);

-- Si la tabla ya existía, agregar columnas que podrían faltar
-- NOTA: DEFAULT en ADD COLUMN solo aplica a filas NUEVAS.
-- Las filas existentes quedan con NULL para columnas recién agregadas.
-- Por eso hay un UPDATE de backfill al final de este bloque.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'active_streamers' AND column_name = 'is_live_on_kick'
  ) THEN
    ALTER TABLE active_streamers ADD COLUMN is_live_on_kick BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'active_streamers' AND column_name = 'kick_viewer_count'
  ) THEN
    ALTER TABLE active_streamers ADD COLUMN kick_viewer_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'active_streamers' AND column_name = 'kick_stream_title'
  ) THEN
    ALTER TABLE active_streamers ADD COLUMN kick_stream_title TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'active_streamers' AND column_name = 'kick_thumbnail_url'
  ) THEN
    ALTER TABLE active_streamers ADD COLUMN kick_thumbnail_url TEXT;
  END IF;

  -- Nullable: filas existentes no tienen streamer_profile_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'active_streamers' AND column_name = 'streamer_profile_id'
  ) THEN
    ALTER TABLE active_streamers ADD COLUMN streamer_profile_id UUID REFERENCES streamer_profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'active_streamers' AND column_name = 'server_id'
  ) THEN
    ALTER TABLE active_streamers ADD COLUMN server_id UUID REFERENCES servers(id);
  END IF;

  -- game_id: podría faltar si tabla ya existía sin él
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'active_streamers' AND column_name = 'game_id'
  ) THEN
    ALTER TABLE active_streamers ADD COLUMN game_id UUID REFERENCES games(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'active_streamers' AND column_name = 'last_seen'
  ) THEN
    ALTER TABLE active_streamers ADD COLUMN last_seen TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Backfill: filas existentes donde columnas recién agregadas son NULL
-- Esto evita que get_connected_streamers/get_live_streamers las filtre por last_seen
-- y que is_live_on_kick/kick_viewer_count sean NULL en lugar de sus defaults.
UPDATE active_streamers SET last_seen = COALESCE(last_seen, connected_at, NOW()) WHERE last_seen IS NULL;
UPDATE active_streamers SET is_live_on_kick = COALESCE(is_live_on_kick, FALSE) WHERE is_live_on_kick IS NULL;
UPDATE active_streamers SET kick_viewer_count = COALESCE(kick_viewer_count, 0) WHERE kick_viewer_count IS NULL;

COMMENT ON TABLE active_streamers IS 'Streamers actualmente conectados a servidores de juego. Manejada por LogWatcher.';
COMMENT ON COLUMN active_streamers.is_live_on_kick IS 'True si el streamer está transmitiendo en Kick (verificado por LogWatcher via OAuth)';
COMMENT ON COLUMN active_streamers.last_seen IS 'Última vez que LogWatcher confirmó actividad del jugador';


-- ============================================
-- ÍNDICES
-- ============================================

-- Query principal del WatchParty: streamers live
CREATE INDEX IF NOT EXISTS idx_active_streamers_live
  ON active_streamers(is_live_on_kick)
  WHERE is_live_on_kick = true;

-- Búsqueda por juego
CREATE INDEX IF NOT EXISTS idx_active_streamers_game
  ON active_streamers(game_id);

-- Búsqueda por steam_id (para LogWatcher)
CREATE INDEX IF NOT EXISTS idx_active_streamers_steam
  ON active_streamers(steam_id);

-- Búsqueda por kick_username
CREATE INDEX IF NOT EXISTS idx_active_streamers_kick
  ON active_streamers(kick_username);

-- Cleanup de streamers inactivos (grace period)
CREATE INDEX IF NOT EXISTS idx_active_streamers_last_seen
  ON active_streamers(last_seen);


-- ============================================
-- RLS POLICIES
-- ============================================

-- Habilitar RLS
ALTER TABLE active_streamers ENABLE ROW LEVEL SECURITY;
ALTER TABLE streamer_profiles ENABLE ROW LEVEL SECURITY;

-- Lectura pública para WatchParty (el frontend necesita leer)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'active_streamers' AND policyname = 'Anyone can view active streamers'
  ) THEN
    CREATE POLICY "Anyone can view active streamers"
      ON active_streamers FOR SELECT
      USING (true);
  END IF;
END $$;

-- Lectura pública de perfiles de streamers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'streamer_profiles' AND policyname = 'Anyone can view streamer profiles'
  ) THEN
    CREATE POLICY "Anyone can view streamer profiles"
      ON streamer_profiles FOR SELECT
      USING (true);
  END IF;
END $$;

-- Solo el service_role (LogWatcher) puede escribir en active_streamers
-- (El anon key del frontend NO puede INSERT/UPDATE/DELETE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'active_streamers' AND policyname = 'Only service role can modify active streamers'
  ) THEN
    CREATE POLICY "Only service role can modify active streamers"
      ON active_streamers FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- Solo el service_role puede modificar streamer_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'streamer_profiles' AND policyname = 'Only service role can modify streamer profiles'
  ) THEN
    CREATE POLICY "Only service role can modify streamer profiles"
      ON streamer_profiles FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;


-- ============================================
-- VIEW: live_streamers_with_game
-- ============================================
-- Vista para simplificar queries del frontend
-- que necesitan datos del juego junto con el streamer.

CREATE OR REPLACE VIEW live_streamers_with_game AS
SELECT
  a.id,
  a.kick_username,
  a.in_game_name,
  a.server_name,
  a.is_live_on_kick,
  a.kick_viewer_count,
  a.kick_stream_title,
  a.kick_thumbnail_url,
  a.connected_at,
  a.last_seen,
  g.name AS game_name,
  g.slug AS game_slug,
  sp.display_name,
  sp.avatar_url
FROM active_streamers a
LEFT JOIN games g ON a.game_id = g.id
LEFT JOIN streamer_profiles sp ON a.streamer_profile_id = sp.id;


-- ============================================
-- RPC: get_live_streamers (actualizada)
-- ============================================
-- Función RPC usada por el frontend para obtener
-- streamers activos con datos del juego.
-- Ahora todos los datos vienen de LogWatcher.

-- DROP todas las versiones existentes de get_live_streamers.
-- CREATE OR REPLACE no puede cambiar RETURNS TABLE, y pueden existir
-- múltiples overloads en la DB (de migraciones anteriores, ejecuciones manuales, etc).
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
  p_filter TEXT DEFAULT 'all'
)
RETURNS TABLE (
  id UUID,
  kick_username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  in_game_name TEXT,
  server_name TEXT,
  game_slug TEXT,
  game_name TEXT,
  is_live_on_kick BOOLEAN,
  is_live BOOLEAN,
  kick_viewer_count INTEGER,
  kick_stream_title TEXT,
  kick_thumbnail_url TEXT,
  connected_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ
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
    g.slug::TEXT AS game_slug,
    g.name::TEXT AS game_name,
    a.is_live_on_kick,
    a.is_live_on_kick AS is_live, -- Alias para compatibilidad
    a.kick_viewer_count,
    a.kick_stream_title::TEXT,
    a.kick_thumbnail_url::TEXT,
    a.connected_at,
    a.last_seen AS last_seen_at
  FROM active_streamers a
  LEFT JOIN games g ON a.game_id = g.id
  LEFT JOIN streamer_profiles sp ON a.streamer_profile_id = sp.id
  WHERE
    (p_game_slug IS NULL OR g.slug = p_game_slug)
    AND (
      p_filter = 'all'
      OR (p_filter = 'live' AND a.is_live_on_kick = true)
      OR (p_filter = 'online' AND a.is_live_on_kick = false)
    )
  ORDER BY
    a.is_live_on_kick DESC,
    a.kick_viewer_count DESC,
    a.connected_at DESC;
END;
$$;

COMMENT ON FUNCTION get_live_streamers IS 'Obtiene streamers conectados a servidores de juego con datos de Kick. Datos actualizados por LogWatcher.';


-- ============================================
-- RPC: get_registered_streamers
-- ============================================
-- Retorna todos los streamers registrados en el programa,
-- independientemente de si están conectados o no.

-- DROP todas las versiones existentes de get_registered_streamers.
-- Mismo patrón que get_live_streamers: CREATE OR REPLACE no puede
-- cambiar RETURNS TABLE si la función ya existe con otra firma.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure AS func_signature
    FROM pg_proc
    WHERE proname = 'get_registered_streamers'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION get_registered_streamers()
RETURNS TABLE (
  id UUID,
  kick_username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  steam_id TEXT,
  game_slug TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.id,
    sp.kick_username::TEXT,
    sp.display_name::TEXT,
    sp.avatar_url::TEXT,
    sp.steam_id::TEXT,
    NULL::TEXT AS game_slug, -- No tiene juego asignado hasta que se conecte
    sp.created_at
  FROM streamer_profiles sp
  WHERE sp.is_active = true
  ORDER BY sp.display_name ASC NULLS LAST, sp.kick_username ASC;
END;
$$;

COMMENT ON FUNCTION get_registered_streamers IS 'Obtiene todos los streamers registrados en el programa WatchParty.';


-- ============================================
-- TRIGGER: Habilitar Realtime para active_streamers
-- ============================================
-- Asegurar que la tabla dispara eventos para
-- las subscriptions de Supabase Realtime.

DO $$
BEGIN
  -- Solo agregar si no está ya en la publicación
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'active_streamers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE active_streamers;
  END IF;
END $$;


-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
