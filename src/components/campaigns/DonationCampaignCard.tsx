import { motion } from 'framer-motion'
import { useCmsStrings } from '../../context/CmsStringsContext'
import { formatNPR } from '../../utils/currency'
import type { DonationGoal } from '../../types/database'

interface DonationCampaignCardProps {
  goal: DonationGoal
}

function getCampaignColor(color: string | null): string {
  const colors: Record<string, { bg: string; text: string; progress: string; icon: string }> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', progress: 'bg-emerald-500', icon: 'bg-emerald-100 text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', progress: 'bg-amber-500', icon: 'bg-amber-100 text-amber-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', progress: 'bg-blue-500', icon: 'bg-blue-100 text-blue-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', progress: 'bg-rose-500', icon: 'bg-rose-100 text-rose-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', progress: 'bg-purple-500', icon: 'bg-purple-100 text-purple-600' },
  }
  return colors[color || '']?.bg || colors.emerald.bg
}

export function DonationCampaignCard({ goal }: DonationCampaignCardProps) {
  const { t } = useCmsStrings()
  const percentage = Math.min(100, Math.round((goal.raised_amount / goal.target_amount) * 100))
  const palette = getCampaignColor(goal.color)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-warm-50 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${palette}`}>
            {goal.category}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {goal.title}
        </h3>

        {goal.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {goal.description}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('campaign_raised')}</span>
            <span className="font-semibold text-gray-900">
              {formatNPR(goal.raised_amount)}
            </span>
          </div>

          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`absolute inset-y-0 left-0 rounded-full ${goal.color ? `bg-${goal.color}-500` : 'bg-emerald-500'}`}
              style={{ backgroundColor: goal.color ? undefined : undefined }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>{t('campaign_percentage_of_goal', { percentage, goal: formatNPR(goal.target_amount) })}</span>
            <span>{t('campaign_donors', { count: goal.donor_count || 0 })}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {goal.end_date
              ? t('campaign_days_remaining', { days: Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) })
              : t('campaign_ongoing')}
          </span>
          <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
            {t('campaign_donate_now')}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export function CampaignGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-warm-50 rounded-xl border border-gray-100 p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl" />
            <div className="w-20 h-5 bg-gray-200 rounded-full" />
          </div>
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-full mb-1" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="h-3 bg-gray-200 rounded-full mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}
