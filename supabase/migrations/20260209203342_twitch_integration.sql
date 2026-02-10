-- Migration: 007_twitch_integration
-- Description: Add Twitch OAuth fields to players table for multi-platform support
-- Author: MindBreakers Team
-- Date: 2026-02-09

-- =============================================
-- STEP 1: Add Twitch fields to players table
-- =============================================

-- Core Twitch identity fields
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS twitch_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS twitch_username TEXT,
ADD COLUMN IF NOT EXISTS twitch_display_name TEXT,
ADD COLUMN IF NOT EXISTS twitch_profile_image TEXT,
ADD COLUMN IF NOT EXISTS twitch_verified_at TIMESTAMPTZ;

-- Twitch OAuth tokens (for user-specific API calls)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS twitch_access_token TEXT,
ADD COLUMN IF NOT EXISTS twitch_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS twitch_token_expires_at TIMESTAMPTZ;

-- Twitch live stream status (cached for performance)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS twitch_is_live BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS twitch_stream_title TEXT,
ADD COLUMN IF NOT EXISTS twitch_game_name TEXT,
ADD COLUMN IF NOT EXISTS twitch_viewer_count INTEGER,
ADD COLUMN IF NOT EXISTS twitch_stream_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS twitch_last_checked_at TIMESTAMPTZ;

-- =============================================
-- STEP 2: Create indexes for Twitch fields
-- =============================================

-- Index for looking up players by Twitch ID (unique, used during OAuth callback)
CREATE INDEX IF NOT EXISTS idx_players_twitch_id 
ON players(twitch_id) 
WHERE twitch_id IS NOT NULL;

-- Index for looking up players by Twitch username (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_players_twitch_username 
ON players(LOWER(twitch_username)) 
WHERE twitch_username IS NOT NULL;

-- Index for finding live Twitch streamers
CREATE INDEX IF NOT EXISTS idx_players_twitch_live 
ON players(twitch_is_live, twitch_viewer_count DESC) 
WHERE twitch_is_live = TRUE;

-- =============================================
-- STEP 3: Update RPC functions for multi-platform support
-- =============================================

-- Function to get all live streamers (both Kick and Twitch)
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
        COALESCE(p.character_name, p.steam_name) AS player_name,
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
        NULL::TEXT AS twitch_thumbnail, -- Could add thumbnail URL construction here
        -- Combined
        p.is_streamer,
        EXISTS (
            SELECT 1 FROM connected_players cp 
            WHERE cp.steam_id = p.steam_id
        ) AS is_connected,
        (
            SELECT cp.server_id FROM connected_players cp 
            WHERE cp.steam_id = p.steam_id 
            LIMIT 1
        ) AS connected_server,
        -- Determine primary platform based on verified status and live status
        CASE 
            WHEN p.twitch_is_live AND p.twitch_verified_at IS NOT NULL THEN 'twitch'
            WHEN p.kick_is_live AND p.kick_verified_at IS NOT NULL THEN 'kick'
            WHEN p.twitch_verified_at IS NOT NULL THEN 'twitch'
            WHEN p.kick_verified_at IS NOT NULL THEN 'kick'
            ELSE NULL
        END AS primary_platform
    FROM players p
    WHERE p.is_streamer = TRUE
      AND (
          (p.kick_is_live = TRUE AND p.kick_verified_at IS NOT NULL)
          OR 
          (p.twitch_is_live = TRUE AND p.twitch_verified_at IS NOT NULL)
      )
    ORDER BY 
        -- Prioritize by total viewer count across platforms
        COALESCE(p.kick_viewer_count, 0) + COALESCE(p.twitch_viewer_count, 0) DESC,
        p.steam_id;
END;
$$;

-- Function to get all registered streamers (verified on any platform)
DROP FUNCTION IF EXISTS get_registered_streamers();
DROP FUNCTION IF EXISTS get_registered_streamers(boolean);

-- Function to get all registered streamers (verified on any platform)
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
        COALESCE(p.character_name, p.steam_name) AS player_name,
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
            SELECT cp.server_id FROM connected_players cp 
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
        p.created_at DESC;
END;
$$;

-- Function to unlink Twitch account
CREATE OR REPLACE FUNCTION unlink_twitch_account(p_steam_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_twitch_username TEXT;
BEGIN
    -- Get current Twitch username for response
    SELECT twitch_username INTO v_twitch_username
    FROM players
    WHERE steam_id = p_steam_id;
    
    IF v_twitch_username IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'No Twitch account linked to this player'
        );
    END IF;
    
    -- Clear all Twitch-related fields
    UPDATE players
    SET 
        twitch_id = NULL,
        twitch_username = NULL,
        twitch_display_name = NULL,
        twitch_profile_image = NULL,
        twitch_verified_at = NULL,
        twitch_access_token = NULL,
        twitch_refresh_token = NULL,
        twitch_token_expires_at = NULL,
        twitch_is_live = FALSE,
        twitch_stream_title = NULL,
        twitch_game_name = NULL,
        twitch_viewer_count = NULL,
        twitch_stream_started_at = NULL,
        twitch_last_checked_at = NULL,
        updated_at = NOW()
    WHERE steam_id = p_steam_id;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'unlinked_username', v_twitch_username
    );
END;
$$;

-- =============================================
-- STEP 4: Add comments for documentation
-- =============================================

COMMENT ON COLUMN players.twitch_id IS 'Twitch user ID (unique identifier from Twitch)';
COMMENT ON COLUMN players.twitch_username IS 'Twitch username (login name, lowercase)';
COMMENT ON COLUMN players.twitch_display_name IS 'Twitch display name (may include capitalization)';
COMMENT ON COLUMN players.twitch_profile_image IS 'URL to Twitch profile image';
COMMENT ON COLUMN players.twitch_verified_at IS 'When the Twitch account was verified via OAuth';
COMMENT ON COLUMN players.twitch_access_token IS 'Twitch OAuth access token (encrypted in production)';
COMMENT ON COLUMN players.twitch_refresh_token IS 'Twitch OAuth refresh token (encrypted in production)';
COMMENT ON COLUMN players.twitch_token_expires_at IS 'When the Twitch access token expires';
COMMENT ON COLUMN players.twitch_is_live IS 'Whether the streamer is currently live on Twitch';
COMMENT ON COLUMN players.twitch_stream_title IS 'Current stream title on Twitch';
COMMENT ON COLUMN players.twitch_game_name IS 'Current game being streamed on Twitch';
COMMENT ON COLUMN players.twitch_viewer_count IS 'Current viewer count on Twitch';
COMMENT ON COLUMN players.twitch_stream_started_at IS 'When the current Twitch stream started';
COMMENT ON COLUMN players.twitch_last_checked_at IS 'Last time Twitch live status was checked';

-- =============================================
-- STEP 5: Grant permissions
-- =============================================

-- Grant execute on new functions
GRANT EXECUTE ON FUNCTION get_live_streamers() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_registered_streamers() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION unlink_twitch_account(TEXT) TO authenticated;