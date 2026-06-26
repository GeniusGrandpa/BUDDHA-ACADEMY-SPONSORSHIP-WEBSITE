import { useCallback } from 'react'
import { useAuth } from '../features/auth/providers/AuthContext'
import type { Role } from '../features/auth/types/permissions'

interface ApiError {
  message: string
  statusCode: number
  code: string
}

function createError(message: string, statusCode: number, code: string): ApiError {
  return { message, statusCode, code }
}

export function useSecureApi() {
  const { user, profile, loading } = useAuth()

  const requireAuthenticated = useCallback(() => {
    if (loading) return
    if (!user) throw createError('Authentication required', 401, 'AUTH_REQUIRED')
  }, [user, loading])

  const requireRole = useCallback((...allowedRoles: Role[]) => {
    requireAuthenticated()
    if (!profile || !allowedRoles.includes(profile.role as Role)) {
      throw createError(
        `Access denied. Required: ${allowedRoles.join(' or ')}`,
        403,
        'FORBIDDEN',
      )
    }
  }, [requireAuthenticated, profile])

  const requireMinRole = useCallback((minRole: Role) => {
    requireAuthenticated()
    if (!profile) throw createError('Profile not found', 401, 'PROFILE_MISSING')

    const roleLevels: Record<Role, number> = {
      super_admin: 100, admin: 90, finance_manager: 80,
      teacher: 60, donor: 40, volunteer: 30, public_user: 10,
    }

    if ((roleLevels[profile.role as Role] ?? 0) < (roleLevels[minRole] ?? 0)) {
      throw createError(
        `Access denied. Minimum role: ${minRole}, your role: ${profile.role}`,
        403,
        'FORBIDDEN',
      )
    }
  }, [requireAuthenticated, profile])

    const secureQuery = useCallback(async <T>(
    query: PromiseLike<{ data: T; error: unknown }>,
    options?: { allowedRoles?: Role[]; minRole?: Role },
  ): Promise<T> => {
    try {
      if (options?.allowedRoles) {
        requireRole(...options.allowedRoles)
      } else if (options?.minRole) {
        requireMinRole(options.minRole)
      } else {
        requireAuthenticated()
      }

      const { data, error } = await query
      if (error) throw error
      return data as T
    } catch (err) {
      if ((err as ApiError).statusCode) throw err
      throw createError(
        (err as Error).message || 'Query failed',
        500,
        'QUERY_ERROR',
      )
    }
  }, [requireAuthenticated, requireRole, requireMinRole])

  return { secureQuery, requireAuthenticated, requireRole, requireMinRole }
}
