import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut, PanelLeftClose, PanelLeftOpen, ExternalLink,
  LayoutDashboard, Users, Heart, Bell, User, Settings,
} from 'lucide-react'
import { sidebarItem } from '../animations'
import logo from '../../../assets/logo.jpg'
import { useAuth } from '../../../context/AuthContext'
import { ROLE_NAMES } from '../../../types/permissions'
import { useTranslation } from 'react-i18next'
import { useLocalizePath } from '../../../hooks/useLocalizePath'

export type Section = 'overview' | 'students' | 'donations' | 'updates' | 'profile' | 'settings'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onMobileClose: () => void
  onSignOut: () => void
  userName: string
  activeSection: Section
  onSectionChange: (section: Section) => void
}

const navItems: { label: string; section: Section; icon: typeof LayoutDashboard }[] = [
  { label: 'dashboard_overview', section: 'overview', icon: LayoutDashboard },
  { label: 'dashboard_students', section: 'students', icon: Users },
  { label: 'dashboard_donations', section: 'donations', icon: Heart },
  { label: 'dashboard_updates', section: 'updates', icon: Bell },
  { label: 'dashboard_profile', section: 'profile', icon: User },
  { label: 'dashboard_settings', section: 'settings', icon: Settings },
]

const SIDEBAR_EXPANDED = 280
const SIDEBAR_COLLAPSED = 72

function TooltipWrapper({ collapsed, children, label }: { collapsed: boolean; children: ReactNode; label: string }) {
  if (!collapsed) return <>{children}</>
  return (
    <div className="relative group/tooltip">
      {children}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all pointer-events-none z-[100]">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
      </div>
    </div>
  )
}

function SidebarContent({ collapsed, onToggleCollapse, onSignOut, userName, activeSection, onSectionChange, inOverlay }: {
  collapsed: boolean
  onToggleCollapse: () => void
  onSignOut: () => void
  userName: string
  activeSection: Section
  onSectionChange: (section: Section) => void
  inOverlay?: boolean
}) {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const localize = useLocalizePath()
  const displayRole = profile?.role ? (ROLE_NAMES[profile.role as keyof typeof ROLE_NAMES] || profile.role) : 'Donor'

  return (
    <div className="flex flex-col h-full bg-warm-50 border-r border-amber-200">
      <div className={`relative flex items-center h-16 border-b border-gray-100 ${collapsed ? 'justify-center px-0' : 'px-4 justify-between'}`}>
        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <img src={logo} alt="Buddha Academy" className="h-8 w-8 rounded-lg object-cover shrink-0" loading="eager" decoding="async" />
          {!collapsed && <span className="font-semibold text-gray-900 text-sm">Buddha Academy</span>}
        </div>
        {!inOverlay && (
          <button onClick={onToggleCollapse} className={`p-1.5 rounded-lg hover:bg-orange-100 text-gray-400 hover:text-orange-600 transition-colors ${collapsed ? 'absolute right-2 top-1/2 -translate-y-1/2' : ''}`}>
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item, i) => {
          const active = activeSection === item.section
          const Icon = item.icon
          const translatedLabel = t(item.label, { defaultValue: item.label.replace('dashboard_', '').replace('_', ' ') })

          return (
            <motion.button
              key={item.section}
              variants={inOverlay ? undefined : sidebarItem}
              initial={inOverlay ? undefined : 'initial'}
              animate={inOverlay ? undefined : 'animate'}
              transition={{ delay: i * 0.03 }}
              onClick={() => { onSectionChange(item.section) }}
              className={`
                relative group w-full flex items-center rounded-xl text-sm font-medium transition-all
                ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5 gap-3'}
                ${active
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
                }
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{translatedLabel}</span>}

              <TooltipWrapper collapsed={collapsed} label={translatedLabel}>
                <div className="absolute inset-0" />
              </TooltipWrapper>
            </motion.button>
          )
        })}
      </nav>

      <div className="p-2 border-t border-gray-100">
        <TooltipWrapper collapsed={collapsed} label={userName}>
          <div className={`flex items-center gap-3 mb-2 w-full rounded-xl transition-colors ${collapsed ? 'justify-center px-0 py-2' : 'px-2 py-2'}`}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xs font-medium shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-900 truncate">{userName}</div>
                <div className="text-xs text-gray-500">{displayRole}</div>
              </div>
            )}
          </div>
        </TooltipWrapper>

        <TooltipWrapper collapsed={collapsed} label={t('dashboard_back_to_website', { defaultValue: 'Back to Website' })}>
          <a
            href={localize('/')}
            className={`
              w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-colors mb-0.5
              ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
              text-gray-500 hover:bg-orange-50 hover:text-orange-600
            `}
          >
            <ExternalLink className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{t('dashboard_back_to_website', { defaultValue: 'Back to Website' })}</span>}
          </a>
        </TooltipWrapper>

        <TooltipWrapper collapsed={collapsed} label={t('dashboard_sign_out', { defaultValue: 'Sign Out' })}>
          <button
            onClick={onSignOut}
            className={`
              w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-colors
              ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
              text-gray-500 hover:bg-red-50 hover:text-red-500
            `}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{t('dashboard_sign_out', { defaultValue: 'Sign Out' })}</span>}
          </button>
        </TooltipWrapper>
      </div>
    </div>
  )
}

export function Sidebar(props: SidebarProps) {
  const { collapsed, mobileOpen, onMobileClose } = props

  return (
    <>
      <motion.div
        animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden lg:flex lg:flex-col lg:shrink-0 h-full border-r border-gray-100 bg-white overflow-hidden"
      >
        <SidebarContent {...props} />
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-stone-900/30 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] lg:hidden shadow-2xl"
            >
              <SidebarContent {...props} inOverlay onToggleCollapse={() => {}} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
