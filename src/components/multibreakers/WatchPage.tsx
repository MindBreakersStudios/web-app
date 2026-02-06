import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Radio, Loader2, AlertCircle } from 'lucide-react';
import { MultiViewer } from './index';
import { useTranslation } from '../../hooks/useTranslation';
import { useActiveStreamers } from '../../hooks/useActiveStreamers';
import type { ActiveGameStreamer } from './multiviewer';

/**
 * WatchPage - Página dedicada para el MultiViewer de Kick
 * Accesible en /watch o /watch?streamers=user1,user2&layout=2
 */
export function WatchPage() {
  const t = useTranslation();
  const [searchParams] = useSearchParams();
  
  // Get game filter from URL (optional)
  const gameFilter = searchParams.get('game') || 'all';

  // Fetch ALL streamers from Supabase with realtime updates
  const { streamers, isLoading, error, realtimeStatus } = useActiveStreamers({
    gameSlug: gameFilter,
    filter: 'all', // Siempre mostrar todos
    realtime: true,
  });

  // Transform Supabase data to MultiViewer format
  const activeStreamers: ActiveGameStreamer[] = streamers.map((s) => ({
    username: s.kick_username,
    displayName: s.display_name || s.kick_username,
    avatarUrl: s.avatar_url,
    isLive: s.is_live, // True si está transmitiendo en Kick
    viewerCount: s.kick_viewer_count,
    streamTitle: s.kick_stream_title,
    addedAt: new Date(s.connected_at || Date.now()).getTime(),
    steamId: s.id, // Using id as steamId for now
    inGameName: s.in_game_name || undefined,
    game: s.game_slug as 'humanitz' | 'scum',
    lastSeenInGame: s.last_seen_at ? new Date(s.last_seen_at).getTime() : Date.now(),
    isOnlineInGame: s.is_connected, // True si está conectado al servidor
  }));

  return (
    <>
      <Helmet>
        <title>MultiViewer - MindBreakers</title>
        <meta 
          name="description" 
          content="Mira múltiples streams de Kick simultáneamente. MultiViewer de MindBreakers para la comunidad gaming de LATAM." 
        />
      </Helmet>

      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Back link and logo */}
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

              {/* Page title */}
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-lime-400" />
                <h1 className="font-bold text-white">MultiViewer</h1>
              </div>

              {/* Right side placeholder */}
              <div className="w-24" />
            </div>
          </div>
        </header>

        {/* Main content - Full width */}
        <main className="h-[calc(100vh-73px)]">
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

          {/* MultiViewer component */}
          {!isLoading && !error && (
            <MultiViewer
              activeServerStreamers={activeStreamers}
              showServerStreamers={true}
              maxHeight="100%"
              className=""
            />
          )}

          {/* Realtime status indicator (optional, for debugging) */}
          {realtimeStatus === 'connected' && (
            <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-300">Live updates activos</span>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default WatchPage;
