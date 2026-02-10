/**
 * ============================================================================
 * useKickLiveStatus - React Hook for checking Kick live status
 * ============================================================================
 * 
 * This hook checks Kick live status from the browser (bypasses server IP blocking)
 * and updates Supabase with the results.
 * 
 * ARCHITECTURE:
 * - Browser calls Kick API directly (no 403 blocking)
 * - Updates Supabase via RPC function
 * - Polls every 60 seconds while component is mounted
 * 
 * Usage:
 *   const { streamers, isLoading, error, refreshNow } = useKickLiveStatus('humanitz');
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// =============================================================================
// Types
// =============================================================================

interface KickChannelResponse {
  livestream: {
    is_live: boolean;
    session_title?: string;
    viewer_count?: number;
    thumbnail?: {
      url?: string;
    };
  } | null;
}

interface KickStatus {
  isLive: boolean;
  viewerCount: number;
  streamTitle: string | null;
  thumbnailUrl: string | null;
}

/** Matches get_live_streamers() return columns */
interface ActiveStreamer {
  steam_id: string;
  player_name: string;
  // Kick
  kick_username: string | null;
  kick_is_live: boolean;
  kick_stream_title: string | null;
  kick_viewer_count: number;
  kick_stream_url: string | null;
  kick_thumbnail: string | null;
  // Twitch
  twitch_username: string | null;
  twitch_display_name: string | null;
  twitch_is_live: boolean;
  twitch_stream_title: string | null;
  twitch_game_name: string | null;
  twitch_viewer_count: number;
  twitch_stream_url: string | null;
  twitch_thumbnail: string | null;
  // General
  is_streamer: boolean;
  is_connected: boolean;
  connected_server: string | null;
  primary_platform: string | null;
}

interface UseKickLiveStatusOptions {
  pollInterval?: number;  // ms, default 60000 (1 minute)
  enabled?: boolean;      // default true
}

interface UseKickLiveStatusReturn {
  streamers: ActiveStreamer[];
  isLoading: boolean;
  error: Error | null;
  refreshNow: () => Promise<void>;
  lastUpdated: Date | null;
}

// =============================================================================
// Kick API Client (browser-side)
// =============================================================================

async function fetchKickStatus(username: string): Promise<KickStatus> {
  try {
    // Use Kick's public API - works from browser, blocked from servers
    const response = await fetch(`https://kick.com/api/v2/channels/${username}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.debug(`Kick API returned ${response.status} for ${username}`);
      return { isLive: false, viewerCount: 0, streamTitle: null, thumbnailUrl: null };
    }

    const data: KickChannelResponse = await response.json();
    const livestream = data.livestream;

    if (!livestream || !livestream.is_live) {
      return { isLive: false, viewerCount: 0, streamTitle: null, thumbnailUrl: null };
    }

    return {
      isLive: true,
      viewerCount: livestream.viewer_count || 0,
      streamTitle: livestream.session_title || null,
      thumbnailUrl: livestream.thumbnail?.url || null,
    };
  } catch (error) {
    console.error(`Failed to fetch Kick status for ${username}:`, error);
    return { isLive: false, viewerCount: 0, streamTitle: null, thumbnailUrl: null };
  }
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useKickLiveStatus(
  gameSlug: string,
  options: UseKickLiveStatusOptions = {}
): UseKickLiveStatusReturn {
  const { pollInterval = 60000, enabled = true } = options;

  const [streamers, setStreamers] = useState<ActiveStreamer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Fetch streamers from Supabase and update their Kick status
  const refreshStatus = useCallback(async () => {
    if (!enabled) return;

    try {
      // 1. Get all live streamers (no params — returns all)
      const { data: activeStreamers, error: fetchError } = await supabase.rpc(
        'get_live_streamers'
      );

      if (fetchError) throw fetchError;
      if (!activeStreamers || activeStreamers.length === 0) {
        if (isMountedRef.current) {
          setStreamers([]);
          setIsLoading(false);
          setLastUpdated(new Date());
        }
        return;
      }

      // 2. Filter to only Kick streamers with a username
      const kickStreamers = activeStreamers.filter(
        (s: ActiveStreamer) => s.kick_username
      );

      // 3. Check Kick status for each streamer (in parallel, with limit)
      const BATCH_SIZE = 5;
      const updates: {
        kick_username: string;
        is_live: boolean;
        viewer_count: number;
        stream_title: string | null;
        thumbnail_url: string | null;
      }[] = [];

      // Process in batches to avoid rate limiting
      for (let i = 0; i < kickStreamers.length; i += BATCH_SIZE) {
        const batch = kickStreamers.slice(i, i + BATCH_SIZE);

        const batchResults = await Promise.all(
          batch.map(async (streamer: ActiveStreamer) => {
            const status = await fetchKickStatus(streamer.kick_username!);
            return {
              kick_username: streamer.kick_username!,
              is_live: status.isLive,
              viewer_count: status.viewerCount,
              stream_title: status.streamTitle,
              thumbnail_url: status.thumbnailUrl,
            };
          })
        );

        updates.push(...batchResults);

        // Small delay between batches
        if (i + BATCH_SIZE < kickStreamers.length) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      // 4. Batch update Supabase (if RPC exists)
      if (updates.length > 0) {
        const { error: updateError } = await supabase.rpc('batch_update_kick_status', {
          p_updates: updates,
        });

        if (updateError) {
          // RPC may not exist yet — not critical, hook still returns correct data in memory
          console.debug('[KickStatus] batch_update_kick_status:', updateError.message);
        }
      }

      // 5. Merge updates with streamer data for immediate UI update
      const updatedStreamers = activeStreamers.map((streamer: ActiveStreamer) => {
        const update = updates.find((u) => u.kick_username === streamer.kick_username);
        if (update) {
          return {
            ...streamer,
            kick_is_live: update.is_live,
            kick_viewer_count: update.viewer_count,
            kick_stream_title: update.stream_title,
            kick_thumbnail: update.thumbnail_url,
          };
        }
        return streamer;
      });

      // Sort: live first (kick or twitch), then by viewer count
      updatedStreamers.sort((a: ActiveStreamer, b: ActiveStreamer) => {
        const aLive = a.kick_is_live || a.twitch_is_live;
        const bLive = b.kick_is_live || b.twitch_is_live;
        if (aLive && !bLive) return -1;
        if (!aLive && bLive) return 1;
        const aViewers = a.kick_viewer_count + a.twitch_viewer_count;
        const bViewers = b.kick_viewer_count + b.twitch_viewer_count;
        return bViewers - aViewers;
      });

      if (isMountedRef.current) {
        setStreamers(updatedStreamers);
        setError(null);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Error refreshing Kick status:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [gameSlug, enabled]);

  // Initial load and polling
  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      refreshStatus();

      // Set up polling
      intervalRef.current = setInterval(refreshStatus, pollInterval);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshStatus, pollInterval, enabled]);

  return {
    streamers,
    isLoading,
    error,
    refreshNow: refreshStatus,
    lastUpdated,
  };
}

// =============================================================================
// Alternative: Simple fetch without auto-update (for manual control)
// =============================================================================

export async function checkKickLiveStatus(
  kickUsernames: string[]
): Promise<Map<string, KickStatus>> {
  const results = new Map<string, KickStatus>();

  const BATCH_SIZE = 5;
  
  for (let i = 0; i < kickUsernames.length; i += BATCH_SIZE) {
    const batch = kickUsernames.slice(i, i + BATCH_SIZE);
    
    const batchResults = await Promise.all(
      batch.map(async (username) => {
        const status = await fetchKickStatus(username);
        return { username, status };
      })
    );

    for (const { username, status } of batchResults) {
      results.set(username, status);
    }

    if (i + BATCH_SIZE < kickUsernames.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return results;
}

// =============================================================================
// Export types
// =============================================================================

export type { ActiveStreamer, KickStatus, UseKickLiveStatusOptions, UseKickLiveStatusReturn };