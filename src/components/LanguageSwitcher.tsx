/**
 * Language Switcher Component
 *
 * Displays the current language flag that opens a dropdown to select a language.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SupportedLocale, supportedLocales } from '../i18n';

const localeData: Record<SupportedLocale, { name: string; flag: string }> = {
  en: { name: 'English', flag: 'US' },
  es: { name: 'Español', flag: 'ES' },
  'pt-br': { name: 'Português', flag: 'BR' },
};

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = localeData[locale];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-800 transition-colors"
        aria-label={`Language: ${current.name}`}
      >
        <img
          src={`https://hatscripts.github.io/circle-flags/flags/${current.flag.toLowerCase()}.svg`}
          alt={current.name}
          className="w-6 h-6 rounded-full"
          loading="lazy"
        />
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-50">
          {supportedLocales.map((lang) => {
            const data = localeData[lang];
            const isActive = locale === lang;
            return (
              <button
                key={lang}
                onClick={() => {
                  setLocale(lang);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <img
                  src={`https://hatscripts.github.io/circle-flags/flags/${data.flag.toLowerCase()}.svg`}
                  alt={data.name}
                  className="w-5 h-5 rounded-full"
                  loading="lazy"
                />
                <span>{data.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
