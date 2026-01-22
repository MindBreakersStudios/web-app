import { Link } from 'react-router-dom';
import { Clock, Users, Shield, Server } from 'lucide-react';

export const GameServers = () => {
  return (
    <section id="servers" className="bg-gray-900 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our Game Servers
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience gaming like never before with our custom-configured
            servers designed for optimal gameplay and community engagement.
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
                Coming Feb 6, 2026
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">HumanitZ Server</h3>
                <img
                  src="https://cdn.akamai.steamstatic.com/steam/apps/1711420/capsule_sm_120.jpg"
                  alt="HumanitZ Logo"
                  className="h-10 w-10 rounded"
                />
              </div>
              <p className="text-gray-400 mb-6">
                100% FREE survival zombie server with base building, PvP, and an active community. Launching February 6, 2026!
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">24/7 Uptime</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">60 Players</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">Free Access</span>
                </div>
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">Custom Config</span>
                </div>
              </div>
              <Link
                to="/humanitz"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition block text-center"
              >
                Learn More
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
                Coming May 2026
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">SCUM Server</h3>
                <img
                  src="https://cdn.akamai.steamstatic.com/steam/apps/513710/capsule_sm_120.jpg"
                  alt="SCUM Logo"
                  className="h-10 w-10 rounded"
                />
              </div>
              <p className="text-gray-400 mb-6">
                Survive in our custom-configured SCUM server with balanced
                gameplay, regular events, and an active community. Launching in May 2026!
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">24/7 Uptime</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">64 Players</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">Anti-Cheat</span>
                </div>
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">Custom Rules</span>
                </div>
              </div>
              <Link
                to="/scum"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition block text-center"
              >
                Learn More
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
                Coming Q4 2026
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Hytale Server</h3>
                <div className="h-10 w-10 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  H
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                Adventure, create, and survive in our Hytale server. Experience block-building, RPG elements, and minigames. Launching Q4 2026!
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">24/7 Uptime</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">Coming Soon</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">Custom Worlds</span>
                </div>
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">Mod Support</span>
                </div>
              </div>
              <button
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-md font-medium transition"
                disabled
              >
                News Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Previous Servers Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Previous Servers
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our legacy servers that helped build the MindBreakers community
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
                  Top LATAM Server
                </div>
                <div className="absolute top-4 right-4 bg-gray-800 text-gray-300 px-3 py-1 rounded-md font-medium text-xs">
                  2020-2021
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">DayZ Server</h3>
                  <img
                    src="https://cdn.akamai.steamstatic.com/steam/apps/221100/capsule_sm_120.jpg"
                    alt="DayZ Logo"
                    className="h-10 w-10 rounded"
                  />
                </div>
                <p className="text-gray-400 mb-6">
                  Our first server that started the MindBreakers community. A top-ranked LATAM DayZ server from 2020-2021.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">Legacy</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">50 Players</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">Top LATAM</span>
                  </div>
                  <div className="flex items-center">
                    <Server className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">2020-2021</span>
                  </div>
                </div>
                <button
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-md font-medium transition cursor-not-allowed"
                  disabled
                >
                  Legacy Server
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
                <div className="absolute top-4 right-4 bg-gray-800 text-gray-300 px-3 py-1 rounded-md font-medium text-xs">
                  2023
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">V Rising Server</h3>
                  <img
                    src="https://cdn.akamai.steamstatic.com/steam/apps/1604030/capsule_sm_120.jpg"
                    alt="V Rising Logo"
                    className="h-10 w-10 rounded"
                  />
                </div>
                <p className="text-gray-400 mb-6">
                  A successful vampire survival server that ran in 2023. Build your castle, hunt for blood, and dominate the night.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">Legacy</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">Active 2023</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">Castle Building</span>
                  </div>
                  <div className="flex items-center">
                    <Server className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-500">PvP Enabled</span>
                  </div>
                </div>
                <button
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-md font-medium transition cursor-not-allowed"
                  disabled
                >
                  Legacy Server
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};