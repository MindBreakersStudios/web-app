import { useState, useCallback, useMemo } from 'react';
import {
  KickStreamer,
  ActiveGameStreamer,
  GridLayout,
  MultiViewerState,
  GRID_LAYOUTS,
} from './multiviewer';

const MAX_STREAMERS = 12;

interface UseMultiViewerOptions {
  activeServerStreamers?: ActiveGameStreamer[];
  game?: 'humanitz' | 'scum';
}

interface UseMultiViewerReturn {
  // State
  state: MultiViewerState;
  allStreamers: KickStreamer[];
  
  // Actions
  addStreamer: (username: string) => void;
  removeStreamer: (username: string) => void;
  clearAllStreamers: () => void;
  setLayout: (layout: GridLayout) => void;
  toggleChat: () => void;
  setActiveChatStreamer: (username: string | null) => void;
  toggleMute: () => void;
  
  // Utilities
  canAddMore: boolean;
  streamerCount: number;
}

export function useMultiViewer(options: UseMultiViewerOptions = {}): UseMultiViewerReturn {
  const {
    activeServerStreamers = [],
    game,
  } = options;

  // Simple state without persistence
  const [state, setState] = useState<MultiViewerState>({
    manualStreamers: [],
    activeGameStreamers: activeServerStreamers,
    currentLayout: GRID_LAYOUTS[1], // 2x2 default
    activeChatStreamer: null,
    showChat: true,
    showOnlyLive: false,
    globalVolume: 50,
    isMuted: true,
  });

  // Filter server streamers by game
  const filteredServerStreamers = useMemo(() => {
    return game
      ? activeServerStreamers.filter(s => s.game === game && s.isOnlineInGame)
      : activeServerStreamers.filter(s => s.isOnlineInGame);
  }, [activeServerStreamers, game]);

  // Combine manual and server streamers
  const allStreamers = useMemo(() => {
    const manualUsernames = new Set(state.manualStreamers.map(s => s.username));
    const filteredServer = filteredServerStreamers.filter(s => !manualUsernames.has(s.username));
    return [...state.manualStreamers, ...filteredServer];
  }, [state.manualStreamers, filteredServerStreamers]);

  // Add streamer from server list
  const addStreamer = useCallback((username: string) => {
    setState(prev => {
      if (prev.manualStreamers.length >= MAX_STREAMERS) return prev;
      if (prev.manualStreamers.some(s => s.username === username)) return prev;

      const newStreamer: KickStreamer = {
        username: username.toLowerCase().trim(),
        addedAt: Date.now(),
      };

      return {
        ...prev,
        manualStreamers: [...prev.manualStreamers, newStreamer],
        activeChatStreamer: prev.activeChatStreamer || username,
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

  // Toggle mute
  const toggleMute = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  }, []);

  return {
    state,
    allStreamers,
    addStreamer,
    removeStreamer,
    clearAllStreamers,
    setLayout,
    toggleChat,
    setActiveChatStreamer,
    toggleMute,
    canAddMore: allStreamers.length < MAX_STREAMERS,
    streamerCount: allStreamers.length,
  };
}
