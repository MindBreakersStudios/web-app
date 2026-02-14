-- ============================================================================
-- MindBreakers - RCON Command Queue System
-- ============================================================================
-- Migration: 20260213000001_rcon_command_queue.sql
-- Date: 2026-02-13
--
-- PURPOSE:
--   Enable admin command execution from web app to game servers via RCON
--
-- COMPONENTS:
--   1. Add RCON connection details to servers table
--   2. server_commands table - Command queue with status tracking
--   3. server_stats table - Live server statistics cache
--   4. Row Level Security policies for admin-only access
--
-- ARCHITECTURE:
--   Web App → server_commands (queue) → Windows Polling Service → RCON → Game Server
--   Windows Service → RCON "info" → server_stats (cache) → Web App
-- ============================================================================


-- ============================================================================
-- 1. ADD RCON CONNECTION FIELDS TO SERVERS TABLE
-- ============================================================================
-- Add RCON configuration to existing servers table

ALTER TABLE servers ADD COLUMN IF NOT EXISTS rcon_host TEXT;
ALTER TABLE servers ADD COLUMN IF NOT EXISTS rcon_port INT;
ALTER TABLE servers ADD COLUMN IF NOT EXISTS rcon_password_encrypted TEXT;
ALTER TABLE servers ADD COLUMN IF NOT EXISTS rcon_enabled BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN servers.rcon_host IS 'RCON server host (usually localhost or server IP)';
COMMENT ON COLUMN servers.rcon_port IS 'RCON port number';
COMMENT ON COLUMN servers.rcon_password_encrypted IS 'Encrypted RCON password (use encryption in app)';
COMMENT ON COLUMN servers.rcon_enabled IS 'Whether RCON is enabled and configured for this server';


-- ============================================================================
-- 2. CREATE SERVER_COMMANDS TABLE (Command Queue)
-- ============================================================================
-- Queue table for admin commands to be executed via RCON

-- Create enum types
DO $$ BEGIN
  CREATE TYPE command_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE command_type AS ENUM (
    'restart',           -- Server restart
    'info',              -- Get server info
    'kick_player',       -- Kick player
    'ban_player',        -- Ban player
    'unban_player',      -- Unban player
    'announce',          -- Send announcement
    'teleport',          -- Teleport player
    'give_item',         -- Give item to player
    'shutdown',          -- Shutdown server
    'custom'             -- Custom RCON command
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS server_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Command details
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  command_type command_type NOT NULL,
  rcon_command TEXT NOT NULL,  -- Actual RCON command to execute (e.g., "restart", "kick PlayerName")
  params JSONB,                -- Command parameters for reference/logging (e.g., {"player": "John", "reason": "Cheating"})
  description TEXT,            -- Human-readable description (e.g., "Restart server for maintenance")

  -- Status tracking
  status command_status NOT NULL DEFAULT 'pending',
  result TEXT,                 -- Command output/response from RCON
  error_message TEXT,          -- Error message if failed

  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,      -- When execution started
  completed_at TIMESTAMPTZ,    -- When execution finished

  -- Execution tracking
  attempt_count INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  executor_pid INT,            -- Process ID of the executor service (for debugging)
  executor_hostname TEXT       -- Hostname of the machine executing the command
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_server_commands_status ON server_commands(status, created_at);
CREATE INDEX IF NOT EXISTS idx_server_commands_server ON server_commands(server_id, created_at);
CREATE INDEX IF NOT EXISTS idx_server_commands_created_by ON server_commands(created_by, created_at);
CREATE INDEX IF NOT EXISTS idx_server_commands_pending ON server_commands(server_id, status) WHERE status = 'pending';

-- Comments
COMMENT ON TABLE server_commands IS 'Queue of RCON commands to be executed on game servers';
COMMENT ON COLUMN server_commands.rcon_command IS 'Actual RCON command string to execute (e.g., "restart", "kick PlayerName")';
COMMENT ON COLUMN server_commands.params IS 'JSON object with command parameters for logging/reference';
COMMENT ON COLUMN server_commands.status IS 'Command execution status (pending → processing → completed/failed)';
COMMENT ON COLUMN server_commands.attempt_count IS 'Number of execution attempts (max 3 by default)';


-- ============================================================================
-- 3. CREATE SERVER_STATS TABLE (Live Stats Cache)
-- ============================================================================
-- Cached server statistics from periodic RCON "info" queries

CREATE TABLE IF NOT EXISTS server_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL UNIQUE REFERENCES servers(id) ON DELETE CASCADE,

  -- Server info
  server_name TEXT,
  map_name TEXT,
  game_mode TEXT,
  version TEXT,

  -- Player info
  current_players INT DEFAULT 0,
  max_players INT DEFAULT 0,
  player_list JSONB,  -- Array of {name, steam_id, playtime} if available

  -- Game-specific data (flexible JSONB for different games)
  game_data JSONB,  -- e.g., {"season": 3, "weather": "rainy", "time": "night"}

  -- Metadata
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rcon_available BOOLEAN DEFAULT TRUE,
  last_rcon_error TEXT,
  sync_interval_seconds INT DEFAULT 900  -- 15 minutes = 900 seconds
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_server_stats_updated ON server_stats(last_updated);
CREATE INDEX IF NOT EXISTS idx_server_stats_server ON server_stats(server_id);

-- Comments
COMMENT ON TABLE server_stats IS 'Cached live statistics from game servers (updated via RCON every 15 minutes)';
COMMENT ON COLUMN server_stats.player_list IS 'JSON array of currently connected players with details';
COMMENT ON COLUMN server_stats.game_data IS 'Game-specific data (season, weather, etc.) stored as flexible JSON';
COMMENT ON COLUMN server_stats.rcon_available IS 'Whether RCON connection is working (false if last sync failed)';
COMMENT ON COLUMN server_stats.sync_interval_seconds IS 'How often stats are synced (default 900s = 15min)';


-- ============================================================================
-- 4. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE server_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_stats ENABLE ROW LEVEL SECURITY;

-- server_commands policies
-- -------------------------

-- Policy: Admins can insert commands
CREATE POLICY "Admins can insert commands"
  ON server_commands
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Policy: Users can view their own commands
CREATE POLICY "Users can view their commands"
  ON server_commands
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Policy: Admins can update command status (also needed for executor service with service role)
CREATE POLICY "Service can update commands"
  ON server_commands
  FOR UPDATE
  TO service_role
  USING (true);

-- Policy: Admins can cancel their own pending commands
CREATE POLICY "Users can cancel their pending commands"
  ON server_commands
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    status = 'cancelled'
  );


-- server_stats policies
-- ---------------------

-- Policy: Anyone authenticated can read stats
CREATE POLICY "Authenticated users can read stats"
  ON server_stats
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Service role can update stats (for sync service)
CREATE POLICY "Service can update stats"
  ON server_stats
  FOR UPDATE, INSERT
  TO service_role
  USING (true);


-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function to get pending commands for a specific server
CREATE OR REPLACE FUNCTION get_pending_commands(target_server_id UUID)
RETURNS TABLE (
  id UUID,
  server_id UUID,
  command_type command_type,
  rcon_command TEXT,
  params JSONB,
  attempt_count INT,
  max_attempts INT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.id,
    sc.server_id,
    sc.command_type,
    sc.rcon_command,
    sc.params,
    sc.attempt_count,
    sc.max_attempts,
    sc.created_at
  FROM server_commands sc
  WHERE sc.server_id = target_server_id
    AND sc.status = 'pending'
  ORDER BY sc.created_at ASC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_pending_commands IS 'Get up to 10 pending commands for a server (used by executor service)';


-- Function to mark command as processing
CREATE OR REPLACE FUNCTION start_command_execution(
  command_id UUID,
  pid INT,
  hostname TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE server_commands
  SET
    status = 'processing',
    started_at = NOW(),
    executor_pid = pid,
    executor_hostname = hostname
  WHERE id = command_id
    AND status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION start_command_execution IS 'Mark a command as processing (called by executor service)';


-- Function to complete command execution
CREATE OR REPLACE FUNCTION complete_command_execution(
  command_id UUID,
  success BOOLEAN,
  output TEXT,
  error TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE server_commands
  SET
    status = CASE WHEN success THEN 'completed'::command_status ELSE 'failed'::command_status END,
    completed_at = NOW(),
    result = output,
    error_message = error
  WHERE id = command_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION complete_command_execution IS 'Mark a command as completed or failed (called by executor service)';


-- ============================================================================
-- 6. INITIAL DATA (Optional)
-- ============================================================================

-- Add some example data for testing (comment out in production)
/*
-- Example: Add RCON config to a server (update with your actual server)
UPDATE servers
SET
  rcon_host = '127.0.0.1',
  rcon_port = 27015,
  rcon_password_encrypted = 'ENCRYPTED_PASSWORD_HERE',
  rcon_enabled = true
WHERE slug = 'humanitz-latam-1';  -- Adjust to your server slug
*/


-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Verification queries (for manual testing)
-- SELECT * FROM server_commands ORDER BY created_at DESC LIMIT 10;
-- SELECT * FROM server_stats;
-- SELECT * FROM servers WHERE rcon_enabled = true;
