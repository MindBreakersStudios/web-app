/**
 * Language Switcher Component
 * 
 * Displays a flag icon button to switch between English and Spanish.
 */

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SupportedLocale, supportedLocales } from '../i18n';

const localeFlags: Record<SupportedLocale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
};

const localeNames: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Español',
};

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useLanguage();

  const toggleLanguage = () => {
    const currentIndex = supportedLocales.indexOf(locale);
    const nextIndex = (currentIndex + 1) % supportedLocales.length;
    setLocale(supportedLocales[nextIndex]);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-md transition text-sm font-medium"
      title={`Switch to ${locale === 'en' ? 'Español' : 'English'}`}
      aria-label={`Current language: ${localeNames[locale]}. Click to switch.`}
    >
      <span className="text-lg">{localeFlags[locale]}</span>
      <span className="hidden md:inline">{localeNames[locale]}</span>
      <Globe className="h-4 w-4" />
    </button>
  );
};
