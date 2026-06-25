import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../features/auth/providers/AuthContext'
import { useRole } from '../../hooks/useRole'
import { getNavigationForRole } from '../../config/navigation'
import { NotificationBell } from '../../components/notifications/NotificationBell'
import { RoleBadge } from '../../components/RoleBadge'
import type { Role } from '../../features/auth/types/permissions'
import { useTheme } from '../../context/ThemeContext'
import fallbackLogo from '../../assets/logo.jpg'

export function AdminLayout() {
  const { user, profile, signOut } = useAuth()
  const { role } = useRole()
  const location = useLocation()
  const { branding } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navSections = getNavigationForRole(role || 'public_user')

  const isActive = useCallback((href: string) => {
    if (href === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(href)
  }, [location.pathname])

  const NavItems = () => (
    <>
      {navSections.map((section, idx) => (
        <div key={idx} className="mb-4">
          {section.title && (
            <p className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
              {section.title}
            </p>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-2 py-1.5 rounded-lg transition-colors text-sm ${
                  isActive(item.href)
                    ? 'bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)]'
                    : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-active-bg)] hover:text-[var(--color-sidebar-active-text)]'
                }`}
              >
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-error)] text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </>
  )

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-stone-950/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex flex-col w-72 bg-[var(--color-sidebar-bg)] border-r border-[var(--color-border)]">
            <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--color-border)]">
              <Link to="/" className="flex items-center space-x-2">
                <img src={branding.logo_url || fallbackLogo} alt={branding.organization_name} className="h-8 w-8 rounded-lg object-cover shrink-0 shadow-lg" />
                <span className="text-[var(--color-text-primary)] font-semibold text-sm">Admin Portal</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:opacity-80" aria-label="Close sidebar">
                <X className="w-5 h-5 text-[var(--color-text-muted)]" />
              </button>
            </div>
            <nav className="flex-1 px-2 py-4 overflow-y-auto scrollbar-thin">
              <NavItems />
            </nav>
          </div>
        </div>
      )}

      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:flex-col lg:w-64">
        <div className="flex flex-col flex-grow overflow-y-auto bg-[var(--color-sidebar-bg)] border-r border-[var(--color-border)]">
          <div className="flex items-center h-16 px-4 border-b border-[var(--color-border)]">
            <Link to="/" className="flex items-center space-x-2">
              <img src={branding.logo_url || fallbackLogo} alt={branding.organization_name} className="h-8 w-8 rounded-lg object-cover shrink-0 shadow-lg" />
              <div>
                <span className="font-semibold text-sm text-[var(--color-text-primary)]">{branding.organization_name}</span>
                <p className="text-xs text-[var(--color-text-muted)]">Admin Portal</p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 px-2 py-4 overflow-y-auto scrollbar-thin">
            <NavItems />
          </nav>
        </div>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border-accent,#fcd34d)] backdrop-blur-xl">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:opacity-80 text-[var(--color-text-muted)]" aria-label="Open sidebar">
                <Menu className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block w-px h-6 bg-[var(--color-border)]" />

              {user && <NotificationBell userId={user.id} />}

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 pr-0 rounded-lg transition-colors hover:opacity-80"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium leading-tight text-[var(--color-text-primary)]">{profile?.full_name}</p>
                    <div className="flex justify-end">
                      <RoleBadge role={profile?.role as Role} size="sm" />
                    </div>
                  </div>
                </button>

                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg z-50 overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)]">
                      <div className="p-3 border-b border-[var(--color-border-light)]">
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{profile?.full_name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{profile?.email}</p>
                      </div>
                      <div className="p-1">
                        <Link to="/" className="flex items-center px-3 py-2 text-sm rounded-lg transition-colors text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
                          View Website
                        </Link>
                        <Link to="/dashboard" className="flex items-center px-3 py-2 text-sm rounded-lg transition-colors text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
                          User Dashboard
                        </Link>
                      </div>
                      <div className="p-1 border-t border-[var(--color-border-light)]">
                        <button onClick={signOut}
                          className="flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors text-[var(--color-error)] hover:bg-red-50">
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
