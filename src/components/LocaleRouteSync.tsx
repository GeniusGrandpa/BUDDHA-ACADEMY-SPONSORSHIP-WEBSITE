import { startTransition, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import i18n, { isSupportedLocale } from '../i18n'
import { getBrowserLanguage } from '../lib/locale'

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
    const targetLocale = isSupportedLocale(routeLocale) ? routeLocale : getBrowserLanguage()

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
