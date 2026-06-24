import { motion } from 'framer-motion'
import { useCmsStrings } from '../../context/CmsStringsContext'
import { formatNPR } from '../../utils/currency'

interface ImpactPanelProps {
  amount: number
  frequency: 'one-time' | 'monthly' | 'annual'
}

export function ImpactPanel({ amount, frequency }: ImpactPanelProps) {
  const { t } = useCmsStrings()
  const metricConfigs = [
    { divisor: 200, key: 'impact_metric_meals' },
    { divisor: 400, key: 'impact_metric_supplies' },
    { divisor: 1000, key: 'impact_metric_education' },
    { divisor: 5000, key: 'impact_metric_benefiting' },
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
            {t('impact_heading')}
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
                ? <>{t('impact_monthly_equivalent', { amount: formatNPR(monthlyEquivalent) })}</>
                : t('impact_sustained')}
            </p>
          )}
        </div>

        <div className="px-6 py-5 space-y-3">
          {metricConfigs.map((cfg, idx) => {
            const value = Math.max(1, Math.floor(amount / cfg.divisor))
            return (
              <motion.div
                key={cfg.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.08 }}
              >
                <span className="text-2xl font-medium text-amber-600 tabular-nums">
                  {value}x
                </span>
                <p className="text-xs text-gray-600">{t(cfg.key)}</p>
              </motion.div>
            )
          })}
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-sm text-gray-600 mb-1">{t('impact_duration_label')}</p>
            <p className="text-sm font-medium text-[#0f172a]">
              {amount >= 10000
                ? t('impact_duration_full')
                : amount >= 5000
                  ? t('impact_duration_comprehensive')
                  : amount >= 1000
                    ? t('impact_duration_essentials')
                    : t('impact_duration_targeted')}
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
          <p className="text-sm font-medium text-[#0f172a] mb-0.5">{t('impact_why_donate')}</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            {t('impact_why_donate_desc')}
          </p>
          <a
            href="/transparency"
            className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium mt-2"
          >
            {t('impact_see_funds')}
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}
