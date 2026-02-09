/**
 * WatchParty Types
 * Sistema de visualización múltiple de streams (multi-platform)
 * Integrado con connected_players y players vía Supabase RPCs
 */

/** Representa un streamer en el sistema de streaming */
export interface KickStreamer {
  /** Username del canal (Kick slug, Twitch username, etc.) */
  username: string;
  /** Nombre para mostrar */
  displayName?: string;
  /** URL del avatar */
  avatarUrl?: string;
  /** Si el stream está en vivo */
  isLive?: boolean;
  /** Viewers actuales */
  viewerCount?: number;
  /** Título del stream */
  streamTitle?: string;
  /** Timestamp de cuando se agregó */
  addedAt: number;
  /** Si está conectado al servidor de juego (viene de useWatchPartyViewer) */
  isOnlineInGame?: boolean;
  /** Nombre del personaje en el juego (viene de useWatchPartyViewer) */
  inGameName?: string;
}

/**
 * Streamer activo en el servidor de juego
 * Datos combinados de connected_players + players
 */
export interface ActiveGameStreamer extends KickStreamer {
  /** SteamID del jugador */
  steamId: string;
  /** Nombre del personaje en el juego */
  inGameName?: string;
  /** Game slug en el que está activo */
  game: string;
  /** Timestamp de última actividad en el servidor */
  lastSeenInGame: number;
  /** Si está actualmente conectado al servidor */
  isOnlineInGame: boolean;
}

/** Configuración del layout de la grilla */
export interface GridLayout {
  /** Número de columnas */
  columns: 1 | 2 | 3 | 4;
  /** Etiqueta para mostrar */
  label: string;
  /** Icono o representación visual */
  icon: string;
}

/** Layouts disponibles */
export const GRID_LAYOUTS: GridLayout[] = [
  { columns: 1, label: '1x1', icon: '▢' },
  { columns: 2, label: '2x2', icon: '▢▢' },
  { columns: 3, label: '3x3', icon: '▢▢▢' },
  { columns: 4, label: '4x4', icon: '▢▢▢▢' },
];

/** Estado del WatchParty */
export interface WatchPartyState {
  /** Lista de streamers agregados manualmente */
  manualStreamers: KickStreamer[];
  /** Lista de streamers activos del servidor (de la API futura) */
  activeGameStreamers: ActiveGameStreamer[];
  /** Layout actual */
  currentLayout: GridLayout;
  /** Streamer con chat activo (solo uno a la vez) */
  activeChatStreamer: string | null;
  /** Si mostrar el chat */
  showChat: boolean;
  /** Si mostrar solo streamers en vivo */
  showOnlyLive: boolean;
  /** Volumen global (0-100) */
  globalVolume: number;
  /** Si todos los streams están muteados */
  isMuted: boolean;
  /** Map de streamers con mute individual */
  mutedStreamers: Set<string>;
}

/** Props del componente KickPlayer */
export interface KickPlayerProps {
  /** Username del streamer */
  username: string;
  /** Si iniciar muteado */
  muted?: boolean;
  /** Si mostrar controles de cierre */
  showCloseButton?: boolean;
  /** Callback al cerrar */
  onClose?: () => void;
  /** Si es el stream principal (más grande) */
  isPrimary?: boolean;
  /** Callback al hacer click para activar chat */
  onActivateChat?: () => void;
  /** Si el chat está activo para este stream */
  isChatActive?: boolean;
  /** Si el streamer está en vivo (default: true) */
  isLive?: boolean;
  /** Callback para toggle mute individual */
  onToggleMute?: () => void;
}

/** Props del componente KickChat */
export interface KickChatProps {
  /** Username del streamer */
  username: string;
  /** Si el chat está visible */
  isVisible: boolean;
}

/** Props del componente principal WatchParty */
export interface WatchPartyProps {
  /** Streamers iniciales (de URL params por ejemplo) */
  initialStreamers?: string[];
  /** Streamers activos del servidor (de API futura) */
  activeServerStreamers?: ActiveGameStreamer[];
  /** Game slug para filtrar streamers del servidor */
  game?: string;
  /** Callback cuando cambia la lista de streamers */
  onStreamersChange?: (streamers: string[]) => void;
  /** Si mostrar sección de streamers activos del servidor */
  showServerStreamers?: boolean;
  /** Altura máxima del componente */
  maxHeight?: string;
  /** Clase CSS adicional */
  className?: string;
}

/** Respuesta de la API de streamers activos */
export interface ActiveStreamersAPIResponse {
  success: boolean;
  data: {
    game: string;
    streamers: ActiveGameStreamer[];
    lastUpdated: string;
  };
  error?: string;
}

/** Parámetros de URL para compartir layout */
export interface ShareableURLParams {
  /** Lista de usernames separados por coma */
  streamers: string;
  /** Columnas del layout */
  layout?: '1' | '2' | '3' | '4';
  /** Chat activo */
  chat?: string;
}

/** Helper para parsear URL params */
export function parseShareableURL(searchParams: URLSearchParams): Partial<WatchPartyState> {
  const streamersParam = searchParams.get('streamers');
  const layoutParam = searchParams.get('layout');
  const chatParam = searchParams.get('chat');

  const result: Partial<WatchPartyState> = {};

  if (streamersParam) {
    const usernames = streamersParam.split(',').filter(Boolean);
    result.manualStreamers = usernames.map(username => ({
      username: username.trim().toLowerCase(),
      addedAt: Date.now(),
    }));
  }

  if (layoutParam) {
    const columns = parseInt(layoutParam, 10) as 1 | 2 | 3 | 4;
    if ([1, 2, 3, 4].includes(columns)) {
      result.currentLayout = GRID_LAYOUTS.find(l => l.columns === columns) || GRID_LAYOUTS[1];
    }
  }

  if (chatParam) {
    result.activeChatStreamer = chatParam.trim().toLowerCase();
    result.showChat = true;
  }

  return result;
}

/** Helper para generar URL compartible */
export function generateShareableURL(state: WatchPartyState, baseURL: string): string {
  const params = new URLSearchParams();
  
  const allStreamers = [...state.manualStreamers.map(s => s.username)];
  if (allStreamers.length > 0) {
    params.set('streamers', allStreamers.join(','));
  }
  
  params.set('layout', state.currentLayout.columns.toString());
  
  if (state.activeChatStreamer && state.showChat) {
    params.set('chat', state.activeChatStreamer);
  }

  return `${baseURL}?${params.toString()}`;
}
