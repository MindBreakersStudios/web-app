import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Radio, Loader2, AlertCircle } from 'lucide-react';
import { WatchParty } from './index';
import { useActiveStreamers } from '../../hooks/useActiveStreamers';
import type { ActiveGameStreamer } from './watchparty-types';

// =============================================================================
// Game Filter Config
// =============================================================================

interface GameFilter {
  slug: string;
  label: string;
  icon: string;        // Path to game icon image
  enabled: boolean;    // Whether this game is clickable
}

const GAME_FILTERS: GameFilter[] = [
  {
    slug: 'humanitz',
    label: 'HumanitZ',
    icon: '/images/humanitz/Humanitz-icon.webp',
    enabled: true,
  },
  {
    slug: 'scum',
    label: 'SCUM',
    icon: '/images/scum/scum-icon.webp',
    enabled: false, // Coming soon
  },
  {
    slug: 'dayz',
    label: 'DayZ',
    icon: '/images/dayz/dayz-icon.webp',
    enabled: false, // Coming soon
  },
  {
    slug: 'vrising',
    label: 'V Rising',
    icon: '/images/vrising/vrising-icon.png',
    enabled: false, // Coming soon
  },
  {
    slug: 'hytale',
    label: 'Hytale',
    icon: '/images/hytale/hytale-icon.jpg',
    enabled: false, // Coming soon
  },
];

// =============================================================================
// WatchPage Component
// =============================================================================

/**
 * WatchPage - Página dedicada para el WatchParty
 * Accesible en /watchparty o /watchparty?game=humanitz
 *
 * NOTA: El estado de streaming (is_live, viewers, thumbnail) es manejado
 * completamente por LogWatcher en el backend. El frontend solo lee
 * datos de Supabase via realtime subscriptions.
 */
export function WatchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Default to 'humanitz' (the only enabled game for now)
  const gameFilter = searchParams.get('game') || 'humanitz';

  // Handle game filter change
  const handleGameFilter = (slug: string) => {
    const game = GAME_FILTERS.find(g => g.slug === slug);
    if (!game?.enabled) return;
    setSearchParams({ game: slug });
  };

  // Fetch ALL streamers from Supabase with realtime updates
  const { streamers, isLoading, error, realtimeStatus } = useActiveStreamers({
    gameSlug: gameFilter,
    filter: 'all',
    realtime: true,
  });

  // Transform Supabase data to WatchParty format
  const activeStreamers: ActiveGameStreamer[] = streamers.map((s) => {
    // Determine platform and username
    const platform = s.streaming_platform || (s.twitch_username ? 'twitch' : 'kick');
    const username = platform === 'twitch'
      ? s.twitch_username || s.username
      : s.kick_username || s.username;

    return {
      username,
      platform,
      displayName: s.display_name || s.username,
      avatarUrl: s.avatar_url || undefined,
      isLive: s.is_live,
      viewerCount: s.viewer_count,
      streamTitle: s.stream_title || undefined,
      addedAt: new Date(s.connected_at || Date.now()).getTime(),
      steamId: s.steam_id,
      inGameName: s.in_game_name || undefined,
      game: s.game_slug,
      lastSeenInGame: s.last_seen ? new Date(s.last_seen).getTime() : Date.now(),
      isOnlineInGame: s.is_connected,
    };
  });

  return (
    <>
      <Helmet>
        <title>WatchParty - MindBreakers</title>
        <meta
          name="description"
          content="Mira múltiples streams simultáneamente. WatchParty de MindBreakers para la comunidad gaming de LATAM."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Back link and logo */}
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Volver</span>
                </Link>
                <div className="w-px h-6 bg-gray-700" />
                <Link to="/" className="flex items-center gap-2">
                  <img
                    src="/images/logos/Logo-35.png"
                    alt="MindBreakers"
                    className="h-8 w-auto"
                  />
                  <span className="font-bold text-white hidden sm:inline">MindBreakers</span>
                </Link>
              </div>

              {/* Center: Game filter chips */}
              <div className="flex items-center gap-2">
                {GAME_FILTERS.map((game) => {
                  const isActive = gameFilter === game.slug;
                  const isDisabled = !game.enabled;

                  return (
                    <button
                      key={game.slug}
                      onClick={() => handleGameFilter(game.slug)}
                      disabled={isDisabled}
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${isActive
                          ? 'bg-lime-400/20 text-lime-400 border border-lime-400/40 ring-1 ring-lime-400/20'
                          : isDisabled
                            ? 'bg-gray-800/50 text-gray-600 border border-gray-700/50 cursor-not-allowed opacity-50'
                            : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-500 hover:text-white cursor-pointer'
                        }
                      `}
                      title={isDisabled ? `${game.label} — Próximamente` : game.label}
                    >
                      <img
                        src={game.icon}
                        alt={game.label}
                        className={`w-5 h-5 rounded object-cover ${isDisabled ? 'grayscale' : ''}`}
                      />
                      <span className="hidden sm:inline">{game.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right: Title and badge */}
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-lime-400" />
                <h1 className="font-bold text-white hidden sm:inline">WatchParty</h1>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-lime-400/20 text-lime-400 uppercase font-bold tracking-widest border border-lime-400/30">
                  BETA
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content - Full width */}
        <main className="h-[calc(100vh-65px)]">
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-12 h-12 text-lime-400 animate-spin mb-4" />
              <p className="text-gray-400">Cargando streamers activos...</p>
              {realtimeStatus === 'connecting' && (
                <p className="text-xs text-gray-500 mt-2">Conectando a actualizaciones en tiempo real...</p>
              )}
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-white font-semibold mb-2">Error al cargar streamers</p>
              <p className="text-gray-400 text-sm">{error.message}</p>
            </div>
          )}

          {/* WatchParty component */}
          {!isLoading && !error && (
            <WatchParty
              activeServerStreamers={activeStreamers}
              showServerStreamers={true}
              maxHeight="100%"
              className=""
            />
          )}
        </main>
      </div>
    </>
  );
}

export default WatchPage;
