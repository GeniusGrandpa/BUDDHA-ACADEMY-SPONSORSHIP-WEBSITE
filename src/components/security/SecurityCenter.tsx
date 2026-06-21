import { useState, useEffect } from 'react'
import { Shield, LogOut, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import type { Json } from '../../types/database'

interface Session {
  id: string
  user_id: string
  ip_address: string | null
  user_agent: string | null
  device_info: Json
  location: string | null
  is_active: boolean
  last_activity: string
  created_at: string
  expired_at: string | null
}

interface LoginRecord {
  id: string
  ip_address: string | null
  user_agent: string | null
  device_info: string | null
  status: 'success' | 'failed' | 'suspicious'
  failure_reason: string | null
  created_at: string
}

export function SecurityCenter() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loggingOutAll, setLoggingOutAll] = useState(false)

  useEffect(() => {
    loadSecurityData()
  }, [])

  async function loadSecurityData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [sessionsRes, loginRes] = await Promise.all([
      supabase.from('user_sessions').select('*').eq('user_id', user.id).order('last_activity', { ascending: false }),
      supabase.from('login_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    ])

    if (sessionsRes.data) setSessions(sessionsRes.data)
    if (loginRes.data) setLoginHistory(loginRes.data)
    setLoading(false)
  }

  async function handleLogoutAllDevices() {
    if (!confirm('This will sign you out of all devices, including this one. Continue?')) return

    setLoggingOutAll(true)
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    if (error) {
      toast.error('Failed to logout all devices')
    } else {
      toast.success('Logged out of all devices')
      window.location.href = '/login'
    }
    setLoggingOutAll(false)
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'success':
        return <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle className="w-3 h-3" /> Success</span>
      case 'failed':
        return <span className="flex items-center gap-1 text-xs text-red-600"><XCircle className="w-3 h-3" /> Failed</span>
      case 'suspicious':
        return <span className="flex items-center gap-1 text-xs text-amber-600"><AlertTriangle className="w-3 h-3" /> Suspicious</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="bg-warm-50 rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
        <div className="space-y-4">
          <div className="h-16 bg-gray-200 rounded" />
          <div className="h-16 bg-gray-200 rounded" />
          <div className="h-16 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Security Center</h2>
            <p className="text-sm text-gray-500">Manage your account security</p>
          </div>
        </div>
        <button
          onClick={handleLogoutAllDevices}
          disabled={loggingOutAll}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          {loggingOutAll ? 'Signing out...' : 'Logout All Devices'}
        </button>
      </div>

      <div className="bg-warm-50 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            Active Sessions
          </h3>
        </div>
        {sessions.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No active sessions found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessions.map((session) => (
              <div key={session.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                    <p className="text-sm font-medium text-gray-900">
                      {String((session.device_info as Record<string, string>)?.browser || session.user_agent?.split('/')[0] || 'Unknown Device')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.location || 'Unknown location'} &middot; {session.ip_address || 'No IP'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Last active: {new Date(session.last_activity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${session.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  {session.is_active ? 'Active' : 'Expired'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-warm-50 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            Login History
          </h3>
        </div>
        {loginHistory.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No login history available.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {loginHistory.map((record) => (
              <div key={record.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm text-gray-900">
                      {record.ip_address || 'Unknown IP'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.created_at).toLocaleString()}
                    </p>
                    {record.failure_reason && (
                      <p className="text-xs text-red-500">{record.failure_reason}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(record.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
