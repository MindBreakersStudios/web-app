/**
 * Language Context Provider
 * 
 * Provides language/locale state management across the application.
 * Stores user preference in localStorage.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLocale, defaultLocale } from '../i18n';

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'mindbreakers-locale';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    // Get from localStorage or browser language, fallback to default (Spanish)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as SupportedLocale;
      if (stored && (stored === 'en' || stored === 'es' || stored === 'pt-br')) {
        return stored;
      }
      // Try to detect from browser, but default to Spanish
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('en')) {
        return 'en';
      }
      if (browserLang.startsWith('pt')) {
        return 'pt-br';
      }
      // Default to Spanish for all other cases
      return 'es';
    }
    return defaultLocale;
  });

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale);
    }
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
