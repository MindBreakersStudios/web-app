import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { VIPPlans } from '../components/VIPPlans';
import { images } from '../config/images';
import { supabase } from '../lib/supabase';
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
  Sparkles,
  Sword,
  Hammer,
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

export const Hytale: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    fetchHytaleData();
  }, []);

  const fetchHytaleData = async () => {
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
        .eq('slug', 'hytale')
        .single();

      if (gameError) {
        console.error('Error fetching game data:', gameError);
      } else {
        setGameData(game);
      }

      // Fetch server data for Hytale (if game exists)
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
      console.error('Error fetching Hytale data:', error);
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
      icon: <Sparkles className="h-8 w-8" />,
      title: 'ADVENTURE MODE',
      description:
        'Embark on epic quests, explore procedurally generated worlds, and battle dangerous creatures in a rich RPG experience.',
    },
    {
      icon: <Hammer className="h-8 w-8" />,
      title: 'CREATIVE BUILDING',
      description:
        'Build anything you can imagine with an advanced block-building system. Create structures, contraptions, and entire worlds.',
    },
    {
      icon: <Sword className="h-8 w-8" />,
      title: 'MINIGAMES',
      description:
        'Play a variety of custom minigames created by the community. From PvP arenas to puzzle challenges, there is something for everyone.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'MODDING SUPPORT',
      description:
        'Full modding support allows you to customize your experience. Create your own content or enjoy community creations.',
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'MASSIVE WORLDS',
      description:
        'Explore vast procedurally generated worlds with diverse biomes, dungeons, and secrets waiting to be discovered.',
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'ACTIVE COMMUNITY',
      description:
        'Join a thriving community of creators, adventurers, and builders. Share your creations and collaborate with others.',
    },
  ];

  const serverStats = serverData
    ? [
        {
          label: 'MAX PLAYERS',
          value: serverData.max_players.toString(),
        },
        {
          label: 'REGION',
          value: serverData.region.toUpperCase(),
        },
        {
          label: 'STATUS',
          value: serverData.status.toUpperCase(),
        },
        {
          label: 'LAUNCH',
          value: 'Q4 2026',
        },
      ]
    : [
        {
          label: 'MAX PLAYERS',
          value: 'TBD',
        },
        {
          label: 'REGION',
          value: 'LATAM',
        },
        {
          label: 'STATUS',
          value: 'COMING SOON',
        },
        {
          label: 'LAUNCH',
          value: 'Q4 2026',
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
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-purple-900/70 to-gray-900 z-10"></div>
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 opacity-30"></div>
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
              ◄ COMING SOON — Q4 2026 ►
            </div>

            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s ease-out 0.4s',
              }}
            >
              <span className="text-lime-400">HYTALE</span>
            </h1>

            <p
              className="text-gray-400 text-lg md:text-xl mb-8 tracking-wider"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease-out 0.6s',
              }}
            >
              ADVENTURE. CREATE. SURVIVE.
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
                SERVER LAUNCH
              </p>
              <p className="text-3xl md:text-5xl font-bold text-lime-400">
                Q4 2026
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
              EXPLORE SERVER
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
            <p className="mt-4 text-gray-400">Loading server information...</p>
          </div>
        </section>
      ) : (
        <section className="py-20 bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <h2 className="text-4xl md:text-5xl font-black mb-6">
                  OUR <span className="text-blue-400">HYTALE SERVER</span>
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
                          Status:{' '}
                          <span className="font-bold capitalize">
                            {serverData.status}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-3 text-blue-400" />
                        <span>
                          Max Players: <span className="font-bold">{serverData.max_players}</span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-3 text-green-400" />
                        <span>
                          Region: <span className="font-bold uppercase">{serverData.region}</span>
                        </span>
                      </div>
                    </div>

                    {/* Server Settings */}
                    {Object.keys(serverSettings).length > 0 && (
                      <div className="mt-6 p-4 bg-gray-900 rounded-lg">
                        <h3 className="font-bold mb-3 text-blue-400">
                          Server Configuration
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {serverSettings.mod_support !== undefined && (
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                              <span>Mods: {serverSettings.mod_support ? 'Enabled' : 'Disabled'}</span>
                            </div>
                          )}
                          {serverSettings.pvp !== undefined && (
                            <div className="flex items-center">
                              <Shield className="h-4 w-4 text-blue-400 mr-2" />
                              <span>PvP: {serverSettings.pvp ? 'Enabled' : 'Disabled'}</span>
                            </div>
                          )}
                          {serverSettings.adventure_mode !== undefined && (
                            <div className="flex items-center">
                              <Sparkles className="h-4 w-4 text-lime-400 mr-2" />
                              <span>Adventure: {serverSettings.adventure_mode ? 'Enabled' : 'Disabled'}</span>
                            </div>
                          )}
                          {serverSettings.creative_mode !== undefined && (
                            <div className="flex items-center">
                              <Hammer className="h-4 w-4 text-purple-400 mr-2" />
                              <span>Creative: {serverSettings.creative_mode ? 'Enabled' : 'Disabled'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 text-gray-300">
                    <p>
                      Our Hytale server is launching in Q4 2026. We're preparing an
                      amazing experience with adventure mode, creative building, minigames,
                      and full modding support.
                    </p>
                    <p className="text-blue-400 font-bold">
                      Join the MindBreakers Hytale community and be ready for launch day!
                    </p>
                    <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-blue-500/20">
                      <p className="text-sm text-gray-400 mb-2">Launch Date:</p>
                      <p className="text-xl font-bold text-lime-400">Q4 2026</p>
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
            WHY <span className="text-blue-400">HYTALE</span>?
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Discover what makes Hytale a unique blend of adventure, creativity, and survival
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
            READY TO <span className="text-blue-400">ADVENTURE</span>?
          </h2>

          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            Join our Discord to get notified when the server launches and start your Hytale journey
            on the MindBreakers server
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-md font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center group">
              <Users className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              JOIN DISCORD
            </button>
            <a
              href="/"
              className="border-2 border-gray-700 hover:border-blue-500 text-white px-8 py-4 rounded-md font-bold text-lg transition-all inline-block hover:bg-gray-700/50"
            >
              BACK TO HOME
            </a>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="bg-gray-900 border-t border-gray-800 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © 2025-2026 Mind Breakers. Made with{' '}
            <span className="text-red-500">❤</span> for the LATAM gaming
            community.
          </p>
        </div>
      </div>

      <Footer />

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
