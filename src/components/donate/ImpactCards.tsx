import { motion } from 'framer-motion'
import { useCmsStrings } from '../../context/CmsStringsContext'
import { formatNPR } from '../../utils/currency'
import type { ImpactBreakdown } from './types'

interface ImpactCardsProps {
  amounts: ImpactBreakdown[]
  selectedAmount: number
  onSelect: (amount: number) => void
}

export function ImpactCards({ amounts, selectedAmount, onSelect }: ImpactCardsProps) {
  const { t } = useCmsStrings()
  return (
    <section className="py-16 sm:py-20 bg-[#fffaf5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-light text-[#0f172a] mb-4">
            {t('impact_cards_title')}{' '}
            <span className="font-medium text-[#d97706]">{t('impact_cards_highlight')}</span>
          </h2>
          <p className="text-gray-600 font-light max-w-xl mx-auto">
            {t('impact_cards_description')}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {amounts.map((item, index) => {
            const isSelected = selectedAmount === item.amount

            return (
              <motion.button
                key={item.amount}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onClick={() => onSelect(item.amount)}
                className={`relative group text-left w-full rounded-xl border transition-all duration-300 ${
                  isSelected
                    ? 'border-amber-300 bg-amber-50 shadow-sm shadow-amber-100/50'
                    : 'border-amber-200 bg-warm-50 hover:border-amber-300 hover:shadow-sm hover:-translate-y-0.5'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="impactHighlight"
                    className="absolute inset-0 rounded-xl ring-1 ring-amber-400/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="p-5 sm:p-6">
                  <p className="text-2xl font-light text-[#0f172a] mb-1">
                    {formatNPR(item.amount)}
                  </p>

                  <p className="text-sm font-medium text-[#0f172a] mb-1.5">{item.label}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
