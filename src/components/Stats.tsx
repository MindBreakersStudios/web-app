import React from 'react';
import { Users, Mail } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const Stats = () => {
  const t = useTranslation();

  return (
    <section id="about" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Headline */}
          <h2 className="text-4xl md:text-5xl font-black text-center mb-8">
            {t('about.headline')}
          </h2>

          {/* Body Text */}
          <div className="prose prose-invert max-w-none mb-12">
            {t('about.body').split('\n\n').map((paragraph, index) => (
              <p
                key={index}
                className="text-gray-300 text-lg md:text-xl leading-relaxed mb-6 text-center"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Stats Line */}
          <div className="text-center mb-12">
            <p className="text-gray-400 text-sm md:text-base font-medium">
              {t('about.statsLine')}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                10+
              </div>
              <p className="text-gray-400">{t('home.stats.yearsOfExperience')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                5+
              </div>
              <p className="text-gray-400">{t('home.stats.serversManaged')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                1000+
              </div>
              <p className="text-gray-400">{t('home.stats.happyPlayers')}</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gray-800 rounded-xl p-8 md:p-12 border border-gray-700">
            <p className="text-center text-gray-300 text-lg md:text-xl mb-6">
              {t('about.cta.question')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://discord.gg/BV6hQ9AY"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition flex items-center justify-center group"
              >
                <Users className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                {t('about.cta.discord')}
              </a>
              <a
                href={`mailto:${t('about.cta.email')}`}
                className="bg-transparent hover:bg-gray-700 text-blue-400 border border-blue-400 px-8 py-3 rounded-md font-medium transition flex items-center justify-center group"
              >
                <Mail className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                {t('about.cta.email')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};