import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/ui/Card'
import { RoleBadge } from '../../components/RoleBadge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ToastContainer } from '../../components/ToastContainer'
import { useToast } from '../../hooks/useToast'
import { useRole } from '../../hooks/useRole'
import { ROLE_NAMES } from '../../features/auth/types/permissions'
import type { Role } from '../../types/permissions'
import type { Profile } from '../../types/database'
import { Mail, CheckCircle, XCircle, Loader2, Search } from 'lucide-react'

type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned'

interface ExtendedProfile extends Profile {
  last_login_at: string | null
}

interface UserStats {
  total_users: number
  admins: number
  super_admins: number
  teachers: number
  donors: number
  volunteers: number
  finance_managers: number
  public_users: number
  active_users: number
  suspended_users: number
  banned_users: number
  inactive_users: number
}

interface VerificationInfo {
  email: string
  email_confirmed_at: string | null
  is_verified: boolean
}

const ADMIN_MANAGEABLE_ROLES: Role[] = ['teacher', 'finance_manager', 'donor', 'volunteer', 'public_user']

function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel, loading, variant = 'danger' }: {
  open: boolean; title: string; message: string; confirmLabel: string
  onConfirm: () => void; onCancel: () => void; loading: boolean; variant?: 'danger' | 'warning' | 'info'
}) {
  if (!open) return null
  const buttonColors = { danger: 'bg-red-500 hover:bg-red-600', warning: 'bg-amber-500 hover:bg-amber-600', info: 'bg-emerald-500 hover:bg-emerald-600' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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

export function AdminUsersPage() {
  const { profile: currentUser } = useAuth()
  const { isSuperAdmin, isAdmin } = useRole()
  const [users, setUsers] = useState<ExtendedProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [roleDropdown, setRoleDropdown] = useState<Record<string, string>>({})
  const [confirmAction, setConfirmAction] = useState<{
    type: 'role' | 'suspend' | 'restore' | 'resend_verification'
    userId?: string; userName?: string; newRole?: string; currentRole?: string
  } | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<Record<string, VerificationInfo>>({})
  const [loadingVerification, setLoadingVerification] = useState<Record<string, boolean>>({})
  const { toasts, addToast, removeToast } = useToast()

  const canManageRole = (targetRole: string): boolean => {
    if (isSuperAdmin) return true
    if (isAdmin) return ADMIN_MANAGEABLE_ROLES.includes(targetRole as Role)
    return false
  }

  const getAvailableRoles = (_targetRole: string): Role[] => {
    if (isSuperAdmin) {
      return ['super_admin', 'admin', 'finance_manager', 'teacher', 'donor', 'volunteer', 'public_user']
    }
    return ADMIN_MANAGEABLE_ROLES
  }

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
      addToast('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { loadData() }, [loadData])

  const fetchVerificationStatus = async (userId: string) => {
    if (verificationStatus[userId]) return
    setLoadingVerification(prev => ({ ...prev, [userId]: true }))
    try {
      const result = await supabase.rpc('get_user_verification_status' as never, { target_user_id: userId } as never)
      const typed = result as unknown as { data: VerificationInfo; error: unknown }
      if (!typed.error && typed.data) {
        setVerificationStatus(prev => ({ ...prev, [userId]: typed.data }))
      }
    } catch {
    } finally {
      setLoadingVerification(prev => ({ ...prev, [userId]: false }))
    }
  }

  const executeRoleUpdate = async (userId: string, newRole: string) => {
    setUpdating(userId)
    try {
      const { error } = await (supabase.rpc('admin_update_user_role' as never, { target_user_id: userId, new_role: newRole } as never) as unknown as Promise<{ error: unknown }>)
      if (error) throw error
      addToast('Role updated successfully', 'success')
      await loadData()
      setRoleDropdown(prev => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update role. Please try again.', 'error')
      setRoleDropdown(prev => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
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
      addToast(`User ${status === 'active' ? 'restored' : 'suspended'} successfully`, 'success')
      await loadData()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update status', 'error')
    } finally {
      setUpdating(null)
      setConfirmAction(null)
    }
  }

  const resendVerification = async (email: string, userId: string) => {
    setUpdating(userId)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
      addToast('Verification email sent successfully', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to send verification email', 'error')
    } finally {
      setUpdating(null)
      setConfirmAction(null)
    }
  }

  const handleRoleChangeClick = (userId: string, newRole: string) => {
    const user = users.find(u => u.id === userId)
    setConfirmAction({
      type: 'role',
      userId,
      userName: user?.full_name || '',
      newRole,
      currentRole: user?.role,
    })
  }

  const filteredUsers = users.filter(u => {
    if (search && !u.full_name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (statusFilter !== 'all' && u.status !== statusFilter) return false
    return true
  })

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : 'N/A'

  const statusColors: Record<UserStatus, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-gray-100 text-gray-600',
    suspended: 'bg-amber-100 text-amber-700',
    banned: 'bg-red-100 text-red-700',
  }

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'finance_manager', label: 'Finance' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'donor', label: 'Donor' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'public_user', label: 'User' },
  ]

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <ConfirmModal
        open={confirmAction !== null}
        title={
          confirmAction?.type === 'role' ? 'Change Role?' :
          confirmAction?.type === 'suspend' ? 'Suspend User?' :
          confirmAction?.type === 'restore' ? 'Restore User?' :
          'Resend Verification?'
        }
        message={
          confirmAction?.type === 'role'
            ? `Change "${confirmAction.userName}" role from ${confirmAction.currentRole} to ${confirmAction.newRole}?`
            : confirmAction?.type === 'suspend'
            ? `Suspend "${confirmAction.userName}"? They will lose platform access.`
            : confirmAction?.type === 'restore'
            ? `Restore "${confirmAction.userName}" account access?`
            : `Send a new verification email to ${confirmAction?.userName}?`
        }
        confirmLabel={
          confirmAction?.type === 'role' ? 'Change Role' :
          confirmAction?.type === 'suspend' ? 'Suspend' :
          confirmAction?.type === 'restore' ? 'Restore' :
          'Send Email'
        }
        onConfirm={() => {
          if (!confirmAction) return
          switch (confirmAction.type) {
            case 'role': executeRoleUpdate(confirmAction.userId!, confirmAction.newRole!); break
            case 'suspend': updateStatus(confirmAction.userId!, 'suspended'); break
            case 'restore': updateStatus(confirmAction.userId!, 'active'); break
            case 'resend_verification': {
              const u = users.find(user => user.id === confirmAction.userId)
              if (u) resendVerification(u.email, u.id)
              break
            }
          }
        }}
        onCancel={() => setConfirmAction(null)}
        loading={updating !== null}
        variant={confirmAction?.type === 'restore' ? 'info' : confirmAction?.type === 'resend_verification' ? 'info' : 'danger'}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">
            {isSuperAdmin ? 'Manage all platform users, assign roles, and control account status' : 'Manage users, update roles (non-admin), and control account status'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <div className="px-3 py-1.5 bg-red-500/5 border border-red-500/20 rounded-lg">
              <span className="text-xs text-red-400 font-medium">Super Admin Access</span>
            </div>
          )}
          {isAdmin && (
            <div className="px-3 py-1.5 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <span className="text-xs text-amber-400 font-medium">Admin Access</span>
            </div>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Users', value: stats.total_users, color: 'text-gray-600', bg: 'bg-gray-50' },
            { label: 'Admins', value: stats.admins + stats.super_admins, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Teachers', value: stats.teachers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Donors', value: stats.donors, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Active', value: stats.active_users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search users by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-500/50" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50">
              <option value="all">All Roles</option>
              {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
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
                  const isTargetAdmin = user.role === 'admin'
                  const canEditRole = canManageRole(user.role)
                  const selectedRole = roleDropdown[user.id] ?? user.role
                  const roleChanged = selectedRole !== user.role

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0 ${
                            isTargetSuperAdmin ? 'bg-gradient-to-br from-red-500 to-amber-600' :
                            isTargetAdmin ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                            'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}>
                            {user.full_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{user.full_name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <RoleBadge role={user.role as Role} size="sm" />
                          {(isSuperAdmin || (isAdmin && canEditRole)) && !isSelf && (
                            <div className="relative">
                              <select
                                value={selectedRole}
                                onChange={(e) => {
                                  setRoleDropdown(prev => ({ ...prev, [user.id]: e.target.value }))
                                }}
                                className="text-xs bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:border-amber-500/50"
                                disabled={updating === user.id}
                              >
                                {getAvailableRoles(user.role).map(r => (
                                  <option key={r} value={r}>{ROLE_NAMES[r] || r}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[user.status as UserStatus] || statusColors.active}`}>
                          {user.status || 'active'}
                        </span>
                        {(isSuperAdmin || isAdmin) && !isSelf && (
                          <button
                            onClick={() => {
                              if (user.status === 'active' || user.status === 'suspended') {
                                setConfirmAction({
                                  type: user.status === 'active' ? 'suspend' : 'restore',
                                  userId: user.id,
                                  userName: user.full_name,
                                })
                              }
                            }}
                            disabled={updating === user.id}
                            className="ml-2 text-xs text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
                          >
                            {user.status === 'active' ? 'Suspend' : user.status === 'suspended' ? 'Restore' : ''}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => fetchVerificationStatus(user.id)}
                          className="flex items-center gap-1 text-xs"
                        >
                          {loadingVerification[user.id] ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : verificationStatus[user.id] ? (
                            verificationStatus[user.id].is_verified ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600">
                                <CheckCircle className="w-3 h-3" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-600">
                                <XCircle className="w-3 h-3" /> Unverified
                              </span>
                            )
                          ) : (
                            <span className="text-gray-400 hover:text-gray-600">
                              <Search className="w-3 h-3" /> Check
                            </span>
                          )}
                        </button>
                        {verificationStatus[user.id] && !verificationStatus[user.id].is_verified && (isSuperAdmin || isAdmin) && (
                          <button
                            onClick={() => {
                              const u = users.find(u2 => u2.id === user.id)
                              if (u) resendVerification(u.email, u.id)
                            }}
                            disabled={updating === user.id}
                            className="ml-2 text-xs text-amber-600 hover:text-amber-700 underline disabled:opacity-50"
                          >
                            Resend
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(user.last_login_at)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <span className="text-xs text-gray-500 italic">Current user</span>
                        ) : isTargetSuperAdmin && !isSuperAdmin ? (
                          <span className="text-xs text-red-400 font-medium">Protected</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            {roleChanged && canEditRole && (
                              <>
                                <button
                                  onClick={() => handleRoleChangeClick(user.id, selectedRole)}
                                  disabled={updating === user.id}
                                  className="px-2 py-1 text-xs font-medium text-white bg-amber-500 rounded hover:bg-amber-600 transition-colors disabled:opacity-50"
                                >
                                  {updating === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                                </button>
                                <button
                                  onClick={() => setRoleDropdown(prev => {
                                    const next = { ...prev }
                                    delete next[user.id]
                                    return next
                                  })}
                                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {!roleChanged && verificationStatus[user.id] && !verificationStatus[user.id].is_verified && (
                              <button
                                onClick={() => {
                                  const u = users.find(u2 => u2.id === user.id)
                                  if (u) setConfirmAction({ type: 'resend_verification', userId: u.id, userName: u.email })
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-amber-600 hover:text-amber-700"
                              >
                                <Mail className="w-3 h-3" /> Resend
                              </button>
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
