import { motion } from 'framer-motion'
import { useCmsStrings } from '../../context/CmsStringsContext'
import { formatNPR } from '../../utils/currency'

const impactAmounts = [200, 500, 1000, 5000]

interface DonationImpactCardProps {
  amount: number
}

export function DonationImpactCard({ amount }: DonationImpactCardProps) {
  const { t } = useCmsStrings()

  const narrative = (perAmount: number, count: number) => {
    if (perAmount === 200) {
      return count > 1 ? t('impact_meals_months', { count }) : t('impact_meals_month')
    }
    if (perAmount === 500) {
      return count > 1 ? t('impact_books_terms', { count }) : t('impact_books_term')
    }
    if (perAmount === 1000) {
      return count > 1 ? t('impact_education_months', { count }) : t('impact_education_month')
    }
    return t('impact_full_month')
  }

  const applicableImpacts = impactAmounts
    .filter(perAmount => amount >= perAmount)
    .map(perAmount => ({
      perAmount,
      count: Math.floor(amount / perAmount),
    }))

  if (applicableImpacts.length === 0) return null

  const progressToFullSponsorship = Math.min(100, Math.round((amount / 5000) * 100))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5"
    >
      <h3 className="font-semibold text-gray-900 mb-1">{t('impact_your_impact')}</h3>
      <p className="text-sm text-gray-500 mb-4">
        <span className="font-medium text-amber-700">{formatNPR(amount)}</span> {t('impact_helps_provide')}
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
                {narrative(impact.perAmount, impact.count)}
              </p>
            </motion.div>
          ))}
      </div>

      {progressToFullSponsorship < 100 && (
        <div className="mt-4 pt-4 border-t border-amber-200">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{t('impact_progress_to_full')}</span>
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
            {t('impact_full_sponsorship_note')}
          </p>
        </div>
      )}
    </motion.div>
  )
}
