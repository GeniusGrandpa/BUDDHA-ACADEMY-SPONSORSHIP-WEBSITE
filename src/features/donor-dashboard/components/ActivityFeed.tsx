import { motion } from 'framer-motion'

import { fadeInUp, stagger } from '../animations'
import { formatRelativeTime } from '../utils/formatters'
import type { ActivityItem } from '../../../types/features'

interface ActivityFeedProps {
  activities: ActivityItem[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
}

export function ActivityFeed({ activities, loading, hasMore, onLoadMore }: ActivityFeedProps) {
  if (loading && activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-50 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Recent Activity</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Activity from your sponsorships and donations will appear here.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <span className="text-sm text-gray-500">{activities.length} item{activities.length !== 1 ? 's' : ''}</span>
      </div>

      <motion.div variants={stagger} initial="initial" animate="animate" className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
        {activities.map((activity) => (
            <motion.div
              key={activity.id}
              variants={fadeInUp}
              className="p-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                {activity.description && (
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{activity.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(activity.created_at)}</p>
              </div>
            </motion.div>
          ))}
      </motion.div>

      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="w-full mt-3 py-2.5 text-sm font-medium text-orange-600 bg-orange-50/50 rounded-xl hover:bg-orange-100/50 transition-colors border border-orange-100/50 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </motion.div>
  )
}
