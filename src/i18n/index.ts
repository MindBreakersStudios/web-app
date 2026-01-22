/**
 * Internationalization (i18n) Configuration
 * 
 * This module provides translation functionality for the MindBreakers website.
 * Supports English (en) and Spanish (es) languages.
 */

import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';

export type SupportedLocale = 'en' | 'es';

export const supportedLocales: SupportedLocale[] = ['en', 'es'];

export const defaultLocale: SupportedLocale = 'en';

export const translations = {
  en: enTranslations,
  es: esTranslations,
} as const;

/**
 * Get translation for a given key path
 * @param locale - The locale to use ('en' or 'es')
 * @param key - Dot-separated key path (e.g., 'about.headline')
 * @param fallback - Optional fallback value if key not found
 * @returns The translated string or fallback
 */
export function t(locale: SupportedLocale, key: string, fallback?: string): string {
  const keys = key.split('.');
  let value: any = translations[locale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value];
    } else {
      // Fallback to English if key not found
      if (locale !== 'en') {
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey as keyof typeof value];
          } else {
            return fallback || key;
          }
        }
      }
      return fallback || key;
    }
  }

  return typeof value === 'string' ? value : fallback || key;
}

/**
 * Get nested translation object
 * @param locale - The locale to use
 * @param key - Dot-separated key path (e.g., 'about')
 * @returns The translation object or null
 */
export function getTranslation(locale: SupportedLocale, key: string): any {
  const keys = key.split('.');
  let value: any = translations[locale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value];
    } else {
      return null;
    }
  }

  return value;
}
