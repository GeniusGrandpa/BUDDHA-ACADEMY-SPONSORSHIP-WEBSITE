import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

import { fadeInUp } from '../animations'
import { ALLOCATION_CATEGORY_COLORS, ALLOCATION_CATEGORY_LABELS } from '../../../types/features'
import type { DonationAllocation } from '../../../types/database'
import type { AllocationCategory } from '../../../types/features'
import { formatNPR } from '../../../utils/currency'

interface AllocationBreakdownProps {
  allocations: DonationAllocation[]
}

const ALLOCATION_CATEGORIES_LIST: AllocationCategory[] = [
  'Educational Materials',
  'Student Meals',
  'School Supplies',
  'Uniform Support',
  'Events & Activities',
  'Operations',
]

interface ChartDataItem {
  name: string
  value: number
  percentage: number
  color: string
  category: AllocationCategory
}

export function AllocationBreakdown({ allocations }: AllocationBreakdownProps) {
  const { chartData, totalAmount } = useMemo(() => {
    const groups = new Map<AllocationCategory, number>()

    for (const alloc of allocations) {
      const cat = alloc.category as AllocationCategory
      groups.set(cat, (groups.get(cat) || 0) + alloc.amount)
    }

    const grandTotal = Array.from(groups.values()).reduce((sum, v) => sum + v, 0)

    const data: ChartDataItem[] = ALLOCATION_CATEGORIES_LIST.map((cat) => {
      const amount = groups.get(cat) || 0
      return {
        name: ALLOCATION_CATEGORY_LABELS[cat],
        value: amount,
        percentage: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
        color: ALLOCATION_CATEGORY_COLORS[cat],
        category: cat,
      }
    }).filter((d) => d.value > 0)

    return { chartData: data, totalAmount: grandTotal }
  }, [allocations])

  if (allocations.length === 0) return null

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) => {
    if (!active || !payload?.length) return null
    const data = payload[0].payload
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
          {/* dynamic chart color cannot be expressed as Tailwind class */}
          <span className="font-medium text-gray-900">{data.name}</span>
        </div>
        <p className="text-gray-500">
          {formatNPR(data.value)} <span className="text-gray-400">({data.percentage}%)</span>
        </p>
      </div>
    )
  }

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 mb-8">
      <div className="mb-1">
        <h2 className="text-xl font-bold text-gray-900">Where Your Donations Go</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Your donations helped support meals and educational materials for students this month.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6 mt-6">
        <div className="w-full max-w-xs shrink-0">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center -mt-4">
            <div className="text-2xl font-bold text-gray-900">{formatNPR(totalAmount)}</div>
            <div className="text-xs text-gray-500">Total Allocated</div>
          </div>
        </div>

        <div className="flex-1 w-full space-y-3">
          {chartData.map((item) => (
            <div key={item.category} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              {/* dynamic color from chart data */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 truncate">{item.name}</span>
                  <span className="text-gray-500 ml-2">{item.percentage}%</span>
                </div>
                <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {/* dynamic color from chart data */}
                </div>
              </div>
              <span className="text-xs text-gray-500 w-20 text-right shrink-0">
                {formatNPR(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center italic">
        Every contribution — no matter the size — directly supports education, nutrition, and opportunities for children at Buddha Academy.
      </p>
    </motion.div>
  )
}
