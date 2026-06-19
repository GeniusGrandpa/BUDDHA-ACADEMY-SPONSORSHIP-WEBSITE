import { type ReactNode } from 'react'

type Status = 'pending' | 'processing' | 'verified' | 'completed' | 'failed' | 'rejected'

interface StatusBadgeProps {
  status: Status
  children?: ReactNode
  className?: string
}

const statusConfig: Record<Status, { bg: string; text: string; dot: string; pulse?: boolean }> = {
  pending: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    dot: 'bg-orange-400',
    pulse: true,
  },
  processing: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    dot: 'bg-orange-400',
  },
  verified: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  completed: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  failed: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
}

const labels: Record<Status, string> = {
  pending: 'Pending',
  processing: 'Processing',
  verified: 'Verified',
  completed: 'Completed',
  failed: 'Failed',
  rejected: 'Rejected',
}

export function StatusBadge({ status, children, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text} ${className}`}
    >
      <span className={`relative flex h-2 w-2 ${config.pulse ? 'animate-pulse' : ''}`}>
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${config.dot} ${config.pulse ? 'animate-ping opacity-75' : ''}`}
        />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dot}`} />
      </span>
      {children || labels[status]}
    </span>
  )
}
