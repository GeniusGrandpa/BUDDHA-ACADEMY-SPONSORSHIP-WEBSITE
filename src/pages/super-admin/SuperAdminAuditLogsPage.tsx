import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import type { Json } from '../../types/database'

interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  changes: Json
  metadata: Json
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export function SuperAdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) throw error
      setLogs(data || [])
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadLogs() }, [loadLogs])

  const filteredLogs = logs.filter(log => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        log.action.toLowerCase().includes(q) ||
        log.entity_type.toLowerCase().includes(q) ||
        log.entity_id?.toLowerCase().includes(q) ||
        log.ip_address?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const actionColors: Record<string, string> = {
    login: 'text-emerald-400',
    logout: 'text-gray-400',
    role_change: 'text-red-400',
    status_change: 'text-amber-400',
    create: 'text-blue-400',
    update: 'text-purple-400',
    delete: 'text-red-400',
    super_admin_bootstrap: 'text-amber-400',
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          </div>
          <p className="text-gray-500 mt-1">Track all system activities, role changes, and security events</p>
        </div>
        <div className="px-3 py-1.5 bg-red-500/5 border border-red-500/20 rounded-lg">
          <span className="text-xs text-red-400 font-medium">Super Admin Only</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search audit logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-red-500/50"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          title="Filter by action"
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-red-500/50"
        >
          <option value="all">All Actions</option>
          <option value="role_change">Role Changes</option>
          <option value="status_change">Status Changes</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="super_admin_bootstrap">Bootstrap</option>
        </select>
      </div>

      <Card variant="bordered" className="bg-white border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-[#FBE7CC] rounded animate-pulse" style={{ width: `${[70, 55, 85, 65, 45][j]}%`, animationDelay: `${i * 50}ms` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No audit logs found</td></tr>
              ) : (
                filteredLogs.map((log) => {
                  const changes = log.changes as Record<string, unknown> | null
                  const details = changes
                    ? Object.entries(changes)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')
                    : '-'

                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${actionColors[log.action] || 'text-gray-600'}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.entity_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                        {details}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{log.ip_address || '-'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
