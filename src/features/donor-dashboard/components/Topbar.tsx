import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Menu, ChevronDown, User, Settings, LogOut, ExternalLink } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { NotificationBell } from '../../../components/notifications/NotificationBell'
import { Tr } from '../../../components/Translated'
import type { Section } from './Sidebar'
import logo from '../../../assets/logo.jpg'

interface TopbarProps {
  userName: string
  onMenuClick: () => void
  userId?: string
  onSectionChange: (section: Section) => void
}

export function Topbar({ userName, onMenuClick, userId, onSectionChange }: TopbarProps) {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const [searchFocused, setSearchFocused] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-gray-100/80">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-orange-100 text-gray-500 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="shrink-0">
            <img src={logo} alt="Buddha Academy" className="h-9 w-9 rounded-lg object-cover" loading="eager" decoding="async" />
          </Link>
          <div className="hidden sm:block">
<h1 className="text-sm font-medium text-gray-900 truncate">
                <Tr text="Welcome back, " />{userName}
              </h1>
              <p className="text-xs text-gray-500"><Tr text="Here's your impact overview" /></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`relative hidden md:block transition-all duration-200 ${searchFocused ? 'md:w-72' : 'md:w-56'}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
<input
                type="text"
                placeholder={t('Search...', { defaultValue: 'Search...' })}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              className="w-full h-9 pl-9 pr-3 text-sm bg-orange-50/50 border border-orange-100 rounded-xl text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200/50 focus:border-orange-300 transition-all"
            />
          </div>

          {userId && <NotificationBell userId={userId} />}

          <div ref={avatarRef} className="relative">
            <button
              onClick={() => setAvatarOpen(!avatarOpen)}
              className="flex items-center gap-1.5 p-0.5 pr-1.5 rounded-xl hover:bg-orange-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-sm font-medium ring-2 ring-white">
                {userName.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${avatarOpen ? 'rotate-180' : ''}`} />
            </button>

            {avatarOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-warm-50 rounded-xl border border-amber-200 shadow-lg py-1.5 z-50">
                <div className="px-4 py-2 border-b border-gray-50">
                  <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-500">Donor</p>
                </div>
                <button
                  onClick={() => { onSectionChange('profile'); setAvatarOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <Tr text="Profile" />
                </button>
                <button
                  onClick={() => { onSectionChange('settings'); setAvatarOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <Tr text="Settings" />
                </button>
                <div className="border-t border-gray-50 mt-1 pt-1">
                  <a
                    href="/"
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-orange-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <Tr text="Back to Website" />
                  </a>
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <Tr text="Sign Out" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sm:hidden flex items-center gap-2 px-4 pb-3">
        <Link to="/" className="shrink-0">
          <img src={logo} alt="Buddha Academy" className="h-7 w-7 rounded object-cover" loading="eager" decoding="async" />
        </Link>
        <div>
          <h1 className="text-sm font-medium text-gray-900"><Tr text="Welcome back, " />{userName}</h1>
          <p className="text-xs text-gray-500"><Tr text="Here's your impact overview" /></p>
        </div>
      </div>
    </header>
  )
}
