import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types/permissions'
import { ROLE_LEVELS } from '../types/permissions'
import {
  hasRole,
  isAdminOrAbove,
  isStaffOrAbove,
  canManageRole,
  canAccessSection,
} from '../lib/permissions'

export function useRole() {
  const { profile } = useAuth()

return useMemo(() => ({
     role: profile?.role as Role | undefined,
     isLoading: false,
     isAuthenticated: !!profile,
     roleLevel: profile?.role ? ROLE_LEVELS[profile.role as Role] : 0,
     hasRole: (...roles: Role[]) => hasRole(profile?.role as Role, ...roles),
     isAdminOrAbove: () => isAdminOrAbove(profile?.role as Role),
     isStaffOrAbove: () => isStaffOrAbove(profile?.role as Role),
     canManageRole: (targetRole: Role) => canManageRole(profile?.role as Role, targetRole),
     canAccessSection: (section: string) => canAccessSection(profile?.role as Role, section),
     isSuperAdmin: profile?.role === 'super_admin',
     isAdmin: profile?.role === 'admin',
     isFinanceManager: profile?.role === 'finance_manager',
     isTeacher: profile?.role === 'teacher',
     isDonor: profile?.role === 'donor',
     isVolunteer: profile?.role === 'volunteer',
   }), [profile])
}
