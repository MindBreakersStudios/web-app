-- ============================================================================
-- Survival tracking: days survived since last death & personal best
-- 1 real hour = 1 in-game day → frontend displays survived_minutes / 60
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. New columns on players
-- ----------------------------------------------------------------------------
ALTER TABLE players ADD COLUMN IF NOT EXISTS survived_minutes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS max_survived_minutes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS last_death_at TIMESTAMPTZ;

-- ----------------------------------------------------------------------------
-- 2. Update record_player_death — reset survival, preserve best record
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION record_player_death(
  p_steam_id TEXT,
  p_player_name TEXT,
  p_game_id UUID,
  p_server_id UUID DEFAULT NULL,
  p_event_timestamp TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_id UUID;
BEGIN
  -- Resolve player (create if needed)
  v_player_id := get_or_create_player(p_steam_id, p_player_name);

  -- Update survival tracking + increment death count
  UPDATE players
  SET
    max_survived_minutes = GREATEST(max_survived_minutes, survived_minutes),
    survived_minutes = 0,
    last_death_at = p_event_timestamp,
    death_count = death_count + 1
  WHERE id = v_player_id;

  -- Insert game event
  INSERT INTO game_events (
    event_type, game_id, server_id, player_id, steam_id,
    player_name, event_data, event_timestamp
  ) VALUES (
    'player_death', p_game_id, p_server_id, v_player_id, p_steam_id,
    p_player_name, '{}'::JSONB, p_event_timestamp
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'player_id', v_player_id
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. Update record_player_session — add survival time (post-death only if
--    a death occurred during this session)
-- ----------------------------------------------------------------------------
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
  v_survival_minutes INTEGER;
  v_session_id UUID;
  v_last_death_at TIMESTAMPTZ;
BEGIN
  -- Calculate total session duration in whole minutes (floor)
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

  -- Increment cumulative playtime
  UPDATE players
  SET total_playtime_minutes = total_playtime_minutes + v_duration_minutes
  WHERE id = p_player_id;

  -- Calculate survival minutes to add
  SELECT last_death_at INTO v_last_death_at
  FROM players
  WHERE id = p_player_id;

  IF v_last_death_at IS NOT NULL
     AND v_last_death_at >= p_connected_at
     AND v_last_death_at <= p_disconnected_at
  THEN
    -- Death happened during this session: only count time after the death
    v_survival_minutes := FLOOR(EXTRACT(EPOCH FROM (p_disconnected_at - v_last_death_at)) / 60)::INTEGER;
  ELSE
    -- No death during this session: count full session
    v_survival_minutes := v_duration_minutes;
  END IF;

  -- Ensure non-negative
  IF v_survival_minutes < 0 THEN
    v_survival_minutes := 0;
  END IF;

  -- Update survival tracking
  UPDATE players
  SET
    survived_minutes = survived_minutes + v_survival_minutes,
    max_survived_minutes = GREATEST(max_survived_minutes, survived_minutes + v_survival_minutes)
  WHERE id = p_player_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'skipped', FALSE,
    'session_id', v_session_id,
    'duration_minutes', v_duration_minutes,
    'survival_minutes_added', v_survival_minutes
  );
END;
$$;
