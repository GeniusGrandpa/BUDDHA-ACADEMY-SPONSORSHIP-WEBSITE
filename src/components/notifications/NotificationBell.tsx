import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCmsStrings } from '../../context/CmsStringsContext'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../services/notifications'
import type { Notification } from '../../types/database'

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const { t } = useCmsStrings()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const loadUnreadCountRef = useRef<(() => Promise<void>) | null>(null)

  const loadUnreadCount = useCallback(async () => {
    const count = await getUnreadCount(userId)
    setUnreadCount(count)
  }, [userId])

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    const data = await getNotifications(userId, 10)
    setNotifications(data)
    await loadUnreadCount()
    setLoading(false)
  }, [userId, loadUnreadCount])

  useEffect(() => {
    loadUnreadCountRef.current = loadUnreadCount
  }, [loadUnreadCount])

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(() => loadUnreadCountRef.current?.(), 30000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleMarkAsRead(id: string) {
    try {
      await markAsRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {
      toast.error(t('Failed to mark notification as read'))
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead(userId)
      setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })))
      setUnreadCount(0)
    } catch {
      toast.error(t('Failed to mark all as read'))
    }
  }

  function getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t('Just now', { defaultValue: 'Just now' })
    if (diffMins < 60) return t('notif_mins_ago', { count: diffMins, defaultValue: `${diffMins} min ago` })
    if (diffHours < 24) return t('notif_hours_ago', { count: diffHours, defaultValue: `${diffHours} hour ago` })
    if (diffDays < 7) return t('notif_days_ago', { count: diffDays, defaultValue: `${diffDays} day ago` })
    return date.toLocaleDateString()
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label={t('notifications_label', { count: unreadCount })}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-warm-50 rounded-xl shadow-lg border border-amber-200 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{t('notif_notifications')}</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  {t('notif_mark_all_read')}
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center px-4">
                  <Bell className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">{t('notif_no_notifications')}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('notif_updates_here')}
                  </p>
                </div>
              ) : (
                <ul role="list" className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      <button
                        onClick={() => {
                          if (!notification.read) handleMarkAsRead(notification.id)
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 ${!notification.read ? 'bg-emerald-50/50' : ''
                            }`}
                      >
                        <div className="flex gap-3">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {getTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    navigate('/dashboard?tab=notifications')
                  }}
                  className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  {t('notif_view_all')}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
