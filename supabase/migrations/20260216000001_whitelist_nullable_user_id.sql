-- =============================================
-- Migration: Make whitelist.user_id nullable
-- =============================================
-- Description: Allow whitelist entries without a web user account.
--   Server players identified by Steam ID may not have registered
--   on the web app yet. When they do and link their Steam account,
--   user_id can be updated via a trigger or manual process.
--
-- Required for: import-whitelist script (bulk import of existing
--   server players who only have Steam IDs)
--
-- Author: MindBreakers Team
-- Date: 2026-02-16
-- =============================================

-- =============================================
-- PART 1: Make user_id nullable
-- =============================================

ALTER TABLE whitelist
ALTER COLUMN user_id DROP NOT NULL;

COMMENT ON COLUMN whitelist.user_id IS 'Optional reference to web user. NULL for players who have not registered on the web app yet.';

-- =============================================
-- PART 2: Update unique constraint
-- =============================================
-- The existing (user_id, game_id) unique constraint allows multiple
-- NULLs in PostgreSQL (NULLs are distinct), so it still works.
-- But we should add a partial unique index for non-null user_ids
-- to maintain the intended uniqueness.

-- Drop old constraint and recreate as partial unique index
ALTER TABLE whitelist DROP CONSTRAINT IF EXISTS whitelist_user_game_unique;

-- Only enforce uniqueness when user_id is NOT NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_whitelist_user_game_unique
  ON whitelist(user_id, game_id)
  WHERE user_id IS NOT NULL;

-- =============================================
-- PART 3: Auto-link trigger
-- =============================================
-- When a user links their Steam account on the web app (users.steam_id
-- gets set), automatically update any matching whitelist entries that
-- have the same steam_id but no user_id.

CREATE OR REPLACE FUNCTION link_whitelist_on_steam_id_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only act when steam_id is set or changed
  IF NEW.steam_id IS NOT NULL AND (OLD.steam_id IS NULL OR NEW.steam_id != OLD.steam_id) THEN
    UPDATE whitelist
    SET user_id = NEW.id
    WHERE steam_id = NEW.steam_id
      AND user_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_link_whitelist_on_steam ON users;
CREATE TRIGGER trigger_link_whitelist_on_steam
  AFTER UPDATE OF steam_id ON users
  FOR EACH ROW
  EXECUTE FUNCTION link_whitelist_on_steam_id_update();

COMMENT ON FUNCTION link_whitelist_on_steam_id_update IS 'Auto-links whitelist entries to user when they link their Steam account';

-- Also fire on INSERT (new user signs up with Steam)
DROP TRIGGER IF EXISTS trigger_link_whitelist_on_steam_insert ON users;
CREATE TRIGGER trigger_link_whitelist_on_steam_insert
  AFTER INSERT ON users
  FOR EACH ROW
  WHEN (NEW.steam_id IS NOT NULL)
  EXECUTE FUNCTION link_whitelist_on_steam_id_update();

-- =============================================
-- PART 4: Update RPC functions
-- =============================================

-- Update add_to_whitelist to work with steam_id directly (no user required)
CREATE OR REPLACE FUNCTION add_steam_id_to_whitelist(
  p_steam_id TEXT,
  p_game_slug TEXT,
  p_reason TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_game_id UUID;
  v_user_id UUID;
  v_whitelist_id UUID;
BEGIN
  -- Get game ID from slug
  SELECT id INTO v_game_id
  FROM games
  WHERE slug = p_game_slug;

  IF v_game_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Game not found'
    );
  END IF;

  -- Try to find an existing user with this Steam ID
  SELECT id INTO v_user_id
  FROM users
  WHERE steam_id = p_steam_id;

  -- Insert or update whitelist entry
  INSERT INTO whitelist (
    user_id,
    game_id,
    steam_id,
    is_active,
    reason,
    expires_at,
    admin_notes
  )
  VALUES (
    v_user_id,  -- NULL if no web user exists
    v_game_id,
    p_steam_id,
    TRUE,
    p_reason,
    p_expires_at,
    p_admin_notes
  )
  ON CONFLICT (steam_id, game_id)
  DO UPDATE SET
    is_active = TRUE,
    user_id = COALESCE(EXCLUDED.user_id, whitelist.user_id),
    reason = COALESCE(p_reason, whitelist.reason),
    expires_at = p_expires_at,
    admin_notes = COALESCE(p_admin_notes, whitelist.admin_notes),
    updated_at = NOW()
  RETURNING id INTO v_whitelist_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'whitelist_id', v_whitelist_id,
    'steam_id', p_steam_id,
    'user_id', v_user_id,
    'game_slug', p_game_slug
  );
END;
$$;

COMMENT ON FUNCTION add_steam_id_to_whitelist IS 'Add a Steam ID to whitelist without requiring a web user account. Used by import scripts and service role operations.';

GRANT EXECUTE ON FUNCTION add_steam_id_to_whitelist TO authenticated, service_role;

-- =============================================
-- PART 5: Verification
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Whitelist Nullable User ID Migration Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Changes:';
  RAISE NOTICE '  - whitelist.user_id is now NULLABLE';
  RAISE NOTICE '  - Auto-link trigger created for users.steam_id updates';
  RAISE NOTICE '  - New RPC: add_steam_id_to_whitelist()';
  RAISE NOTICE '========================================';
END $$;
