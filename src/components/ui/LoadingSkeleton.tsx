interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

function SkeletonPulse({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`bg-[#FBE7CC] rounded shimmer-bg ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

function Skeletons({ count = 1, className }: { count?: number; className?: string }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPulse key={i} className={className} />
      ))}
    </>
  )
}

export function CardSkeleton() {
  return (
    <div
      className="bg-[#FFF8F0] rounded-xl p-6 shadow-sm border border-[#FBE7CC]"
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
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div
      className="bg-[#FFF8F0] rounded-xl p-5 shadow-sm border border-[#FBE7CC]"
      role="status"
      aria-label="Loading stat"
    >
      <div className="flex items-center justify-between mb-3">
        <SkeletonPulse className="h-3 w-20" />
        <SkeletonPulse className="h-8 w-8 rounded-lg" />
      </div>
      <SkeletonPulse className="h-7 w-28 mb-1" />
      <SkeletonPulse className="h-3 w-16" />
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-[#FFF8F0] rounded-xl shadow-sm border border-[#FBE7CC] overflow-hidden" role="status" aria-label="Loading table">
      <div className="p-4 border-b border-[#FBE7CC]">
        <div className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <SkeletonPulse key={i} className={`h-4 ${i === 0 ? 'w-48' : 'w-24'}`} />
          ))}
        </div>
      </div>
      <div className="divide-y divide-[#FBE7CC]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <SkeletonPulse key={j} className={`h-3 ${j === 0 ? 'w-3/4' : 'w-1/4'}`} />
            ))}
            <SkeletonPulse className="h-8 w-20 rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableSkeleton rows={4} />
        <div className="bg-[#FFF8F0] rounded-xl p-6 shadow-sm border border-[#FBE7CC]">
          <SkeletonPulse className="h-4 w-24 mb-4" />
          <SkeletonPulse className="h-48 w-full rounded-lg" />
        </div>
      </div>
      <div className="bg-[#FFF8F0] rounded-xl p-6 shadow-sm border border-[#FBE7CC]">
        <SkeletonPulse className="h-4 w-32 mb-4" />
        <div className="space-y-3">
          <Skeletons count={3} className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="bg-[#FFF8F0] rounded-xl p-6 shadow-sm border border-[#FBE7CC]" role="status" aria-label="Loading profile">
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

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading list">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-[#FFF8F0] rounded-lg p-4 border border-[#FBE7CC] flex items-center gap-3">
          <SkeletonPulse className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <SkeletonPulse className="h-3 w-3/4" />
            <SkeletonPulse className="h-3 w-1/2" />
          </div>
          <SkeletonPulse className="h-6 w-16 rounded" />
        </div>
      ))}
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-[400px] md:h-[500px] bg-[#FFF8F0] rounded-xl" role="status" aria-label="Loading hero">
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <SkeletonPulse className="h-6 w-32 rounded-full" />
        <SkeletonPulse className="h-10 w-72 md:w-96" />
        <SkeletonPulse className="h-10 w-48" />
        <SkeletonPulse className="h-4 w-64 md:w-80 mt-4" />
        <SkeletonPulse className="h-4 w-56" />
        <div className="flex gap-3 mt-4">
          <SkeletonPulse className="h-12 w-36 rounded-full" />
          <SkeletonPulse className="h-12 w-36 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="bg-[#FFF8F0] rounded-xl p-6 shadow-sm border border-[#FBE7CC] space-y-5" role="status" aria-label="Loading form">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <SkeletonPulse className="h-3 w-24 mb-2" />
          <SkeletonPulse className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <SkeletonPulse className="h-10 w-32 rounded-lg" />
    </div>
  )
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading page">
      <SkeletonPulse className="h-8 w-64" />
      <SkeletonPulse className="h-4 w-96" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-5/6" />
          <SkeletonPulse className="h-4 w-4/6" />
          <SkeletonPulse className="h-64 w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <SkeletonPulse className="h-40 w-full rounded-lg" />
          <SkeletonPulse className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function StudentCardSkeleton() {
  return (
    <div
      className="bg-[#FFF8F0] rounded-xl overflow-hidden shadow-sm border border-[#FBE7CC]"
      role="status"
      aria-label="Loading student card"
    >
      <SkeletonPulse className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <SkeletonPulse className="h-5 w-32" />
        <SkeletonPulse className="h-3 w-24" />
        <SkeletonPulse className="h-6 w-20 rounded-full" />
        <div className="flex gap-2 pt-2">
          <SkeletonPulse className="h-9 w-full rounded-lg" />
          <SkeletonPulse className="h-9 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Loading gallery">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[#FFF8F0] rounded-xl overflow-hidden shadow-sm border border-[#FBE7CC]">
          <SkeletonPulse className="h-48 w-full" />
          <div className="p-3">
            <SkeletonPulse className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function NewsCardSkeleton() {
  return (
    <div
      className="bg-[#FFF8F0] rounded-xl overflow-hidden shadow-sm border border-[#FBE7CC]"
      role="status"
      aria-label="Loading news"
    >
      <SkeletonPulse className="h-40 w-full" />
      <div className="p-4 space-y-2">
        <SkeletonPulse className="h-3 w-20" />
        <SkeletonPulse className="h-5 w-3/4" />
        <SkeletonPulse className="h-3 w-full" />
        <SkeletonPulse className="h-3 w-2/3" />
      </div>
    </div>
  )
}

export function ActivitySkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading activities">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-[#FFF8F0] rounded-lg border border-[#FBE7CC]">
          <SkeletonPulse className="h-8 w-8 rounded-full shrink-0 mt-1" />
          <div className="flex-1 space-y-1.5">
            <SkeletonPulse className="h-3 w-3/4" />
            <SkeletonPulse className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-[#FFF8F0] rounded-xl p-6 shadow-sm border border-[#FBE7CC]" role="status" aria-label="Loading chart">
      <SkeletonPulse className="h-4 w-32 mb-4" />
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonPulse key={i} className={`flex-1 rounded-t-lg`} style={{ height: `${30 + Math.random() * 60}%` }} />
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonPulse key={i} className="flex-1 h-3" />
        ))}
      </div>
    </div>
  )
}
