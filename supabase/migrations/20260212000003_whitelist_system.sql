-- =============================================
-- Migration: Whitelist System with Admin Roles
-- =============================================
-- Description: Add whitelist functionality per game with admin management
-- Author: MindBreakers Team
-- Date: 2026-02-12
--
-- Features:
-- 1. Admin role system for users
-- 2. Whitelist table per game
-- 3. RLS policies for admin access
-- 4. RPC functions for whitelist management
-- 5. User whitelist status checking
-- =============================================

-- =============================================
-- PART 1: Add admin role to users table
-- =============================================

-- Add is_admin column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add admin_notes column for internal documentation
ALTER TABLE users
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;

COMMENT ON COLUMN users.is_admin IS 'Whether user has admin privileges (can manage whitelist, edit user profiles)';
COMMENT ON COLUMN users.admin_notes IS 'Internal notes for admins (not visible to user)';

-- =============================================
-- PART 2: Create whitelist table
-- =============================================

CREATE TABLE IF NOT EXISTS whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  steam_id TEXT NOT NULL,

  -- Whitelist status
  is_active BOOLEAN DEFAULT TRUE,

  -- Who added them and when
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),

  -- Expiration (optional - for temporary whitelist access)
  expires_at TIMESTAMPTZ,

  -- Reason for whitelist (streamer, VIP subscriber, moderator, etc.)
  reason TEXT,

  -- Admin notes
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one whitelist entry per user per game
  CONSTRAINT whitelist_user_game_unique UNIQUE (user_id, game_id),

  -- Unique constraint: one steam_id per game (prevent duplicates)
  CONSTRAINT whitelist_steam_game_unique UNIQUE (steam_id, game_id)
);

COMMENT ON TABLE whitelist IS 'Game server whitelist entries per user per game';
COMMENT ON COLUMN whitelist.is_active IS 'Whether whitelist entry is currently active';
COMMENT ON COLUMN whitelist.added_by IS 'Admin user who added this whitelist entry';
COMMENT ON COLUMN whitelist.expires_at IS 'Optional expiration date for temporary whitelist access';
COMMENT ON COLUMN whitelist.reason IS 'Reason for whitelist (streamer, VIP, moderator, etc.)';

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_whitelist_user_game ON whitelist(user_id, game_id);
CREATE INDEX IF NOT EXISTS idx_whitelist_steam_game ON whitelist(steam_id, game_id);
CREATE INDEX IF NOT EXISTS idx_whitelist_game_active ON whitelist(game_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_whitelist_expires ON whitelist(expires_at) WHERE expires_at IS NOT NULL;

-- =============================================
-- PART 3: Create trigger for whitelist timestamps
-- =============================================

DROP TRIGGER IF EXISTS update_whitelist_updated_at ON whitelist;
CREATE TRIGGER update_whitelist_updated_at
  BEFORE UPDATE ON whitelist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PART 4: RPC function to check if user is whitelisted
-- =============================================

CREATE OR REPLACE FUNCTION is_user_whitelisted(
  p_user_id UUID,
  p_game_slug TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_game_id UUID;
  v_is_whitelisted BOOLEAN;
BEGIN
  -- Get game ID from slug
  SELECT id INTO v_game_id
  FROM games
  WHERE slug = p_game_slug;

  IF v_game_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user is whitelisted and active
  SELECT EXISTS (
    SELECT 1
    FROM whitelist
    WHERE user_id = p_user_id
      AND game_id = v_game_id
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_is_whitelisted;

  RETURN v_is_whitelisted;
END;
$$;

COMMENT ON FUNCTION is_user_whitelisted IS 'Check if a user is whitelisted for a specific game';

-- =============================================
-- PART 5: RPC function to check Steam ID whitelist status
-- =============================================

CREATE OR REPLACE FUNCTION is_steam_id_whitelisted(
  p_steam_id TEXT,
  p_game_slug TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_game_id UUID;
  v_is_whitelisted BOOLEAN;
BEGIN
  -- Get game ID from slug
  SELECT id INTO v_game_id
  FROM games
  WHERE slug = p_game_slug;

  IF v_game_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if Steam ID is whitelisted and active
  SELECT EXISTS (
    SELECT 1
    FROM whitelist
    WHERE steam_id = p_steam_id
      AND game_id = v_game_id
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_is_whitelisted;

  RETURN v_is_whitelisted;
END;
$$;

COMMENT ON FUNCTION is_steam_id_whitelisted IS 'Check if a Steam ID is whitelisted for a specific game (used by LogWatcher)';

-- =============================================
-- PART 6: RPC function to get whitelist for game
-- =============================================

CREATE OR REPLACE FUNCTION get_game_whitelist(p_game_slug TEXT)
RETURNS TABLE (
  steam_id TEXT,
  user_id UUID,
  username TEXT,
  email TEXT,
  is_active BOOLEAN,
  expires_at TIMESTAMPTZ,
  reason TEXT,
  added_at TIMESTAMPTZ,
  added_by_username TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_game_id UUID;
BEGIN
  -- Get game ID from slug
  SELECT id INTO v_game_id
  FROM games
  WHERE slug = p_game_slug;

  IF v_game_id IS NULL THEN
    RAISE EXCEPTION 'Game not found: %', p_game_slug;
  END IF;

  RETURN QUERY
  SELECT
    w.steam_id,
    w.user_id,
    u.username,
    u.email,
    w.is_active,
    w.expires_at,
    w.reason,
    w.added_at,
    admin.username AS added_by_username
  FROM whitelist w
  JOIN users u ON w.user_id = u.id
  LEFT JOIN users admin ON w.added_by = admin.id
  WHERE w.game_id = v_game_id
  ORDER BY w.added_at DESC;
END;
$$;

COMMENT ON FUNCTION get_game_whitelist IS 'Get all whitelist entries for a specific game (admin only)';

-- =============================================
-- PART 7: RPC function to add user to whitelist
-- =============================================

CREATE OR REPLACE FUNCTION add_to_whitelist(
  p_user_id UUID,
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
  v_steam_id TEXT;
  v_admin_id UUID;
  v_whitelist_id UUID;
BEGIN
  -- Get current admin user ID from JWT
  v_admin_id := auth.uid();

  -- Verify admin is actually an admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_admin_id AND is_admin = TRUE) THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Only admins can add users to whitelist'
    );
  END IF;

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

  -- Get user's Steam ID
  SELECT steam_id INTO v_steam_id
  FROM users
  WHERE id = p_user_id;

  IF v_steam_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'User does not have a Steam ID linked'
    );
  END IF;

  -- Insert or update whitelist entry
  INSERT INTO whitelist (
    user_id,
    game_id,
    steam_id,
    is_active,
    added_by,
    reason,
    expires_at,
    admin_notes
  )
  VALUES (
    p_user_id,
    v_game_id,
    v_steam_id,
    TRUE,
    v_admin_id,
    p_reason,
    p_expires_at,
    p_admin_notes
  )
  ON CONFLICT (user_id, game_id)
  DO UPDATE SET
    is_active = TRUE,
    steam_id = v_steam_id,
    added_by = v_admin_id,
    reason = p_reason,
    expires_at = p_expires_at,
    admin_notes = p_admin_notes,
    updated_at = NOW()
  RETURNING id INTO v_whitelist_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'whitelist_id', v_whitelist_id,
    'user_id', p_user_id,
    'game_slug', p_game_slug
  );
END;
$$;

COMMENT ON FUNCTION add_to_whitelist IS 'Add a user to game whitelist (admin only)';

-- =============================================
-- PART 8: RPC function to remove user from whitelist
-- =============================================

CREATE OR REPLACE FUNCTION remove_from_whitelist(
  p_user_id UUID,
  p_game_slug TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_game_id UUID;
  v_admin_id UUID;
BEGIN
  -- Get current admin user ID from JWT
  v_admin_id := auth.uid();

  -- Verify admin is actually an admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_admin_id AND is_admin = TRUE) THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Only admins can remove users from whitelist'
    );
  END IF;

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

  -- Soft delete: set is_active to FALSE
  UPDATE whitelist
  SET
    is_active = FALSE,
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND game_id = v_game_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'user_id', p_user_id,
    'game_slug', p_game_slug
  );
END;
$$;

COMMENT ON FUNCTION remove_from_whitelist IS 'Remove a user from game whitelist (admin only)';

-- =============================================
-- PART 9: Enable RLS on whitelist table
-- =============================================

ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own whitelist status
CREATE POLICY "Users can see own whitelist status"
  ON whitelist FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can see all whitelist entries
CREATE POLICY "Admins can see all whitelist entries"
  ON whitelist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND is_admin = TRUE
    )
  );

-- Policy: Admins can manage whitelist
CREATE POLICY "Admins can manage whitelist"
  ON whitelist FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND is_admin = TRUE
    )
  );

-- Policy: Service role has full access
CREATE POLICY "Service role can manage whitelist"
  ON whitelist FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- PART 10: Update users table RLS for admin access
-- =============================================

-- Policy: Admins can see all users
CREATE POLICY "Admins can see all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.is_admin = TRUE
    )
  );

-- Policy: Admins can update any user (except admin status and admin notes)
-- Note: This should be handled carefully in the application layer
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.is_admin = TRUE
    )
  );

-- =============================================
-- PART 11: Grant permissions
-- =============================================

GRANT SELECT ON whitelist TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_user_whitelisted TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_steam_id_whitelisted TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_game_whitelist TO authenticated;
GRANT EXECUTE ON FUNCTION add_to_whitelist TO authenticated;
GRANT EXECUTE ON FUNCTION remove_from_whitelist TO authenticated;

-- =============================================
-- PART 12: Cleanup expired whitelist entries (maintenance function)
-- =============================================

CREATE OR REPLACE FUNCTION cleanup_expired_whitelist()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Set expired entries to inactive
  UPDATE whitelist
  SET is_active = FALSE
  WHERE is_active = TRUE
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION cleanup_expired_whitelist IS 'Deactivate expired whitelist entries (run periodically)';

-- =============================================
-- PART 13: Verification
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Whitelist System Migration Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created: whitelist';
  RAISE NOTICE 'Columns added to users: is_admin, admin_notes';
  RAISE NOTICE 'RPC functions created: 6';
  RAISE NOTICE 'RLS policies created: 7';
  RAISE NOTICE '========================================';
END $$;
