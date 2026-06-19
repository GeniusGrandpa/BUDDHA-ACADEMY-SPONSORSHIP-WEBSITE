import type { DonationStatus } from '../../../../types/database'

interface StatusBadgeProps {
  status: DonationStatus
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<DonationStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-orange-100', text: 'text-orange-700' },
  processing: { label: 'Processing', bg: 'bg-orange-50', text: 'text-orange-600' },
  verified: { label: 'Verified', bg: 'bg-green-50', text: 'text-green-700' },
  completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  failed: { label: 'Failed', bg: 'bg-red-50', text: 'text-red-700' },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700' },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-50', text: 'text-gray-600' },
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses}`}>
      {config.label}
    </span>
  )
}
