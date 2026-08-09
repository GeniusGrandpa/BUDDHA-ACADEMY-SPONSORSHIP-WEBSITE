import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '../locales/en.json'
import ne from '../locales/ne.json'

export const SUPPORTED_LOCALES = ['en', 'ne'] as const
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
    saveMissing: false,
    missingKeyHandler(language, _namespace, key) {
      if (typeof window !== 'undefined' && import.meta.env.DEV && !/\s/.test(key)) {
        console.warn(`[i18n] Missing translation key "${key}" for language "${language}"`)
      }
    },
    returnNull: false,
  })
}

export default i18n