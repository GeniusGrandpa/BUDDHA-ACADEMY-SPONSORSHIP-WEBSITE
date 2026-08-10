import React, { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import { LANGUAGE_STORAGE_KEY, setLanguageCookie, toLocale } from '../lib/locale'
import { LanguageContext, languages, type LanguageCode } from './LanguageContext'
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
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.lang = language
    document.documentElement.dir = 'ltr'
  }, [language])

  const setLanguage = useCallback((newLanguage: LanguageCode) => {
    if (!languages.some((item) => item.code === newLanguage)) return
    if (i18n.isInitialized && i18n.language !== newLanguage) {
      void i18n.changeLanguage(newLanguage)
    }
    startTransition(() => setLanguageState(newLanguage))
  }, [language])

  const toggleLanguage = useCallback(() => {
    const newLanguage = language === 'en' ? 'ne' : 'en'
    if (!languages.some((item) => item.code === newLanguage)) return
    if (i18n.isInitialized && i18n.language !== newLanguage) {
      void i18n.changeLanguage(newLanguage)
    }
    startTransition(() => setLanguageState(newLanguage))
  }, [language])

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage }),
    [language, setLanguage, toggleLanguage],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
