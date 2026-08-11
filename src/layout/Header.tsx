import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useCmsStrings } from '../context/CmsStringsContext'
import { useLanguage } from '../context/LanguageContext'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useLocalizePath } from '../hooks/useLocalizePath'
import { getNavigationItems } from '../services/navigation'
import { getSiteSettings } from '../services/settings'
import { sanitizeCmsText } from '../lib/sanitize-cms'
import type { NavigationItem } from '../types/cms'
import fallbackLogo from '../assets/logo.jpg'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const { t } = useCmsStrings()
  const { branding } = useTheme()
  const { language } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const localize = useLocalizePath()
  const [navItems, setNavItems] = useState<NavigationItem[]>([])
  const [siteName, setSiteName] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let cancelled = false
    getNavigationItems('header', language).then(items => { if (!cancelled) setNavItems(items.filter(i => i.is_visible && i.route !== '/programs')) }).catch(() => {})
    getSiteSettings().then(s => {
      if (s && !cancelled) {
        setSiteName(s.site_name || '')
        setLogoUrl(s.logo_url)
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [language])

  const headerLogoSrc = branding.header_logo_url || logoUrl || branding.logo_url || fallbackLogo

  const navigation = navItems.map(item => ({
    name: navigationLabel(item.label, item.route || item.url),
    href: localize(item.route || item.url || '/'),
    target: item.target,
    isCta: item.is_cta,
    ctaStyle: item.cta_style,
  }))

  function navigationLabel(label: string, route?: string | null) {
    const key = {
      '/': 'navigation_home',
      '/about': 'navigation_about',
      '/students': 'navigation_students',
      '/sponsor': 'navigation_sponsor',
      '/gallery': 'navigation_gallery',
      '/donate': 'navigation_donate',
      '/news': 'navigation_news',
      '/contact': 'navigation_contact',
    }[route || '']
    return key ? t(key) : sanitizeCmsText(label)
  }

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    await signOut()
    navigate(localize('/'))
  }

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-navbar-bg)] border-b border-[var(--color-border)]">
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24">
        <div className="flex justify-between items-center h-20">
          <Link to={localize('/')} className="flex items-center space-x-3">
            <img src={headerLogoSrc} alt={sanitizeCmsText(siteName || branding.organization_name || '')} className="h-12 w-auto drop-shadow-sm" loading="eager" decoding="async" width="48" height="48" {...{'fetchpriority': 'high'}} />
            <div className="hidden sm:block">
              <div className="font-semibold text-lg text-[var(--color-navbar-text)]">{sanitizeCmsText(siteName || branding.organization_name || '')}</div>
              {branding.tagline && <div className="text-xs text-[var(--color-text-muted)]">{sanitizeCmsText(branding.tagline)}</div>}
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => {
              if (item.isCta) {
                return (
                  <Link key={item.href} to={item.href} target={item.target}
                    className="px-5 py-2.5 rounded-full font-medium text-sm transition-colors hover:opacity-90 bg-[var(--color-button-primary-bg)] text-[var(--color-button-primary-text)]">
                    {item.name}
                  </Link>
                )
              }
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  target={item.target}
                  className={`text-sm font-medium transition-colors hover:opacity-80 ${isActive(item.href) ? 'text-[var(--color-navbar-active)]' : 'text-[var(--color-navbar-text)]'}`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-5">
            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center gap-4">
                {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                  <Link to={localize(profile?.role === 'super_admin' ? '/super-admin' : '/admin')}
                    className="text-sm font-medium transition-colors hover:opacity-80 text-[var(--color-navbar-text)]">
                    {t('header_admin')}
                  </Link>
                )}
                {profile?.role === 'teacher' && (
                  <Link to="/teacher/dashboard"
                    className="text-sm font-medium transition-colors hover:opacity-80 text-[var(--color-navbar-text)]">
                    Teacher Dashboard
                  </Link>
                )}
                {profile?.role === 'finance_manager' && (
                  <Link to="/admin/finance"
                    className="text-sm font-medium transition-colors hover:opacity-80 text-[var(--color-navbar-text)]">
                    Finance Dashboard
                  </Link>
                )}
                {(profile?.role === 'donor' || profile?.role === 'volunteer') && (
                  <Link to={localize('/dashboard')}
                    className="text-sm font-medium transition-colors hover:opacity-80 text-[var(--color-navbar-text)]">
                    {t('header_dashboard')}
                  </Link>
                )}
                <button onClick={handleSignOut}
                  className="text-sm font-medium transition-colors hover:opacity-80 text-[var(--color-navbar-text)]">
                  {t('header_sign_out')}
                </button>
              </div>
            ) : (
              <Link to={localize('/login')}
                className="text-sm font-medium transition-colors hover:opacity-80 text-[var(--color-navbar-text)]">
                {t('header_sign_in')}
              </Link>
            )}

            <Link to={localize('/donate')}
              className="px-5 py-2.5 rounded-full font-medium text-sm transition-colors hover:opacity-90 bg-[var(--color-button-primary-bg)] text-[var(--color-button-primary-text)]">
              {t('header_donate')}
            </Link>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-3 touch-target text-[var(--color-navbar-text)]" aria-label={isMenuOpen ? t('header_close_menu') : t('header_open_menu')}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[var(--color-border)] max-h-[80vh] overflow-y-auto">
            <nav className="space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href) ? 'bg-[var(--color-navbar-hover)] text-[var(--color-navbar-active)]' : 'bg-transparent text-[var(--color-navbar-text)]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link to={localize('/donate')} onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-center bg-[var(--color-button-primary-bg)] text-[var(--color-button-primary-text)]">
                {t('header_donate')}
              </Link>
              <div className="pt-2 pb-1">
                <LanguageSwitcher mobile />
              </div>
              {user ? (
                <div className="space-y-1 pt-2 border-t border-[var(--color-border)]">
                  {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                    <Link to={localize(profile?.role === 'super_admin' ? '/super-admin' : '/admin')}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-navbar-text)]">
                      {t('header_admin')}
                    </Link>
                  )}
                  {profile?.role === 'teacher' && (
                    <Link to="/teacher/dashboard" onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-navbar-text)]">
                      Teacher Dashboard
                    </Link>
                  )}
                  {profile?.role === 'finance_manager' && (
                    <Link to="/admin/finance" onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-navbar-text)]">
                      Finance Dashboard
                    </Link>
                  )}
                  {(profile?.role === 'donor' || profile?.role === 'volunteer') && (
                    <Link to={localize('/dashboard')} onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-navbar-text)]">
                      {t('header_dashboard')}
                    </Link>
                  )}
                  <button onClick={() => { handleSignOut(); setIsMenuOpen(false) }}
                    className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-navbar-text)]">
                    {t('header_sign_out')}
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-[var(--color-border)]">
                  <Link to={localize('/login')} onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-navbar-text)]">
                    {t('header_sign_in')}
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
