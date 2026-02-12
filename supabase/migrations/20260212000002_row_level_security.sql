-- =============================================
-- Migration: Row Level Security (RLS) Policies
-- =============================================
-- Description: Enable RLS and create security policies for all tables
-- Author: MindBreakers Team
-- Date: 2026-02-12
--
-- This migration implements Row Level Security to ensure users can only
-- access data they're authorized to see. Without RLS, all authenticated
-- users could read/write any data, which is a security risk.
-- =============================================

-- =============================================
-- PART 1: Enable RLS on all tables
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scum_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE humanitz_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_players ENABLE ROW LEVEL SECURITY;

-- Enable RLS on achievement tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'achievements') THEN
    ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
    ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- =============================================
-- PART 2: users table policies
-- =============================================

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Service role can do anything (for backend operations)
CREATE POLICY "Service role has full access to users"
  ON users FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- PART 3: games table policies
-- =============================================

-- Policy: Anyone can read games (public catalog)
CREATE POLICY "Anyone can read games"
  ON games FOR SELECT
  USING (true);

-- Policy: Only admins can modify games (future: check custom claims)
-- For now, only service role can modify
CREATE POLICY "Only service role can modify games"
  ON games FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- PART 4: servers table policies
-- =============================================

-- Policy: Anyone can read servers (public information)
CREATE POLICY "Anyone can read servers"
  ON servers FOR SELECT
  USING (true);

-- Policy: Only service role can modify servers
CREATE POLICY "Only service role can modify servers"
  ON servers FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- PART 5: subscription_tiers table policies
-- =============================================

-- Policy: Anyone can read subscription tiers (public pricing)
CREATE POLICY "Anyone can read subscription tiers"
  ON subscription_tiers FOR SELECT
  USING (true);

-- Policy: Only service role can modify tiers
CREATE POLICY "Only service role can modify subscription tiers"
  ON subscription_tiers FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- PART 6: subscriptions table policies
-- =============================================

-- Policy: Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only service role can create/modify subscriptions
-- (subscriptions are created by payment webhooks, not directly by users)
CREATE POLICY "Only service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- PART 7: player stats tables policies
-- =============================================

-- SCUM stats
-- Policy: Users can read their own stats
CREATE POLICY "Users can read own SCUM stats"
  ON scum_player_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Anyone can read stats (public leaderboards)
CREATE POLICY "Anyone can read SCUM stats"
  ON scum_player_stats FOR SELECT
  USING (true);

-- Policy: Only service role can modify stats
CREATE POLICY "Only service role can modify SCUM stats"
  ON scum_player_stats FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- HumanitZ stats
-- Policy: Users can read their own stats
CREATE POLICY "Users can read own HumanitZ stats"
  ON humanitz_player_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Anyone can read stats (public leaderboards)
CREATE POLICY "Anyone can read HumanitZ stats"
  ON humanitz_player_stats FOR SELECT
  USING (true);

-- Policy: Only service role can modify stats
CREATE POLICY "Only service role can modify HumanitZ stats"
  ON humanitz_player_stats FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- PART 8: players table policies
-- =============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can read players" ON players;
DROP POLICY IF EXISTS "Users can update own player" ON players;
DROP POLICY IF EXISTS "Service role can manage players" ON players;

-- Policy: Anyone can read players (for streamer listings)
CREATE POLICY "Anyone can read players"
  ON players FOR SELECT
  USING (true);

-- Policy: Users can update their own player record (if linked)
CREATE POLICY "Users can update own player"
  ON players FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can manage all players
CREATE POLICY "Service role can manage players"
  ON players FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- PART 9: connected_players table policies
-- =============================================

-- Policy: Anyone can read connected players (for WatchParty)
CREATE POLICY "Anyone can read connected players"
  ON connected_players FOR SELECT
  USING (true);

-- Policy: Only service role can manage connections
-- (LogWatcher manages this table)
CREATE POLICY "Only service role can manage connected players"
  ON connected_players FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- PART 10: Achievement tables policies (if they exist)
-- =============================================

DO $$
BEGIN
  -- achievements table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'achievements') THEN
    -- Anyone can read achievements (public catalog)
    EXECUTE 'CREATE POLICY "Anyone can read achievements" ON achievements FOR SELECT USING (true)';

    -- Only service role can manage achievements
    EXECUTE 'CREATE POLICY "Only service role can manage achievements" ON achievements FOR ALL USING (auth.jwt()->>''role'' = ''service_role'')';
  END IF;

  -- user_achievements table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
    -- Users can read their own achievements
    EXECUTE 'CREATE POLICY "Users can read own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id)';

    -- Anyone can read achievements (for public profiles)
    EXECUTE 'CREATE POLICY "Anyone can read user achievements" ON user_achievements FOR SELECT USING (true)';

    -- Only service role can grant achievements
    EXECUTE 'CREATE POLICY "Only service role can grant achievements" ON user_achievements FOR ALL USING (auth.jwt()->>''role'' = ''service_role'')';
  END IF;
END $$;

-- =============================================
-- PART 11: Grant anon access to public data
-- =============================================

-- Grant anonymous users (not logged in) access to public data
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Public read access
GRANT SELECT ON games TO anon, authenticated;
GRANT SELECT ON servers TO anon, authenticated;
GRANT SELECT ON subscription_tiers TO anon, authenticated;
GRANT SELECT ON players TO anon, authenticated;
GRANT SELECT ON connected_players TO anon, authenticated;
GRANT SELECT ON scum_player_stats TO anon, authenticated;
GRANT SELECT ON humanitz_player_stats TO anon, authenticated;

-- Authenticated users can read their own data
GRANT SELECT ON users TO authenticated;
GRANT SELECT ON subscriptions TO authenticated;

-- Service role needs full access (already has it by default)

-- =============================================
-- PART 12: Comments for documentation
-- =============================================

COMMENT ON POLICY "Users can read own profile" ON users IS
  'Users can only view their own profile data';

COMMENT ON POLICY "Anyone can read games" ON games IS
  'Games catalog is public for all users (anon and authenticated)';

COMMENT ON POLICY "Anyone can read players" ON players IS
  'Player data is public for streamer listings and leaderboards';

COMMENT ON POLICY "Anyone can read connected players" ON connected_players IS
  'Connected players data is public for WatchParty feature';

-- =============================================
-- PART 13: Security verification
-- =============================================

-- Verify RLS is enabled on all tables
DO $$
DECLARE
  table_record RECORD;
  rls_enabled BOOLEAN;
BEGIN
  FOR table_record IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = table_record.tablename
      AND relnamespace = 'public'::regnamespace;

    IF rls_enabled THEN
      RAISE NOTICE 'RLS enabled on: %', table_record.tablename;
    ELSE
      RAISE WARNING 'RLS NOT enabled on: %', table_record.tablename;
    END IF;
  END LOOP;
END $$;
