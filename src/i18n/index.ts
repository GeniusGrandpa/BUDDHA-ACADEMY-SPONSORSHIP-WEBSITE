import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '../locales/en.json'
import ne from '../locales/ne.json'
import ja from '../locales/ja.json'
import zh from '../locales/zh.json'
import ar from '../locales/ar.json'
import fr from '../locales/fr.json'
import es from '../locales/es.json'
import de from '../locales/de.json'

export const SUPPORTED_LOCALES = ['en', 'ne', 'ja', 'zh', 'ar', 'fr', 'es', 'de'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

function buildResources(source: Record<string, string>): Record<string, string> {
  const { _translated: _flag, ...strings } = source as Record<string, unknown>
  return strings as Record<string, string>
}

export const resources = {
  en: { translation: buildResources(en as unknown as Record<string, string>) },
  ne: { translation: buildResources(ne as unknown as Record<string, string>) },
  ja: { translation: buildResources(ja as unknown as Record<string, string>) },
  zh: { translation: buildResources(zh as unknown as Record<string, string>) },
  ar: { translation: buildResources(ar as unknown as Record<string, string>) },
  fr: { translation: buildResources(fr as unknown as Record<string, string>) },
  es: { translation: buildResources(es as unknown as Record<string, string>) },
  de: { translation: buildResources(de as unknown as Record<string, string>) },
} as const

export const DEFAULT_LOCALE: SupportedLocale = 'en'

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LOCALE,
    fallbackLng: 'en',
    supportedLngs: [...SUPPORTED_LOCALES],
    keySeparator: false,
    nsSeparator: false,
    interpolation: {
      prefix: '{',
      suffix: '}',
      escapeValue: false,
    },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
    },
  })
}

export default i18n