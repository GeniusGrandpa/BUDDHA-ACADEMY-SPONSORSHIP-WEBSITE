import { useEffect, useState, useCallback } from 'react'
import { Bell, CheckCheck, Loader2, ChevronLeft, ChevronRight, Send, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { createNotification, NOTIFICATION_TYPES } from '../../services/notifications'
import type { Notification } from '../../types/database'
import type { Role } from '../../types/permissions'

const PAGE_SIZE = 20

const NOTIFICATION_TYPE_OPTIONS = [
  { value: NOTIFICATION_TYPES.SYSTEM, label: 'System' },
  { value: NOTIFICATION_TYPES.DONATION_CONFIRMED, label: 'Donation Confirmed' },
  { value: NOTIFICATION_TYPES.PAYMENT_VERIFIED, label: 'Payment Verified' },
  { value: NOTIFICATION_TYPES.SPONSORSHIP_ACTIVE, label: 'Sponsorship Active' },
  { value: NOTIFICATION_TYPES.SPONSORSHIP_RENEWAL, label: 'Sponsorship Renewal' },
  { value: NOTIFICATION_TYPES.TEACHER_UPDATE, label: 'Teacher Update' },
  { value: NOTIFICATION_TYPES.VOLUNTEER_APPROVED, label: 'Volunteer Approved' },
  { value: NOTIFICATION_TYPES.VOLUNTEER_EVENT, label: 'Volunteer Event' },
  { value: NOTIFICATION_TYPES.REPORT_AVAILABLE, label: 'Report Available' },
  { value: NOTIFICATION_TYPES.ACHIEVEMENT, label: 'Achievement' },
]

const ROLE_OPTIONS: { value: Role | 'all'; label: string }[] = [
  { value: 'all', label: 'All Users' },
  { value: 'super_admin', label: 'Super Admins' },
  { value: 'admin', label: 'Admins' },
  { value: 'finance_manager', label: 'Finance Managers' },
  { value: 'teacher', label: 'Teachers' },
  { value: 'donor', label: 'Donors' },
  { value: 'volunteer', label: 'Volunteers' },
]

export function AdminNotificationsPage() {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const [showSendForm, setShowSendForm] = useState(false)
  const [sendTitle, setSendTitle] = useState('')
  const [sendMessage, setSendMessage] = useState('')
  const [sendType, setSendType] = useState<string>(NOTIFICATION_TYPES.SYSTEM)
  const [sendRole, setSendRole] = useState<Role | 'all'>('all')
  const [sending, setSending] = useState(false)

const userRole = profile?.role as Role | undefined
  const canSend = userRole === 'super_admin'

  const loadNotifications = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)
    try {
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .range(from, to)

      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)

      const { count: unread } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('read', false)

      if (data) setNotifications(data)
      setTotalCount(count ?? 0)
      setUnreadCount(unread ?? 0)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [page, profile?.id])

   useEffect(() => {
    if (profile?.id) loadNotifications()
  }, [profile?.id, page, loadNotifications])

  const markAsRead = async (id: string) => {
    try {
      await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).eq('id', id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    if (!profile?.id) return
    try {
      await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).eq('user_id', profile.id).eq('read', false)
      setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sendTitle.trim()) {
      toast.error('Title is required')
      return
    }
    if (!sendMessage.trim()) {
      toast.error('Message is required')
      return
    }

    setSending(true)
    try {
      let recipients: { id: string }[] = []

      if (sendRole === 'all') {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('status', 'active')
        if (data) recipients = data
      } else {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', sendRole)
          .eq('status', 'active')
        if (data) recipients = data
      }

      if (recipients.length === 0) {
        toast.error('No recipients found')
        setSending(false)
        return
      }

      let successCount = 0
      let errorCount = 0

      for (const recipient of recipients) {
        const ok = await createNotification(recipient.id, sendType, sendTitle.trim(), sendMessage.trim() || undefined)
        if (ok) {
          successCount++
        } else {
          errorCount++
        }
      }

      if (errorCount === 0) {
        toast.success(`Notification sent to ${successCount} user${successCount > 1 ? 's' : ''}`)
      } else if (successCount > 0) {
        toast.success(`Sent to ${successCount} user${successCount > 1 ? 's' : ''}, ${errorCount} failed`)
      } else {
        toast.error('Failed to send notifications')
      }

      setSendTitle('')
      setSendMessage('')
      setSendType(NOTIFICATION_TYPES.SYSTEM)
      setSendRole('all')
      setShowSendForm(false)
      loadNotifications()
    } catch (error) {
      console.error('Error sending notifications:', error)
      toast.error('Failed to send notifications')
    } finally {
      setSending(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  function getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canSend && (
            <button
              onClick={() => setShowSendForm(!showSendForm)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              Send Notification
            </button>
          )}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {canSend && showSendForm && (
        <Card variant="bordered" className="mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Compose Notification</h2>
            <button
              onClick={() => setShowSendForm(false)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <form onSubmit={handleSendNotification} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
              <select
                value={sendRole}
                onChange={e => setSendRole(e.target.value as Role | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                aria-label="Filter recipients"
              >
                {ROLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={sendType}
                onChange={e => setSendType(e.target.value as typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                aria-label="Filter type"
              >
                {NOTIFICATION_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={sendTitle}
                onChange={e => setSendTitle(e.target.value)}
                placeholder="Notification title"
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={sendMessage}
                onChange={e => setSendMessage(e.target.value)}
                placeholder="Notification message"
                rows={4}
                maxLength={2000}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSendForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending || !sendTitle.trim() || !sendMessage.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card variant="bordered" className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-4">
            <Bell className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No notifications yet</p>
            <p className="text-sm text-gray-500 mt-1">Notifications about system activities will appear here</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  onClick={() => { if (!notification.read) markAsRead(notification.id) }}
                  className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-emerald-50/50' : ''
                  }`}
                  aria-label="Mark as read"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !notification.read ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}>
                      <Bell className={`w-4 h-4 ${!notification.read ? 'text-emerald-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{getTimeAgo(notification.created_at)}</span>
                      </div>
                      {notification.message && (
                        <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                      )}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
