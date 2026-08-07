import React, { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import { setLanguageCookie, toLocale } from '../lib/locale'
import { LanguageContext, languages, rtlLanguages, type LanguageCode } from './LanguageContext'
import i18n from '../i18n'

export function LanguageProvider({ children, initialLanguage }: { children: React.ReactNode; initialLanguage?: LanguageCode }) {
  const [language, setLanguageState] = useState<LanguageCode>(toLocale(initialLanguage))

  useEffect(() => {
    if (i18n.isInitialized && i18n.language !== language) {
      void i18n.changeLanguage(language)
    }
  }, [language])

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