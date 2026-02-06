/**
 * MultiViewer Types
 * Sistema de visualización múltiple de streams de Kick
 * Preparado para futura integración con API de steamIds de jugadores activos
 */

/** Representa un streamer de Kick */
export interface KickStreamer {
  /** Username de Kick (slug del canal) */
  username: string;
  /** Nombre para mostrar (opcional, si viene de API) */
  displayName?: string;
  /** URL del avatar (opcional, si viene de API) */
  avatarUrl?: string;
  /** Si el stream está en vivo (opcional, si viene de API) */
  isLive?: boolean;
  /** Viewers actuales (opcional, si viene de API) */
  viewerCount?: number;
  /** Título del stream (opcional, si viene de API) */
  streamTitle?: string;
  /** Timestamp de cuando se agregó */
  addedAt: number;
}

/** 
 * Streamer activo en el servidor de juego
 * Para futura integración con logs del servidor via steamId
 */
export interface ActiveGameStreamer extends KickStreamer {
  /** SteamID del jugador */
  steamId: string;
  /** Nombre del personaje en el juego */
  inGameName?: string;
  /** Juego en el que está activo */
  game: 'humanitz' | 'scum';
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

/** Estado del MultiViewer */
export interface MultiViewerState {
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
}

/** Props del componente KickChat */
export interface KickChatProps {
  /** Username del streamer */
  username: string;
  /** Si el chat está visible */
  isVisible: boolean;
}

/** Props del componente principal MultiViewer */
export interface MultiViewerProps {
  /** Streamers iniciales (de URL params por ejemplo) */
  initialStreamers?: string[];
  /** Streamers activos del servidor (de API futura) */
  activeServerStreamers?: ActiveGameStreamer[];
  /** Juego actual para filtrar streamers del servidor */
  game?: 'humanitz' | 'scum';
  /** Callback cuando cambia la lista de streamers */
  onStreamersChange?: (streamers: string[]) => void;
  /** Si mostrar sección de streamers activos del servidor */
  showServerStreamers?: boolean;
  /** Altura máxima del componente */
  maxHeight?: string;
  /** Clase CSS adicional */
  className?: string;
}

/** Respuesta de la API futura de streamers activos */
export interface ActiveStreamersAPIResponse {
  success: boolean;
  data: {
    game: 'humanitz' | 'scum';
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
export function parseShareableURL(searchParams: URLSearchParams): Partial<MultiViewerState> {
  const streamersParam = searchParams.get('streamers');
  const layoutParam = searchParams.get('layout');
  const chatParam = searchParams.get('chat');

  const result: Partial<MultiViewerState> = {};

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
export function generateShareableURL(state: MultiViewerState, baseURL: string): string {
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
