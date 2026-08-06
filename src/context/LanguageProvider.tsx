import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { setLanguageCookie } from '../lib/locale'
import { LanguageContext, languages, rtlLanguages, type LanguageCode } from './LanguageContext'

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