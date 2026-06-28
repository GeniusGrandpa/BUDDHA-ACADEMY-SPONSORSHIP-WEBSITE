import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { fadeInUp } from '../animations'
import type { Donation } from '../../../types/database'

interface DonationChartProps {
  donations: Donation[]
}

function aggregateByMonth(donations: Donation[]) {
  const map = new Map<string, number>()
  donations.forEach(d => {
    const key = new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    map.set(key, (map.get(key) || 0) + d.amount)
  })
  return Array.from(map, ([month, amount]) => ({ month, amount })).reverse()
}

export function DonationChart({ donations }: DonationChartProps) {
  const data = aggregateByMonth(donations)

  if (data.length === 0) return null

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-white rounded-2xl border border-gray-100 p-5 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Contributions</h2>
      <div className="h-64 min-w-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '14px',
              }}
              formatter={(value) => [value, 'Donated']}
            />
            <Bar
              dataKey="amount"
              fill="url(#donationGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
            <defs>
              <linearGradient id="donationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
