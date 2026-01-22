/**
 * useTranslation Hook
 * 
 * Convenience hook for accessing translations in components.
 * Usage: const t = useTranslation(); t('about.headline')
 */

import { useLanguage } from '../contexts/LanguageContext';
import { t as translate } from '../i18n';

export function useTranslation() {
  const { locale } = useLanguage();

  return (key: string, fallback?: string) => translate(locale, key, fallback);
}
