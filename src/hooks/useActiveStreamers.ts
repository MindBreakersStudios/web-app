/**
 * useActiveStreamers Hook
 * =======================
 *
 * Hook para obtener streamers activos con Realtime updates.
 * Combina datos de get_active_streamers (live + conectados) y
 * get_registered_streamers (todos los registrados) para mostrar
 * dos estados: LIVE y OFFLINE.
 *
 * ARQUITECTURA:
 * - LogWatcher (backend en Windows Server) es la UNICA fuente de verdad
 * - LogWatcher detecta conexiones/desconexiones via logs del servidor
 * - LogWatcher verifica estado live en plataforma de streaming
 * - LogWatcher actualiza `connected_players` en Supabase
 * - Este hook SOLO LEE datos de Supabase (NO llama a APIs de streaming)
 * - Realtime subscriptions para actualizaciones instantáneas
 *
 * TABLAS:
 * - connected_players (reemplaza active_streamers)
 * - players (reemplaza streamer_profiles)
 *
 * RPCs:
 * - get_active_streamers(p_game_slug?) → streamers LIVE + conectados
 * - get_registered_streamers() → todos los registrados (sin parámetros)
 *
 * Uso:
 *   const { streamers, isLoading, error } = useActiveStreamers({ gameSlug: 'humanitz' });
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { ActiveStreamer, RegisteredStreamer } from '../types/watchparty';

// =============================================================================
// Types
// =============================================================================

/** Streamer combinado con estado calculado */
export interface CombinedStreamer {
  id: string;
  steam_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  kick_username: string | null;
  twitch_username: string | null;
  streaming_platform: string | null;
  game_slug: string;
  game_name: string;
  server_name: string;
  in_game_name: string | null;
  is_live: boolean;
  is_connected: boolean;
  viewer_count: number;
  stream_title: string | null;
  stream_thumbnail_url: string | null;
  connected_at: string;
  last_seen: string | null;
}

interface UseActiveStreamersOptions {
  /** Filter by game slug ('humanitz', 'scum') or 'all' */
  gameSlug?: string | 'all';
  /** Filter by streamer status: 'live', 'online', 'offline', or 'all' (default: 'all') */
  filter?: 'live' | 'online' | 'offline' | 'all';
  /** Enable realtime updates (default: true) */
  realtime?: boolean;
  /** Polling interval in ms if realtime is disabled */
  pollingInterval?: number;
}

interface UseActiveStreamersReturn {
  streamers: CombinedStreamer[];
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
    realtime = true,
    pollingInterval = 30000,
  } = options;

  const [streamers, setStreamers] = useState<CombinedStreamer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // =========================================================================
  // Fetch streamers - DOS FUENTES DE DATOS
  // get_active_streamers (conectados al servidor) + get_registered_streamers (registrados)
  // Ambas manejadas por LogWatcher en el backend
  // =========================================================================
  const fetchStreamers = useCallback(async () => {
    try {
      setError(null);

      if (!supabase || !isSupabaseAvailable()) {
        throw new Error('Supabase not configured. Please check your environment variables.');
      }

      // 1. Hacer ambas llamadas en paralelo
      const [activeResult, registeredResult] = await Promise.all([
        // Streamers conectados y LIVE via get_active_streamers
        supabase.rpc('get_active_streamers', {
          p_game_slug: gameSlug === 'all' ? null : gameSlug,
        }),
        // Todos los streamers registrados en el programa
        supabase.rpc('get_registered_streamers'),
      ]);

      if (activeResult.error) {
        throw new Error(`get_active_streamers: ${activeResult.error.message}`);
      }

      if (registeredResult.error) {
        throw new Error(`get_registered_streamers: ${registeredResult.error.message}`);
      }

      const activeStreamers: ActiveStreamer[] = activeResult.data || [];
      const registeredStreamers: RegisteredStreamer[] = registeredResult.data || [];

      // 2. Crear Maps para lookup rápido
      const activeMap = new Map(
        activeStreamers.map((s) => [s.steam_id, s])
      );
      const registeredSteamIds = new Set(
        registeredStreamers.map((s) => s.steam_id)
      );

      // 3. Combinar: empezar con registered streamers, enriquecer con active data
      let combined: CombinedStreamer[] = registeredStreamers.map((registered) => {
        const active = activeMap.get(registered.steam_id);
        const isLive = active?.is_live || registered.kick_is_live || registered.twitch_is_live;
        const displayName = active?.display_name || registered.twitch_display_name || registered.player_name || registered.kick_username || 'Unknown';
        const streamingPlatform = active?.streaming_platform || (registered.kick_is_live ? 'kick' : registered.twitch_is_live ? 'twitch' : (registered.platforms?.[0] || null));

        return {
          id: active?.id || registered.steam_id,
          steam_id: registered.steam_id,
          username: active?.username || registered.kick_username || registered.twitch_username || registered.player_name || registered.steam_id,
          display_name: displayName,
          avatar_url: active?.avatar_url || null,
          kick_username: registered.kick_username,
          twitch_username: registered.twitch_username,
          streaming_platform: streamingPlatform,
          game_slug: active?.game_slug || 'unknown',
          game_name: active?.game_name || '',
          server_name: active?.server_name || registered.connected_server || '',
          in_game_name: active?.in_game_name || null,
          is_live: isLive,
          is_connected: active ? true : registered.is_connected,
          viewer_count: active?.viewer_count || 0,
          stream_title: active?.stream_title || null,
          stream_thumbnail_url: active?.stream_thumbnail_url || null,
          connected_at: active?.connected_at || new Date().toISOString(),
          last_seen: active?.last_seen || null,
        };
      });

      // 4. Add active streamers NOT in registered list (they're live but not in the registered program)
      for (const active of activeStreamers) {
        if (!registeredSteamIds.has(active.steam_id)) {
          combined.push({
            id: active.id,
            steam_id: active.steam_id,
            username: active.username || active.kick_username || active.twitch_username || active.steam_id,
            display_name: active.display_name || active.username || 'Unknown',
            avatar_url: active.avatar_url,
            kick_username: active.kick_username,
            twitch_username: active.twitch_username,
            streaming_platform: active.streaming_platform,
            game_slug: active.game_slug,
            game_name: active.game_name,
            server_name: active.server_name,
            in_game_name: active.in_game_name || null,
            is_live: active.is_live,
            is_connected: true,
            viewer_count: active.viewer_count || 0,
            stream_title: active.stream_title,
            stream_thumbnail_url: active.stream_thumbnail_url,
            connected_at: active.connected_at,
            last_seen: active.last_seen,
          });
        }
      }

      // 4. Filtrar por game_slug si es necesario
      if (gameSlug !== 'all') {
        combined = combined.filter(s => s.game_slug === gameSlug || s.is_connected === false);
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

      // 6. Ordenar: LIVE primero (por viewers), luego ONLINE (por connected_at), luego OFFLINE
      combined.sort((a, b) => {
        // Primero por estado
        if (a.is_live !== b.is_live) return a.is_live ? -1 : 1;
        if (a.is_connected !== b.is_connected) return a.is_connected ? -1 : 1;

        // Dentro de LIVE: por viewers (más viewers primero)
        if (a.is_live && b.is_live) {
          return (b.viewer_count || 0) - (a.viewer_count || 0);
        }

        // Dentro de ONLINE: por connected_at (más reciente primero)
        if (a.is_connected && b.is_connected) {
          return new Date(b.connected_at).getTime() - new Date(a.connected_at).getTime();
        }

        // OFFLINE: alfabético (with null safety)
        const aName = a.display_name || a.username || '';
        const bName = b.display_name || b.username || '';
        return aName.localeCompare(bName);
      });

      setStreamers(combined);
    } catch (err) {
      console.error('[useActiveStreamers] Error fetching:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [gameSlug, filter]);

  // =========================================================================
  // Initial fetch
  // =========================================================================
  useEffect(() => {
    fetchStreamers();
  }, [fetchStreamers]);

  // =========================================================================
  // Realtime subscription
  // LogWatcher actualiza connected_players → Supabase dispara evento →
  // Este hook refetch los datos combinados
  // =========================================================================
  useEffect(() => {
    if (!realtime || !supabase || !isSupabaseAvailable()) {
      // Fallback to polling
      const interval = setInterval(fetchStreamers, pollingInterval);
      return () => clearInterval(interval);
    }

    setRealtimeStatus('connecting');

    const channel: RealtimeChannel = supabase
      .channel('connected_players_realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'connected_players',
        },
        (payload) => {
          console.log('[Realtime] Change on connected_players:', payload.eventType);
          // Refetch para re-combinar con registered streamers
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
// Helper: Convert to WatchParty viewer format
// =============================================================================

export interface WatchPartyViewerStreamer {
  id: string;
  username: string;
  displayName: string;
  platform: 'kick' | 'twitch' | 'youtube';
  isLive: boolean;
  title: string | null;
  viewerCount: number;
  thumbnailUrl: string | null;
  gameSlug: string;
  serverName: string;
}

export function toWatchPartyFormat(streamers: CombinedStreamer[]): WatchPartyViewerStreamer[] {
  return streamers.map((s) => ({
    id: s.id,
    username: s.kick_username || s.twitch_username || s.username,
    displayName: s.display_name || s.username,
    platform: (s.streaming_platform as 'kick' | 'twitch' | 'youtube') || 'kick',
    isLive: s.is_live,
    title: s.stream_title,
    viewerCount: s.viewer_count,
    thumbnailUrl: s.stream_thumbnail_url,
    gameSlug: s.game_slug,
    serverName: s.server_name,
  }));
}

// Re-export for backwards compat
export type { CombinedStreamer as ActiveStreamer };
