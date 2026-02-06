/**
 * Language Switcher Component
 * 
 * Displays flag buttons to switch between English, Spanish, and Brazilian Portuguese.
 */

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SupportedLocale, supportedLocales } from '../i18n';

const localeData: Record<SupportedLocale, { name: string; flag: string }> = {
  en: { name: 'English', flag: 'US' },
  es: { name: 'Español', flag: 'ES' },
  'pt-br': { name: 'Português', flag: 'BR' },
};

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      {supportedLocales.map((lang) => {
        const data = localeData[lang];
        const isActive = locale === lang;
        
        return (
          <button
            key={lang}
            onClick={() => setLocale(lang)}
            className={`
              relative rounded-full transition-all duration-200
              hover:scale-110
              ${isActive
                ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-gray-900 scale-110' 
                : 'opacity-60 hover:opacity-100'
              }
            `}
            title={data.name}
            aria-label={`Switch to ${data.name}`}
            aria-current={isActive ? 'true' : 'false'}
          >
            <img 
              src={`https://hatscripts.github.io/circle-flags/flags/${data.flag.toLowerCase()}.svg`}
              alt={`${data.name} flag`}
              className="w-8 h-8 rounded-full"
              loading="lazy"
            />
          </button>
        );
      })}
    </div>
  );
};
