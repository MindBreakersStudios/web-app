import { useState, useCallback, useMemo } from 'react';
import {
  KickStreamer,
  ActiveGameStreamer,
  GridLayout,
  WatchPartyState,
  GRID_LAYOUTS,
} from './multiviewer';

const MAX_STREAMERS = 12;

interface UseMultiViewerOptions {
  activeServerStreamers?: ActiveGameStreamer[];
  game?: 'humanitz' | 'scum';
}

interface UseMultiViewerReturn {
  // State
  state: WatchPartyState;
  allStreamers: KickStreamer[];
  availableStreamers: ActiveGameStreamer[];
  
  // Actions
  addStreamer: (username: string) => void;
  removeStreamer: (username: string) => void;
  clearAllStreamers: () => void;
  setLayout: (layout: GridLayout) => void;
  toggleChat: () => void;
  setActiveChatStreamer: (username: string | null) => void;
  toggleMute: () => void;
  toggleMuteForStreamer: (username: string) => void;
  
  // Utilities
  canAddMore: boolean;
  streamerCount: number;
  isStreamerMuted: (username: string) => boolean;
}

export function useMultiViewer(options: UseMultiViewerOptions = {}): UseMultiViewerReturn {
  const {
    activeServerStreamers = [],
    game,
  } = options;

  // Simple state without persistence
  const [state, setState] = useState<WatchPartyState>({
    manualStreamers: [],
    activeGameStreamers: activeServerStreamers,
    currentLayout: GRID_LAYOUTS[0], // Will be auto-calculated
    activeChatStreamer: null,
    showChat: true,
    showOnlyLive: false,
    globalVolume: 50,
    isMuted: true,
    mutedStreamers: new Set<string>(),
  });

  // Auto-calculate layout based on number of streams
  const autoLayout = useMemo(() => {
    const count = state.manualStreamers.length;
    if (count === 0) return GRID_LAYOUTS[0]; // 1x1
    if (count === 1) return GRID_LAYOUTS[0]; // 1x1 - full screen
    if (count === 2) return GRID_LAYOUTS[0]; // 1x1 - vertical split (uno arriba, otro abajo)
    if (count <= 4) return GRID_LAYOUTS[1]; // 2x2
    if (count <= 9) return GRID_LAYOUTS[2]; // 3x3
    return GRID_LAYOUTS[3]; // 4x4
  }, [state.manualStreamers.length]);

  // Filter server streamers by game (for display in the list, not auto-added to grid)
  const availableStreamers = useMemo(() => {
    return game
      ? activeServerStreamers.filter(s => s.game === game)
      : activeServerStreamers;
  }, [activeServerStreamers, game]);

  // Only show manually selected streamers in the grid
  // Enrich with data from availableStreamers (isOnlineInGame, viewerCount, etc.)
  const allStreamers = useMemo(() => {
    return state.manualStreamers.map(manual => {
      const serverData = availableStreamers.find(s => s.username === manual.username);
      return {
        ...manual,
        isLive: serverData?.isLive ?? false,
        isOnlineInGame: serverData?.isOnlineInGame ?? false,
        viewerCount: serverData?.viewerCount,
        displayName: serverData?.displayName,
        avatarUrl: serverData?.avatarUrl,
        inGameName: serverData?.inGameName,
      } as KickStreamer & { isOnlineInGame: boolean; inGameName?: string };
    });
  }, [state.manualStreamers, availableStreamers]);

  // Add streamer from server list
  const addStreamer = useCallback((username: string) => {
    setState(prev => {
      if (prev.manualStreamers.length >= MAX_STREAMERS) return prev;
      if (prev.manualStreamers.some(s => s.username === username)) return prev;

      const newStreamer: KickStreamer = {
        username: username.toLowerCase().trim(),
        addedAt: Date.now(),
      };

      const isFirstStreamer = prev.manualStreamers.length === 0;

      return {
        ...prev,
        manualStreamers: [...prev.manualStreamers, newStreamer],
        activeChatStreamer: prev.activeChatStreamer || username,
        // Desmutear el primer stream automáticamente
        isMuted: isFirstStreamer ? false : prev.isMuted,
      };
    });
  }, []);

  // Remove streamer
  const removeStreamer = useCallback((username: string) => {
    setState(prev => {
      const newManualStreamers = prev.manualStreamers.filter(s => s.username !== username);
      const wasActiveChat = prev.activeChatStreamer === username;
      
      return {
        ...prev,
        manualStreamers: newManualStreamers,
        activeChatStreamer: wasActiveChat
          ? (newManualStreamers[0]?.username || null)
          : prev.activeChatStreamer,
      };
    });
  }, []);

  // Clear all streamers
  const clearAllStreamers = useCallback(() => {
    setState(prev => ({
      ...prev,
      manualStreamers: [],
      activeChatStreamer: null,
    }));
  }, []);

  // Set layout
  const setLayout = useCallback((layout: GridLayout) => {
    setState(prev => ({
      ...prev,
      currentLayout: layout,
    }));
  }, []);

  // Toggle chat visibility
  const toggleChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      showChat: !prev.showChat,
    }));
  }, []);

  // Set active chat streamer
  const setActiveChatStreamer = useCallback((username: string | null) => {
    setState(prev => ({
      ...prev,
      activeChatStreamer: username,
      showChat: username ? true : prev.showChat,
    }));
  }, []);

  // Toggle mute global
  const toggleMute = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  }, []);

  // Toggle mute para un streamer específico
  const toggleMuteForStreamer = useCallback((username: string) => {
    setState(prev => {
      const newMutedStreamers = new Set(prev.mutedStreamers);
      if (newMutedStreamers.has(username)) {
        newMutedStreamers.delete(username);
      } else {
        newMutedStreamers.add(username);
      }
      return {
        ...prev,
        mutedStreamers: newMutedStreamers,
      };
    });
  }, []);

  // Check si un streamer está muteado
  const isStreamerMuted = useCallback((username: string) => {
    return state.isMuted || state.mutedStreamers.has(username);
  }, [state.isMuted, state.mutedStreamers]);

  return {
    state: {
      ...state,
      currentLayout: autoLayout, // Use auto-calculated layout
    },
    allStreamers,
    availableStreamers,
    addStreamer,
    removeStreamer,
    clearAllStreamers,
    setLayout,
    toggleChat,
    setActiveChatStreamer,
    toggleMute,
    toggleMuteForStreamer,
    isStreamerMuted,
    canAddMore: allStreamers.length < MAX_STREAMERS,
    streamerCount: allStreamers.length,
  };
}
