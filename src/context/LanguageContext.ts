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
  googleCode?: string
}

export const languages: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', shortLabel: '🇺🇸', googleCode: 'en' },
  { code: 'ne', label: 'Nepali', nativeLabel: 'नेपाली', shortLabel: '🇳🇵', googleCode: 'ne' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', shortLabel: '🇸🇦', googleCode: 'ar' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', shortLabel: '🇫🇷', googleCode: 'fr' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', shortLabel: '🇩🇪', googleCode: 'de' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', shortLabel: '🇨🇳', googleCode: 'zh-CN' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', shortLabel: '🇯🇵', googleCode: 'ja' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', shortLabel: '🇪🇸', googleCode: 'es' },
]

const languageFlagCountries: Record<LanguageCode, { code: string; name: string }> = {
  en: { code: 'us', name: 'United States' },
  ne: { code: 'np', name: 'Nepal' },
  ar: { code: 'sa', name: 'Saudi Arabia' },
  fr: { code: 'fr', name: 'France' },
  de: { code: 'de', name: 'Germany' },
  zh: { code: 'cn', name: 'China' },
  ja: { code: 'jp', name: 'Japan' },
  es: { code: 'es', name: 'Spain' },
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
export const rtlLanguages = new Set(['ar', 'fa', 'he', 'ur', 'ps', 'sd'])

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}