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
    if (isSupportedLocale(routeLocale)) {
      startTransition(() => {
        if (language !== routeLocale) {
          setLanguage(routeLocale)
        }
        if (i18n.resolvedLanguage !== routeLocale) {
          void i18n.changeLanguage(routeLocale)
        }
      })
    } else if (i18n.resolvedLanguage !== language) {
      startTransition(() => {
        void i18n.changeLanguage(language)
      })
    }
  }, [language, pathname, routeLocale, setLanguage])

  return null
}
