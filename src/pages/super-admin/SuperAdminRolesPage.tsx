import { useMemo } from 'react'
import { Card } from '../../components/ui/Card'
import { RoleBadge } from '../../components/RoleBadge'
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, ROLE_NAMES, ROLE_DESCRIPTIONS } from '../../types/permissions'
import type { Role, PermissionCode } from '../../types/permissions'

export function SuperAdminRolesPage() {
  const roles = useMemo(() => {
    const allRoles: Role[] = [
      'super_admin', 'admin', 'finance_manager', 'teacher',
      'donor', 'volunteer', 'public_user',
    ]
    return allRoles.map(role => ({
      role,
      name: ROLE_NAMES[role],
      description: ROLE_DESCRIPTIONS[role],
      permissions: DEFAULT_ROLE_PERMISSIONS[role],
    }))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          </div>
          <p className="text-gray-500 mt-1">View all role configurations and their assigned permissions</p>
        </div>
        <div className="px-3 py-1.5 bg-red-500/5 border border-red-500/20 rounded-lg">
          <span className="text-xs text-red-400 font-medium">Super Admin Only</span>
        </div>
      </div>

      <Card variant="bordered" className="bg-white border-gray-100 p-4">
        <p className="text-sm text-gray-500">
          This is a read-only view of all roles and their default permissions. Role definitions and
          permission assignments can only be modified via database migrations. Use the User Management
          page to assign roles to individual users.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {roles.map(({ role, description, permissions }) => (
          <Card key={role} variant="bordered" className="bg-white border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <RoleBadge role={role} size="md" />
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{permissions.length} permissions</span>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {ALL_PERMISSIONS.map(group => {
                  const groupPerms = group.permissions.filter(p => (permissions as readonly PermissionCode[]).includes(p.code))
                  if (groupPerms.length === 0) return null
                  return (
                    <div key={group.group}>
                      <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">{group.group}</p>
                      {groupPerms.map(p => (
                        <div key={p.code} className="py-0.5">
                          <span className="text-xs text-gray-700">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
