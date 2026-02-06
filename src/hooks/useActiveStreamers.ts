/**
 * useActiveStreamers Hook
 * =======================
 * 
 * Hook para obtener streamers activos con Realtime updates.
 * Diseñado para integrarse con el schema existente de MindBreakers.
 * 
 * Uso:
 *   const { streamers, isLoading, error } = useActiveStreamers({ gameSlug: 'humanitz' });
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// =============================================================================
// Types
// =============================================================================

export interface ActiveStreamer {
  id: string;
  kick_username: string;
  display_name: string | null;
  avatar_url: string | null;
  game_slug: string;
  game_name: string;
  server_name: string;
  in_game_name: string | null;
  is_live_on_kick: boolean; // Deprecated: usar is_live
  is_live: boolean; // True si está transmitiendo en Kick
  is_connected: boolean; // True si está conectado al servidor
  kick_stream_title: string | null;
  kick_viewer_count: number;
  kick_thumbnail_url: string | null;
  connected_at: string;
  last_seen_at: string | null;
}

interface UseActiveStreamersOptions {
  /** Filter by game slug ('humanitz', 'scum') or 'all' */
  gameSlug?: string | 'all';
  /** Filter by streamer status: 'live', 'online', 'offline', or 'all' (default: 'all') */
  filter?: 'live' | 'online' | 'offline' | 'all';
  /** Only return streamers who are live on Kick (deprecated, use filter) */
  onlyLive?: boolean;
  /** Enable realtime updates (default: true) */
  realtime?: boolean;
  /** Polling interval in ms if realtime is disabled */
  pollingInterval?: number;
}

interface UseActiveStreamersReturn {
  streamers: ActiveStreamer[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  realtimeStatus: 'connecting' | 'connected' | 'disconnected';
}

// =============================================================================
// Hook
// =============================================================================

export function useActiveStreamers(
  options: UseActiveStreamersOptions = {}
): UseActiveStreamersReturn {
  const {
    gameSlug = 'all',
    filter = 'all',
    onlyLive = true,
    realtime = true,
    pollingInterval = 30000,
  } = options;

  const [streamers, setStreamers] = useState<ActiveStreamer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // =========================================================================
  // Fetch streamers - DOS FUENTES DE DATOS
  // =========================================================================
  const fetchStreamers = useCallback(async () => {
    try {
      setError(null);

      // Check if Supabase is available
      if (!supabase || !isSupabaseAvailable()) {
        throw new Error('Supabase not configured. Please check your environment variables.');
      }

      // 1. Hacer ambas llamadas en paralelo
      const [liveResult, registeredResult] = await Promise.all([
        // Streamers conectados al servidor (con estado de Kick)
        supabase.rpc('get_live_streamers', {
          p_game_slug: gameSlug === 'all' ? null : gameSlug,
          p_filter: 'all', // Siempre traer todos los conectados
        }),
        // Todos los streamers registrados en el programa
        supabase.rpc('get_registered_streamers'),
      ]);

      if (liveResult.error) {
        throw new Error(`get_live_streamers: ${liveResult.error.message}`);
      }

      if (registeredResult.error) {
        throw new Error(`get_registered_streamers: ${registeredResult.error.message}`);
      }

      // 2. Crear Map de streamers conectados por kick_username para lookup rápido
      const liveStreamersMap = new Map(
        (liveResult.data || []).map((s: any) => [s.kick_username, s])
      );

      // 3. Combinar los resultados
      let combined: ActiveStreamer[] = (registeredResult.data || []).map((registered: any) => {
        const liveData = liveStreamersMap.get(registered.kick_username);
        
        return {
          id: registered.id,
          kick_username: registered.kick_username,
          display_name: registered.display_name,
          avatar_url: registered.avatar_url,
          game_slug: liveData?.game_slug || registered.game_slug || 'unknown',
          game_name: liveData?.game_name || '',
          server_name: liveData?.server_name || '',
          in_game_name: liveData?.in_game_name || null,
          is_live_on_kick: liveData?.is_live ?? false, // Backward compatibility
          is_live: liveData?.is_live ?? false, // True si está transmitiendo en Kick
          is_connected: !!liveData, // True si está en liveData (conectado al servidor)
          kick_stream_title: liveData?.kick_stream_title || null,
          kick_viewer_count: liveData?.kick_viewer_count || 0,
          kick_thumbnail_url: liveData?.kick_thumbnail_url || null,
          connected_at: liveData?.connected_at || registered.created_at,
          last_seen_at: liveData?.last_seen_at || null,
        };
      });

      // 4. Filtrar por game_slug si es necesario
      if (gameSlug !== 'all') {
        combined = combined.filter(s => s.game_slug === gameSlug);
      }

      // 5. Aplicar filtro de estado
      if (filter === 'live') {
        combined = combined.filter(s => s.is_live);
      } else if (filter === 'online') {
        combined = combined.filter(s => s.is_connected && !s.is_live);
      } else if (filter === 'offline') {
        combined = combined.filter(s => !s.is_connected);
      }
      // filter === 'all' no filtra nada

      // 6. Ordenar: LIVE primero, luego ONLINE, luego OFFLINE
      combined.sort((a, b) => {
        // Primero por estado
        if (a.is_live !== b.is_live) return a.is_live ? -1 : 1;
        if (a.is_connected !== b.is_connected) return a.is_connected ? -1 : 1;
        
        // Dentro de LIVE: por viewers
        if (a.is_live && b.is_live) {
          return (b.kick_viewer_count || 0) - (a.kick_viewer_count || 0);
        }
        
        // Dentro de ONLINE/OFFLINE: alfabético
        return (a.display_name || a.kick_username).localeCompare(
          b.display_name || b.kick_username
        );
      });

      setStreamers(combined);
    } catch (err) {
      console.error('[useActiveStreamers] Error fetching:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [gameSlug, filter, onlyLive]);

  // =========================================================================
  // Initial fetch
  // =========================================================================
  useEffect(() => {
    fetchStreamers();
  }, [fetchStreamers]);

  // =========================================================================
  // Realtime subscription
  // =========================================================================
  useEffect(() => {
    if (!realtime || !supabase || !isSupabaseAvailable()) {
      // Fallback to polling
      const interval = setInterval(fetchStreamers, pollingInterval);
      return () => clearInterval(interval);
    }

    setRealtimeStatus('connecting');

    const channel: RealtimeChannel = supabase
      .channel('active_streamers_realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'active_streamers',
        },
        (payload) => {
          console.log('[Realtime] Change on active_streamers:', payload.eventType, payload);
          // Refetch get_live_streamers y re-combinar con registered
          fetchStreamers();
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Status:', status);
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeStatus('disconnected');
        }
      });

    return () => {
      console.log('[Realtime] Unsubscribing...');
      channel.unsubscribe();
      setRealtimeStatus('disconnected');
    };
  }, [realtime, fetchStreamers, pollingInterval]);

  return {
    streamers,
    isLoading,
    error,
    refetch: fetchStreamers,
    realtimeStatus,
  };
}

// =============================================================================
// Helper: Convert to MultiViewer format
// =============================================================================

export interface MultiViewerStreamer {
  id: string;
  username: string;
  displayName: string;
  platform: 'kick';
  isLive: boolean;
  title: string | null;
  viewerCount: number;
  thumbnailUrl: string | null;
  gameSlug: string;
  serverName: string;
}

export function toMultiViewerFormat(streamers: ActiveStreamer[]): MultiViewerStreamer[] {
  return streamers.map((s) => ({
    id: s.id,
    username: s.kick_username,
    displayName: s.display_name || s.kick_username,
    platform: 'kick' as const,
    isLive: s.is_live_on_kick,
    title: s.kick_stream_title,
    viewerCount: s.kick_viewer_count,
    thumbnailUrl: s.kick_thumbnail_url,
    gameSlug: s.game_slug,
    serverName: s.server_name,
  }));
}

// =============================================================================
// Alternative: Direct query hook (without RPC function)
// =============================================================================

/**
 * Alternative hook that queries the view directly.
 * Use this if you prefer not to use RPC functions.
 */
export function useActiveStreamersView(
  options: UseActiveStreamersOptions = {}
): UseActiveStreamersReturn {
  const { gameSlug = 'all', realtime = true } = options;

  const [streamers, setStreamers] = useState<ActiveStreamer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  const fetchStreamers = useCallback(async () => {
    try {
      setError(null);

      if (!supabase || !isSupabaseAvailable()) {
        throw new Error('Supabase not configured. Please check your environment variables.');
      }

      let query = supabase
        .from('live_streamers_view')
        .select('*')
        .order('kick_viewer_count', { ascending: false });

      if (gameSlug !== 'all') {
        query = query.eq('game_slug', gameSlug);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw new Error(queryError.message);
      }

      setStreamers(data as ActiveStreamer[] || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [gameSlug]);

  useEffect(() => {
    fetchStreamers();
  }, [fetchStreamers]);

  useEffect(() => {
    if (!realtime || !supabase || !isSupabaseAvailable()) return;

    setRealtimeStatus('connecting');

    const channel = supabase
      .channel('live_streamers_view_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_streamers' },
        () => fetchStreamers()
      )
      .subscribe((status) => {
        setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });

    return () => {
      channel.unsubscribe();
    };
  }, [realtime, fetchStreamers]);

  return {
    streamers,
    isLoading,
    error,
    refetch: fetchStreamers,
    realtimeStatus,
  };
}
