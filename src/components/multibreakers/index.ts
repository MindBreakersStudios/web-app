// WatchParty - Sistema de visualización múltiple de streams
// Para MindBreakers Gaming Community

// Componentes principales
export { WatchParty, default } from './WatchPartyViewer.tsx';
export { WatchPartyPanel } from './WatchPartyPanel.tsx';
export { KickPlayer, KickPlayerSkeleton } from './KickPlayer.tsx';
export { KickChat, KickChatPlaceholder } from './KickChat.tsx';
export { OfflineStreamerCard } from './OfflineStreamerCard.tsx';

// Hooks
export { useWatchPartyViewer } from './useWatchPartyViewer.ts';

// Types
export type {
  KickStreamer,
  ActiveGameStreamer,
  GridLayout,
  WatchPartyState,
  KickPlayerProps,
  KickChatProps,
  WatchPartyProps,
  ActiveStreamersAPIResponse,
  ShareableURLParams,
} from './watchparty-types.ts';

// Constants y utilidades
export {
  GRID_LAYOUTS,
  parseShareableURL,
  generateShareableURL,
} from './watchparty-types.ts';
