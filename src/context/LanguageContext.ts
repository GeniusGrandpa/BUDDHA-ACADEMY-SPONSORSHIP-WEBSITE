import { createContext, useContext } from 'react'

export type LanguageCode = string

interface LanguageContextType {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
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

const languageFlagCountries: Record<LanguageCode, { code: string; name: string }> = {
  en: { code: 'us', name: 'United States' },
  ne: { code: 'np', name: 'Nepal' },
}

export function getLanguageFlagUrl(language: LanguageCode) {
  const country = languageFlagCountries[language] ?? languageFlagCountries.en
  return `https://flagcdn.com/w40/${country.code}.png`
}

export function getLanguageFlagAlt(language: LanguageCode) {
  const country = languageFlagCountries[language] ?? languageFlagCountries.en
  return `${country.name} flag`
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}