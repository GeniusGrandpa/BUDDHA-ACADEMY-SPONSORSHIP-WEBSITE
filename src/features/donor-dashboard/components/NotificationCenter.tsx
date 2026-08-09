import { motion } from 'framer-motion'
import { Bell, CheckCheck } from 'lucide-react'
import { fadeInUp, stagger } from '../animations'
import { formatRelativeTime, cn } from '../utils/formatters'
import { useTranslation } from 'react-i18next'
import { Tr } from '../../../components/Translated'
import type { Notification } from '../../../types/features'

interface NotificationCenterProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  loading: boolean
}

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  loading,
}: NotificationCenterProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 text-center">
        <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
          <Bell className="w-7 h-7 text-orange-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1"><Tr text="No Notifications Yet" /></h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          <Tr text="You'll see notifications here when there are updates about your donations and sponsored students." />
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900"><Tr text="Notifications" /></h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
              {unreadCount} <Tr text="new" />
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <Tr text="Mark all as read" />
          </button>
        )}
      </div>

      <motion.div variants={stagger} initial="initial" animate="animate" className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
        {notifications.map((notif) => {
          return (
            <motion.div
              key={notif.id}
              variants={fadeInUp}
              className={cn(
                'flex items-start gap-3 p-4 transition-colors',
                !notif.read ? 'bg-orange-50/30' : 'hover:bg-orange-50/30',
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-900">{notif.title}</h4>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatRelativeTime(notif.created_at)}
                    </span>
                    {!notif.read && (
                      <button
                        onClick={() => onMarkAsRead(notif.id)}
                        className="p-0.5 rounded text-gray-300 hover:text-orange-500 transition-colors"
                        title={t('Mark as read', { defaultValue: 'Mark as read' })}
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {notif.message && (
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
