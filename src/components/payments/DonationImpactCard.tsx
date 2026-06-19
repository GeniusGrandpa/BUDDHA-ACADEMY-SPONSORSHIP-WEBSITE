import { motion } from 'framer-motion'
import { formatNPR } from '../../utils/currency'

const impacts = [
  {
    perAmount: 200,
    narrative: (count: number) =>
      count > 1
        ? `nutritious meals for ${count} months`
        : 'nutritious meals for one month',
  },
  {
    perAmount: 500,
    narrative: (count: number) =>
      count > 1
        ? `books & supplies for ${count} terms`
        : 'books & supplies for one term',
  },
  {
    perAmount: 1000,
    narrative: (count: number) =>
      count > 1
        ? `quality education for ${count} months`
        : 'quality education for one month',
  },
  {
    perAmount: 5000,
    narrative: () => 'full sponsorship for a student for one month',
  },
]

interface DonationImpactCardProps {
  amount: number
}

export function DonationImpactCard({ amount }: DonationImpactCardProps) {
  const applicableImpacts = impacts
    .filter(i => amount >= i.perAmount)
    .map(i => ({
      ...i,
      count: Math.floor(amount / i.perAmount),
    }))

  if (applicableImpacts.length === 0) return null

  const progressToFullSponsorship = Math.min(100, Math.round((amount / 5000) * 100))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5"
    >
      <h3 className="font-semibold text-gray-900 mb-1">Your Impact</h3>
      <p className="text-sm text-gray-500 mb-4">
        <span className="font-medium text-amber-700">{formatNPR(amount)}</span> helps provide:
      </p>

      <div className="space-y-2.5">
        {applicableImpacts.map((impact, idx) => (
            <motion.div
              key={impact.perAmount}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/80 rounded-lg p-3"
            >
              <p className="text-sm font-medium text-gray-900">
                {impact.narrative(impact.count)}
              </p>
            </motion.div>
          ))}
      </div>

      {progressToFullSponsorship < 100 && (
        <div className="mt-4 pt-4 border-t border-amber-200">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Progress to full sponsorship</span>
            <span>{progressToFullSponsorship}%</span>
          </div>
          <div className="h-2 bg-amber-200/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToFullSponsorship}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Full sponsorship for one student is NPR 5,000/month
          </p>
        </div>
      )}
    </motion.div>
  )
}
