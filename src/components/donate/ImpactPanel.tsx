import { motion } from 'framer-motion'
import { formatNPR } from '../../utils/currency'

interface ImpactPanelProps {
  amount: number
  frequency: 'one-time' | 'monthly' | 'annual'
}

export function ImpactPanel({ amount, frequency }: ImpactPanelProps) {
  const metrics = [
    {
      value: Math.max(1, Math.floor(amount / 200)),
      unit: 'month' + (Math.floor(amount / 200) > 1 ? 's' : ''),
      description: 'of daily meals for a student',
    },
    {
      value: Math.max(1, Math.floor(amount / 400)),
      unit: 'set' + (Math.floor(amount / 400) > 1 ? 's' : ''),
      description: 'of books, stationery & supplies',
    },
    {
      value: Math.max(1, Math.floor(amount / 1000)),
      unit: 'week' + (Math.floor(amount / 1000) > 1 ? 's' : ''),
      description: 'of quality education support',
    },
    {
      value: Math.max(1, Math.floor(amount / 5000)),
      unit: 'student' + (Math.floor(amount / 5000) > 1 ? 's' : ''),
      description: 'directly benefiting from your support',
    },
  ]

  const monthlyEquivalent = frequency === 'annual' ? Math.round(amount / 12) : amount

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="rounded-xl border border-amber-200 bg-warm-50 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-1">
            Your Impact Preview
          </h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-light text-[#0f172a]">
              {formatNPR(amount)}
            </span>
            <span className="text-sm text-gray-600">
              {frequency !== 'one-time' ? '/month' : ''}
            </span>
          </div>
          {frequency !== 'one-time' && (
            <p className="text-xs text-gray-600 mt-1">
              {frequency === 'annual'
                ? <>{formatNPR(monthlyEquivalent)} monthly equivalent</>
                : `Sustained monthly sponsorship`}
            </p>
          )}
        </div>

        <div className="px-6 py-5 space-y-3">
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.description}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.08 }}
            >
              <span className="text-2xl font-medium text-amber-600 tabular-nums">
                {metric.value} {metric.unit}
              </span>
              <p className="text-xs text-gray-600">{metric.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-sm text-gray-600 mb-1">Estimated sponsorship duration:</p>
            <p className="text-sm font-medium text-[#0f172a]">
              {amount >= 10000
                ? 'Full monthly sponsorship for one student'
                : amount >= 5000
                  ? 'Comprehensive support package'
                  : amount >= 1000
                    ? 'Essential supplies & materials'
                    : 'Targeted student assistance'}
            </p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-4"
      >
        <div className="rounded-xl border border-amber-200 bg-warm-50 px-6 py-4">
          <p className="text-sm font-medium text-[#0f172a] mb-0.5">Why Donate?</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Every contribution, no matter the size, creates ripples of opportunity.
            Your support helps break the cycle of poverty through education.
          </p>
          <a
            href="/transparency"
            className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium mt-2"
          >
            See how funds are used
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}
