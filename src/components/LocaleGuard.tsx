import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { DEFAULT_LOCALE, isSupportedLocale } from '../i18n'

interface LocaleGuardProps {
  children: ReactNode
}

export function LocaleGuard({ children }: LocaleGuardProps) {
  const { locale } = useParams<{ locale: string }>()
  const { language, setLanguage } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()

  const valid = isSupportedLocale(locale ?? '')

  useEffect(() => {
    if (valid) {
      if (locale !== language) {
        setLanguage(locale as string)
      }
      return
    }
    const rest = location.pathname.replace(/^\/[^/]*/, '')
    navigate(`/${DEFAULT_LOCALE}${rest}`, { replace: true })
  }, [valid, locale, language, setLanguage, navigate, location.pathname])

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background, #fffaf5)]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}