// WatchParty - Sistema de visualización múltiple de streams de Kick
// Para MindBreakers Gaming Community

// Componentes principales
export { WatchParty, default } from './MultiViewer.tsx';
export { KickPlayer, KickPlayerSkeleton } from './KickPlayer.tsx';
export { KickChat, KickChatPlaceholder } from './KickChat.tsx';
export { OfflineStreamerCard } from './OfflineStreamerCard.tsx';

// Hook
export { useMultiViewer } from './useMultiViewer.ts';

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
} from './multiviewer.ts';

// Constants y utilidades
export {
  GRID_LAYOUTS,
  parseShareableURL,
  generateShareableURL,
} from './multiviewer.ts';
