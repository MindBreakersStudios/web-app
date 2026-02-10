/**
 * WatchParty Types
 * ================
 *
 * Tipos TypeScript para el sistema WatchParty de MindBreakers.
 *
 * ARQUITECTURA DE BASE DE DATOS (3 niveles):
 *   auth.users (Supabase Auth)
 *       ↓
 *   users (perfiles web, requiere auth)
 *       ↓ (opcional)
 *   players (todos los jugadores del servidor, por steam_id)
 *       ↓
 *   connected_players (jugadores actualmente conectados)
 *
 * TABLAS DEPRECADAS:
 *   - streamer_profiles → datos ahora en `players`
 *   - active_streamers → reemplazada por `connected_players`
 *
 * RPCs:
 *   - get_active_streamers(p_game_slug?) → streamers LIVE + conectados (WatchParty)
 *   - get_registered_streamers() → todos los streamers registrados (sin parámetros)
 *   - get_live_streamers() → streamers en vivo (sin parámetros)
 *   - get_connected_players(p_game_slug?) → TODOS los jugadores conectados (admin)
 */

// =============================================================================
// ActiveStreamer — Respuesta de get_active_streamers()
// Streamers que están LIVE en plataforma Y conectados al servidor
// =============================================================================

export interface ActiveStreamer {
  /** connected_players.id */
  id: string;
  /** players.id */
  player_id: string;
  steam_id: string;
  /** Solo si el player tiene cuenta web */
  user_id: string | null;
  username: string;
  display_name: string;
  avatar_url: string | null;
  kick_username: string | null;
  twitch_username: string | null;
  streaming_platform: 'kick' | 'twitch' | 'youtube' | null;
  game_id: string;
  game_slug: string;
  game_name: string;
  server_name: string;
  in_game_name: string;
  is_live: boolean;
  viewer_count: number;
  stream_title: string | null;
  stream_thumbnail_url: string | null;
  connected_at: string;
  last_seen: string;
}

// =============================================================================
// RegisteredStreamer — Respuesta de get_registered_streamers()
// Todos los streamers registrados en el programa, con estado actual
// =============================================================================

export interface RegisteredStreamer {
  steam_id: string;
  player_name: string;
  is_streamer: boolean;
  // Kick
  kick_username: string | null;
  kick_verified_at: string | null;
  kick_is_live: boolean;
  // Twitch
  twitch_username: string | null;
  twitch_display_name: string | null;
  twitch_verified_at: string | null;
  twitch_is_live: boolean;
  // Estado actual
  is_connected: boolean;
  connected_server: string | null;
  platforms: string[];
}

// =============================================================================
// LiveStreamer — Respuesta de get_live_streamers()
// Streamers actualmente en vivo en cualquier plataforma
// =============================================================================

export interface LiveStreamer {
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

// =============================================================================
// Helpers — Funciones de utilidad para la plataforma de streaming
// =============================================================================

/**
 * Obtiene la URL del stream según la plataforma
 */
export function getStreamUrl(streamer: ActiveStreamer): string {
  switch (streamer.streaming_platform) {
    case 'kick':
      return `https://kick.com/${streamer.kick_username}`;
    case 'twitch':
      return `https://twitch.tv/${streamer.twitch_username}`;
    case 'youtube':
      return `https://youtube.com/channel/${streamer.kick_username}`; // placeholder
    default:
      // Fallback: intentar kick_username primero
      if (streamer.kick_username) return `https://kick.com/${streamer.kick_username}`;
      if (streamer.twitch_username) return `https://twitch.tv/${streamer.twitch_username}`;
      return '#';
  }
}

/**
 * Obtiene el username de streaming (kick o twitch)
 */
export function getStreamUsername(streamer: ActiveStreamer): string {
  return streamer.kick_username || streamer.twitch_username || streamer.username;
}

/**
 * Obtiene la etiqueta de plataforma para mostrar en badges
 */
export function getPlatformLabel(platform: string | null): string {
  switch (platform) {
    case 'kick': return 'KICK';
    case 'twitch': return 'TWITCH';
    case 'youtube': return 'YOUTUBE';
    default: return 'LIVE';
  }
}
