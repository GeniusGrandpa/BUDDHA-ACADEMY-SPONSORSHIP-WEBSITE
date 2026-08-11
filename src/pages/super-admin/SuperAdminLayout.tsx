import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { RoleBadge } from '../../components/RoleBadge'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { useLocalizePath } from '../../hooks/useLocalizePath'
import type { Role } from '../../types/permissions'

const superAdminNavItems = [
  {
    label: 'User Management',
    href: '/super-admin/users',
    description: 'Manage users, roles, and account status',
  },
  {
    label: 'Roles & Permissions',
    href: '/super-admin/roles',
    description: 'View and manage role configurations',
  },
  {
    label: 'Payment Settings',
    href: '/admin/payments/settings',
    description: 'Configure payment gateways and account details',
  },
  {
    label: 'Audit Logs',
    href: '/super-admin/audit',
    description: 'Track all system activities and changes',
  },
  {
    label: 'Send Notification',
    href: '/super-admin/notifications',
    description: 'Send notifications to platform users',
  },
]

export function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, profile } = useAuth()
  const localize = useLocalizePath()

  if (profile?.role !== 'super_admin') {
    return <Navigate to="/admin" replace />
  }

  const isActive = (href: string) => {
    if (href === '/super-admin' && (location.pathname === '/super-admin' || location.pathname === '/super-admin/users')) return true
    if (href !== '/super-admin' && location.pathname.startsWith(href)) return true
    return false
  }

  const NavItems = () => (
    <div className="space-y-1">
      {superAdminNavItems.map((item) => {
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
              isActive(item.href)
                ? 'bg-orange-100 text-orange-700'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
            }`}
          >
            <span className="truncate">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-screen bg-warm-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex flex-col w-72 bg-warm-50 border-r border-gray-200">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg text-white text-sm font-bold">
                  SA
                </div>
                <div>
                  <span className="text-gray-900 font-semibold text-sm">Super Admin</span>
                  <p className="text-xs text-gray-500">Admin Portal</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400 text-sm">
                Close
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
              <NavItems />
            </nav>
          </div>
        </div>
      )}

      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:flex-col lg:w-64">
        <div className="flex flex-col flex-grow bg-warm-50 border-r border-gray-200 overflow-y-auto">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg text-white text-sm font-bold">
                SA
              </div>
              <div>
                <span className="text-gray-900 font-semibold text-sm">Super Admin</span>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            </div>
          </div>

          <div className="px-3 py-3 border-b border-gray-200">
            <div className="px-2 py-2 rounded-lg bg-orange-50">
              <span className="text-xs text-orange-700 font-medium">Full System Access</span>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
            <NavItems />
          </nav>

          <div className="px-3 py-3 border-t border-gray-200">
            <Link
              to="/admin"
              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Back to Admin Portal
            </Link>
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-warm-50/80 backdrop-blur-xl border-b border-amber-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                className="lg:hidden p-2 rounded-lg hover:bg-orange-50 text-gray-400 text-sm"
              >
                Menu
              </button>
              <div className="hidden sm:flex items-center">
                <span className="text-sm text-gray-500">Admin Dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block w-px h-6 bg-gray-200" />

              <button
                onClick={() => navigate('/admin/notifications')}
                aria-label="Notifications"
                className="relative p-2 rounded-lg hover:bg-orange-50 text-gray-400"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 pr-0 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-900 leading-tight">{profile?.full_name}</p>
                    <div className="flex justify-end">
                      <RoleBadge role={profile?.role as Role} size="sm" />
                    </div>
                  </div>
                </button>

                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-warm-50 border border-amber-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                        <p className="text-xs text-gray-500">{profile?.email}</p>
                      </div>
                      <div className="p-1">
                        <Link to={localize('/')} className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-orange-50 rounded-lg">
                          View Website
                        </Link>
                        <Link to="/admin" className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-orange-50 rounded-lg">
                          Admin Portal
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 p-1">
                        <button
                          onClick={signOut}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        >
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
              <ErrorBoundary context="super-admin-content">
                <Outlet />
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
