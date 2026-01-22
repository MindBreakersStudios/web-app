import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { VIPPlans } from '../components/VIPPlans';
import { images } from '../config/images';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../hooks/useTranslation';
import {
  Users,
  Shield,
  Globe,
  Heart,
  CheckCircle,
  Crosshair,
  Skull,
  Zap,
  Server,
  Clock,
  MapPin,
  Activity,
  ChevronDown,
} from 'lucide-react';

interface GameData {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  status: string;
  launch_date: string | null;
}

interface ServerData {
  id: string;
  slug: string;
  name: string;
  description: string;
  region: string;
  max_players: number;
  status: string;
  settings: Record<string, any>;
}

export const Scum: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslation();

  useEffect(() => {
    setIsVisible(true);
    fetchScumData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchScumData = async () => {
    try {
      setLoading(true);

      // Check if Supabase is available
      if (!supabase) {
        console.warn('Supabase not configured, skipping data fetch');
        setLoading(false);
        return;
      }

      // Fetch game data
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('slug', 'scum')
        .single();

      if (gameError) {
        console.error('Error fetching game data:', gameError);
      } else {
        setGameData(game);
      }

      // Fetch server data for SCUM (if game exists)
      if (game?.id) {
        const { data: server, error: serverError } = await supabase
          .from('servers')
          .select('*')
          .eq('game_id', game.id)
          .maybeSingle();

        if (serverError) {
          console.error('Error fetching server data:', serverError);
        } else if (server) {
          setServerData(server);
        }
      }
    } catch (error) {
      console.error('Error fetching SCUM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  const gameFeatures = [
    {
      icon: <Skull className="h-8 w-8" />,
      title: t('scum.gameFeatures.features.survival.title'),
      description: t('scum.gameFeatures.features.survival.description'),
    },
    {
      icon: <Crosshair className="h-8 w-8" />,
      title: t('scum.gameFeatures.features.combat.title'),
      description: t('scum.gameFeatures.features.combat.description'),
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: t('scum.gameFeatures.features.crafting.title'),
      description: t('scum.gameFeatures.features.crafting.description'),
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('scum.gameFeatures.features.baseBuilding.title'),
      description: t('scum.gameFeatures.features.baseBuilding.description'),
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: t('scum.gameFeatures.features.openWorld.title'),
      description: t('scum.gameFeatures.features.openWorld.description'),
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: t('scum.gameFeatures.features.community.title'),
      description: t('scum.gameFeatures.features.community.description'),
    },
  ];

  const serverStats = serverData
    ? [
        {
          label: t('scum.serverInfo.stats.maxPlayers'),
          value: serverData.max_players.toString(),
        },
        {
          label: t('scum.serverInfo.stats.region'),
          value: serverData.region.toUpperCase(),
        },
        {
          label: t('scum.serverInfo.stats.status'),
          value: serverData.status.toUpperCase(),
        },
        {
          label: t('scum.serverInfo.stats.uptime'),
          value: '24/7',
        },
      ]
    : [
        {
          label: t('scum.serverInfo.stats.maxPlayers'),
          value: '64',
        },
        {
          label: t('scum.serverInfo.stats.region'),
          value: 'LATAM',
        },
        {
          label: t('scum.serverInfo.stats.status'),
          value: 'ONLINE',
        },
        {
          label: t('scum.serverInfo.stats.uptime'),
          value: '24/7',
        },
      ];

  const serverSettings = serverData?.settings || {};

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/70 to-gray-900 z-10"></div>
          <img
            src={images.games.scum.header}
            alt="SCUM Background"
            className="w-full h-full object-cover opacity-30"
            style={{
              transform: isVisible ? 'scale(1)' : 'scale(1.1)',
              transition: 'transform 1.5s ease-out',
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center max-w-4xl mx-auto">
            <div
              className="inline-flex items-center bg-lime-400 text-black px-4 py-2 rounded-full text-xs md:text-sm font-bold mb-8"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
                transition: 'all 0.6s ease-out 0.2s',
              }}
            >
              {t('scum.hero.badge')}
            </div>

            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s ease-out 0.4s',
              }}
            >
              <span className="text-lime-400">{t('scum.hero.title')}</span>
            </h1>

            <p
              className="text-gray-400 text-lg md:text-xl mb-8 tracking-wider"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease-out 0.6s',
              }}
            >
              {t('scum.hero.subtitle')}
            </p>

            {gameData && (
              <p
                className="text-gray-300 text-base md:text-lg mb-12 max-w-2xl mx-auto"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.8s ease-out 0.8s',
                }}
              >
                {gameData.description}
              </p>
            )}

            <div
              className="mb-12"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease-out 0.8s',
              }}
            >
              <p className="text-sm text-gray-500 mb-2">
                {t('scum.hero.launchDate.label')}
              </p>
              <p className="text-3xl md:text-5xl font-bold text-lime-400">
                {t('scum.hero.launchDate.date')}
              </p>
            </div>

            <button
              onClick={scrollToContent}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-md font-bold text-lg transition-all transform hover:scale-105 inline-flex items-center group"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease-out 1s',
              }}
            >
              {t('scum.hero.exploreButton')}
              <ChevronDown className="ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <ChevronDown className="h-8 w-8 text-blue-400 opacity-50" />
          </div>
        </div>
      </section>

      {/* Server Information Section */}
      {loading ? (
        <section className="py-20 bg-gray-800">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-400">{t('scum.serverInfo.loading')}</p>
          </div>
        </section>
      ) : (
        <section className="py-20 bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <h2 className="text-4xl md:text-5xl font-black mb-6">
                  {t('scum.serverInfo.title')} <span className="text-blue-400">{t('scum.serverInfo.titleHighlight')}</span>
                </h2>

                {serverData ? (
                  <div className="space-y-4 text-gray-300">
                    <p className="text-xl font-bold text-blue-400">
                      {serverData.name}
                    </p>
                    <p>{serverData.description}</p>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center">
                        <Activity
                          className={`h-5 w-5 mr-3 ${
                            serverData.status === 'online'
                              ? 'text-green-400'
                              : serverData.status === 'maintenance'
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}
                        />
                        <span>
                          {t('scum.serverInfo.status')}{' '}
                          <span className="font-bold capitalize">
                            {serverData.status}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-3 text-blue-400" />
                        <span>
                          {t('scum.serverInfo.maxPlayers')} <span className="font-bold">{serverData.max_players}</span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-3 text-green-400" />
                        <span>
                          {t('scum.serverInfo.region')} <span className="font-bold uppercase">{serverData.region}</span>
                        </span>
                      </div>
                    </div>

                    {/* Server Settings */}
                    {Object.keys(serverSettings).length > 0 && (
                      <div className="mt-6 p-4 bg-gray-900 rounded-lg">
                        <h3 className="font-bold mb-3 text-blue-400">
                          {t('scum.serverInfo.serverConfiguration')}
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {serverSettings.pvp !== undefined && (
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                              <span>{t('scum.serverInfo.pvp.label')} {serverSettings.pvp ? t('scum.serverInfo.pvp.enabled') : t('scum.serverInfo.pvp.disabled')}</span>
                            </div>
                          )}
                          {serverSettings.whitelist !== undefined && (
                            <div className="flex items-center">
                              <Shield className="h-4 w-4 text-blue-400 mr-2" />
                              <span>{t('scum.serverInfo.whitelist.label')} {serverSettings.whitelist ? t('scum.serverInfo.whitelist.active') : t('scum.serverInfo.whitelist.open')}</span>
                            </div>
                          )}
                          {serverSettings.high_loot !== undefined && (
                            <div className="flex items-center">
                              <Crosshair className="h-4 w-4 text-lime-400 mr-2" />
                              <span>{t('scum.serverInfo.loot.label')} {serverSettings.high_loot ? t('scum.serverInfo.loot.high') : t('scum.serverInfo.loot.standard')}</span>
                            </div>
                          )}
                          {serverSettings.hardcore !== undefined && (
                            <div className="flex items-center">
                              <Skull className="h-4 w-4 text-red-400 mr-2" />
                              <span>{t('scum.serverInfo.mode.label')} {serverSettings.hardcore ? t('scum.serverInfo.mode.hardcore') : t('scum.serverInfo.mode.standard')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 text-gray-300">
                    <p>
                      {t('scum.serverInfo.fallback.description')}
                    </p>
                    <p className="text-blue-400 font-bold">
                      {t('scum.serverInfo.fallback.cta')}
                    </p>
                    <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-blue-500/20">
                      <p className="text-sm text-gray-400 mb-2">{t('scum.serverInfo.fallback.launchDateLabel')}</p>
                      <p className="text-xl font-bold text-lime-400">{t('scum.serverInfo.fallback.launchDate')}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {serverStats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 border-2 border-gray-700 p-6 rounded-lg hover:border-blue-500 transition-all group"
                    style={{
                      opacity: 0,
                      transform: 'translateY(20px)',
                      animation: `fadeInUp 0.6s ease-out ${0.1 * index}s forwards`,
                    }}
                  >
                    <div className="text-3xl md:text-4xl font-black text-lime-400 mb-2 group-hover:scale-110 transition-transform">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-400 font-bold tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Game Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4">
            {t('scum.gameFeatures.title')} <span className="text-blue-400">{t('scum.gameFeatures.titleHighlight')}</span>{t('scum.gameFeatures.titleSuffix')}
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            {t('scum.gameFeatures.description')}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {gameFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800 border-2 border-gray-700 p-6 rounded-lg hover:border-blue-500 transition-all group"
                style={{
                  opacity: 0,
                  transform: 'translateY(30px)',
                  animation: `fadeInUp 0.5s ease-out ${0.1 * index}s forwards`,
                }}
              >
                <div className="text-blue-400 mb-4 transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP Plans Section */}
      <VIPPlans />

      {/* CTA Section */}
      <section className="py-20 bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            {t('scum.cta.title')} <span className="text-blue-400">{t('scum.cta.titleHighlight')}</span>{t('scum.cta.titleSuffix')}
          </h2>

          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            {t('scum.cta.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-md font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center group">
              <img
                src="/images/logos/Face-19.png"
                alt="MindBreakers"
                className="h-5 w-5 mr-2 object-contain group-hover:rotate-12 transition-transform"
              />
              {t('scum.cta.joinDiscord')}
            </button>
            <a
              href="/"
              className="border-2 border-gray-700 hover:border-blue-500 text-white px-8 py-4 rounded-md font-bold text-lg transition-all inline-block hover:bg-gray-700/50"
            >
              {t('scum.cta.backToHome')}
            </a>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="bg-gray-900 border-t border-gray-800 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center">
            <img
              src="/images/logos/Face-18.png"
              alt="MindBreakers"
              className="h-5 w-5 mr-2 opacity-70 object-contain"
            />
            {t('scum.footer.copyright')}{' '}
            <span className="text-red-500 mx-1">❤</span> {t('scum.footer.copyrightSuffix')}
          </p>
        </div>
      </div>

      <Footer />

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 bg-gray-800 border border-gray-700 hover:border-lime-400 rounded-full p-3 transition-all duration-300 z-50 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <img
          src="/images/logos/Face-18.png"
          alt="Scroll to top"
          className="h-8 w-8 object-contain"
        />
      </button>

      <style>{`
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
