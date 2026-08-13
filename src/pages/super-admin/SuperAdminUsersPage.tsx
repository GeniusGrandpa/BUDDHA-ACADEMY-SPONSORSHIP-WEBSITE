import { useCallback, useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/ui/Card'
import { RoleBadge } from '../../components/RoleBadge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../lib/errors'
import type { Role } from '../../features/auth/types/permissions'
import type { Profile } from '../../types/database'
import { Trash2, ShieldCheck } from 'lucide-react'

type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned' | 'deleted'

interface ExtendedProfile extends Profile {
  status: UserStatus
  last_login_at: string | null
}

interface UserStats {
  total_users: number
  super_admins: number
  admins: number
  finance_managers: number
  donors: number
  volunteers: number
  public_users: number
  suspended_users: number
  active_users: number
  banned_users: number
  inactive_users: number
}

interface AuditEntry {
  id: number
  actor_id: string
  actor_name: string
  actor_email: string
  target_id: string
  target_name: string
  target_email: string
  action: string
  entity_type: string
  metadata: Record<string, unknown>
  created_at: string
}

function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel, loading, variant = 'danger' }: {
  open: boolean; title: string; message: string; confirmLabel: string
  onConfirm: () => void; onCancel: () => void; loading: boolean; variant?: 'danger' | 'warning' | 'info'
}) {
  if (!open) return null
  const buttonColors = { danger: 'bg-red-500 hover:bg-red-600', warning: 'bg-amber-500 hover:bg-amber-600', info: 'bg-emerald-500 hover:bg-emerald-600' }
  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50" onClick={onCancel} />
      <div className="relative bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${buttonColors[variant]}`}>
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function ChangeRoleModal({ open, user, onClose, onConfirm, loading }: {
  open: boolean; user: ExtendedProfile | null; onClose: () => void; onConfirm: (userId: string, newRole: string) => void; loading: boolean
}) {
  const [newRole, setNewRole] = useState<string>('')

  useEffect(() => {
    if (user) { setNewRole(user.role) }
  }, [user])

  if (!open || !user) return null

  const roleOptions: { value: Role; label: string }[] = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'finance_manager', label: 'Finance Manager' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'donor', label: 'Donor' },
    { value: 'public_user', label: 'Public User' },
  ]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50" onClick={onClose} />
      <div className="relative bg-white border border-gray-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Change Role</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">User</p>
            <p className="font-medium text-gray-900">{user.full_name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
            <RoleBadge role={user.role as Role} size="sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button
              onClick={() => onConfirm(user.id, newRole)}
              disabled={loading || newRole === user.role}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Changing...' : 'Change Role'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoleHistoryModal({ open, userId, userName, onClose }: {
  open: boolean; userId: string | null; userName: string; onClose: () => void
}) {
  const [history, setHistory] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !userId) return
    setLoading(true)
    const fetchHistory = async () => {
      const result = await supabase.rpc('get_user_role_history' as never, { p_user_id: userId, p_limit: 50 } as never)
      const typed = result as unknown as { data: AuditEntry[]; error: unknown }
      if (!typed.error) setHistory(typed.data || [])
      setLoading(false)
    }
    fetchHistory()
  }, [open, userId])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50" onClick={onClose} />
      <div className="relative bg-white border border-gray-200 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Role History</h3>
            <p className="text-sm text-gray-500">{userName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : history.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No role change history found.</p>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {entry.action.replace(/^(role|status)\./, '')}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(entry.created_at).toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500">
                  By: {entry.actor_name}
                  {typeof entry.metadata === 'object' && entry.metadata && 'previous_role' in entry.metadata && (
                    <span className="ml-2">
                      · From: <span className="font-medium">{String(entry.metadata.previous_role)}</span>
                      {' → '}<span className="font-medium">{String((entry.metadata as Record<string, unknown>).new_role)}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function SuperAdminUsersPage() {
  const [users, setUsers] = useState<ExtendedProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [confirmAction, setConfirmAction] = useState<{
    type: 'super_admin' | 'suspend' | 'restore' | 'bulk_suspend' | 'bulk_restore' | 'delete_user'
    userId?: string; userName?: string; newRole?: string; currentRole?: string
  } | null>(null)
  const [roleModal, setRoleModal] = useState<{ user: ExtendedProfile } | null>(null)
  const [historyModal, setHistoryModal] = useState<{ userId: string; userName: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [relatedRecords, setRelatedRecords] = useState<{ donations: number; sponsorships: number; notifications: number; audit_logs: number } | null>(null)
  const [checkingRecords] = useState<string | null>(null)
  const { profile: currentUser } = useAuth()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersResult, statsResult] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.rpc('get_user_management_stats' as never) as unknown as Promise<{ data: UserStats; error: unknown }>,
      ])
      if (usersResult.error) throw usersResult.error
      setUsers((usersResult.data || []) as ExtendedProfile[])
      if (!statsResult.error) setStats(statsResult.data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const executeRoleUpdate = async (userId: string, newRole: string) => {
    setUpdating(userId)
    try {
      const { error } = await supabase.rpc('admin_update_role', { target_user_id: userId, new_role: newRole } as never)
      if (error) throw error
      toast.success('Role updated successfully')
      await loadData()
      setRoleModal(null)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update role'))
    } finally {
      setUpdating(null)
      setConfirmAction(null)
    }
  }

  const updateStatus = async (userId: string, status: UserStatus) => {
    setUpdating(userId)
    try {
      const { error } = await (supabase.rpc('admin_update_user_status', { target_user_id: userId, new_status: status } as never) as unknown as Promise<{ error: unknown }>)
      if (error) throw error
      toast.success(`User ${status === 'active' ? 'restored' : 'suspended'} successfully`)
      await loadData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update status'))
    } finally {
      setUpdating(null)
      setConfirmAction(null)
    }
  }

  const handleBulkAction = async (action: 'suspend' | 'restore') => {
    setUpdating('bulk')
    try {
      for (const uid of selectedUsers) {
        await supabase.rpc('admin_update_user_status', { target_user_id: uid, new_status: action === 'suspend' ? 'suspended' : 'active' } as never)
      }
      toast.success(`${selectedUsers.size} users ${action === 'suspend' ? 'suspended' : 'restored'}`)
      setSelectedUsers(new Set())
      await loadData()
    } catch (err) {
      toast.error(getErrorMessage(err, `Failed to ${action} users`))
    } finally {
      setUpdating(null)
      setConfirmAction(null)
    }
  }

  const checkRelatedRecords = async (userId: string) => {
    try {
      const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      const result = await Promise.race([
        supabase.rpc('get_user_related_record_counts' as never, { target_user_id: userId } as never),
        timeout
      ])
      const typed = result as unknown as { data: { donations: number; sponsorships: number; notifications: number; audit_logs: number }; error: unknown }
      if (!typed.error && typed.data) {
        return typed.data
      }
      return { donations: 0, sponsorships: 0, notifications: 0, audit_logs: 0 }
    } catch {
      return { donations: 0, sponsorships: 0, notifications: 0, audit_logs: 0 }
    }
  }

  const deleteUser = async (userId: string, reason: string) => {
    setUpdating(userId)
    try {
      const result = await supabase.rpc('admin_delete_user' as never, { target_user_id: userId, delete_reason: reason } as never)
      const typed = result as unknown as { data: { success: boolean; message: string; related_records: { donations: number; sponsorships: number; notifications: number; audit_logs: number }; user_email: string; user_name: string }; error: unknown }
      if (typed.error) throw typed.error
      if (typed.data?.success) {
        toast.success('User deleted successfully. All historical data has been preserved.')
        await loadData()
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete user'))
    } finally {
      setUpdating(null)
      setConfirmAction(null)
    }
  }

  const restoreUser = async (userId: string) => {
    setUpdating(userId)
    try {
      const { error } = await supabase.rpc('admin_restore_user' as never, { target_user_id: userId } as never)
      if (error) throw error
      toast.success('User restored successfully')
      await loadData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to restore user'))
    } finally {
      setUpdating(null)
      setConfirmAction(null)
    }
  }

  const filteredUsers = users.filter(u => {
    if (search && !u.full_name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (statusFilter !== 'all' && u.status !== statusFilter) return false
    return true
  })

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : 'N/A'

  const statusColors: Record<UserStatus, string> = {
    active: 'bg-emerald-100 text-emerald-700', inactive: 'bg-gray-100 text-gray-600',
    suspended: 'bg-amber-100 text-amber-700', banned: 'bg-red-100 text-red-700', deleted: 'bg-purple-100 text-purple-700',
  }

  const getConfirmMessage = () => {
    if (!confirmAction) return ''
    switch (confirmAction.type) {
      case 'super_admin': return `Assign Super Admin to "${confirmAction.userName}"? This role has full system control. This action is permanently audited.`
      case 'suspend': return `Suspend "${confirmAction.userName}"? They will lose all platform access.`
      case 'restore': return `Restore "${confirmAction.userName}" account access?`
      case 'bulk_suspend': return `Suspend ${selectedUsers.size} selected users? They will lose all platform access.`
      case 'bulk_restore': return `Restore ${selectedUsers.size} selected users?`
      case 'delete_user': {
        if (relatedRecords) {
          return `Delete "${confirmAction.userName}"? This will deactivate their account but preserve all historical data: ${relatedRecords.donations} donations, ${relatedRecords.sponsorships} sponsorships, ${relatedRecords.notifications} notifications, ${relatedRecords.audit_logs} audit logs. This action cannot be undone.`
        }
        return `Delete "${confirmAction.userName}"? This will deactivate their account but preserve all historical data. This action cannot be undone.`
      }
      default: return ''
    }
  }

  const roleOptions: { value: Role; label: string }[] = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'finance_manager', label: 'Finance Manager' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'donor', label: 'Donor' },
  ]

  const allSelected = filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length

  const exportUsersCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Joined', 'Last Login']
    const rows = filteredUsers.map(u => [u.full_name, u.email, u.role, u.status, formatDate(u.created_at), formatDate(u.last_login_at)])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'users.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <ConfirmModal
        open={confirmAction !== null}
        title={confirmAction?.type === 'super_admin' ? 'Promote to Super Admin?' : confirmAction?.type === 'suspend' ? 'Suspend User?' : confirmAction?.type === 'restore' ? 'Restore User?' : confirmAction?.type === 'bulk_suspend' ? 'Bulk Suspend?' : confirmAction?.type === 'bulk_restore' ? 'Bulk Restore?' : confirmAction?.type === 'delete_user' ? 'Delete User?' : 'Confirm'}
        message={getConfirmMessage()}
        confirmLabel={confirmAction?.type === 'super_admin' ? 'Promote to Super Admin' : confirmAction?.type === 'suspend' ? 'Suspend User' : confirmAction?.type === 'restore' ? 'Restore User' : confirmAction?.type === 'bulk_suspend' ? 'Suspend All' : confirmAction?.type === 'bulk_restore' ? 'Restore All' : confirmAction?.type === 'delete_user' ? 'Delete User' : 'Confirm'}
        onConfirm={() => {
          if (!confirmAction) return
          switch (confirmAction.type) {
            case 'super_admin': executeRoleUpdate(confirmAction.userId!, confirmAction.newRole!); break
            case 'suspend': updateStatus(confirmAction.userId!, 'suspended'); break
            case 'restore': restoreUser(confirmAction.userId!); break
            case 'bulk_suspend': handleBulkAction('suspend'); break
            case 'bulk_restore': handleBulkAction('restore'); break
            case 'delete_user': deleteUser(confirmAction.userId!, ''); break
          }
        }}
        onCancel={() => {
          setConfirmAction(null)
          setRelatedRecords(null)
        }}
        loading={updating !== null || checkingRecords !== null}
        variant={confirmAction?.type === 'restore' || confirmAction?.type === 'bulk_restore' ? 'info' : confirmAction?.type === 'super_admin' ? 'warning' : 'danger'}
      />
      <ChangeRoleModal
        open={roleModal !== null}
        user={roleModal?.user || null}
        onClose={() => setRoleModal(null)}
        onConfirm={(userId, newRole) => {
          if (newRole === 'super_admin') {
            const user = users.find(u => u.id === userId)
            setConfirmAction({ type: 'super_admin', userId, userName: user?.full_name || '', newRole })
          } else {
            executeRoleUpdate(userId, newRole)
          }
        }}
        loading={updating !== null}
      />
      <RoleHistoryModal
        open={historyModal !== null}
        userId={historyModal?.userId || null}
        userName={historyModal?.userName || ''}
        onClose={() => setHistoryModal(null)}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage all platform users, assign roles, and control account status</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportUsersCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            Export CSV
          </button>
          <div className="px-3 py-1.5 bg-red-500/5 border border-red-500/20 rounded-lg">
            <span className="text-xs text-red-400 font-medium">Super Admin Access</span>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Users', value: stats.total_users, color: 'text-gray-600', bg: 'bg-gray-50' },
            { label: 'Admins', value: stats.admins + stats.super_admins, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Finance', value: stats.finance_managers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Donors', value: stats.donors, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Suspended', value: stats.suspended_users, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((stat) => (
            <Card key={stat.label} variant="bordered" className={`${stat.bg} border-gray-100 p-4`}>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
              <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
        </div>
      )}

      <Card variant="bordered" className="bg-white border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input type="text" placeholder="Search users by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-500/50" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50">
              <option value="all">All Roles</option>
              {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              <option value="public_user">Public User</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
          {selectedUsers.size > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">{selectedUsers.size} selected</span>
              <button onClick={() => setSelectedUsers(new Set())} className="text-xs text-gray-500 hover:text-gray-700">Clear</button>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button onClick={() => setConfirmAction({ type: 'bulk_suspend' })} className="text-xs font-medium text-red-600 hover:text-red-700">Suspend all</button>
              <button onClick={() => setConfirmAction({ type: 'bulk_restore' })} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">Restore all</button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left w-10">
                  <input type="checkbox" checked={allSelected} onChange={() => { if (allSelected) setSelectedUsers(new Set()); else setSelectedUsers(new Set(filteredUsers.map(u => u.id))) }}
                    className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500/30" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500"><LoadingSpinner /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No users found</td></tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = user.id === currentUser?.id
                  const isTargetSuperAdmin = user.role === 'super_admin'
                  const isSelected = selectedUsers.has(user.id)

                  return (
                    <tr key={user.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-amber-50/50' : ''}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={isSelected} onChange={() => {
                          const next = new Set(selectedUsers)
                          if (isSelected) next.delete(user.id); else next.add(user.id)
                          setSelectedUsers(next)
                        }} disabled={isSelf} className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500/30" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0 ${
                            isTargetSuperAdmin ? 'bg-gradient-to-br from-red-500 to-amber-600' : 'bg-gradient-to-br from-amber-400 to-amber-600'
                          }`}>
                            {user.full_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{user.full_name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><RoleBadge role={user.role as Role} size="sm" /></td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[user.status as UserStatus] || statusColors.active}`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(user.last_login_at)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <span className="text-xs text-gray-500 italic">Current user</span>
                        ) : isTargetSuperAdmin && !isSelf ? (
                          <span className="text-xs text-red-400 font-medium">Protected</span>
                        ) : (
                          <div className="relative" ref={dropdownRef}>
                            <button
                              onClick={() => setDropdownOpen(dropdownOpen === user.id ? null : user.id)}
                              disabled={updating === user.id}
                              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {updating === user.id ? <LoadingSpinner size="sm" /> : <span className="text-gray-400 text-sm">Actions</span>}
                            </button>
                            {dropdownOpen === user.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
                                <button onClick={() => { setRoleModal({ user }); setDropdownOpen(null) }}
                                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50">
                                  Change Role
                                </button>
                                <button onClick={() => { setHistoryModal({ userId: user.id, userName: user.full_name }); setDropdownOpen(null) }}
                                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50">
                                  View History
                                </button>
                                <div className="border-t border-gray-100 my-1" />
                                {user.status !== 'deleted' ? (
                                  <button
                                    onClick={() => {
                                      setConfirmAction({ type: 'delete_user', userId: user.id, userName: user.full_name })
                                      setDropdownOpen(null)
                                      checkRelatedRecords(user.id).then(setRelatedRecords)
                                    }}
                                    disabled={checkingRecords === user.id}
                                    className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete User
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => { setConfirmAction({ type: 'restore', userId: user.id, userName: user.full_name }); setDropdownOpen(null) }}
                                    className="w-full px-4 py-2 text-sm text-left text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                  >
                                    <ShieldCheck className="w-3 h-3" />
                                    Restore User
                                  </button>
                                )}
                                {user.status === 'active' && (
                                  <>
                                    <div className="border-t border-gray-100 my-1" />
                                    <button onClick={() => { setConfirmAction({ type: 'suspend', userId: user.id, userName: user.full_name }); setDropdownOpen(null) }}
                                      className="w-full px-4 py-2 text-sm text-left text-amber-600 hover:bg-amber-50">
                                      Suspend
                                    </button>
                                  </>
                                )}
                                {user.status === 'suspended' && (
                                  <>
                                    <div className="border-t border-gray-100 my-1" />
                                    <button onClick={() => { setConfirmAction({ type: 'restore', userId: user.id, userName: user.full_name }); setDropdownOpen(null) }}
                                      className="w-full px-4 py-2 text-sm text-left text-emerald-600 hover:bg-emerald-50">
                                      Restore Access
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
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
