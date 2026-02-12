-- =============================================
-- Migration: Database Triggers
-- =============================================
-- Description: Add automatic triggers for common database operations
-- Author: MindBreakers Team
-- Date: 2026-02-12
--
-- This migration creates:
-- 1. Trigger to auto-create user profile when auth.users record is created
-- 2. Triggers to auto-update updated_at timestamps on all tables
-- =============================================

-- =============================================
-- PART 1: Auto-create user profile
-- =============================================

-- Function: Create user profile when auth.users record is created
-- This ensures every authenticated user has a corresponding profile in users table
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert new profile in users table with basic info from auth.users
  INSERT INTO public.users (id, email, username, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    -- Extract username from email (before @) as default
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Avoid errors if profile already exists

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION handle_new_user() IS 'Auto-creates user profile in users table when new auth.users record is created';

-- Create trigger on auth.users
-- Note: This trigger is on the auth schema, so it requires SUPERUSER privileges
-- In Supabase, this is handled automatically via the dashboard or supabase CLI
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- PART 2: Auto-update timestamps
-- =============================================

-- Function: Update updated_at timestamp
-- Generic function that updates the updated_at column to current timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_updated_at_column() IS 'Generic trigger function to auto-update updated_at timestamp';

-- =============================================
-- Apply timestamp triggers to all tables with updated_at column
-- =============================================

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for scum_player_stats table
DROP TRIGGER IF EXISTS update_scum_player_stats_updated_at ON scum_player_stats;
CREATE TRIGGER update_scum_player_stats_updated_at
  BEFORE UPDATE ON scum_player_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for humanitz_player_stats table
DROP TRIGGER IF EXISTS update_humanitz_player_stats_updated_at ON humanitz_player_stats;
CREATE TRIGGER update_humanitz_player_stats_updated_at
  BEFORE UPDATE ON humanitz_player_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for players table
DROP TRIGGER IF EXISTS update_players_updated_at ON players;
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for achievements table (if it has updated_at)
-- Note: Check if achievements table exists and has updated_at column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'achievements'
    AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS update_achievements_updated_at ON achievements;
    CREATE TRIGGER update_achievements_updated_at
      BEFORE UPDATE ON achievements
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Trigger for user_achievements table (if it has updated_at)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_achievements'
    AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS update_user_achievements_updated_at ON user_achievements;
    CREATE TRIGGER update_user_achievements_updated_at
      BEFORE UPDATE ON user_achievements
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =============================================
-- PART 3: Indexes for common queries
-- =============================================

-- Index for users.email (used for lookups during auth)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for users timestamps (for sorting/filtering)
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at DESC);

-- Index for subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
ON subscriptions(user_id, status, expires_at DESC);

-- Index for active subscriptions (common query)
CREATE INDEX IF NOT EXISTS idx_subscriptions_active
ON subscriptions(status, expires_at DESC)
WHERE status = 'active';

-- =============================================
-- PART 4: Comments for documentation
-- =============================================

-- Note: Cannot comment on auth.users trigger due to permission restrictions
-- COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
--   'Automatically creates a user profile in users table when new auth user is created';

COMMENT ON TRIGGER update_users_updated_at ON users IS
  'Automatically updates updated_at timestamp on user profile changes';

COMMENT ON TRIGGER update_players_updated_at ON players IS
  'Automatically updates updated_at timestamp on player record changes';

COMMENT ON TRIGGER update_scum_player_stats_updated_at ON scum_player_stats IS
  'Automatically updates updated_at timestamp on SCUM stats changes';

COMMENT ON TRIGGER update_humanitz_player_stats_updated_at ON humanitz_player_stats IS
  'Automatically updates updated_at timestamp on HumanitZ stats changes';

-- =============================================
-- PART 5: Test the triggers (optional, for verification)
-- =============================================

-- You can test these triggers by:
-- 1. Creating a new auth user (will auto-create profile)
-- 2. Updating a user profile (will auto-update updated_at)
--
-- Example test queries:
-- SELECT * FROM users WHERE id = '<test-user-id>';
-- UPDATE users SET username = 'test' WHERE id = '<test-user-id>';
-- SELECT updated_at FROM users WHERE id = '<test-user-id>';
