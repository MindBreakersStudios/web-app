import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';

// API Configuration
// NOTE: This URL should be configured via environment variables in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Debug flag - disable in production
const DEBUG_API = import.meta.env.DEV;

// Global session storage to avoid hanging getSession() calls
let globalSession: Session | null = null;

export const setGlobalSession = (session: Session | null) => {
  if (DEBUG_API) {
    console.log('[API] Setting global session:', !!session);
  }
  globalSession = session;
};

// Helper function to get session with timeout
const getSessionWithTimeout = async (timeoutMs = 5000) => {
  if (globalSession) {
    if (DEBUG_API) {
      console.log('[API] Using cached global session');
    }
    return { data: { session: globalSession } };
  }

  if (!supabase || !supabase.auth) {
    if (DEBUG_API) {
      console.warn('[API] Supabase not configured, returning null session');
    }
    return { data: { session: null } };
  }

  if (DEBUG_API) {
    console.log('[API] Fetching session with timeout...');
  }

  return Promise.race([
    supabase.auth.getSession(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('getSession timeout')), timeoutMs)
    )
  ]) as Promise<{ data: { session: Session | null } }>;
};

// Helper function for authenticated API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  if (DEBUG_API) {
    console.log(`[API] Calling ${endpoint}`);
  }

  let session = null;
  
  try {
    const { data: { session: fetchedSession } } = await getSessionWithTimeout();
    session = fetchedSession;
  } catch (error) {
    if (DEBUG_API) {
      console.error('[API] Failed to get session:', error);
    }
    throw new Error('Failed to get authentication session');
  }
  
  if (!session) {
    if (DEBUG_API) {
      console.log('[API] No active session found');
    }
    throw new Error('No active session');
  }

  if (DEBUG_API) {
    console.log(`[API] Session found, making request to ${API_BASE_URL}${endpoint}`);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (DEBUG_API) {
      console.log(`[API] Response status: ${response.status}`);
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      if (DEBUG_API) {
        console.error(`[API] Error response (${response.status}):`, errorText);
      }
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (DEBUG_API) {
      console.log(`[API] Success response:`, data);
    }
    
    return data;
  } catch (error) {
    if (DEBUG_API) {
      console.error(`[API] Network/Parse error:`, error);
    }
    throw error;
  }
};

// Auth API calls - User authentication and profile
export const authAPI = {
  // Sync user with backend after Supabase login
  syncUser: async () => {
    try {
      const userData = await apiCall('/auth/me');
      console.log('User synced to local database:', userData);
      return userData;
    } catch (error) {
      console.error('Failed to sync user:', error);
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const profile = await apiCall('/auth/profile');
      return profile;
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    }
  }
};

// Profile API calls - Enhanced user profile endpoints
export const profileAPI = {
  // Get profile with cached data (fast)
  getProfile: async (forceRefresh = false) => {
    try {
      const url = forceRefresh ? '/profile/me?force_refresh=true' : '/profile/me';
      const profile = await apiCall(url);
      return profile;
    } catch (error) {
      console.error('Failed to get enhanced profile:', error);
      throw error;
    }
  },

  // Refresh platform-specific data
  refreshPlatform: async (platform: 'steam' | 'discord') => {
    try {
      const response = await apiCall(`/profile/refresh?platform=${platform}`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error(`Failed to refresh ${platform} data:`, error);
      throw error;
    }
  },

  // Check linking status
  getLinkingStatus: async () => {
    try {
      const status = await apiCall('/profile/linking-status');
      return status;
    } catch (error) {
      console.error('Failed to get linking status:', error);
      throw error;
    }
  }
};

// Steam API calls - Steam account linking
export const steamAPI = {
  // Initialize secure Steam linking
  initSecureLink: async (returnUrl: string) => {
    console.log('Initializing Steam link...');

    try {
      const initResponse = await apiCall('/steam-link-secure/init-link', {
        method: 'POST',
        body: JSON.stringify({ return_url: returnUrl })
      });
      
      if (!initResponse || !initResponse.steam_auth_url) {
        throw new Error('Invalid response from init-link - missing steam_auth_url');
      }
      
      const authResponse = await fetch(initResponse.steam_auth_url);
      
      if (!authResponse.ok) {
        throw new Error(`Failed to get auth URL: ${authResponse.statusText}`);
      }
      
      const authData = await authResponse.json();
      
      if (!authData || !authData.auth_url) {
        throw new Error('Invalid response - missing auth_url');
      }
      
      return authData;
    } catch (error) {
      console.error('Failed to initialize Steam linking:', error);
      throw error;
    }
  },

  // Check Steam linking status
  getLinkingStatus: async () => {
    try {
      const response = await apiCall('/steam-link-secure/status');
      return response;
    } catch (error) {
      console.error('Failed to get Steam linking status:', error);
      throw error;
    }
  },

  // Unlink Steam account
  unlinkSteam: async () => {
    try {
      const response = await apiCall('/steam-link-secure/unlink', {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Failed to unlink Steam account:', error);
      throw error;
    }
  }
};

// General API helper for other endpoints
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  return apiCall(endpoint, options);
};

// ── Admin: Server Stats ─────────────────────────────────────────────────────

export interface ServerStats {
  server_id: string;
  server_name: string | null;
  current_players: number;
  max_players: number;
  map_name: string | null;
  game_mode: string | null;
  version: string | null;
  rcon_available: boolean;
  last_rcon_error: string | null;
  sync_interval_seconds: number;
  last_updated: string;
  game_data: Record<string, any>;
  player_list: any[];
}

export const getServerStats = async (serverId: string): Promise<ServerStats | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('server_stats')
    .select('*')
    .eq('server_id', serverId)
    .single();
  if (error) throw new Error(error.message);
  return data as ServerStats;
};

export const subscribeToServerStats = (
  serverId: string,
  callback: (stats: ServerStats) => void,
) => {
  if (!supabase) return { unsubscribe: () => {} };
  const channel = supabase
    .channel(`server_stats:${serverId}`)
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'server_stats', filter: `server_id=eq.${serverId}` },
      (payload: any) => callback(payload.new as ServerStats),
    )
    .subscribe();
  return { unsubscribe: () => { supabase!.removeChannel(channel); } };
};

// ── Admin: Server Commands ──────────────────────────────────────────────────

export type CommandType = 'restart' | 'stop' | 'start' | 'message' | 'kick' | 'ban' | 'custom';

export interface ServerCommand {
  id: string;
  server_id: string;
  command_type: CommandType;
  payload: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  created_by: string;
}

export const createServerCommand = async (
  serverId: string,
  commandType: CommandType,
  payload: Record<string, any> = {},
): Promise<ServerCommand> => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('server_commands')
    .insert({ server_id: serverId, command_type: commandType, payload, created_by: session.user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ServerCommand;
};

export const getCommandHistory = async (serverId?: string, limit = 50): Promise<ServerCommand[]> => {
  if (!supabase) return [];
  let query = supabase.from('server_commands').select('*').order('created_at', { ascending: false }).limit(limit);
  if (serverId) query = query.eq('server_id', serverId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as ServerCommand[];
};

export const subscribeToServerCommands = (
  serverId: string | undefined,
  callback: (command: ServerCommand) => void,
) => {
  if (!supabase) return { unsubscribe: () => {} };
  const filter = serverId ? `server_id=eq.${serverId}` : undefined;
  const channel = supabase
    .channel(`server_commands:${serverId ?? 'all'}`)
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'server_commands', ...(filter ? { filter } : {}) },
      (payload: any) => callback(payload.new as ServerCommand),
    )
    .subscribe();
  return { unsubscribe: () => { supabase!.removeChannel(channel); } };
};

// ── Admin: Command helpers ──────────────────────────────────────────────────

export const formatCommandStatus = (status: string): string => {
  switch (status) {
    case 'pending': return 'Pending';
    case 'running': return 'Running';
    case 'completed': return 'Completed';
    case 'failed': return 'Failed';
    default: return status;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return 'text-yellow-400';
    case 'running': return 'text-blue-400';
    case 'completed': return 'text-green-400';
    case 'failed': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

export const getCommandDuration = (command: ServerCommand): string | null => {
  if (!command.started_at) return null;
  const end = command.completed_at ? new Date(command.completed_at) : new Date();
  const start = new Date(command.started_at);
  const ms = end.getTime() - start.getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};
