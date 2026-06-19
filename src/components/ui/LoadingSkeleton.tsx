import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
}

function SkeletonPulse({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  )
}

export function CardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-warm-50 rounded-xl p-6 shadow-sm border border-gray-100"
      role="status"
      aria-label="Loading content"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <SkeletonPulse className="h-4 w-24" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
        <SkeletonPulse className="h-10 w-10 rounded-full" />
      </div>
      <SkeletonPulse className="h-8 w-32 mb-2" />
      <SkeletonPulse className="h-3 w-full mb-1" />
      <SkeletonPulse className="h-3 w-3/4" />
    </motion.div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-warm-50 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <SkeletonPulse className="h-4 w-48" />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <SkeletonPulse className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonPulse className="h-3 w-3/4" />
              <SkeletonPulse className="h-3 w-1/2" />
            </div>
            <SkeletonPulse className="h-8 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableSkeleton rows={4} />
        <div className="bg-warm-50 rounded-xl p-6 shadow-sm border border-gray-100">
          <SkeletonPulse className="h-4 w-24 mb-4" />
          <SkeletonPulse className="h-48 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="bg-warm-50 rounded-xl p-6 shadow-sm border border-gray-100" role="status" aria-label="Loading profile">
      <div className="flex items-center gap-4 mb-6">
        <SkeletonPulse className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <SkeletonPulse className="h-5 w-40" />
          <SkeletonPulse className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-3">
        <SkeletonPulse className="h-3 w-full" />
        <SkeletonPulse className="h-3 w-5/6" />
        <SkeletonPulse className="h-3 w-4/6" />
      </div>
    </div>
  )
}
