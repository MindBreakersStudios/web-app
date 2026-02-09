-- ============================================
-- MindBreakers - Kick Live Status Support
-- ============================================
-- Migración: 002_kick_live_status.sql
-- Descripción: Adds batch_update_kick_status RPC function
--   and ensures active_streamers has the required columns
--   for browser-side Kick API status checking.
-- ============================================

-- ============================================
-- RPC: batch_update_kick_status
-- ============================================
-- Called from the browser to persist Kick live status
-- after checking the Kick API (server gets 403).
-- Accepts a JSON array of updates and applies them
-- to the active_streamers table.
--
-- Usage from Supabase client:
--   supabase.rpc('batch_update_kick_status', {
--     p_updates: [
--       { kick_username: 'user1', game_slug: 'humanitz', is_live: true, viewer_count: 42, stream_title: '...', thumbnail_url: '...' },
--       ...
--     ]
--   })

CREATE OR REPLACE FUNCTION batch_update_kick_status(
  p_updates JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_update JSONB;
BEGIN
  FOR v_update IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    UPDATE active_streamers
    SET
      is_live_on_kick   = (v_update->>'is_live')::boolean,
      kick_viewer_count = COALESCE((v_update->>'viewer_count')::int, 0),
      kick_stream_title = v_update->>'stream_title',
      kick_thumbnail_url = v_update->>'thumbnail_url',
      kick_last_checked = NOW()
    WHERE
      kick_username = v_update->>'kick_username';
  END LOOP;
END;
$$;

COMMENT ON FUNCTION batch_update_kick_status IS 'Updates Kick live status for multiple streamers. Called from browser since server gets 403 from Kick API.';

-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
