interface StatusBadgeProps {
  status: 'published' | 'draft' | 'hidden' | 'scheduled' | 'visible' | 'hidden_section'
  size?: 'sm' | 'md'
}

const statusStyles: Record<string, string> = {
  published: 'bg-green-100 text-green-700 border-green-200',
  draft: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  hidden: 'bg-gray-100 text-gray-500 border-gray-200',
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  visible: 'bg-green-100 text-green-700 border-green-200',
  hidden_section: 'bg-gray-100 text-gray-500 border-gray-200',
}

const statusLabels: Record<string, string> = {
  published: 'Published',
  draft: 'Draft',
  hidden: 'Hidden',
  scheduled: 'Scheduled',
  visible: 'Visible',
  hidden_section: 'Hidden',
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const cls = `inline-flex items-center gap-1.5 font-medium rounded-full border ${
    size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  } ${statusStyles[status] || statusStyles.draft}`
  return (
    <span className={cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'published' || status === 'visible' ? 'bg-green-500' :
        status === 'draft' ? 'bg-yellow-500' :
        status === 'hidden' || status === 'hidden_section' ? 'bg-gray-400' : 'bg-blue-500'
      }`} />
      {statusLabels[status] || status}
    </span>
  )
}
