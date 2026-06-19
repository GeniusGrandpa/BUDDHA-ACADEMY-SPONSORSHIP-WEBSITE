import type { Role } from '../types/permissions'
import { ROLE_NAMES, ROLE_COLORS } from '../types/permissions'

interface RoleBadgeProps {
  role: Role
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function RoleBadge({ role, size = 'sm', showLabel = true }: RoleBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses[size]} ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-700'}`}
    >
      {showLabel && (ROLE_NAMES[role] || role)}
    </span>
  )
}
