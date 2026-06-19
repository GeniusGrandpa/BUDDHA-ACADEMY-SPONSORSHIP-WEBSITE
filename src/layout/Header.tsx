import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { getNavigationItems } from '../services/navigation'
import { getSiteSettings } from '../services/settings'
import type { NavigationItem } from '../types/cms'
import fallbackLogo from '../assets/logo.jpg'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const { t } = useLanguage()
  const { branding } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [navItems, setNavItems] = useState<NavigationItem[]>([])
  const [siteName, setSiteName] = useState('Buddha Academy')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    getNavigationItems('header').then(items => setNavItems(items.filter(i => i.is_visible))).catch(() => {})
    getSiteSettings().then(s => {
      if (s) {
        setSiteName(s.site_name)
        setLogoUrl(s.logo_url)
      }
    }).catch(() => {})
  }, [])

  const navigation = navItems.length > 0
    ? navItems.map(item => ({
        name: item.label,
        href: item.route || item.url || '/',
        target: item.target,
        isCta: item.is_cta,
        ctaStyle: item.cta_style,
      }))
    : [
        { name: t('nav.home'), href: '/', target: '_self' as const, isCta: false, ctaStyle: null },
        { name: t('nav.about'), href: '/about', target: '_self' as const, isCta: false, ctaStyle: null },
        { name: t('nav.students'), href: '/students', target: '_self' as const, isCta: false, ctaStyle: null },
        { name: t('nav.gallery'), href: '/gallery', target: '_self' as const, isCta: false, ctaStyle: null },
        { name: t('nav.news'), href: '/news', target: '_self' as const, isCta: false, ctaStyle: null },
        { name: t('nav.contact'), href: '/contact', target: '_self' as const, isCta: false, ctaStyle: null },
      ]

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: 'var(--color-navbar-bg)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="flex justify-between items-center h-24">
          <Link to="/" className="flex items-center space-x-4">
            <img src={logoUrl || branding.logo_url || fallbackLogo} alt={siteName || branding.organization_name} className="h-14 w-auto drop-shadow-sm" loading="eager" fetchpriority="high" />
            <div className="hidden sm:block">
              <div className="font-semibold" style={{ color: 'var(--color-navbar-text)' }}>{siteName || branding.organization_name}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{branding.tagline}</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {navigation.map((item) => {
              if (item.isCta) {
                return (
                  <Link key={item.href} to={item.href} target={item.target}
                    style={{ backgroundColor: 'var(--color-button-primary-bg)', color: 'var(--color-button-primary-text)' }}
                    className="px-5 py-2.5 rounded-full font-medium text-sm transition-colors hover:opacity-90">
                    {item.name}
                  </Link>
                )
              }
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  target={item.target}
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{
                    color: isActive(item.href) ? 'var(--color-navbar-active)' : 'var(--color-navbar-text)',
                  }}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center gap-5">
                {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                  <Link to={profile?.role === 'super_admin' ? '/super-admin' : '/admin'}
                    className="text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-navbar-text)' }}>
                    {t('nav.admin')}
                  </Link>
                )}
                <Link to="/dashboard"
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-navbar-text)' }}>
                  {t('nav.dashboard')}
                </Link>
                <button onClick={handleSignOut}
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-navbar-text)' }}>
                  {t('auth.signOut')}
                </button>
              </div>
            ) : (
              <Link to="/login"
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--color-navbar-text)' }}>
                {t('auth.signIn')}
              </Link>
            )}

            <Link to="/donate"
              style={{ backgroundColor: 'var(--color-button-primary-bg)', color: 'var(--color-button-primary-text)' }}
              className="px-5 py-2.5 rounded-full font-medium text-sm transition-colors hover:opacity-90">
              {t('footer.makeDonation')}
            </Link>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2" style={{ color: 'var(--color-navbar-text)' }}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive(item.href) ? 'var(--color-navbar-hover)' : 'transparent',
                    color: isActive(item.href) ? 'var(--color-navbar-active)' : 'var(--color-navbar-text)',
                  }}
                >
                  {item.name}
                </Link>
              ))}
              <Link to="/donate" onClick={() => setIsMenuOpen(false)}
                style={{ backgroundColor: 'var(--color-button-primary-bg)', color: 'var(--color-button-primary-text)' }}
                className="block px-4 py-2 rounded-lg text-sm font-medium text-center">
                {t('footer.makeDonation')}
              </Link>
              <LanguageSwitcher mobile />
              {user ? (
                <>
                  {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                    <Link to={profile?.role === 'super_admin' ? '/super-admin' : '/admin'}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ color: 'var(--color-navbar-text)' }}>
                      {t('nav.admin')}
                    </Link>
                  )}
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ color: 'var(--color-navbar-text)' }}>
                    {t('nav.dashboard')}
                  </Link>
                  <button onClick={() => { handleSignOut(); setIsMenuOpen(false) }}
                    className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ color: 'var(--color-navbar-text)' }}>
                    {t('auth.signOut')}
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--color-navbar-text)' }}>
                  {t('auth.signIn')}
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
