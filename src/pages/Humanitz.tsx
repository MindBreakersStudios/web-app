import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { images } from '../config/images';
import {
  Users,
  Skull,
  Wrench,
  Shield,
  Globe,
  Heart,
  CheckCircle,
  Crosshair,
  Zap,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';

export const Humanitz = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const serverStats = [
    {
      label: 'PLAYER SLOTS',
      value: '60',
    },
    {
      label: 'FORTUNE FREE',
      value: 'OS',
    },
    {
      label: 'SERVER LOCATION',
      value: 'ARG',
    },
    {
      label: 'UPTIME',
      value: '24/7',
    },
  ];

  const versionComparison = [
    {
      feature: 'Zombie AI',
      current: 'Basic pathfinding, predictable behavior',
      new: 'Advanced AI with dynamic threat assessment',
      currentImage: images.backgrounds.versionComparison.current.zombieAI,
      newImage: images.backgrounds.versionComparison.new.zombieAI,
    },
    {
      feature: 'Base Building',
      current: 'Limited building options and materials',
      new: 'Expanded construction system with fortifications',
      currentImage: images.backgrounds.versionComparison.current.baseBuilding,
      newImage: images.backgrounds.versionComparison.new.baseBuilding,
    },
    {
      feature: 'Loot System',
      current: 'Standard spawn rates and locations',
      new: 'Dynamic loot with high-tier weapon spawns',
      currentImage: images.backgrounds.versionComparison.current.lootSystem,
      newImage: images.backgrounds.versionComparison.new.lootSystem,
    },
    {
      feature: 'Performance',
      current: 'Occasional lag with large groups',
      new: 'Optimized for 60 players with smooth gameplay',
      currentImage: images.backgrounds.versionComparison.current.performance,
      newImage: images.backgrounds.versionComparison.new.performance,
    },
  ];

  const serverConfig = [
    {
      icon: <Crosshair className="h-8 w-8" />,
      title: 'HIGH LOOT',
      description:
        'Increased spawn rates for weapons, ammo, and supplies. Find what you need to survive without the grind.',
    },
    {
      icon: <Skull className="h-8 w-8" />,
      title: 'HIGH ZOMBIES',
      description:
        'Massive zombie populations create constant danger and tension. Every step could be your last. Stay alert, move smart.',
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      title: 'HIGH CHALLENGE',
      description:
        'Balanced difficulty that rewards skill and teamwork. Not for casual players—this is hardcore survival.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'WHITELISTED',
      description:
        'Application-based access ensures a quality community. No griefers, no trolls—just dedicated survivors.',
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'LATAM OPTIMIZED',
      description:
        'Argentina-based servers deliver sub-50ms ping for most Latin American players. Smooth, responsive gameplay guaranteed.',
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'CREATOR FRIENDLY',
      description:
        'Built for streamers and YouTubers. Bring your community, create epic content, build your following.',
    },
  ];

  const targetAudience = [
    'Content creators looking for a dedicated LATAM server',
    'Communities who want to play together',
    'Hardcore survival enthusiasts',
    'Players tired of pay-to-win servers',
    'Spanish & Portuguese speaking players',
    'Anyone who loves a real challenge',
  ];

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/70 to-gray-900 z-10"></div>
          <img
            src={images.backgrounds.humanitzHero}
            alt="Humanitz Background"
            className="w-full h-full object-cover opacity-30"
            style={{
              transform: isVisible ? 'scale(1)' : 'scale(1.1)',
              transition: 'transform 1.5s ease-out',
            }}
          />
<<<<<<< Updated upstream
=======
          {/* Logo Background - Similar to SCUM */}
          <div className="absolute inset-0 flex items-center justify-center z-[5] pointer-events-none">
            <div className="relative w-full h-full">
              <img
                src="/images/humanitz/Humanitz-logo.jpg"
                alt="Humanitz Logo"
                className="w-full h-full object-contain opacity-[0.25]"
                style={{
                  transform: isVisible ? 'scale(1)' : 'scale(0.95)',
                  transition: 'transform 1.5s ease-out',
                }}
              />
              {/* Gradient fade on sides */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(to right, rgba(17, 24, 39, 1) 0%, transparent 15%, transparent 85%, rgba(17, 24, 39, 1) 100%)',
                }}
              />
            </div>
          </div>
>>>>>>> Stashed changes
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
              ◄ 100% FREE — NO MONETIZATION ►
            </div>

            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s ease-out 0.4s',
              }}
            >
              HUMANIT<span className="text-lime-400">Z</span>
            </h1>

            <p
              className="text-gray-400 text-lg md:text-xl mb-8 tracking-wider"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease-out 0.6s',
              }}
            >
              HARDCORE SURVIVAL FOR CONTENT CREATORS
            </p>

            <div
              className="mb-12"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease-out 0.8s',
              }}
            >
              <p className="text-sm text-gray-500 mb-2">
                SERVER LAUNCH WITH 0.70
              </p>
              <p className="text-3xl md:text-5xl font-bold text-lime-400">
                FEBRUARY 6, 2026
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
              SCROLL TO DISCOVER
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

      {/* Built for Community Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                BUILT FOR THE <span className="text-blue-400">COMMUNITY</span>
              </h2>

              <div className="space-y-4 text-gray-300">
                <p>
                  We're not here to make money. We're here because we love
                  survival games and want to give Latin American players the
                  server they deserve.
                </p>

                <p>
                  Mind Breakers Humanitz is a whitelisted, hardcore experience
                  designed specifically for content creators and their
                  communities. High loot, high zombies, maximum challenge.
                </p>

                <p className="text-blue-400 font-bold">
                  Hosted in Argentina for the best ping across all of Latin
                  America. No pay-to-win, no VIP tiers, no hidden costs. Just
                  pure survival.
                </p>
              </div>
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

      {/* Version Comparison Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              WHAT'S <span className="text-blue-400">NEW</span> IN 0.70
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              See how the latest version transforms the Humanitz experience with
              major improvements
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-8">
            {versionComparison.map((comparison, index) => (
              <div
                key={index}
                className="grid md:grid-cols-2 gap-6 items-center"
                style={{
                  opacity: 0,
                  transform: 'translateY(30px)',
                  animation: `fadeInUp 0.6s ease-out ${0.15 * index}s forwards`,
                }}
              >
                {/* Current Version */}
                <div className="bg-gray-800 border-2 border-gray-700 rounded-lg overflow-hidden group relative">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={comparison.currentImage}
                      alt={`Current ${comparison.feature}`}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-bold">
                        CURRENT (0.9)
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-300">
                      {comparison.feature}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {comparison.current}
                    </p>
                  </div>
                </div>

                {/* Arrow Indicator */}
                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-blue-500 rounded-full p-3">
                    <ArrowRight className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* New Version 1.0 */}
                <div className="bg-gray-800 border-2 border-blue-500 rounded-lg overflow-hidden group hover:border-lime-400 transition-all relative">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={comparison.newImage}
                      alt={`New ${comparison.feature}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-lime-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                        1.0 NEW
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-white">
                      {comparison.feature}
                    </h3>
                    <p className="text-gray-300 text-sm">{comparison.new}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Server Configuration */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4">
            SERVER <span className="text-blue-400">CONFIGURATION</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Carefully tuned settings for the ultimate hardcore survival
            experience
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {serverConfig.map((config, index) => (
              <div
                key={index}
                className="bg-gray-900 border-2 border-gray-700 p-6 rounded-lg hover:border-blue-500 transition-all group"
                style={{
                  opacity: 0,
                  transform: 'translateY(30px)',
                  animation: `fadeInUp 0.5s ease-out ${0.1 * index}s forwards`,
                }}
              >
                <div className="text-blue-400 mb-4 transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                  {config.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{config.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {config.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8">
                WHO IS THIS <span className="text-blue-400">FOR?</span>
              </h2>

              <div className="space-y-4">
                {targetAudience.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start"
                    style={{
                      opacity: 0,
                      transform: 'translateX(-20px)',
                      animation: `fadeInLeft 0.5s ease-out ${0.1 * index}s forwards`,
                    }}
                  >
                    <CheckCircle className="h-6 w-6 text-lime-400 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 border-2 border-blue-500 p-12 rounded-lg text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/5 transform scale-0 group-hover:scale-100 transition-transform duration-500 rounded-lg"></div>
              <div className="relative z-10">
                <h3 className="text-6xl md:text-7xl font-black text-blue-400 mb-4">
                  LATAM
                </h3>
                <p className="text-gray-300 text-lg mb-6">
                  Best ping for Argentina, Brazil, Uruguay, Chile, Peru,
                  Colombia, Mexico and all Latin America
                </p>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-lime-400">ARG</div>
                    <div className="text-xs text-gray-400">Server Location</div>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-lime-400">
                      &lt;50ms
                    </div>
                    <div className="text-xs text-gray-400">Average Ping</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            READY TO <span className="text-blue-400">SURVIVE?</span>
          </h2>

          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            Join our Discord to apply for whitelist access and be ready for
            launch day
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

        @keyframes fadeInLeft {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
