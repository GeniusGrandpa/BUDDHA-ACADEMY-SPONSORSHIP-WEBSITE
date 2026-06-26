import { getSupabaseClient } from '../supabase'
import type { Role } from '../../features/auth/types/permissions'

const supabase = getSupabaseClient()

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
    public code: string = 'AUTH_ERROR',
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends Error {
  constructor(
    message: string = 'Insufficient permissions',
    public statusCode: number = 403,
    public code: string = 'FORBIDDEN',
  ) {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export async function requireAuth(): Promise<string> {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session?.user) {
    throw new AuthError('Authentication required. Please log in.')
  }
  return session.user.id
}

export async function requireMinRole(minRole: Role): Promise<void> {
  const userId = await requireAuth()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    throw new AuthError('User profile not found')
  }

  const roleLevels: Record<Role, number> = {
    super_admin: 100,
    admin: 90,
    finance_manager: 80,
    teacher: 60,
    donor: 40,
    volunteer: 30,
    public_user: 10,
  }

  const userLevel = roleLevels[profile.role as Role] ?? 0
  const requiredLevel = roleLevels[minRole] ?? 0

  if (userLevel < requiredLevel) {
    throw new ForbiddenError(
      `Access denied. Required role: ${minRole} or higher. Your role: ${profile.role}`
    )
  }
}

export async function requireRole(allowedRoles: Role[]): Promise<void> {
  const userId = await requireAuth()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    throw new AuthError('User profile not found')
  }

  if (!allowedRoles.includes(profile.role as Role)) {
    throw new ForbiddenError(
      `Access denied. Required one of: ${allowedRoles.join(', ')}. Your role: ${profile.role}`
    )
  }
}

export async function withAuth<T>(fn: () => Promise<T>): Promise<T> {
  await requireAuth()
  return fn()
}
