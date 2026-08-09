import { useSiteCurrency } from '../../hooks/useSiteCurrency'
import { formatCurrency } from '../../../../utils/currency'
import type { AllocationCategory } from '../../../../types/features'

interface AllocationBadgeProps {
  category: AllocationCategory
  percentage: number
  amount?: number
  size?: 'sm' | 'md'
}

const CATEGORY_CONFIG: Record<AllocationCategory, { bg: string; text: string }> = {
  'Educational Materials': { bg: 'bg-orange-100 text-orange-700 border-orange-200', text: 'text-orange-700' },
  'Student Meals': { bg: 'bg-orange-50 text-orange-600 border-orange-200', text: 'text-orange-600' },
  'School Supplies': { bg: 'bg-gray-50 text-gray-600 border-gray-200', text: 'text-gray-600' },
  'Uniform Support': { bg: 'bg-green-50 text-green-700 border-green-200', text: 'text-green-700' },
  'Events & Activities': { bg: 'bg-gray-50 text-gray-500 border-gray-200', text: 'text-gray-500' },
  'Operations': { bg: 'bg-gray-100 text-gray-600 border-gray-200', text: 'text-gray-600' },
}

export function AllocationBadge({ category, percentage, amount, size = 'sm' }: AllocationBadgeProps) {
  const config = CATEGORY_CONFIG[category]
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
  const currency = useSiteCurrency()

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.bg} ${sizeClasses}`}>
      <span>{category}</span>
      <span className="opacity-75">({percentage}%)</span>
      {amount !== undefined && (
        <span className="opacity-60 ml-0.5">{formatCurrency(amount, currency)}</span>
      )}
    </span>
  )
}
