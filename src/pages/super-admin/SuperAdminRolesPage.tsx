import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { RoleBadge } from '../../components/RoleBadge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ToastContainer } from '../../components/ToastContainer'
import { useToast } from '../../hooks/useToast'
import type { Role, PermissionCode } from '../../types/permissions'
import { ROLE_NAMES, ROLE_DESCRIPTIONS, ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '../../types/permissions'

async function getRoleId(roleName: Role): Promise<string | null> {
  const { data } = await supabase.from('roles').select('id').eq('name', roleName).maybeSingle()
  return data?.id ?? null
}

async function getPermissionCodesForRoleId(roleId: string): Promise<string[]> {
  const { data } = await supabase
    .from('role_permissions')
    .select('permissions!inner(code)')
    .eq('role_id', roleId)
  if (!data) return []
  return data.map(r => (r.permissions as { code: string }).code)
}

async function getPermissionIdsForCodes(codes: string[]): Promise<Map<string, string>> {
  const { data } = await supabase
    .from('permissions')
    .select('id, code')
    .in('code', codes)
  const map = new Map<string, string>()
  if (data) data.forEach(p => map.set(p.code, p.id))
  return map
}

function PermissionGroupCard({
  group,
  rolePermissions,
  onToggle,
}: {
  group: { group: string; permissions: { code: PermissionCode; name: string; description: string }[] }
  rolePermissions: Set<string>
  onToggle: (code: PermissionCode, checked: boolean) => void
}) {
  const allChecked = group.permissions.every(p => rolePermissions.has(p.code))
  const someChecked = group.permissions.some(p => rolePermissions.has(p.code))

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">{group.group}</h4>
        <button
          onClick={() => group.permissions.forEach(p => onToggle(p.code, !allChecked))}
          className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
            allChecked ? 'bg-emerald-100 text-emerald-700' : someChecked ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {allChecked ? 'All On' : someChecked ? 'Partial' : 'All Off'}
        </button>
      </div>
      <div className="p-3 space-y-1">
        {group.permissions.map(p => {
          const isChecked = rolePermissions.has(p.code)
          return (
            <label key={p.code} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div
                onClick={() => onToggle(p.code, !isChecked)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                  isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {isChecked && <span className="text-white text-xs font-bold">&#10003;</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">{p.name}</p>
                <p className="text-xs text-gray-500">{p.description}</p>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export function SuperAdminRolesPage() {
  const [selectedRole, setSelectedRole] = useState<Role>('admin')
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set())
  const [originalPermissions, setOriginalPermissions] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toasts, addToast, removeToast } = useToast()

  const loadRolePermissions = useCallback(async (role: Role) => {
    setLoading(true)
    try {
      const defaults = DEFAULT_ROLE_PERMISSIONS[role] || []

      if (role === 'super_admin') {
        const allPerms = new Set<string>(defaults as string[])
        setRolePermissions(allPerms)
        setOriginalPermissions(new Set(allPerms))
      } else {
        const roleId = await getRoleId(role)
        if (roleId) {
          const codes = await getPermissionCodesForRoleId(roleId)
          if (codes.length > 0) {
            const dbPerms = new Set<string>(codes)
            setRolePermissions(dbPerms)
            setOriginalPermissions(new Set(dbPerms))
          } else {
            const defaultPerms = new Set<string>(defaults as string[])
            setRolePermissions(defaultPerms)
            setOriginalPermissions(new Set(defaultPerms))
          }
        } else {
          const defaultPerms = new Set<string>(defaults as string[])
          setRolePermissions(defaultPerms)
          setOriginalPermissions(new Set(defaultPerms))
        }
      }
    } catch {
      addToast('Failed to load permissions', 'error')
      const defaults = new Set<string>((DEFAULT_ROLE_PERMISSIONS[role] || []) as string[])
      setRolePermissions(defaults)
      setOriginalPermissions(new Set(defaults))
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    loadRolePermissions(selectedRole)
  }, [selectedRole, loadRolePermissions])

  const handleToggle = async (code: PermissionCode, checked: boolean) => {
    const next = new Set(rolePermissions)
    if (checked) next.add(code); else next.delete(code)
    setRolePermissions(next)
  }

  const handleSave = async () => {
    if (selectedRole === 'super_admin') {
      addToast('Super Admin permissions cannot be modified', 'warning')
      return
    }

    setSaving(true)
    try {
      const roleId = await getRoleId(selectedRole)
      if (!roleId) throw new Error('Role not found')

      const codeToId = await getPermissionIdsForCodes([...rolePermissions, ...originalPermissions])
      const toAdd = [...rolePermissions].filter(c => !originalPermissions.has(c))
      const toRemove = [...originalPermissions].filter(c => !rolePermissions.has(c))

      if (toRemove.length > 0) {
        const removeIds = toRemove.map(c => codeToId.get(c)).filter(Boolean) as string[]
        const { error: delError } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', roleId)
          .in('permission_id', removeIds)
        if (delError) throw delError
      }

      if (toAdd.length > 0) {
        const insertRows = toAdd
          .map(c => ({ role_id: roleId, permission_id: codeToId.get(c) }))
          .filter(r => r.permission_id) as { role_id: string; permission_id: string }[]
        const { error: insError } = await supabase
          .from('role_permissions')
          .insert(insertRows)
        if (insError) throw insError
      }

      const auditError = await supabase.rpc('log_audit_event', {
        p_user_id: (await supabase.auth.getSession()).data.session?.user?.id,
        p_action: 'roles.permissions_updated',
        p_entity_type: 'role_permissions',
        p_entity_id: selectedRole,
        p_changes: { added: toAdd, removed: toRemove },
        p_metadata: null,
      } as never)
      if (auditError) { /* log silently */ }

      setOriginalPermissions(new Set(rolePermissions))
      addToast('Permissions saved successfully', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save permissions', 'error')
      setRolePermissions(new Set(originalPermissions))
    } finally {
      setSaving(false)
    }
  }

  const roles: Role[] = ['super_admin', 'admin', 'finance_manager', 'teacher', 'donor', 'volunteer', 'public_user']
  const hasChanges = [...rolePermissions].sort().join(',') !== [...originalPermissions].sort().join(',')

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-500 mt-1">Configure permissions for each role</p>
        </div>
        <div className="px-3 py-1.5 bg-red-500/5 border border-red-500/20 rounded-lg">
          <span className="text-xs text-red-400 font-medium">Super Admin Access</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedRole === role
                ? 'bg-amber-100 text-amber-800 border border-amber-200 shadow-sm'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <RoleBadge role={role} size="sm" />
          </button>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="text-sm text-amber-800">
          <p className="font-medium">{ROLE_NAMES[selectedRole]}</p>
          <p className="mt-1">{ROLE_DESCRIPTIONS[selectedRole]}</p>
          {selectedRole === 'super_admin' && (
            <p className="mt-1 text-amber-600 font-medium">Super Admin permissions are fixed and cannot be modified.</p>
          )}
        </div>
      </div>

      <Card variant="bordered" className="bg-white border-gray-100 p-6">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : (
          <div className="space-y-4">
            {ALL_PERMISSIONS.map((group) => (
              <PermissionGroupCard
                key={group.group}
                group={group}
                rolePermissions={rolePermissions}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </Card>

      {hasChanges && selectedRole !== 'super_admin' && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => { setRolePermissions(new Set(originalPermissions)) }}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <><LoadingSpinner size="sm" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}
