import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Role, PermissionCode } from '../types/permissions'
import { hasPermission } from '../lib/permissions'

interface ProtectedActionOptions {
  permission?: PermissionCode
  roles?: Role[]
  onUnauthorized?: () => void
}

export function useProtectedAction(options?: ProtectedActionOptions) {
  const { profile } = useAuth()

  const guard = useCallback(<T extends (...args: never[]) => unknown>(action: T): ((...args: Parameters<T>) => void) => {
    return (...args: Parameters<T>) => {
      if (options?.permission && !hasPermission(profile?.role as Role, options.permission)) {
        options.onUnauthorized?.()
        return
      }
      if (options?.roles && !options.roles.includes(profile?.role as Role)) {
        options.onUnauthorized?.()
        return
      }
      action(...args)
    }
  }, [profile?.role, options])

  return { guard }
}
