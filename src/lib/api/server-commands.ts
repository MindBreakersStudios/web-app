/**
 * MindBreakers - Server Commands API
 *
 * Supabase API helper functions for RCON command queue system.
 * Provides type-safe access to server commands, stats, and real-time updates.
 *
 * @module server-commands
 */

import { supabase } from '../supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Command execution status
 */
export type CommandStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * Available RCON command types
 */
export type CommandType =
  | 'restart'
  | 'info'
  | 'kick_player'
  | 'ban_player'
  | 'unban_player'
  | 'announce'
  | 'teleport'
  | 'give_item'
  | 'shutdown'
  | 'custom';

/**
 * Server command record from database
 */
export interface ServerCommand {
  id: string;
  server_id: string;
  command_type: CommandType;
  rcon_command: string;
  params?: Record<string, any>;
  description?: string;
  status: CommandStatus;
  result?: string;
  error_message?: string;
  created_by: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  attempt_count: number;
  max_attempts: number;
  executor_pid?: number;
  executor_hostname?: string;
}

/**
 * Server statistics record from database
 */
export interface ServerStats {
  id: string;
  server_id: string;
  server_name?: string;
  map_name?: string;
  game_mode?: string;
  version?: string;
  current_players: number;
  max_players: number;
  player_list?: any[];
  game_data?: Record<string, any>;
  last_updated: string;
  rcon_available: boolean;
  last_rcon_error?: string;
  sync_interval_seconds: number;
}

/**
 * Parameters for creating a new server command
 */
export interface CreateCommandParams {
  serverId: string;
  commandType: CommandType;
  rconCommand: string;
  params?: Record<string, any>;
  description?: string;
}

/**
 * Filters for querying command history
 */
export interface CommandHistoryFilters {
  serverId?: string;
  status?: CommandStatus;
  limit?: number;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates that Supabase is available
 * @throws {Error} If Supabase is not configured
 */
function ensureSupabase(): void {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }
}

/**
 * Creates a standardized error response
 */
function createError(message: string, details?: any): ApiError {
  return {
    message,
    details,
  };
}

/**
 * Validates that a string parameter is not empty
 */
function validateNonEmpty(value: string, fieldName: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }
}

// ============================================================================
// COMMAND OPERATIONS
// ============================================================================

/**
 * Create a new server command
 *
 * Queues an RCON command for execution on a game server. Only admins can create commands.
 *
 * @param params - Command creation parameters
 * @returns Promise resolving to the created command
 * @throws {Error} If Supabase is not configured or command creation fails
 *
 * @example
 * ```typescript
 * const command = await createServerCommand({
 *   serverId: 'uuid-here',
 *   commandType: 'restart',
 *   rconCommand: 'restart',
 *   description: 'Scheduled maintenance'
 * });
 * console.log('Command created:', command.id);
 * ```
 */
export async function createServerCommand(params: CreateCommandParams): Promise<ServerCommand> {
  ensureSupabase();

  // Validate inputs
  validateNonEmpty(params.serverId, 'Server ID');
  validateNonEmpty(params.commandType, 'Command type');
  validateNonEmpty(params.rconCommand, 'RCON command');

  try {
    const { data, error } = await supabase!
      .from('server_commands')
      .insert({
        server_id: params.serverId,
        command_type: params.commandType,
        rcon_command: params.rconCommand,
        params: params.params || null,
        description: params.description || null,
        status: 'pending',
        attempt_count: 0,
        max_attempts: 3,
      })
      .select()
      .single();

    if (error) {
      throw createError('Failed to create server command', error);
    }

    if (!data) {
      throw createError('No data returned from command creation');
    }

    return data as ServerCommand;
  } catch (error: any) {
    console.error('[API] Error creating server command:', error);
    throw error;
  }
}

/**
 * Get command status by ID
 *
 * Retrieves the current status and details of a specific command.
 * Users can only view their own commands unless they are admins.
 *
 * @param commandId - UUID of the command to retrieve
 * @returns Promise resolving to the command details
 * @throws {Error} If Supabase is not configured or command not found
 *
 * @example
 * ```typescript
 * const command = await getCommandStatus('command-uuid');
 * console.log('Status:', command.status);
 * if (command.status === 'completed') {
 *   console.log('Result:', command.result);
 * }
 * ```
 */
export async function getCommandStatus(commandId: string): Promise<ServerCommand> {
  ensureSupabase();
  validateNonEmpty(commandId, 'Command ID');

  try {
    const { data, error } = await supabase!
      .from('server_commands')
      .select('*')
      .eq('id', commandId)
      .single();

    if (error) {
      throw createError('Failed to fetch command status', error);
    }

    if (!data) {
      throw createError('Command not found');
    }

    return data as ServerCommand;
  } catch (error: any) {
    console.error('[API] Error fetching command status:', error);
    throw error;
  }
}

/**
 * Get command history
 *
 * Retrieves command history with optional filtering. Users see only their own
 * commands unless they are admins (enforced by RLS).
 *
 * @param filters - Optional filters for server ID, status, and limit
 * @returns Promise resolving to array of commands
 * @throws {Error} If Supabase is not configured or query fails
 *
 * @example
 * ```typescript
 * // Get all pending commands for a server
 * const pending = await getCommandHistory({
 *   serverId: 'server-uuid',
 *   status: 'pending',
 *   limit: 20
 * });
 *
 * // Get last 10 commands across all servers
 * const recent = await getCommandHistory({ limit: 10 });
 * ```
 */
export async function getCommandHistory(
  filters: CommandHistoryFilters = {}
): Promise<ServerCommand[]> {
  ensureSupabase();

  try {
    let query = supabase!
      .from('server_commands')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.serverId) {
      query = query.eq('server_id', filters.serverId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Apply limit (default 50, max 200)
    const limit = Math.min(filters.limit || 50, 200);
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      throw createError('Failed to fetch command history', error);
    }

    return (data || []) as ServerCommand[];
  } catch (error: any) {
    console.error('[API] Error fetching command history:', error);
    throw error;
  }
}

/**
 * Cancel a pending command
 *
 * Cancels a command that is still in 'pending' status. Users can only cancel
 * their own commands (enforced by RLS).
 *
 * @param commandId - UUID of the command to cancel
 * @returns Promise resolving to true if cancelled successfully
 * @throws {Error} If Supabase is not configured or cancellation fails
 *
 * @example
 * ```typescript
 * const cancelled = await cancelCommand('command-uuid');
 * if (cancelled) {
 *   console.log('Command cancelled successfully');
 * }
 * ```
 */
export async function cancelCommand(commandId: string): Promise<boolean> {
  ensureSupabase();
  validateNonEmpty(commandId, 'Command ID');

  try {
    const { error } = await supabase!
      .from('server_commands')
      .update({ status: 'cancelled' })
      .eq('id', commandId)
      .eq('status', 'pending'); // Only cancel pending commands

    if (error) {
      throw createError('Failed to cancel command', error);
    }

    return true;
  } catch (error: any) {
    console.error('[API] Error cancelling command:', error);
    throw error;
  }
}

// ============================================================================
// SERVER STATS OPERATIONS
// ============================================================================

/**
 * Get server statistics
 *
 * Retrieves cached live statistics for a specific game server. Stats are
 * updated every 15 minutes by the sync service.
 *
 * @param serverId - UUID of the server
 * @returns Promise resolving to server stats or null if not found
 * @throws {Error} If Supabase is not configured or query fails
 *
 * @example
 * ```typescript
 * const stats = await getServerStats('server-uuid');
 * if (stats) {
 *   console.log(`Players: ${stats.current_players}/${stats.max_players}`);
 *   console.log(`Map: ${stats.map_name}`);
 * }
 * ```
 */
export async function getServerStats(serverId: string): Promise<ServerStats | null> {
  ensureSupabase();
  validateNonEmpty(serverId, 'Server ID');

  try {
    const { data, error } = await supabase!
      .from('server_stats')
      .select('*')
      .eq('server_id', serverId)
      .single();

    if (error) {
      // Return null if not found (not an error condition)
      if (error.code === 'PGRST116') {
        return null;
      }
      throw createError('Failed to fetch server stats', error);
    }

    return data as ServerStats;
  } catch (error: any) {
    console.error('[API] Error fetching server stats:', error);
    throw error;
  }
}

/**
 * Get all servers statistics
 *
 * Retrieves cached live statistics for all game servers. Useful for
 * displaying a server list with current player counts.
 *
 * @returns Promise resolving to array of server stats
 * @throws {Error} If Supabase is not configured or query fails
 *
 * @example
 * ```typescript
 * const allStats = await getAllServersStats();
 * allStats.forEach(stats => {
 *   console.log(`${stats.server_name}: ${stats.current_players}/${stats.max_players}`);
 * });
 * ```
 */
export async function getAllServersStats(): Promise<ServerStats[]> {
  ensureSupabase();

  try {
    const { data, error } = await supabase!
      .from('server_stats')
      .select('*')
      .order('server_name', { ascending: true });

    if (error) {
      throw createError('Failed to fetch all server stats', error);
    }

    return (data || []) as ServerStats[];
  } catch (error: any) {
    console.error('[API] Error fetching all server stats:', error);
    throw error;
  }
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to server stats updates
 *
 * Creates a real-time subscription to receive updates when server statistics
 * change. The callback is invoked whenever the stats are updated by the sync service.
 *
 * Remember to unsubscribe when component unmounts to prevent memory leaks.
 *
 * @param serverId - UUID of the server to monitor
 * @param callback - Function to call when stats update
 * @returns RealtimeChannel subscription (call .unsubscribe() to cleanup)
 * @throws {Error} If Supabase is not configured
 *
 * @example
 * ```typescript
 * const subscription = subscribeToServerStats('server-uuid', (stats) => {
 *   console.log('Stats updated:', stats.current_players);
 * });
 *
 * // Cleanup when done
 * subscription.unsubscribe();
 * ```
 */
export function subscribeToServerStats(
  serverId: string,
  callback: (stats: ServerStats) => void
): RealtimeChannel {
  ensureSupabase();
  validateNonEmpty(serverId, 'Server ID');

  const channel = supabase!
    .channel(`server-stats-${serverId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'server_stats',
        filter: `server_id=eq.${serverId}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as ServerStats);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to command status updates
 *
 * Creates a real-time subscription to receive updates when a specific command's
 * status changes (e.g., pending → processing → completed).
 *
 * Remember to unsubscribe when component unmounts to prevent memory leaks.
 *
 * @param commandId - UUID of the command to monitor
 * @param callback - Function to call when command updates
 * @returns RealtimeChannel subscription (call .unsubscribe() to cleanup)
 * @throws {Error} If Supabase is not configured
 *
 * @example
 * ```typescript
 * const subscription = subscribeToCommandStatus('command-uuid', (command) => {
 *   console.log('Command status:', command.status);
 *   if (command.status === 'completed') {
 *     console.log('Result:', command.result);
 *   }
 * });
 *
 * // Cleanup when done
 * subscription.unsubscribe();
 * ```
 */
export function subscribeToCommandStatus(
  commandId: string,
  callback: (command: ServerCommand) => void
): RealtimeChannel {
  ensureSupabase();
  validateNonEmpty(commandId, 'Command ID');

  const channel = supabase!
    .channel(`server-command-${commandId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'server_commands',
        filter: `id=eq.${commandId}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as ServerCommand);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to all command updates for a server
 *
 * Creates a real-time subscription to receive updates for all commands related
 * to a specific server. Useful for admin dashboards showing live command queue.
 *
 * Remember to unsubscribe when component unmounts to prevent memory leaks.
 *
 * @param serverId - UUID of the server to monitor
 * @param callback - Function to call when any command updates
 * @returns RealtimeChannel subscription (call .unsubscribe() to cleanup)
 * @throws {Error} If Supabase is not configured
 *
 * @example
 * ```typescript
 * const subscription = subscribeToServerCommands('server-uuid', (command) => {
 *   console.log('Command update:', command.status, command.description);
 * });
 *
 * // Cleanup when done
 * subscription.unsubscribe();
 * ```
 */
export function subscribeToServerCommands(
  serverId: string,
  callback: (command: ServerCommand) => void
): RealtimeChannel {
  ensureSupabase();
  validateNonEmpty(serverId, 'Server ID');

  const channel = supabase!
    .channel(`server-commands-${serverId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'server_commands',
        filter: `server_id=eq.${serverId}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as ServerCommand);
        }
      }
    )
    .subscribe();

  return channel;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if command is in a final state
 *
 * Utility function to determine if a command has finished executing
 * (completed, failed, or cancelled).
 *
 * @param command - Command to check
 * @returns True if command is in a terminal state
 *
 * @example
 * ```typescript
 * if (isCommandFinished(command)) {
 *   console.log('Command is done');
 * }
 * ```
 */
export function isCommandFinished(command: ServerCommand): boolean {
  return ['completed', 'failed', 'cancelled'].includes(command.status);
}

/**
 * Check if command is currently executing
 *
 * Utility function to determine if a command is actively being processed.
 *
 * @param command - Command to check
 * @returns True if command is in processing state
 *
 * @example
 * ```typescript
 * if (isCommandExecuting(command)) {
 *   console.log('Command is running...');
 * }
 * ```
 */
export function isCommandExecuting(command: ServerCommand): boolean {
  return command.status === 'processing';
}

/**
 * Calculate command duration
 *
 * Calculates how long a command took to execute (or is taking if still running).
 *
 * @param command - Command to analyze
 * @returns Duration in milliseconds, or null if not started
 *
 * @example
 * ```typescript
 * const duration = getCommandDuration(command);
 * if (duration) {
 *   console.log(`Took ${duration}ms`);
 * }
 * ```
 */
export function getCommandDuration(command: ServerCommand): number | null {
  if (!command.started_at) {
    return null;
  }

  const end = command.completed_at
    ? new Date(command.completed_at)
    : new Date();
  const start = new Date(command.started_at);

  return end.getTime() - start.getTime();
}

/**
 * Format command status for display
 *
 * Converts command status enum to human-readable text.
 *
 * @param status - Command status
 * @returns Formatted status string
 *
 * @example
 * ```typescript
 * console.log(formatCommandStatus('pending')); // "Pending"
 * console.log(formatCommandStatus('processing')); // "Processing"
 * ```
 */
export function formatCommandStatus(status: CommandStatus): string {
  const statusMap: Record<CommandStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
  };

  return statusMap[status] || status;
}

/**
 * Get status color for UI
 *
 * Returns a color class name based on command status for UI styling.
 *
 * @param status - Command status
 * @returns Color indicator string
 *
 * @example
 * ```typescript
 * const color = getStatusColor(command.status);
 * // Returns: 'success', 'error', 'warning', 'info', or 'default'
 * ```
 */
export function getStatusColor(status: CommandStatus): 'success' | 'error' | 'warning' | 'info' | 'default' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'error';
    case 'processing':
      return 'warning';
    case 'pending':
      return 'info';
    case 'cancelled':
      return 'default';
    default:
      return 'default';
  }
}
