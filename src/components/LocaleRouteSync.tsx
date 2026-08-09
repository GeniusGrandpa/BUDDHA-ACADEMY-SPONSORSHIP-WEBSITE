import { startTransition, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import i18n, { isSupportedLocale } from '../i18n'

/**
 * Keeps the translation runtime aligned with locale-prefixed public URLs.
 * Routes without a locale prefix (such as /dashboard) deliberately preserve
 * the last selected language, which is persisted by LanguageProvider.
 */
export function LocaleRouteSync() {
  const { pathname } = useLocation()
  const { language, setLanguage } = useLanguage()
  const routeLocale = pathname.split('/')[1]

  useEffect(() => {
    if (!isSupportedLocale(routeLocale)) return

    startTransition(() => {
      if (language !== routeLocale) {
        setLanguage(routeLocale)
      }
      if (i18n.resolvedLanguage !== routeLocale) {
        void i18n.changeLanguage(routeLocale)
      }
    })
  }, [language, pathname, routeLocale, setLanguage])

  return null
}
