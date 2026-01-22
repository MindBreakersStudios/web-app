import { Link } from 'react-router-dom';
import { Clock, Users, Shield, Server } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const GameServers = () => {
  const t = useTranslation();

  return (
    <section id="servers" className="bg-gray-900 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('home.gameServers.title')}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t('home.gameServers.description')}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Humanitz Server */}
          <div
            id="humanitz"
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition duration-300"
          >
            <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: 'url(/images/humanitz/title.jpg)' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
              <div className="absolute top-4 left-4 bg-lime-400 text-black px-3 py-1 rounded-md font-medium text-sm">
                {t('home.gameServers.servers.humanitz.badge')}
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">{t('home.gameServers.servers.humanitz.title')}</h3>
                <img
                  src="https://cdn.akamai.steamstatic.com/steam/apps/1711420/capsule_sm_120.jpg"
                  alt="HumanitZ Logo"
                  className="h-10 w-10 rounded"
                />
              </div>
              <p className="text-gray-400 mb-6">
                {t('home.gameServers.servers.humanitz.description')}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">{t('home.gameServers.servers.humanitz.features.uptime')}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">{t('home.gameServers.servers.humanitz.features.players')}</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">{t('home.gameServers.servers.humanitz.features.freeAccess')}</span>
                </div>
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">{t('home.gameServers.servers.humanitz.features.customConfig')}</span>
                </div>
              </div>
              <Link
                to="/humanitz"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition block text-center"
              >
                {t('home.gameServers.servers.humanitz.learnMore')}
              </Link>
            </div>
          </div>

          {/* SCUM Server */}
          <div
            id="scum"
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition duration-300"
          >
            <div className="h-48 bg-[url('https://cdn.akamai.steamstatic.com/steam/apps/513710/header.jpg')] bg-cover bg-center relative">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
              <div className="absolute top-4 left-4 bg-lime-400 text-black px-3 py-1 rounded-md font-medium text-sm">
                {t('home.gameServers.servers.scum.badge')}
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">{t('home.gameServers.servers.scum.title')}</h3>
                <img
                  src="https://cdn.akamai.steamstatic.com/steam/apps/513710/capsule_sm_120.jpg"
                  alt="SCUM Logo"
                  className="h-10 w-10 rounded"
                />
              </div>
              <p className="text-gray-400 mb-6">
                {t('home.gameServers.servers.scum.description')}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">{t('home.gameServers.servers.scum.features.uptime')}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">{t('home.gameServers.servers.scum.features.players')}</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">{t('home.gameServers.servers.scum.features.antiCheat')}</span>
                </div>
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">{t('home.gameServers.servers.scum.features.customRules')}</span>
                </div>
              </div>
              <Link
                to="/scum"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition block text-center"
              >
                {t('home.gameServers.servers.scum.learnMore')}
              </Link>
            </div>
          </div>

          {/* Hytale Server */}
          <div
            id="hytale"
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition duration-300"
          >
            <div className="h-48 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
              <div className="absolute top-4 left-4 bg-lime-400 text-black px-3 py-1 rounded-md font-medium text-sm">
                {t('home.gameServers.servers.hytale.badge')}
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">{t('home.gameServers.servers.hytale.title')}</h3>
                <div className="h-10 w-10 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  H
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                {t('home.gameServers.servers.hytale.description')}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">{t('home.gameServers.servers.hytale.features.uptime')}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">{t('home.gameServers.servers.hytale.features.comingSoon')}</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">{t('home.gameServers.servers.hytale.features.customWorlds')}</span>
                </div>
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">{t('home.gameServers.servers.hytale.features.modSupport')}</span>
                </div>
              </div>
              <button
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-md font-medium transition"
                disabled
              >
                {t('home.gameServers.servers.hytale.newsComingSoon')}
              </button>
            </div>
          </div>
        </div>

        {/* Previous Servers Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t('home.gameServers.previousServers.title')}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t('home.gameServers.previousServers.description')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* DayZ Server */}
            <div
              id="dayz"
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition duration-300 opacity-75"
            >
              <div className="h-48 bg-[url('https://cdn.akamai.steamstatic.com/steam/apps/221100/header.jpg')] bg-cover bg-center relative">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-md font-medium text-sm">
                  {t('home.gameServers.servers.dayz.badge')}
                </div>
                <div className="absolute top-4 right-4 bg-gray-800 text-gray-300 px-3 py-1 rounded-md font-medium text-xs">
                  {t('home.gameServers.servers.dayz.years')}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">{t('home.gameServers.servers.dayz.title')}</h3>
                  <img
                    src="https://cdn.akamai.steamstatic.com/steam/apps/221100/capsule_sm_120.jpg"
                    alt="DayZ Logo"
                    className="h-10 w-10 rounded"
                  />
                </div>
                <p className="text-gray-400 mb-6">
                  {t('home.gameServers.servers.dayz.description')}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">{t('home.gameServers.servers.dayz.features.legacy')}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">{t('home.gameServers.servers.dayz.features.players')}</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">{t('home.gameServers.servers.dayz.features.topLatam')}</span>
                  </div>
                  <div className="flex items-center">
                    <Server className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">{t('home.gameServers.servers.dayz.features.years')}</span>
                  </div>
                </div>
                <button
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-md font-medium transition cursor-not-allowed"
                  disabled
                >
                  {t('home.gameServers.servers.dayz.legacyServer')}
                </button>
              </div>
            </div>

            {/* V Rising Server */}
            <div
              id="vrising"
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition duration-300 opacity-75"
            >
              <div className="h-48 bg-[url('https://cdn.akamai.steamstatic.com/steam/apps/1604030/header.jpg')] bg-cover bg-center relative">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-md font-medium text-sm">
                  {t('home.gameServers.servers.vrising.badge')}
                </div>
                <div className="absolute top-4 right-4 bg-gray-800 text-gray-300 px-3 py-1 rounded-md font-medium text-xs">
                  {t('home.gameServers.servers.vrising.year')}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">{t('home.gameServers.servers.vrising.title')}</h3>
                  <img
                    src="https://cdn.akamai.steamstatic.com/steam/apps/1604030/capsule_sm_120.jpg"
                    alt="V Rising Logo"
                    className="h-10 w-10 rounded"
                  />
                </div>
                <p className="text-gray-400 mb-6">
                  {t('home.gameServers.servers.vrising.description')}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">{t('home.gameServers.servers.vrising.features.legacy')}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">{t('home.gameServers.servers.vrising.features.active2023')}</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">{t('home.gameServers.servers.vrising.features.castleBuilding')}</span>
                  </div>
                  <div className="flex items-center">
                    <Server className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">{t('home.gameServers.servers.vrising.features.pvpEnabled')}</span>
                  </div>
                </div>
                <button
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-md font-medium transition cursor-not-allowed"
                  disabled
                >
                  {t('home.gameServers.servers.vrising.legacyServer')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};