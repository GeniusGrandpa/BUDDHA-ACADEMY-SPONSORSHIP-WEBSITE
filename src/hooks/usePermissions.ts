import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Role, PermissionCode } from '../types/permissions'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canEdit,
  canDelete,
  canManageUsers,
  canViewFinancials,
  canManageContent,
  canAccessSection,
} from '../lib/permissions'

export function usePermissions(userPermissions?: PermissionCode[]) {
  const { profile } = useAuth()
  const userRole = profile?.role as Role | undefined

  return useMemo(() => ({
    permissions: userPermissions || [],
    hasPermission: (permission: PermissionCode) => hasPermission(userRole, permission, userPermissions),
    hasAnyPermission: (permissions: PermissionCode[]) => hasAnyPermission(userRole, permissions, userPermissions),
    hasAllPermissions: (permissions: PermissionCode[]) => hasAllPermissions(userRole, permissions, userPermissions),
    canEdit: (entityType: string) => canEdit(userRole, entityType),
    canDelete: (entityType: string) => canDelete(userRole, entityType),
    canManageUsers: () => canManageUsers(userRole),
    canViewFinancials: () => canViewFinancials(userRole),
    canManageContent: () => canManageContent(userRole),
    canAccessSection: (section: string) => canAccessSection(userRole, section),
  }), [userRole, userPermissions])
}
