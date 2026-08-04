import type { Role, PermissionCode } from '../types/permissions'
import { ROLE_LEVELS, DEFAULT_ROLE_PERMISSIONS } from '../types/permissions'
import { getSupabaseClient } from '../../../lib/supabase'
const supabase = getSupabaseClient()

export function hasRole(userRole: Role | undefined | null, ...roles: Role[]): boolean {
  if (!userRole) return false
  return roles.includes(userRole)
}

export function hasPermission(
  userRole: Role | undefined | null,
  permission: PermissionCode,
  userPermissions?: PermissionCode[],
): boolean {
  if (!userRole) return false
  if (userRole === 'super_admin') return true
  if (userPermissions && userPermissions.length > 0) return userPermissions.includes(permission)
  const defaults = DEFAULT_ROLE_PERMISSIONS[userRole]
  return defaults ? (defaults as readonly PermissionCode[]).includes(permission) : false
}

export function hasAnyPermission(
  userRole: Role | undefined | null,
  permissions: PermissionCode[],
  userPermissions?: PermissionCode[],
): boolean {
  if (!userRole) return false
  if (userRole === 'super_admin') return true
  return permissions.some(p => hasPermission(userRole, p, userPermissions))
}

export function hasAllPermissions(
  userRole: Role | undefined | null,
  permissions: PermissionCode[],
  userPermissions?: PermissionCode[],
): boolean {
  if (!userRole) return false
  if (userRole === 'super_admin') return true
  return permissions.every(p => hasPermission(userRole, p, userPermissions))
}

export function canEdit(userRole: Role | undefined | null, entityType: string): boolean {
  if (!userRole) return false
  if (userRole === 'super_admin') return true
  const permMap: Record<string, PermissionCode> = {
    students: 'students.update',
    news: 'news.update',
    gallery: 'gallery.update',
    donations: 'donations.update',
    sponsorships: 'sponsorships.update',
    contacts: 'contacts.update',
    users: 'users.update',
    profile: 'profile.update',
  }
  const perm = permMap[entityType]
  return perm ? hasPermission(userRole, perm) : false
}

export function canDelete(userRole: Role | undefined | null, entityType: string): boolean {
  if (!userRole) return false
  if (userRole === 'super_admin') return true
  const permMap: Record<string, PermissionCode> = {
    students: 'students.delete',
    news: 'news.delete',
    gallery: 'gallery.delete',
    donations: 'donations.delete',
    sponsorships: 'sponsorships.delete',
    users: 'users.delete',
    profile: 'profile.delete',
  }
  const perm = permMap[entityType]
  return perm ? hasPermission(userRole, perm) : false
}

export function canManageUsers(userRole: Role | undefined | null): boolean {
  return userRole === 'super_admin'
}

export function canViewFinancials(userRole: Role | undefined | null): boolean {
  if (!userRole) return false
  if (userRole === 'super_admin') return true
  return hasPermission(userRole, 'finances.read')
}

export function canManageContent(userRole: Role | undefined | null): boolean {
  if (!userRole) return false
  if (userRole === 'super_admin') return true
  return hasAnyPermission(userRole, ['content.pages', 'content.homepage', 'content.videos', 'content.faqs', 'content.stories', 'content.media', 'news.create', 'gallery.create'])
}

export function isAdminOrAbove(role: Role | undefined | null): boolean {
  if (!role) return false
  return ROLE_LEVELS[role] >= ROLE_LEVELS.admin
}

export function isStaffOrAbove(role: Role | undefined | null): boolean {
  if (!role) return false
  return ROLE_LEVELS[role] >= ROLE_LEVELS.teacher
}

export function getRoleLevel(role: Role): number {
  return ROLE_LEVELS[role] || 0
}

export function canManageRole(assignerRole: Role | undefined | null, _targetRole: Role): boolean {
  if (!assignerRole) return false
  return assignerRole === 'super_admin'
}

export function canAccessSection(userRole: Role | undefined | null, section: string): boolean {
  if (!userRole) return false
  if (userRole === 'super_admin') return true
  switch (section) {
    case 'payment_settings':
      return ROLE_LEVELS[userRole] >= ROLE_LEVELS.admin
    case 'finance':
    case 'payment_verification':
    case 'donations':
      return ROLE_LEVELS[userRole] >= ROLE_LEVELS.finance_manager
    case 'students':
    case 'attendance':
    case 'progress_reports':
      return ROLE_LEVELS[userRole] >= ROLE_LEVELS.teacher
    case 'content':
    case 'news':
    case 'gallery':
    case 'cms':
      return ROLE_LEVELS[userRole] >= ROLE_LEVELS.admin
    case 'users':
    case 'roles':
    case 'audit':
    case 'super_admin':
      return (userRole as string) === 'super_admin'
    default:
      return false
  }
}

export async function fetchUserPermissions(userId: string): Promise<PermissionCode[]> {
  const rpc = supabase.rpc as unknown as (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>
  const { data, error } = await rpc('get_user_permissions', { user_id: userId })
  if (error) {
    return []
  }
  return data as unknown as PermissionCode[]
}
