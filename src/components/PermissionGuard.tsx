import { useAuth } from '../context/AuthContext'
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../lib/permissions'
import { AccessDenied } from './AccessDenied'
import type { Role, PermissionCode } from '../types/permissions'
import type { ReactNode } from 'react'

interface PermissionGuardProps {
  children: ReactNode
  permission?: PermissionCode
  anyPermission?: PermissionCode[]
  allPermissions?: PermissionCode[]
  roles?: Role[]
  fallback?: ReactNode
  showAccessDenied?: boolean
}

export function PermissionGuard({
  children,
  permission,
  anyPermission,
  allPermissions,
  roles,
  fallback,
  showAccessDenied = true,
}: PermissionGuardProps) {
  const { profile } = useAuth()
  const userRole = profile?.role as Role | undefined

  if (roles && roles.length > 0 && !roles.includes(userRole!)) {
    return fallback ?? (showAccessDenied ? <AccessDenied /> : null)
  }

  if (permission && !hasPermission(userRole, permission)) {
    return fallback ?? (showAccessDenied ? <AccessDenied /> : null)
  }

  if (anyPermission && !hasAnyPermission(userRole, anyPermission)) {
    return fallback ?? (showAccessDenied ? <AccessDenied /> : null)
  }

  if (allPermissions && !hasAllPermissions(userRole, allPermissions)) {
    return fallback ?? (showAccessDenied ? <AccessDenied /> : null)
  }

  return <>{children}</>
}
