-- ============================================================================
-- Migration: 008_fix_players_schema_and_functions
-- Description: Fix players table schema and RPC functions for multi-platform support
-- Date: 2026-02-10
--
-- PROBLEMA:
--   Las funciones get_live_streamers() y get_registered_streamers() de migración 007
--   usan columnas que no existen: character_name, steam_name, kick_is_live, etc.
--
-- SOLUCIÓN:
--   1. Agregar columnas de Kick que faltan (paridad con Twitch)
--   2. Recrear funciones con las columnas correctas
-- ============================================================================


-- ============================================================================
-- STEP 1: Add missing Kick columns to players table
-- ============================================================================

-- Kick verification timestamp (like twitch_verified_at)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS kick_verified_at TIMESTAMPTZ;

-- Kick live status fields (like Twitch fields)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS kick_is_live BOOLEAN DEFAULT FALSE;

ALTER TABLE players 
ADD COLUMN IF NOT EXISTS kick_stream_title TEXT;

ALTER TABLE players 
ADD COLUMN IF NOT EXISTS kick_viewer_count INTEGER;

ALTER TABLE players 
ADD COLUMN IF NOT EXISTS kick_thumbnail TEXT;

ALTER TABLE players 
ADD COLUMN IF NOT EXISTS kick_last_checked_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN players.kick_verified_at IS 'When the Kick account was verified via OAuth';
COMMENT ON COLUMN players.kick_is_live IS 'Whether the streamer is currently live on Kick';
COMMENT ON COLUMN players.kick_stream_title IS 'Current stream title on Kick';
COMMENT ON COLUMN players.kick_viewer_count IS 'Current viewer count on Kick';
COMMENT ON COLUMN players.kick_thumbnail IS 'Kick stream thumbnail URL';
COMMENT ON COLUMN players.kick_last_checked_at IS 'Last time Kick live status was checked';


-- ============================================================================
-- STEP 2: Create indexes for Kick fields
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_players_kick_live 
ON players(kick_is_live, kick_viewer_count DESC) 
WHERE kick_is_live = TRUE;

CREATE INDEX IF NOT EXISTS idx_players_kick_username 
ON players(LOWER(kick_username)) 
WHERE kick_username IS NOT NULL;


-- ============================================================================
-- STEP 3: Migrate existing streamer data
-- ============================================================================

-- Mark existing streamers with kick_username as verified
UPDATE players
SET kick_verified_at = COALESCE(streamer_registered_at, first_seen_at, NOW())
WHERE kick_username IS NOT NULL 
  AND kick_verified_at IS NULL
  AND is_streamer = TRUE;


-- ============================================================================
-- STEP 4: Fix get_live_streamers() function
-- ============================================================================

DROP FUNCTION IF EXISTS get_live_streamers();
DROP FUNCTION IF EXISTS get_live_streamers(text);
DROP FUNCTION IF EXISTS get_live_streamers(text, text);

CREATE OR REPLACE FUNCTION get_live_streamers()
RETURNS TABLE (
    steam_id TEXT,
    player_name TEXT,
    -- Kick data
    kick_username TEXT,
    kick_is_live BOOLEAN,
    kick_stream_title TEXT,
    kick_viewer_count INTEGER,
    kick_stream_url TEXT,
    kick_thumbnail TEXT,
    -- Twitch data
    twitch_username TEXT,
    twitch_display_name TEXT,
    twitch_is_live BOOLEAN,
    twitch_stream_title TEXT,
    twitch_game_name TEXT,
    twitch_viewer_count INTEGER,
    twitch_stream_url TEXT,
    twitch_thumbnail TEXT,
    -- Combined
    is_streamer BOOLEAN,
    is_connected BOOLEAN,
    connected_server TEXT,
    primary_platform TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.steam_id,
        COALESCE(p.display_name, p.in_game_name, p.kick_username, p.twitch_username) AS player_name,
        -- Kick
        p.kick_username,
        COALESCE(p.kick_is_live, FALSE) AS kick_is_live,
        p.kick_stream_title,
        p.kick_viewer_count,
        CASE WHEN p.kick_username IS NOT NULL 
            THEN 'https://kick.com/' || p.kick_username 
            ELSE NULL 
        END AS kick_stream_url,
        p.kick_thumbnail,
        -- Twitch
        p.twitch_username,
        p.twitch_display_name,
        COALESCE(p.twitch_is_live, FALSE) AS twitch_is_live,
        p.twitch_stream_title,
        p.twitch_game_name,
        p.twitch_viewer_count,
        CASE WHEN p.twitch_username IS NOT NULL 
            THEN 'https://www.twitch.tv/' || p.twitch_username 
            ELSE NULL 
        END AS twitch_stream_url,
        p.twitch_profile_image AS twitch_thumbnail,
        -- Combined
        p.is_streamer,
        EXISTS (
            SELECT 1 FROM connected_players cp 
            WHERE cp.steam_id = p.steam_id
        ) AS is_connected,
        (
            SELECT cp.server_id::TEXT FROM connected_players cp 
            WHERE cp.steam_id = p.steam_id 
            LIMIT 1
        ) AS connected_server,
        -- Determine primary platform based on live status and verified status
        CASE 
            WHEN COALESCE(p.twitch_is_live, FALSE) AND p.twitch_verified_at IS NOT NULL THEN 'twitch'
            WHEN COALESCE(p.kick_is_live, FALSE) AND p.kick_verified_at IS NOT NULL THEN 'kick'
            WHEN p.twitch_verified_at IS NOT NULL THEN 'twitch'
            WHEN p.kick_verified_at IS NOT NULL THEN 'kick'
            ELSE NULL
        END AS primary_platform
    FROM players p
    WHERE p.is_streamer = TRUE
      AND (
          (COALESCE(p.kick_is_live, FALSE) = TRUE AND p.kick_verified_at IS NOT NULL)
          OR 
          (COALESCE(p.twitch_is_live, FALSE) = TRUE AND p.twitch_verified_at IS NOT NULL)
      )
    ORDER BY 
        -- Prioritize by total viewer count across platforms
        COALESCE(p.kick_viewer_count, 0) + COALESCE(p.twitch_viewer_count, 0) DESC,
        p.steam_id;
END;
$$;

COMMENT ON FUNCTION get_live_streamers() IS 
    'Returns all streamers currently LIVE on Kick or Twitch. Multi-platform support.';


-- ============================================================================
-- STEP 5: Fix get_registered_streamers() function
-- ============================================================================

DROP FUNCTION IF EXISTS get_registered_streamers();
DROP FUNCTION IF EXISTS get_registered_streamers(boolean);

CREATE OR REPLACE FUNCTION get_registered_streamers()
RETURNS TABLE (
    steam_id TEXT,
    player_name TEXT,
    is_streamer BOOLEAN,
    -- Kick
    kick_username TEXT,
    kick_verified_at TIMESTAMPTZ,
    kick_is_live BOOLEAN,
    -- Twitch
    twitch_username TEXT,
    twitch_display_name TEXT,
    twitch_verified_at TIMESTAMPTZ,
    twitch_is_live BOOLEAN,
    -- Status
    is_connected BOOLEAN,
    connected_server TEXT,
    platforms TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.steam_id,
        COALESCE(p.display_name, p.in_game_name, p.kick_username, p.twitch_username) AS player_name,
        p.is_streamer,
        -- Kick
        p.kick_username,
        p.kick_verified_at,
        COALESCE(p.kick_is_live, FALSE) AS kick_is_live,
        -- Twitch
        p.twitch_username,
        p.twitch_display_name,
        p.twitch_verified_at,
        COALESCE(p.twitch_is_live, FALSE) AS twitch_is_live,
        -- Status
        EXISTS (
            SELECT 1 FROM connected_players cp 
            WHERE cp.steam_id = p.steam_id
        ) AS is_connected,
        (
            SELECT cp.server_id::TEXT FROM connected_players cp 
            WHERE cp.steam_id = p.steam_id 
            LIMIT 1
        ) AS connected_server,
        -- Build array of verified platforms
        ARRAY_REMOVE(ARRAY[
            CASE WHEN p.kick_verified_at IS NOT NULL THEN 'kick' ELSE NULL END,
            CASE WHEN p.twitch_verified_at IS NOT NULL THEN 'twitch' ELSE NULL END
        ], NULL) AS platforms
    FROM players p
    WHERE p.is_streamer = TRUE
      AND (p.kick_verified_at IS NOT NULL OR p.twitch_verified_at IS NOT NULL)
    ORDER BY 
        -- Live streamers first, then by viewer count
        (COALESCE(p.kick_is_live, FALSE) OR COALESCE(p.twitch_is_live, FALSE)) DESC,
        COALESCE(p.kick_viewer_count, 0) + COALESCE(p.twitch_viewer_count, 0) DESC,
        p.display_name ASC NULLS LAST;
END;
$$;

COMMENT ON FUNCTION get_registered_streamers() IS 
    'Returns all registered streamers (verified on Kick or Twitch). Includes live status.';


-- ============================================================================
-- STEP 6: Add unlink_kick_account function (for parity with Twitch)
-- ============================================================================

CREATE OR REPLACE FUNCTION unlink_kick_account(p_steam_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_kick_username TEXT;
BEGIN
    -- Get current Kick username for response
    SELECT kick_username INTO v_kick_username
    FROM players
    WHERE steam_id = p_steam_id;
    
    IF v_kick_username IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'No Kick account linked to this player'
        );
    END IF;
    
    -- Clear all Kick-related fields
    UPDATE players
    SET 
        kick_username = NULL,
        kick_verified_at = NULL,
        kick_is_live = FALSE,
        kick_stream_title = NULL,
        kick_viewer_count = NULL,
        kick_thumbnail = NULL,
        kick_last_checked_at = NULL,
        last_seen_at = NOW()
    WHERE steam_id = p_steam_id;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'unlinked_username', v_kick_username
    );
END;
$$;

COMMENT ON FUNCTION unlink_kick_account(TEXT) IS 
    'Unlinks a Kick account from a player. Clears all Kick-related fields.';


-- ============================================================================
-- STEP 7: Grant permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_live_streamers() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_registered_streamers() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION unlink_kick_account(TEXT) TO authenticated;


-- ============================================================================
-- STEP 8: Verification
-- ============================================================================

DO $$
DECLARE
    v_streamers_count INTEGER;
    v_kick_verified INTEGER;
    v_twitch_verified INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_streamers_count FROM players WHERE is_streamer = TRUE;
    SELECT COUNT(*) INTO v_kick_verified FROM players WHERE kick_verified_at IS NOT NULL;
    SELECT COUNT(*) INTO v_twitch_verified FROM players WHERE twitch_verified_at IS NOT NULL;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration 008 completed';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total streamers: %', v_streamers_count;
    RAISE NOTICE 'Kick verified: %', v_kick_verified;
    RAISE NOTICE 'Twitch verified: %', v_twitch_verified;
    RAISE NOTICE '========================================';
END $$;


-- ============================================================================
-- END OF MIGRATION
-- ============================================================================