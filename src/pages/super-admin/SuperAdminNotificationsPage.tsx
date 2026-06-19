import { useState, useEffect, useCallback } from 'react'
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { broadcastNotification, getAllUserIds } from '../../services/notifications'
import { logAuditEvent } from '../../lib/audit'
import { toast } from 'react-hot-toast'
import { ROLE_NAMES } from '../../types/permissions'

interface SendResult {
  success: number
  failed: number
}

export function SuperAdminNotificationsPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('announcement')
  const [targetRole, setTargetRole] = useState<string>('all')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)
  const [userCount, setUserCount] = useState<number | null>(null)

  const roleOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'All Users' },
    { value: 'super_admin', label: ROLE_NAMES.super_admin },
    { value: 'admin', label: ROLE_NAMES.admin },
    { value: 'finance_manager', label: ROLE_NAMES.finance_manager },
    { value: 'teacher', label: ROLE_NAMES.teacher },
    { value: 'donor', label: ROLE_NAMES.donor },
    { value: 'volunteer', label: ROLE_NAMES.volunteer },
  ]

  const typeOptions = [
    { value: 'announcement', label: 'Announcement' },
    { value: 'system', label: 'System Update' },
    { value: 'report_available', label: 'Report Available' },
    { value: 'achievement', label: 'Achievement' },
  ]

  const estimateRecipients = useCallback(async () => {
    const roles = targetRole === 'all' ? undefined : [targetRole]
    const ids = await getAllUserIds({ roles, status: 'active' })
    setUserCount(ids.length)
  }, [targetRole])

  useEffect(() => {
    estimateRecipients()
  }, [estimateRecipients])

  const handleSend = async () => {
    if (!title.trim()) {
      toast.error('Please enter a notification title')
      return
    }
    if (!message.trim()) {
      toast.error('Please enter a notification message')
      return
    }

    setSending(true)
    setResult(null)

    try {
      const roles = targetRole === 'all' ? undefined : [targetRole]
      const userIds = await getAllUserIds({ roles, status: 'active' })

      if (userIds.length === 0) {
        toast.error('No active users found for the selected role')
        setSending(false)
        return
      }

      const res = await broadcastNotification(userIds, type, title.trim(), message.trim())

      setResult(res)

      await logAuditEvent({
        action: 'notification_broadcast',
        entityType: 'notification',
        metadata: {
          type,
          targetRole: targetRole === 'all' ? 'all' : targetRole,
          recipientCount: userIds.length,
          successCount: res.success,
          failedCount: res.failed,
        },
      })

      if (res.failed === 0) {
        toast.success(`Notification sent to ${res.success} user(s)`)
        setTitle('')
        setMessage('')
      } else {
        toast.error(`Sent to ${res.success} user(s), ${res.failed} failed`)
      }
    } catch {
      toast.error('Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Send Notification</h1>
          <p className="text-gray-500 mt-1">Broadcast notifications to platform users</p>
        </div>
        <div className="px-3 py-1.5 bg-orange-500/5 border border-orange-500/20 rounded-lg">
          <span className="text-xs text-orange-600 font-medium">Super Admin Only</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="bordered" className="bg-white border-gray-100 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-orange-500/50"
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., System Maintenance Notice"
                  maxLength={200}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter notification message..."
                  rows={5}
                  maxLength={2000}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-500/50 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{message.length}/2000</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSend}
                  disabled={sending || !title.trim() || !message.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {sending ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </div>
          </Card>

          {result && (
            <Card variant="bordered" className="bg-white border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Delivery Result</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-gray-700">
                    <strong className="text-emerald-600">{result.success}</strong> delivered
                  </span>
                </div>
                {result.failed > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-gray-700">
                      <strong className="text-red-600">{result.failed}</strong> failed
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card variant="bordered" className="bg-white border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Target Audience
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Select Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-orange-500/50"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                <p className="text-xs text-orange-700 font-medium">Estimated Recipients</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {userCount !== null ? userCount : <Loader2 className="w-5 h-5 animate-spin inline" />}
                </p>
                <p className="text-xs text-orange-500 mt-0.5">active users</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" className="bg-white border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Guidelines</h3>
            <ul className="text-xs text-gray-500 space-y-2 list-disc list-inside">
              <li>Notifications are sent to active users only</li>
              <li>Suspended or banned users will not receive notifications</li>
              <li>All broadcasts are logged in the audit trail</li>
              <li>Keep messages concise and actionable</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}