-- =============================================
-- Migration: Playtime Tracking
-- =============================================
-- Description: Add session logging and cumulative playtime tracking
-- Author: MindBreakers Team
-- Date: 2026-02-14
--
-- Adds:
--   1. players.total_playtime_minutes column for quick cumulative lookups
--   2. player_sessions table for per-session history
--   3. record_player_session() RPC that atomically inserts a session
--      and increments the player's total playtime
--   4. RLS policies following patterns from 20260212000002_row_level_security.sql
-- =============================================


-- =============================================
-- PART 1: Add total_playtime_minutes to players
-- =============================================

ALTER TABLE players
ADD COLUMN IF NOT EXISTS total_playtime_minutes INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN players.total_playtime_minutes IS
  'Cumulative playtime in minutes across all sessions and servers';


-- =============================================
-- PART 2: Create player_sessions table
-- =============================================

CREATE TABLE IF NOT EXISTS player_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  steam_id TEXT NOT NULL,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  server_id UUID REFERENCES servers(id) ON DELETE SET NULL,
  server_name TEXT NOT NULL,
  in_game_name TEXT NOT NULL,
  connected_at TIMESTAMPTZ NOT NULL,
  disconnected_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT duration_non_negative CHECK (duration_minutes >= 0),
  CONSTRAINT disconnect_after_connect CHECK (disconnected_at >= connected_at)
);

COMMENT ON TABLE player_sessions IS
  'Individual play sessions. One row per connect→disconnect cycle.';


-- =============================================
-- PART 3: Indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_player_sessions_player_id
  ON player_sessions(player_id);

CREATE INDEX IF NOT EXISTS idx_player_sessions_steam_id
  ON player_sessions(steam_id);

CREATE INDEX IF NOT EXISTS idx_player_sessions_game_id
  ON player_sessions(game_id);

CREATE INDEX IF NOT EXISTS idx_player_sessions_connected_at
  ON player_sessions(connected_at DESC);

CREATE INDEX IF NOT EXISTS idx_player_sessions_player_game_connected
  ON player_sessions(player_id, game_id, connected_at DESC);


-- =============================================
-- PART 4: record_player_session() RPC
-- =============================================

CREATE OR REPLACE FUNCTION record_player_session(
  p_player_id UUID,
  p_steam_id TEXT,
  p_game_id UUID,
  p_server_id UUID,
  p_server_name TEXT,
  p_in_game_name TEXT,
  p_connected_at TIMESTAMPTZ,
  p_disconnected_at TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_duration_minutes INTEGER;
  v_session_id UUID;
BEGIN
  -- Calculate duration in whole minutes (floor)
  v_duration_minutes := FLOOR(EXTRACT(EPOCH FROM (p_disconnected_at - p_connected_at)) / 60)::INTEGER;

  -- Skip sessions shorter than 1 minute
  IF v_duration_minutes < 1 THEN
    RETURN jsonb_build_object(
      'success', TRUE,
      'skipped', TRUE,
      'reason', 'Session shorter than 1 minute',
      'duration_seconds', FLOOR(EXTRACT(EPOCH FROM (p_disconnected_at - p_connected_at)))::INTEGER
    );
  END IF;

  -- Insert session row
  INSERT INTO player_sessions (
    player_id, steam_id, game_id, server_id, server_name,
    in_game_name, connected_at, disconnected_at, duration_minutes
  ) VALUES (
    p_player_id, p_steam_id, p_game_id, p_server_id, p_server_name,
    p_in_game_name, p_connected_at, p_disconnected_at, v_duration_minutes
  )
  RETURNING id INTO v_session_id;

  -- Increment cumulative playtime on the player record
  UPDATE players
  SET total_playtime_minutes = total_playtime_minutes + v_duration_minutes
  WHERE id = p_player_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'skipped', FALSE,
    'session_id', v_session_id,
    'duration_minutes', v_duration_minutes
  );
END;
$$;

COMMENT ON FUNCTION record_player_session IS
  'Atomically logs a play session and increments cumulative playtime. Skips sessions < 1 min.';


-- =============================================
-- PART 5: RLS policies
-- =============================================

ALTER TABLE player_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can read session history (public leaderboards / profiles)
CREATE POLICY "Anyone can read player sessions"
  ON player_sessions FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (LogWatcher manages this)
CREATE POLICY "Only service role can manage player sessions"
  ON player_sessions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');


-- =============================================
-- PART 6: Grants
-- =============================================

GRANT SELECT ON player_sessions TO anon, authenticated;
GRANT EXECUTE ON FUNCTION record_player_session(UUID, TEXT, UUID, UUID, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;


-- =============================================
-- PART 7: Documentation
-- =============================================

COMMENT ON POLICY "Anyone can read player sessions" ON player_sessions IS
  'Session history is public for profile pages and leaderboards';

COMMENT ON POLICY "Only service role can manage player sessions" ON player_sessions IS
  'Only the LogWatcher service (service_role) can write session data';


-- =============================================
-- PART 8: Verification
-- =============================================

DO $$
DECLARE
  v_has_column BOOLEAN;
  v_has_table BOOLEAN;
  v_has_function BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'total_playtime_minutes'
  ) INTO v_has_column;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'player_sessions'
  ) INTO v_has_table;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'record_player_session'
  ) INTO v_has_function;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Playtime Tracking Migration completed';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'players.total_playtime_minutes: %', v_has_column;
  RAISE NOTICE 'player_sessions table: %', v_has_table;
  RAISE NOTICE 'record_player_session() function: %', v_has_function;
  RAISE NOTICE '========================================';
END $$;


-- =============================================
-- END OF MIGRATION
-- =============================================
