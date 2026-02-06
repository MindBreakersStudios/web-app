/**
 * Internationalization (i18n) Configuration
 * 
 * This module provides translation functionality for the MindBreakers website.
 * Supports English (en), Spanish (es), and Brazilian Portuguese (pt-br) languages.
 */

import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';
import ptBrTranslations from '../locales/pt-br.json';

export type SupportedLocale = 'en' | 'es' | 'pt-br';

export const supportedLocales: SupportedLocale[] = ['en', 'es', 'pt-br'];

export const defaultLocale: SupportedLocale = 'es';

export const translations = {
  en: enTranslations,
  es: esTranslations,
  'pt-br': ptBrTranslations,
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
      // Fallback to Spanish (default) if key not found
      if (locale !== 'es') {
        value = translations.es;
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
