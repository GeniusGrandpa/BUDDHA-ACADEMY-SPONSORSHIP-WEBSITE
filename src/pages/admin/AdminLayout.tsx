import { useState, useMemo } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { NotificationBell } from '../../components/notifications/NotificationBell'
import { RoleBadge } from '../../components/RoleBadge'
import { getNavigationForRole } from '../../config/navigation'
import type { PermissionCode } from '../../types/permissions'
import type { Role } from '../../types/permissions'
import fallbackLogo from '../../assets/logo.jpg'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const location = useLocation()
  const { signOut, profile, permissions, user } = useAuth()
  const { branding } = useTheme()

  const userRole = profile?.role as Role | undefined
  const userPermissions = permissions as PermissionCode[]
  const navSections = useMemo(() => getNavigationForRole(userRole, userPermissions), [userRole, userPermissions])

  const isActive = (href: string) => {
    if (href === '/admin' && location.pathname === '/admin') return true
    if (href !== '/admin' && location.pathname.startsWith(href)) return true
    return false
  }

  const NavItems = () => (
    <>
      {navSections.map((section, idx) => (
        <div key={idx} className="mb-4">
          {section.title && (
            <p className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              {section.title}
            </p>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center px-2 py-1.5 rounded-lg transition-colors text-sm"
                style={{
                  backgroundColor: isActive(item.href) ? 'var(--color-sidebar-active-bg)' : 'transparent',
                  color: isActive(item.href) ? 'var(--color-sidebar-active-text)' : 'var(--color-sidebar-text)',
                }}
                onMouseEnter={e => { if (!isActive(item.href)) e.currentTarget.style.backgroundColor = 'var(--color-sidebar-active-bg)'; e.currentTarget.style.color = 'var(--color-sidebar-active-text)' }}
                onMouseLeave={e => { if (!isActive(item.href)) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-sidebar-text)' } }}
              >
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-error)', color: 'white' }}>
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgba(28,25,23,0.2)' }} onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex flex-col w-72" style={{ backgroundColor: 'var(--color-sidebar-bg)', borderRight: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between h-16 px-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <Link to="/" className="flex items-center space-x-2">
                <img src={branding.logo_url || fallbackLogo} alt={branding.organization_name} className="h-8 w-8 rounded-lg object-cover shrink-0 shadow-lg" />
                <span style={{ color: 'var(--color-text-primary)' }} className="font-semibold text-sm">Admin Portal</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:opacity-80">
                <X className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
            <nav className="flex-1 px-2 py-4 overflow-y-auto scrollbar-thin">
              <NavItems />
            </nav>
          </div>
        </div>
      )}

      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:flex-col lg:w-64">
        <div className="flex flex-col flex-grow overflow-y-auto" style={{ backgroundColor: 'var(--color-sidebar-bg)', borderRight: '1px solid var(--color-border)' }}>
          <div className="flex items-center h-16 px-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <Link to="/" className="flex items-center space-x-2">
              <img src={branding.logo_url || fallbackLogo} alt={branding.organization_name} className="h-8 w-8 rounded-lg object-cover shrink-0 shadow-lg" />
              <div>
                <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{branding.organization_name}</span>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Admin Portal</p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 px-2 py-4 overflow-y-auto scrollbar-thin">
            <NavItems />
          </nav>
        </div>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border-accent, #fcd34d)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:opacity-80" style={{ color: 'var(--color-text-muted)' }}>
                <Menu className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block w-px h-6" style={{ backgroundColor: 'var(--color-border)' }} />

              {user && <NotificationBell userId={user.id} />}

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 pr-0 rounded-lg transition-colors hover:opacity-80"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm"
                    style={{ background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-primary-dark))' }}>
                    {profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium leading-tight" style={{ color: 'var(--color-text-primary)' }}>{profile?.full_name}</p>
                    <div className="flex justify-end">
                      <RoleBadge role={profile?.role as Role} size="sm" />
                    </div>
                  </div>
                </button>

                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg z-50 overflow-hidden"
                      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                      <div className="p-3" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{profile?.full_name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{profile?.email}</p>
                      </div>
                      <div className="p-1">
                        <Link to="/" className="flex items-center px-3 py-2 text-sm rounded-lg transition-colors"
                          style={{ color: 'var(--color-text-secondary)' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          View Website
                        </Link>
                        <Link to="/dashboard" className="flex items-center px-3 py-2 text-sm rounded-lg transition-colors"
                          style={{ color: 'var(--color-text-secondary)' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          User Dashboard
                        </Link>
                      </div>
                      <div className="p-1" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                        <button onClick={signOut}
                          className="flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors"
                          style={{ color: 'var(--color-error)' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
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
          <Outlet />
        </main>
      </div>
    </div>
  )
}
