import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCmsStrings } from '../../context/CmsStringsContext'
import { formatCurrency, type Currency } from '../../utils/currency'
import { useLocalizePath } from '../../hooks/useLocalizePath'

interface ImpactPanelProps {
  amount: number
  currency: Currency
  frequency: 'one-time' | 'monthly' | 'annual'
}

export function ImpactPanel({ amount, currency, frequency }: ImpactPanelProps) {
  const { t } = useCmsStrings()
  const localize = useLocalizePath()
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
            {t('impact_heading')}
          </h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-light text-[#0f172a]">
              {formatCurrency(amount, currency)}
            </span>
            <span className="text-sm text-gray-600">
              {frequency !== 'one-time' ? t('month_suffix') : ''}
            </span>
          </div>
          {frequency !== 'one-time' && (
            <p className="text-xs text-gray-600 mt-1">
              {frequency === 'annual'
                ? <>{t('impact_monthly_equivalent', { amount: formatCurrency(monthlyEquivalent, currency) })}</>
                : t('impact_sustained')}
            </p>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-4"
      >
        <div className="rounded-xl border border-amber-200 bg-warm-50 px-6 py-4">
          <p className="text-sm font-medium text-[#0f172a] mb-0.5">{t('impact_why_donate')}</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            {t('impact_why_donate_desc')}
          </p>
          <Link
            to={localize('/transparency')}
            className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium mt-2"
          >
            {t('impact_see_funds')}
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
