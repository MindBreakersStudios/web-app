import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Radio, Tv, Users } from 'lucide-react';
import { MultiViewer } from './index';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * WatchPage - Página dedicada para el MultiViewer de Kick
 * Accesible en /watch o /watch?streamers=user1,user2&layout=2
 */
export function WatchPage() {
  const t = useTranslation();

  // Hardcoded streamers list (temporal hasta que tengas Supabase)
  // Puedes cambiar estos usernames por los que quieras mostrar
  const hardcodedStreamers = [
    { username: 'monoz_aoe', displayName: 'Monoz', game: 'humanitz' as const, isOnlineInGame: true, steamId: '123', lastSeenInGame: Date.now() },
    { username: 'xqc', displayName: 'xQc', game: 'humanitz' as const, isOnlineInGame: true, steamId: '124', lastSeenInGame: Date.now() },
    { username: 'trainwreckstv', displayName: 'Trainwreckstv', game: 'scum' as const, isOnlineInGame: true, steamId: '125', lastSeenInGame: Date.now() },
  ];

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

        {/* Main content */}
        <main className="container mx-auto px-4 py-6">
          {/* Info banner */}
          <div className="bg-gradient-to-r from-lime-400/10 to-blue-500/10 border border-lime-400/20 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-lime-400/20 flex items-center justify-center">
                  <Tv className="w-6 h-6 text-lime-400" />
                </div>
                <div>
                  <h2 className="font-bold text-white">
                    {t('multiviewer.title') || 'MultiViewer de Kick'}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {t('multiviewer.description') || 'Mira hasta 12 streams simultáneamente'}
                  </p>
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>Máximo 12 streams</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Radio className="w-4 h-4" />
                  <span>Streams de Kick.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* MultiViewer component */}
          <MultiViewer
            activeServerStreamers={hardcodedStreamers}
            showServerStreamers={true}
            maxHeight="calc(100vh - 200px)"
            className="shadow-2xl"
          />

          {/* Tips section */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-lime-400 text-black text-sm flex items-center justify-center font-bold">1</span>
                Agregar streams
              </h3>
              <p className="text-sm text-gray-400">
                Usa el botón "Agregar" e ingresa el username de Kick del streamer que quieras ver.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-lime-400 text-black text-sm flex items-center justify-center font-bold">2</span>
                Cambiar layout
              </h3>
              <p className="text-sm text-gray-400">
                Elige entre 1x1, 2x2, 3x3 o 4x4 según cuántos streams quieras ver a la vez.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-lime-400 text-black text-sm flex items-center justify-center font-bold">3</span>
                Compartir
              </h3>
              <p className="text-sm text-gray-400">
                Comparte tu configuración con amigos usando el botón de compartir. La URL guarda todo tu setup.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-700 mt-8 py-4">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            <p>
              MindBreakers MultiViewer • Powered by{' '}
              <a 
                href="https://kick.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lime-400 hover:underline"
              >
                Kick.com
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default WatchPage;
