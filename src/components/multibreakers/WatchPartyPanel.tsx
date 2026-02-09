/**
 * WatchPartyPanel - Componente de tarjetas para mostrar streamers en vivo
 * ========================================================================
 *
 * Componente standalone que muestra una grilla de tarjetas de streamers
 * que están conectados a nuestros servidores Y en vivo en su plataforma.
 *
 * Se diferencia de WatchPartyViewer en que:
 * - WatchPartyPanel: Grilla de tarjetas con thumbnails y links al stream
 *   Ideal para embeber en otras páginas (homepage, páginas de juegos)
 * - WatchPartyViewer: Visor multi-stream con iframes embebidos
 *   Ideal para la página dedicada /watchparty
 *
 * Uso:
 *   <WatchPartyPanel />                    // Todos los juegos
 *   <WatchPartyPanel gameSlug="humanitz" /> // Solo HumanitZ
 */

import { useWatchParty, WatchPartyStreamer } from '../../hooks/useWatchParty';
import { getStreamUrl, getStreamUsername, getPlatformLabel } from '../../types/watchparty';

// =============================================================================
// Skeleton loader
// =============================================================================

function WatchPartySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-gray-700 rounded-full animate-pulse" />
        <div className="h-6 w-48 bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-700" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-24 bg-gray-700 rounded" />
              <div className="h-3 w-48 bg-gray-700 rounded" />
              <div className="h-3 w-36 bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Streamer Card
// =============================================================================

function StreamerCard({ streamer }: { streamer: WatchPartyStreamer }) {
  const streamUrl = getStreamUrl(streamer);
  const streamUsername = getStreamUsername(streamer);
  const platformLabel = getPlatformLabel(streamer.streaming_platform);

  return (
    <a
      href={streamUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-lime-400 transition-all duration-200 group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-900">
        {streamer.stream_thumbnail_url ? (
          <img
            src={streamer.stream_thumbnail_url}
            alt={streamer.stream_title || streamUsername}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <span className="text-4xl">🎮</span>
          </div>
        )}

        {/* Live badge */}
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>

        {/* Viewer count */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          {streamer.viewer_count.toLocaleString()}
        </div>

        {/* Platform badge */}
        <div className="absolute top-2 right-2 bg-black/70 text-lime-400 text-[10px] px-2 py-1 rounded font-bold">
          {platformLabel}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="font-bold text-white truncate group-hover:text-lime-400 transition-colors">
          {streamer.display_name || streamUsername}
        </div>
        {streamer.stream_title && (
          <div className="text-sm text-gray-400 truncate mt-0.5">
            {streamer.stream_title}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-2">
          <span className="flex items-center gap-1">
            🎮 {streamer.game_name}
          </span>
          <span className="text-gray-600">•</span>
          <span className="flex items-center gap-1">
            📍 {streamer.server_name}
          </span>
        </div>
        <div className="text-xs text-lime-500 mt-1">
          Jugando como: {streamer.in_game_name}
        </div>
      </div>
    </a>
  );
}

// =============================================================================
// Main Component
// =============================================================================

interface WatchPartyPanelProps {
  /** Filtrar por juego (slug). Si no se pasa, muestra todos */
  gameSlug?: string;
  /** Clase CSS adicional para el contenedor */
  className?: string;
}

export function WatchPartyPanel({ gameSlug, className = '' }: WatchPartyPanelProps) {
  const { streamers, loading, error } = useWatchParty(gameSlug);

  if (loading) {
    return <WatchPartySkeleton />;
  }

  if (error) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className="text-red-400 text-sm">
          Error cargando WatchParty: {error.message}
        </div>
      </div>
    );
  }

  if (streamers.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📺</span>
        </div>
        <p className="text-gray-400">No hay streamers en vivo jugando en nuestros servidores</p>
        <p className="text-sm mt-2 text-gray-600">
          ¿Sos streamer? Registrate y empezá a transmitir
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
        WatchParty
        <span className="text-lime-400">—</span>
        <span className="text-lime-400">{streamers.length}</span>
        <span className="text-gray-400 text-base font-normal">en vivo</span>
      </h2>

      {/* Streamers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {streamers.map((streamer) => (
          <StreamerCard key={streamer.id} streamer={streamer} />
        ))}
      </div>
    </div>
  );
}

export default WatchPartyPanel;
