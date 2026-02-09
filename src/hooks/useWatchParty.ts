/**
 * useWatchParty Hook
 * ==================
 *
 * Hook simplificado para el WatchParty de MindBreakers.
 * Muestra SOLO streamers que están LIVE en su plataforma de streaming
 * Y conectados a nuestros servidores de juego.
 *
 * ARQUITECTURA:
 * - LogWatcher (backend) maneja TODO: detección de conexiones + estado de streaming
 * - Este hook SOLO LEE datos de Supabase via RPC get_active_streamers
 * - Usa realtime subscriptions para actualizaciones instantáneas
 * - NO llama a la API de Kick/Twitch desde el frontend
 *
 * TABLAS:
 * - connected_players (reemplaza active_streamers)
 * - players (reemplaza streamer_profiles)
 *
 * Uso:
 *   const { streamers, loading, error } = useWatchParty();
 *   const { streamers } = useWatchParty('humanitz'); // Filtrar por juego
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { ActiveStreamer } from '../types/watchparty';

// =============================================================================
// Types
// =============================================================================

export type WatchPartyStreamer = ActiveStreamer;

interface UseWatchPartyReturn {
  streamers: WatchPartyStreamer[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// =============================================================================
// Hook
// =============================================================================

export function useWatchParty(gameSlug?: string): UseWatchPartyReturn {
  const [streamers, setStreamers] = useState<WatchPartyStreamer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // =========================================================================
  // Fetch - Streamers LIVE y conectados al servidor via RPC
  // =========================================================================
  const fetchStreamers = useCallback(async () => {
    try {
      setError(null);

      if (!supabase || !isSupabaseAvailable()) {
        throw new Error('Supabase not configured. Please check your environment variables.');
      }

      const { data, error: fetchError } = await supabase.rpc('get_active_streamers', {
        p_game_slug: gameSlug || null,
      });

      if (fetchError) throw fetchError;

      setStreamers(data || []);
    } catch (err) {
      console.error('[useWatchParty] Error fetching:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [gameSlug]);

  // =========================================================================
  // Initial fetch + Realtime subscription
  // =========================================================================
  useEffect(() => {
    // Initial fetch
    fetchStreamers();

    // Realtime: refetch when connected_players changes
    if (!supabase || !isSupabaseAvailable()) return;

    const channel: RealtimeChannel = supabase
      .channel('watchparty-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connected_players',
        },
        (payload) => {
          console.log('[WatchParty] Realtime change:', payload.eventType);
          // Refetch cuando LogWatcher actualiza cualquier jugador
          fetchStreamers();
        }
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [fetchStreamers, gameSlug]);

  return { streamers, loading, error, refetch: fetchStreamers };
}
