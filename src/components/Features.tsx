import { Cpu, Shield, HeartPulse, Zap, BarChart3, Users, Star } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const Features = () => {
  const t = useTranslation();

  return <section id="features" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('home.features.title')}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t('home.features.description')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-900 p-6 rounded-lg border-2 border-yellow-500/50 hover:border-yellow-500 transition duration-300 relative">
            <div className="absolute top-2 right-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-full w-fit mb-4">
              <BarChart3 className="h-6 w-6 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('home.features.items.statsDashboard.title')}</h3>
            <p className="text-gray-400">
              {t('home.features.items.statsDashboard.description')}
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition duration-300">
            <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
              <Cpu className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('home.features.items.highPerformance.title')}</h3>
            <p className="text-gray-400">
              {t('home.features.items.highPerformance.description')}
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition duration-300">
            <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('home.features.items.antiCheat.title')}</h3>
            <p className="text-gray-400">
              {t('home.features.items.antiCheat.description')}
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition duration-300">
            <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
              <HeartPulse className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('home.features.items.activeSupport.title')}</h3>
            <p className="text-gray-400">
              {t('home.features.items.activeSupport.description')}
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition duration-300">
            <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('home.features.items.customConfigurations.title')}</h3>
            <p className="text-gray-400">
              {t('home.features.items.customConfigurations.description')}
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition duration-300">
            <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('home.features.items.communityEvents.title')}</h3>
            <p className="text-gray-400">
              {t('home.features.items.communityEvents.description')}
            </p>
          </div>
        </div>
      </div>
    </section>;
};