import React, { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { setLanguageCookie } from '../lib/locale'

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
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', shortLabel: '🇮🇳', googleCode: 'hi' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', shortLabel: '🇪🇸', googleCode: 'es' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', shortLabel: '🇫🇷', googleCode: 'fr' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', shortLabel: '🇩🇪', googleCode: 'de' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', shortLabel: '🇨🇳', googleCode: 'zh-CN' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', shortLabel: '🇯🇵', googleCode: 'ja' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어', shortLabel: '🇰🇷', googleCode: 'ko' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', shortLabel: '🇸🇦', googleCode: 'ar' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', shortLabel: '🇵🇹', googleCode: 'pt' },
  { code: 'pt-br', label: 'Brazilian Portuguese', nativeLabel: 'Português', shortLabel: '🇧🇷 PT-BR', googleCode: 'pt' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', shortLabel: '🇷🇺', googleCode: 'ru' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano', shortLabel: '🇮🇹', googleCode: 'it' },
  { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', shortLabel: '🇳🇱', googleCode: 'nl' },
  { code: 'sv', label: 'Swedish', nativeLabel: 'Svenska', shortLabel: '🇸🇪', googleCode: 'sv' },
  { code: 'no', label: 'Norwegian', nativeLabel: 'Norsk', shortLabel: '🇳🇴', googleCode: 'no' },
  { code: 'da', label: 'Danish', nativeLabel: 'Dansk', shortLabel: '🇩🇰', googleCode: 'da' },
  { code: 'fi', label: 'Finnish', nativeLabel: 'Suomi', shortLabel: '🇫🇮', googleCode: 'fi' },
  { code: 'pl', label: 'Polish', nativeLabel: 'Polski', shortLabel: '🇵🇱', googleCode: 'pl' },
  { code: 'cs', label: 'Czech', nativeLabel: 'Čeština', shortLabel: '🇨🇿', googleCode: 'cs' },
  { code: 'sk', label: 'Slovak', nativeLabel: 'Slovenčina', shortLabel: '🇸🇰', googleCode: 'sk' },
  { code: 'hu', label: 'Hungarian', nativeLabel: 'Magyar', shortLabel: '🇭🇺', googleCode: 'hu' },
  { code: 'ro', label: 'Romanian', nativeLabel: 'Română', shortLabel: '🇷🇴', googleCode: 'ro' },
  { code: 'bg', label: 'Bulgarian', nativeLabel: 'Български', shortLabel: '🇧🇬', googleCode: 'bg' },
  { code: 'el', label: 'Greek', nativeLabel: 'Ελληνικά', shortLabel: '🇬🇷', googleCode: 'el' },
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', shortLabel: '🇹🇷', googleCode: 'tr' },
  { code: 'uk', label: 'Ukrainian', nativeLabel: 'Українська', shortLabel: '🇺🇦', googleCode: 'uk' },
  { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia', shortLabel: '🇮🇩', googleCode: 'id' },
  { code: 'ms', label: 'Malay', nativeLabel: 'Bahasa Melayu', shortLabel: '🇲🇾', googleCode: 'ms' },
  { code: 'th', label: 'Thai', nativeLabel: 'ไทย', shortLabel: '🇹🇭', googleCode: 'th' },
  { code: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt', shortLabel: '🇻🇳', googleCode: 'vi' },
  { code: 'fil', label: 'Filipino', nativeLabel: 'Filipino', shortLabel: '🇵🇭', googleCode: 'tl' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', shortLabel: '🇧🇩', googleCode: 'bn' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', shortLabel: '🇵🇰', googleCode: 'ur' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ', shortLabel: '🇮🇳', googleCode: 'pa' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', shortLabel: '🇮🇳', googleCode: 'ta' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', shortLabel: '🇮🇳', googleCode: 'te' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', shortLabel: '🇮🇳', googleCode: 'mr' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', shortLabel: '🇮🇳', googleCode: 'gu' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', shortLabel: '🇮🇳', googleCode: 'kn' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം', shortLabel: '🇮🇳', googleCode: 'ml' },
  { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල', shortLabel: '🇱🇰', googleCode: 'si' },
  { code: 'fa', label: 'Persian', nativeLabel: 'فارسی', shortLabel: '🇮🇷', googleCode: 'fa' },
  { code: 'he', label: 'Hebrew', nativeLabel: 'עברית', shortLabel: '🇮🇱', googleCode: 'iw' },
  { code: 'sw', label: 'Swahili', nativeLabel: 'Kiswahili', shortLabel: '🇰🇪', googleCode: 'sw' },
  { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ', shortLabel: '🇪🇹', googleCode: 'am' },
  { code: 'ha', label: 'Hausa', nativeLabel: 'Hausa', shortLabel: '🇳🇬', googleCode: 'ha' },
  { code: 'yo', label: 'Yoruba', nativeLabel: 'Yorùbá', shortLabel: '🇳🇬', googleCode: 'yo' },
  { code: 'zu', label: 'Zulu', nativeLabel: 'isiZulu', shortLabel: '🇿🇦', googleCode: 'zu' },
  { code: 'af', label: 'Afrikaans', nativeLabel: 'Afrikaans', shortLabel: '🇿🇦', googleCode: 'af' },
  { code: 'sq', label: 'Albanian', nativeLabel: 'Shqip', shortLabel: '🇦🇱', googleCode: 'sq' },
  { code: 'sr', label: 'Serbian', nativeLabel: 'Српски', shortLabel: '🇷🇸', googleCode: 'sr' },
  { code: 'hr', label: 'Croatian', nativeLabel: 'Hrvatski', shortLabel: '🇭🇷', googleCode: 'hr' },
  { code: 'sl', label: 'Slovenian', nativeLabel: 'Slovenščina', shortLabel: '🇸🇮', googleCode: 'sl' },
  { code: 'et', label: 'Estonian', nativeLabel: 'Eesti', shortLabel: '🇪🇪', googleCode: 'et' },
  { code: 'lv', label: 'Latvian', nativeLabel: 'Latviešu', shortLabel: '🇱🇻', googleCode: 'lv' },
  { code: 'lt', label: 'Lithuanian', nativeLabel: 'Lietuvių', shortLabel: '🇱🇹', googleCode: 'lt' },
  { code: 'ga', label: 'Irish', nativeLabel: 'Gaeilge', shortLabel: '🇮🇪', googleCode: 'ga' },
  { code: 'cy', label: 'Welsh', nativeLabel: 'Cymraeg', shortLabel: 'CY', googleCode: 'cy' },
  { code: 'is', label: 'Icelandic', nativeLabel: 'Íslenska', shortLabel: '🇮🇸 ', googleCode: 'is' },
  { code: 'mt', label: 'Maltese', nativeLabel: 'Malti', shortLabel: '🇲🇹', googleCode: 'mt' },
]

const languageFlagCountries: Record<LanguageCode, { code: string; name: string }> = {
  en: { code: 'us', name: 'United States' },
  ne: { code: 'np', name: 'Nepal' },
  hi: { code: 'in', name: 'India' },
  es: { code: 'es', name: 'Spain' },
  fr: { code: 'fr', name: 'France' },
  de: { code: 'de', name: 'Germany' },
  zh: { code: 'cn', name: 'China' },
  ja: { code: 'jp', name: 'Japan' },
  ko: { code: 'kr', name: 'South Korea' },
  ar: { code: 'sa', name: 'Saudi Arabia' },
  pt: { code: 'pt', name: 'Portugal' },
  'pt-br': { code: 'br', name: 'Brazil' },
  ru: { code: 'ru', name: 'Russia' },
  it: { code: 'it', name: 'Italy' },
  nl: { code: 'nl', name: 'Netherlands' },
  sv: { code: 'se', name: 'Sweden' },
  no: { code: 'no', name: 'Norway' },
  da: { code: 'dk', name: 'Denmark' },
  fi: { code: 'fi', name: 'Finland' },
  pl: { code: 'pl', name: 'Poland' },
  cs: { code: 'cz', name: 'Czechia' },
  sk: { code: 'sk', name: 'Slovakia' },
  hu: { code: 'hu', name: 'Hungary' },
  ro: { code: 'ro', name: 'Romania' },
  bg: { code: 'bg', name: 'Bulgaria' },
  el: { code: 'gr', name: 'Greece' },
  tr: { code: 'tr', name: 'Turkey' },
  uk: { code: 'ua', name: 'Ukraine' },
  id: { code: 'id', name: 'Indonesia' },
  ms: { code: 'my', name: 'Malaysia' },
  th: { code: 'th', name: 'Thailand' },
  vi: { code: 'vn', name: 'Vietnam' },
  fil: { code: 'ph', name: 'Philippines' },
  bn: { code: 'bd', name: 'Bangladesh' },
  ur: { code: 'pk', name: 'Pakistan' },
  pa: { code: 'in', name: 'India' },
  ta: { code: 'in', name: 'India' },
  te: { code: 'in', name: 'India' },
  mr: { code: 'in', name: 'India' },
  gu: { code: 'in', name: 'India' },
  kn: { code: 'in', name: 'India' },
  ml: { code: 'in', name: 'India' },
  si: { code: 'lk', name: 'Sri Lanka' },
  fa: { code: 'ir', name: 'Iran' },
  he: { code: 'il', name: 'Israel' },
  sw: { code: 'ke', name: 'Kenya' },
  am: { code: 'et', name: 'Ethiopia' },
  ha: { code: 'ng', name: 'Nigeria' },
  yo: { code: 'ng', name: 'Nigeria' },
  zu: { code: 'za', name: 'South Africa' },
  af: { code: 'za', name: 'South Africa' },
  sq: { code: 'al', name: 'Albania' },
  sr: { code: 'rs', name: 'Serbia' },
  hr: { code: 'hr', name: 'Croatia' },
  sl: { code: 'si', name: 'Slovenia' },
  et: { code: 'ee', name: 'Estonia' },
  lv: { code: 'lv', name: 'Latvia' },
  lt: { code: 'lt', name: 'Lithuania' },
  ga: { code: 'ie', name: 'Ireland' },
  cy: { code: 'gb-wls', name: 'Wales' },
  is: { code: 'is', name: 'Iceland' },
  mt: { code: 'mt', name: 'Malta' },
}

export function getLanguageFlagUrl(language: LanguageCode) {
  const country = languageFlagCountries[language] ?? languageFlagCountries.en
  return `https://flagcdn.com/w40/${country.code}.png`
}

export function getLanguageFlagAlt(language: LanguageCode) {
  const country = languageFlagCountries[language] ?? languageFlagCountries.en
  return `${country.name} flag`
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)
const rtlLanguages = new Set(['ar', 'fa', 'he', 'ur', 'ps', 'sd'])

export function getGoogleLanguageCode(language: LanguageCode) {
  return languages.find((item) => item.code === language)?.googleCode ?? language
}

export function LanguageProvider({ children, initialLanguage }: { children: React.ReactNode; initialLanguage?: LanguageCode }) {
  const [language, setLanguageState] = useState<LanguageCode>(
    initialLanguage && languages.some((item) => item.code === initialLanguage) ? initialLanguage : 'en',
  )

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(true)
  }, [])

  const restoredFallback = useRef(false)
  useEffect(() => {
    if (!hydrated || restoredFallback.current) return
    restoredFallback.current = true
    try {
      const saved = window.localStorage.getItem('language')
      if (saved && languages.some((item) => item.code === saved)) {
        startTransition(() => setLanguageState(saved))
      }
    } catch {
      // ignore
    }
  }, [hydrated])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setLanguageCookie(language)
    window.localStorage.setItem('language', language)
    document.documentElement.lang = language
    document.documentElement.dir = rtlLanguages.has(language) ? 'rtl' : 'ltr'
  }, [language])

  const setLanguage = useCallback((newLanguage: LanguageCode) => {
    if (!languages.some((item) => item.code === newLanguage)) return
    startTransition(() => setLanguageState(newLanguage))
  }, [])

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language, setLanguage],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}