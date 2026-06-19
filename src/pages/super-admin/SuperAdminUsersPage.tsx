import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/ui/Card'
import { RoleBadge } from '../../components/RoleBadge'
import { toast } from 'react-hot-toast'
import type { Role } from '../../types/permissions'
import type { Profile } from '../../types/database'

type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned'

interface ExtendedProfile extends Profile {
  status: UserStatus
  last_login_at: string | null
}

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  loading,
  variant = 'danger',
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
  variant?: 'danger' | 'warning' | 'info'
}) {
  if (!open) return null

  const buttonColors = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-amber-500 hover:bg-amber-600',
    info: 'bg-blue-500 hover:bg-blue-600',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50" onClick={onCancel} />
      <div className="relative bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${buttonColors[variant]}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function SuperAdminUsersPage() {
  const [users, setUsers] = useState<ExtendedProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'role' | 'super_admin' | 'suspend' | 'restore'
    userId: string
    userName: string
    newRole?: string
    currentRole?: string
  } | null>(null)
  const { profile: currentUser } = useAuth()

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers((data || []) as ExtendedProfile[])
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const executeRoleUpdate = async (userId: string, newRole: string) => {
    setUpdating(userId)
    try {
      const { error } = await supabase.rpc('admin_update_role', {
        target_user_id: userId,
        new_role: newRole,
      } as never)
      if (error) throw error
      toast.success('Role updated successfully')
      await loadUsers()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update role'
      toast.error(msg)
    } finally {
      setUpdating(null)
      setConfirmAction(null)
    }
  }

  const updateRole = (user: ExtendedProfile, newRole: string) => {
    if (newRole === 'super_admin') {
      setConfirmAction({
        type: 'super_admin',
        userId: user.id,
        userName: user.full_name,
        newRole,
        currentRole: user.role,
      })
    } else {
      setConfirmAction({
        type: 'role',
        userId: user.id,
        userName: user.full_name,
        newRole,
        currentRole: user.role,
      })
    }
  }

  const updateStatus = async (userId: string, status: UserStatus) => {
    setUpdating(userId)
    try {
      const { error } = await supabase.rpc('admin_update_user_status', {
        target_user_id: userId,
        new_status: status,
      } as never)
      if (error) throw error
      toast.success(`User ${status === 'active' ? 'restored' : 'suspended'} successfully`)
      await loadUsers()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status'
      toast.error(msg)
    } finally {
      setUpdating(null)
    }
  }

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : 'N/A'

  const statusColors: Record<UserStatus, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-gray-100 text-gray-600',
    suspended: 'bg-amber-100 text-amber-700',
    banned: 'bg-red-100 text-red-700',
  }

  const roleOptions: { value: Role; label: string }[] = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'finance_manager', label: 'Finance Manager' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'donor', label: 'Donor' },
  ]

  const getConfirmMessage = () => {
    if (!confirmAction) return ''
    switch (confirmAction.type) {
      case 'super_admin':
        return `Are you sure you want to assign Super Admin access to "${confirmAction.userName}"? This role has full system control including user management, role management, security settings, and all administrative controls. This action is permanently audited.`
      case 'role':
        return `Change "${confirmAction.userName}" role from ${confirmAction.currentRole} to ${confirmAction.newRole}? Their permissions will update immediately.`
      case 'suspend':
        return `Are you sure you want to suspend "${confirmAction.userName}"? They will lose all access to the platform until restored.`
      case 'restore':
        return `Restore "${confirmAction.userName}" account access? They will regain all previous permissions.`
      default:
        return ''
    }
  }

  const getConfirmTitle = () => {
    if (!confirmAction) return ''
    switch (confirmAction.type) {
      case 'super_admin': return 'Promote to Super Admin?'
      case 'role': return 'Confirm Role Change'
      case 'suspend': return 'Suspend User?'
      case 'restore': return 'Restore User?'
      default: return ''
    }
  }

  const getConfirmLabel = () => {
    if (!confirmAction) return ''
    switch (confirmAction.type) {
      case 'super_admin': return 'Promote to Super Admin'
      case 'role': return 'Change Role'
      case 'suspend': return 'Suspend User'
      case 'restore': return 'Restore User'
      default: return ''
    }
  }

  const getConfirmVariant = () => {
    if (!confirmAction) return 'danger' as const
    switch (confirmAction.type) {
      case 'super_admin': return 'warning' as const
      case 'role': return 'info' as const
      case 'suspend': return 'danger' as const
      case 'restore': return 'info' as const
      default: return 'danger' as const
    }
  }

  const handleConfirm = () => {
    if (!confirmAction) return
    switch (confirmAction.type) {
      case 'super_admin':
      case 'role':
        executeRoleUpdate(confirmAction.userId, confirmAction.newRole!)
        break
      case 'suspend':
        updateStatus(confirmAction.userId, 'suspended')
        break
      case 'restore':
        updateStatus(confirmAction.userId, 'active')
        break
    }
  }

  return (
    <div className="space-y-6">
      <ConfirmModal
        open={confirmAction !== null}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        loading={updating !== null}
        variant={getConfirmVariant()}
      />

      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          </div>
          <p className="text-gray-500 mt-1">Manage all platform users, assign roles, and control account status</p>
        </div>
        <div className="px-3 py-1.5 bg-red-500/5 border border-red-500/20 rounded-lg">
          <span className="text-xs text-red-400 font-medium">Super Admin Access</span>
        </div>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-red-500/50"
        />
      </div>

      <Card variant="bordered" className="bg-white border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
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
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No users found</td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = user.id === currentUser?.id
                  const isTargetSuperAdmin = user.role === 'super_admin'

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                            isTargetSuperAdmin
                              ? 'bg-gradient-to-br from-red-500 to-amber-600'
                              : 'bg-gradient-to-br from-amber-400 to-amber-600'
                          }`}>
                            {user.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">{user.full_name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role as Role} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[user.status as UserStatus] || statusColors.active}`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.last_login_at)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {!isSelf && !isTargetSuperAdmin && (
                            <select
                              value={user.role}
                              onChange={(e) => updateRole(user, e.target.value)}
                              disabled={updating === user.id}
                              className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-600 focus:outline-none focus:border-red-500/50"
                            >
                              {roleOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          )}
                          {isTargetSuperAdmin && !isSelf && (
                            <span className="text-xs text-red-400 font-medium">Protected</span>
                          )}
                          {isSelf && (
                            <span className="text-xs text-gray-500 italic">Current user</span>
                          )}
                          {!isSelf && (
                            user.status === 'active' ? (
                              <button
                                onClick={() => setConfirmAction({
                                  type: 'suspend',
                                  userId: user.id,
                                  userName: user.full_name,
                                })}
                                disabled={updating === user.id}
                                className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-red-600 transition-colors"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => setConfirmAction({
                                  type: 'restore',
                                  userId: user.id,
                                  userName: user.full_name,
                                })}
                                disabled={updating === user.id}
                                className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-emerald-600 transition-colors"
                              >
                                Restore
                              </button>
                            )
                          )}
                        </div>
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
