import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut, PanelLeftClose, PanelLeftOpen, ExternalLink,
} from 'lucide-react'
import { sidebarItem } from '../animations'
import logo from '../../../assets/logo.jpg'
import { useAuth } from '../../../context/AuthContext'
import { ROLE_NAMES } from '../../../types/permissions'

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

const navItems: { label: string; section: Section }[] = [
  { label: 'Overview', section: 'overview' },
  { label: 'Students', section: 'students' },
  { label: 'Donations', section: 'donations' },
  { label: 'Updates', section: 'updates' },
  { label: 'Profile', section: 'profile' },
  { label: 'Settings', section: 'settings' },
]

const SIDEBAR_EXPANDED = 280
const SIDEBAR_COLLAPSED = 72

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
  const displayRole = profile?.role ? (ROLE_NAMES[profile.role as keyof typeof ROLE_NAMES] || profile.role) : 'Donor'
  return (
    <div className="flex flex-col h-full bg-warm-50 border-r border-amber-200">
      <div className="flex items-center h-16 px-4 border-b border-gray-100 justify-between">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Buddha Academy" className="h-8 w-8 rounded-lg object-cover shrink-0" />
          {!collapsed && <span className="font-semibold text-gray-900 text-sm">Buddha Academy</span>}
        </div>
        {!inOverlay && (
          <button onClick={onToggleCollapse} className="p-1.5 rounded-lg hover:bg-orange-100 text-gray-400 hover:text-orange-600 transition-colors">
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item, i) => {
          const active = activeSection === item.section
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
                ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
                ${active
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              {!collapsed && <span className="truncate">{item.label}</span>}

              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-white text-gray-700 text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 shadow-lg border border-gray-200">
                  {item.label}
                </div>
              )}
            </motion.button>
          )
        })}
      </nav>

      <div className="p-2 border-t border-gray-100">
        <div className={`flex items-center gap-3 mb-2 ${collapsed ? 'justify-center' : 'px-2'}`}>
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
        <a
          href="/"
          className={`
            w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-colors mb-0.5
            ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
            text-gray-500 hover:bg-orange-50 hover:text-orange-600
          `}
          title={collapsed ? 'Back to Website' : undefined}
        >
          <ExternalLink className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Back to Website</span>}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-white text-gray-700 text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 shadow-lg border border-gray-200">
              Back to Website
            </div>
          )}
        </a>
        <button
          onClick={onSignOut}
          className={`
            w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-colors
            ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
            text-gray-500 hover:bg-red-50 hover:text-red-500
          `}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-white text-gray-700 text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 shadow-lg border border-gray-200">
              Sign Out
            </div>
          )}
        </button>
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
