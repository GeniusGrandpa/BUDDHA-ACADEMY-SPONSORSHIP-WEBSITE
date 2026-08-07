import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { DEFAULT_LOCALE, isSupportedLocale } from '../i18n'

interface LocaleGuardProps {
  children: ReactNode
}

export function LocaleGuard({ children }: LocaleGuardProps) {
  const { locale } = useParams<{ locale: string }>()
  const { language, setLanguage } = useLanguage()
  const location = useLocation()

  const valid = isSupportedLocale(locale ?? '')

  useEffect(() => {
    if (valid && locale && locale !== language) {
      setLanguage(locale)
    }
  }, [valid, locale, language, setLanguage])

  if (!valid) {
    const rest = location.pathname.replace(/^\/[^/]*/, '')
    return <Navigate to={`/${DEFAULT_LOCALE}${rest}`} replace />
  }

  return <>{children}</>
}
