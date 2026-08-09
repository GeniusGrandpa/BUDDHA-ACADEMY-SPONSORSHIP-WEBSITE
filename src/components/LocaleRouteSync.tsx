import { startTransition, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import i18n, { isSupportedLocale } from '../i18n'
import { getBrowserLanguage, LANGUAGE_STORAGE_KEY } from '../lib/locale'

export function LocaleRouteSync() {
  const { pathname } = useLocation()
  const { language, setLanguage } = useLanguage()
  const routeLocale = pathname.split('/')[1]

  useEffect(() => {
    let targetLocale: string

    if (isSupportedLocale(routeLocale)) {
      targetLocale = routeLocale
    } else {
      const persistedLocale = typeof window !== 'undefined' 
        ? window.localStorage.getItem(LANGUAGE_STORAGE_KEY) 
        : null
      
      if (isSupportedLocale(persistedLocale ?? '')) {
        targetLocale = persistedLocale as string
      } else {
        targetLocale = getBrowserLanguage()
      }
    }

    startTransition(() => {
      if (language !== targetLocale) {
        setLanguage(targetLocale)
      }
      if (i18n.resolvedLanguage !== targetLocale) {
        void i18n.changeLanguage(targetLocale)
      }
    })
  }, [language, pathname, routeLocale, setLanguage])

  return null
}
