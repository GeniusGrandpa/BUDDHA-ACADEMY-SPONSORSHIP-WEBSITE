export function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' | 'lg' }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    verified: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  }
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'md' ? 'px-3 py-1 text-sm' : 'px-4 py-1.5 text-base'
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
