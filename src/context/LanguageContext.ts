import { createContext, useContext } from 'react'

export type LanguageCode = string

interface LanguageContextType {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  toggleLanguage: () => void
}

interface LanguageOption {
  code: LanguageCode
  label: string
  nativeLabel: string
  shortLabel: string
}

export const languages: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', shortLabel: '🇺🇸' },
  { code: 'ne', label: 'Nepali', nativeLabel: 'नेपाली', shortLabel: '🇳🇵' },
]

const languageFlagCountries: Record<LanguageCode, string> = {
  en: 'us',
  ne: 'np',
}

export function getLanguageFlagUrl(language: LanguageCode) {
  const countryCode = languageFlagCountries[language] ?? languageFlagCountries.en
  return `https://flagcdn.com/w40/${countryCode}.png`
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
