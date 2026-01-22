import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { images } from '../config/images';
import { useTranslation } from '../hooks/useTranslation';
import { getTranslation } from '../i18n';
import { useLanguage } from '../contexts/LanguageContext';
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
  Map,
  Gamepad2,
  Building,
  Sparkles,
  Lock,
} from 'lucide-react';

export const Humanitz = () => {
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslation();
  const { locale } = useLanguage();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const serverStats = [
    {
      label: t('humanitz.community.stats.playerSlots'),
      value: '60',
    },
    {
      label: t('humanitz.community.stats.fortuneFree'),
      value: 'OS',
    },
    {
      label: t('humanitz.community.stats.serverLocation'),
      value: 'ARG',
    },
    {
      label: t('humanitz.community.stats.uptime'),
      value: '24/7',
    },
  ];

  // Major 1.0 Features highlight
  const majorFeatures = [
    {
      icon: <Map className="h-10 w-10" />,
      title: t('humanitz.majorFeatures.features.newIsland.title'),
      subtitle: t('humanitz.majorFeatures.features.newIsland.subtitle'),
      description: t('humanitz.majorFeatures.features.newIsland.description'),
      highlight: true,
    },
    {
      icon: <Sparkles className="h-10 w-10" />,
      title: t('humanitz.majorFeatures.features.skillsProfessions.title'),
      subtitle: t('humanitz.majorFeatures.features.skillsProfessions.subtitle'),
      description: t('humanitz.majorFeatures.features.skillsProfessions.description'),
      highlight: true,
    },
    {
      icon: <Building className="h-10 w-10" />,
      title: t('humanitz.majorFeatures.features.hudsonCity.title'),
      subtitle: t('humanitz.majorFeatures.features.hudsonCity.subtitle'),
      description: t('humanitz.majorFeatures.features.hudsonCity.description'),
      highlight: true,
    },
    {
      icon: <Gamepad2 className="h-10 w-10" />,
      title: t('humanitz.majorFeatures.features.controller.title'),
      subtitle: t('humanitz.majorFeatures.features.controller.subtitle'),
      description: t('humanitz.majorFeatures.features.controller.description'),
      highlight: false,
    },
  ];

  // Comprehensive 1.0 features list
  const allNewFeatures = [
    { 
      category: t('humanitz.allFeatures.categories.combat.name'), 
      items: getTranslation(locale, 'humanitz.allFeatures.categories.combat.items') || []
    },
    { 
      category: t('humanitz.allFeatures.categories.aiEnemies.name'), 
      items: getTranslation(locale, 'humanitz.allFeatures.categories.aiEnemies.items') || []
    },
    { 
      category: t('humanitz.allFeatures.categories.survival.name'), 
      items: getTranslation(locale, 'humanitz.allFeatures.categories.survival.items') || []
    },
    { 
      category: t('humanitz.allFeatures.categories.worldLore.name'), 
      items: getTranslation(locale, 'humanitz.allFeatures.categories.worldLore.items') || []
    },
    { 
      category: t('humanitz.allFeatures.categories.systems.name'), 
      items: getTranslation(locale, 'humanitz.allFeatures.categories.systems.items') || []
    },
    { 
      category: t('humanitz.allFeatures.categories.qualityOfLife.name'), 
      items: getTranslation(locale, 'humanitz.allFeatures.categories.qualityOfLife.items') || []
    },
  ];

  // Map Overhaul Comparisons
  const mapComparisons = [
    {
      location: t('humanitz.mapOverhaul.comparisons.residential.location'),
      before: t('humanitz.mapOverhaul.comparisons.residential.before'),
      after: t('humanitz.mapOverhaul.comparisons.residential.after'),
      beforeImage: images.backgrounds.versionComparison.current.zombieAI,
      afterImage: images.backgrounds.versionComparison.new.zombieAI,
    },
    {
      location: t('humanitz.mapOverhaul.comparisons.commercial.location'),
      before: t('humanitz.mapOverhaul.comparisons.commercial.before'),
      after: t('humanitz.mapOverhaul.comparisons.commercial.after'),
      beforeImage: images.backgrounds.versionComparison.current.baseBuilding,
      afterImage: images.backgrounds.versionComparison.new.baseBuilding,
    },
    {
      location: t('humanitz.mapOverhaul.comparisons.gasStations.location'),
      before: t('humanitz.mapOverhaul.comparisons.gasStations.before'),
      after: t('humanitz.mapOverhaul.comparisons.gasStations.after'),
      beforeImage: images.backgrounds.versionComparison.current.lootSystem,
      afterImage: images.backgrounds.versionComparison.new.lootSystem,
    },
    {
      location: t('humanitz.mapOverhaul.comparisons.rural.location'),
      before: t('humanitz.mapOverhaul.comparisons.rural.before'),
      after: t('humanitz.mapOverhaul.comparisons.rural.after'),
      beforeImage: images.backgrounds.versionComparison.current.performance,
      afterImage: images.backgrounds.versionComparison.new.performance,
    },
  ];

  const serverConfig = [
    {
      icon: <Crosshair className="h-8 w-8" />,
      title: t('humanitz.serverConfig.features.highLoot.title'),
      description: t('humanitz.serverConfig.features.highLoot.description'),
    },
    {
      icon: <Skull className="h-8 w-8" />,
      title: t('humanitz.serverConfig.features.highZombies.title'),
      description: t('humanitz.serverConfig.features.highZombies.description'),
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      title: t('humanitz.serverConfig.features.highChallenge.title'),
      description: t('humanitz.serverConfig.features.highChallenge.description'),
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('humanitz.serverConfig.features.whitelisted.title'),
      description: t('humanitz.serverConfig.features.whitelisted.description'),
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: t('humanitz.serverConfig.features.latamOptimized.title'),
      description: t('humanitz.serverConfig.features.latamOptimized.description'),
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: t('humanitz.serverConfig.features.creatorFriendly.title'),
      description: t('humanitz.serverConfig.features.creatorFriendly.description'),
    },
  ];

  const targetAudience = (getTranslation(locale, 'humanitz.targetAudience.items') || []) as string[];

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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
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
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center max-w-4xl mx-auto">
            <div
              className="inline-flex items-center bg-lime-400 text-black px-4 py-2 rounded-full text-xs md:text-sm font-bold mb-6"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
                transition: 'all 0.6s ease-out 0.2s',
              }}
            >
              {t('humanitz.hero.badge')}
            </div>

            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-4"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s ease-out 0.4s',
              }}
            >
              {t('humanitz.hero.title')}<span className="text-lime-400">{t('humanitz.hero.titleHighlight')}</span>
            </h1>

            {/* Enhanced Subtitle & Description */}
            <div
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease-out 0.6s',
              }}
            >
              <p className="text-blue-400 text-xl md:text-2xl font-bold mb-4 tracking-wide">
                {t('humanitz.hero.subtitle')}
              </p>
              <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
                <span className="text-white font-semibold">HumanitZ</span> {t('humanitz.hero.description.part1')} <span className="text-lime-400 font-semibold">{t('humanitz.hero.description.whitelistedServer')}</span> {t('humanitz.hero.description.part2')}
              </p>
            </div>

            {/* Key Points */}
            <div
              className="flex flex-wrap gap-3 justify-center mb-8"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease-out 0.7s',
              }}
            >
              <span className="inline-flex items-center bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full text-sm">
                <Lock className="h-4 w-4 text-lime-400 mr-2" />
                {t('humanitz.hero.keyPoints.whitelistOnly')}
              </span>
              <span className="inline-flex items-center bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full text-sm">
                <Globe className="h-4 w-4 text-blue-400 mr-2" />
                {t('humanitz.hero.keyPoints.latamServers')}
              </span>
              <span className="inline-flex items-center bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full text-sm">
                <Users className="h-4 w-4 text-purple-400 mr-2" />
                {t('humanitz.hero.keyPoints.creatorFocused')}
              </span>
            </div>

            {/* Launch Date */}
            <div
              className="mb-10"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease-out 0.8s',
              }}
            >
              <p className="text-sm text-gray-500 mb-2">
                {t('humanitz.hero.launchDate.label')}
              </p>
              <p className="text-3xl md:text-5xl font-bold text-lime-400">
                {t('humanitz.hero.launchDate.date')}
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
              {t('humanitz.hero.exploreButton')}
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

      {/* Whitelist Explainer Section */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-800 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center bg-lime-400/20 border border-lime-400/50 text-lime-400 px-3 py-1 rounded-full text-sm font-bold mb-4">
                  <Lock className="h-4 w-4 mr-2" />
                  {t('humanitz.whitelist.badge')}
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  {t('humanitz.whitelist.title')} <span className="text-lime-400">{t('humanitz.whitelist.titleHighlight')}</span>
                </h2>
                <p className="text-gray-300 mb-4">
                  {t('humanitz.whitelist.description1')}
                </p>
                <p className="text-gray-400 text-sm">
                  {t('humanitz.whitelist.description2')}
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex items-start">
                  <div className="bg-lime-400/20 rounded-full p-2 mr-4">
                    <Shield className="h-5 w-5 text-lime-400" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{t('humanitz.whitelist.features.noGriefers.title')}</h4>
                    <p className="text-gray-400 text-sm">{t('humanitz.whitelist.features.noGriefers.description')}</p>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex items-start">
                  <div className="bg-blue-400/20 rounded-full p-2 mr-4">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{t('humanitz.whitelist.features.communityFirst.title')}</h4>
                    <p className="text-gray-400 text-sm">{t('humanitz.whitelist.features.communityFirst.description')}</p>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex items-start">
                  <div className="bg-purple-400/20 rounded-full p-2 mr-4">
                    <Heart className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{t('humanitz.whitelist.features.contentReady.title')}</h4>
                    <p className="text-gray-400 text-sm">{t('humanitz.whitelist.features.contentReady.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1.0 Major Features Showcase */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-lime-400/20 border border-lime-400 text-lime-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Zap className="h-4 w-4 mr-2" />
              {t('humanitz.majorFeatures.badge')}
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-4">
              {t('humanitz.majorFeatures.title')} <span className="text-lime-400">{t('humanitz.majorFeatures.titleHighlight')}</span> {t('humanitz.majorFeatures.titleSuffix')}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              {t('humanitz.majorFeatures.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
            {majorFeatures.map((feature, index) => (
              <div
                key={index}
                className={`relative p-6 rounded-xl border-2 transition-all group hover:scale-105 ${
                  feature.highlight 
                    ? 'bg-gradient-to-br from-lime-400/10 to-transparent border-lime-400/50 hover:border-lime-400' 
                    : 'bg-gray-900 border-gray-700 hover:border-blue-500'
                }`}
                style={{
                  opacity: 0,
                  transform: 'translateY(30px)',
                  animation: `fadeInUp 0.6s ease-out ${0.1 * index}s forwards`,
                }}
              >
                {feature.highlight && (
                  <div className="absolute -top-3 -right-3 bg-lime-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                    {t('humanitz.majorFeatures.newBadge')}
                  </div>
                )}
                <div className={`mb-4 ${feature.highlight ? 'text-lime-400' : 'text-blue-400'}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                <p className={`text-xs font-bold mb-3 ${feature.highlight ? 'text-lime-400/70' : 'text-blue-400/70'}`}>
                  {feature.subtitle}
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Features List */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              {t('humanitz.allFeatures.title')} <span className="text-blue-400">{t('humanitz.allFeatures.titleHighlight')}</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t('humanitz.allFeatures.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {allNewFeatures.map((category, catIndex) => (
              <div
                key={catIndex}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all"
                style={{
                  opacity: 0,
                  transform: 'translateY(20px)',
                  animation: `fadeInUp 0.5s ease-out ${0.1 * catIndex}s forwards`,
                }}
              >
                <h3 className="text-lg font-bold text-blue-400 mb-4 pb-2 border-b border-gray-700">
                  {category.category}
                </h3>
                <ul className="space-y-2">
                  {category.items.map((item: string, itemIndex: number) => (
                    <li key={itemIndex} className="flex items-start text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-lime-400 mr-2 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              {t('humanitz.allFeatures.footerNote')}
            </p>
          </div>
        </div>
      </section>

      {/* Map Overhaul Comparison Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              {t('humanitz.mapOverhaul.title')} <span className="text-lime-400">{t('humanitz.mapOverhaul.titleHighlight')}</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t('humanitz.mapOverhaul.description')}
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            {mapComparisons.map((comparison, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-lime-400/50 transition-all"
                style={{
                  opacity: 0,
                  transform: 'translateY(30px)',
                  animation: `fadeInUp 0.6s ease-out ${0.15 * index}s forwards`,
                }}
              >
                {/* Location Title */}
                <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
                  <h3 className="text-2xl font-bold">
                    <span className="text-lime-400">#</span> {comparison.location}
                  </h3>
                </div>

                {/* Image Comparison */}
                <div className="grid md:grid-cols-2">
                  {/* Before */}
                  <div className="relative">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-gray-900/90 text-gray-300 px-3 py-1 rounded-full text-xs font-bold border border-gray-600">
                        {t('humanitz.mapOverhaul.labels.earlyAccess')}
                      </span>
                    </div>
                    <img
                      src={comparison.beforeImage}
                      alt={`${comparison.location} - Before`}
                      className="w-full h-64 object-cover opacity-70"
                    />
                    <div className="p-4 bg-gray-800/50">
                      <p className="text-gray-400 text-sm">{comparison.before}</p>
                    </div>
                  </div>

                  {/* After */}
                  <div className="relative border-l border-gray-700">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-lime-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                        {t('humanitz.mapOverhaul.labels.version10')}
                      </span>
                    </div>
                    <img
                      src={comparison.afterImage}
                      alt={`${comparison.location} - After`}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-4 bg-lime-400/5">
                      <p className="text-gray-300 text-sm">{comparison.after}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Community Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                {t('humanitz.community.title')} <span className="text-blue-400">{t('humanitz.community.titleHighlight')}</span>
              </h2>

              <div className="space-y-4 text-gray-300">
                <p>
                  {t('humanitz.community.description1')}
                </p>

                <p>
                  {t('humanitz.community.description2')}
                </p>

                <p className="text-blue-400 font-bold">
                  {t('humanitz.community.description3')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {serverStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gray-800 border-2 border-gray-700 p-6 rounded-lg hover:border-blue-500 transition-all group"
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

      {/* Server Configuration */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4">
            {t('humanitz.serverConfig.title')} <span className="text-blue-400">{t('humanitz.serverConfig.titleHighlight')}</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            {t('humanitz.serverConfig.description')}
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
                {t('humanitz.targetAudience.title')} <span className="text-blue-400">{t('humanitz.targetAudience.titleHighlight')}</span>
              </h2>

              <div className="space-y-4">
                {targetAudience.map((item: string, index: number) => (
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
                  {t('humanitz.targetAudience.latamSection.title')}
                </h3>
                <p className="text-gray-300 text-lg mb-6">
                  {t('humanitz.targetAudience.latamSection.description')}
                </p>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-lime-400">ARG</div>
                    <div className="text-xs text-gray-400">{t('humanitz.targetAudience.latamSection.serverLocation')}</div>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-lime-400">
                      &lt;50ms
                    </div>
                    <div className="text-xs text-gray-400">{t('humanitz.targetAudience.latamSection.averagePing')}</div>
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
            {t('humanitz.cta.title')} <span className="text-blue-400">{t('humanitz.cta.titleHighlight')}</span>
          </h2>

          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            {t('humanitz.cta.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-md font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center group">
              <Users className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              {t('humanitz.cta.joinDiscord')}
            </button>
            <a
              href="/"
              className="border-2 border-gray-700 hover:border-blue-500 text-white px-8 py-4 rounded-md font-bold text-lg transition-all inline-block hover:bg-gray-700/50"
            >
              {t('humanitz.cta.backToHome')}
            </a>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="bg-gray-900 border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            {t('humanitz.footer.copyright')}{' '}
            <span className="text-red-500">❤</span> {t('humanitz.footer.copyrightSuffix')}
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