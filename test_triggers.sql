-- =============================================
-- Test Database Triggers
-- =============================================
-- Run these queries to test the newly created triggers
-- =============================================

-- Test 1: Auto-create user profile trigger
-- Create a test auth user and verify profile is auto-created
-- Note: This requires inserting into auth.users which needs elevated privileges
-- In local Supabase Studio, you can test by signing up a new user via Auth UI

-- View existing triggers
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  OR (trigger_schema = 'auth' AND event_object_table = 'users')
ORDER BY event_object_table, trigger_name;

-- Test 2: Auto-update timestamp trigger
-- Update a user and check if updated_at changed

-- First, insert a test user directly (bypassing auth)
INSERT INTO users (id, username, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'test_user_' || floor(random() * 1000),
  'test_' || floor(random() * 1000) || '@example.com',
  NOW() - INTERVAL '1 day',  -- Set created 1 day ago
  NOW() - INTERVAL '1 day'   -- Set updated 1 day ago
)
RETURNING id, username, email, created_at, updated_at;

-- Save the returned ID and use it below
-- Example: \set user_id '123e4567-e89b-12d3-a456-426614174000'

-- Update the user and verify updated_at changes automatically
UPDATE users
SET username = 'updated_test_user'
WHERE username LIKE 'test_user_%'
RETURNING id, username, created_at, updated_at;

-- Verify: updated_at should be more recent than created_at
SELECT
  id,
  username,
  created_at,
  updated_at,
  (updated_at > created_at) AS "timestamp_updated_correctly"
FROM users
WHERE username = 'updated_test_user';

-- Test 3: Verify trigger on players table
INSERT INTO players (steam_id, steam_name, is_streamer, created_at, updated_at)
VALUES (
  '76561198123456789',
  'Test Player',
  false,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
)
RETURNING steam_id, steam_name, created_at, updated_at;

-- Update player and check timestamp
UPDATE players
SET steam_name = 'Updated Test Player'
WHERE steam_id = '76561198123456789'
RETURNING steam_id, steam_name, created_at, updated_at;

-- Verify trigger worked
SELECT
  steam_id,
  steam_name,
  created_at,
  updated_at,
  (updated_at > created_at) AS "timestamp_updated_correctly"
FROM players
WHERE steam_id = '76561198123456789';

-- Test 4: Cleanup test data
DELETE FROM players WHERE steam_id = '76561198123456789';
DELETE FROM users WHERE username = 'updated_test_user';

-- =============================================
-- Verification Queries
-- =============================================

-- List all triggers
SELECT
  n.nspname AS schema_name,
  t.tgname AS trigger_name,
  c.relname AS table_name,
  p.proname AS function_name,
  CASE
    WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
    ELSE 'AFTER'
  END AS trigger_timing,
  CASE
    WHEN t.tgtype & 4 = 4 THEN 'INSERT'
    WHEN t.tgtype & 8 = 8 THEN 'DELETE'
    WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
    ELSE 'OTHER'
  END AS trigger_event
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE NOT t.tgisinternal
  AND (n.nspname = 'public' OR (n.nspname = 'auth' AND c.relname = 'users'))
ORDER BY schema_name, table_name, trigger_name;

-- List all tables with updated_at column
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE column_name = 'updated_at'
  AND table_schema = 'public'
ORDER BY table_name;
