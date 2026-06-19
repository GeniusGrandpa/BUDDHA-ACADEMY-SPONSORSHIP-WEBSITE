import type { Role } from '../types/permissions'

export const ROLE_REDIRECTS: Record<Role, string> = {
  super_admin: '/admin',
  admin: '/admin',
  finance_manager: '/admin/finance',
  teacher: '/teacher',
  donor: '/dashboard',
  volunteer: '/dashboard',
  public_user: '/',
}

export function getRedirectPath(role: Role): string {
  return ROLE_REDIRECTS[role] || '/'
}
