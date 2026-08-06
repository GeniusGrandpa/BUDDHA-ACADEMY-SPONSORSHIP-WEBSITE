import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useCmsStrings } from '../../context/CmsStringsContext'
import { Tr } from '../Translated'
import { getPublicActivities } from '../../services/activities'
import type { ActivityRow } from '../../types/database'

export function ActivityFeed() {
  const { t } = useCmsStrings()
  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [])

  async function loadActivities() {
    setLoading(true)
    const data = await getPublicActivities(15)
    setActivities(data)
    setLoading(false)
  }

  function getActivityColor(type: string): string {
    const colors: Record<string, string> = {
      donation_received: 'bg-rose-50 border-rose-200',
      donation_completed: 'bg-emerald-50 border-emerald-200',
      sponsorship_started: 'bg-blue-50 border-blue-200',
      teacher_report: 'bg-amber-50 border-amber-200',
      student_achievement: 'bg-purple-50 border-purple-200',
      sponsorship_renewed: 'bg-emerald-50 border-emerald-200',
      volunteer_signup: 'bg-indigo-50 border-indigo-200',
    }
    return colors[type] || 'bg-gray-50 border-gray-200'
  }

  function getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t('activity_just_now')
    if (diffMins < 60) return t('activity_minutes_ago', { count: diffMins })
    if (diffHours < 24) return t('activity_hours_ago', { count: diffHours })
    if (diffDays < 7) return t('activity_days_ago', { count: diffDays })
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {t('activity_empty_title')}
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          {t('activity_empty_desc')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={`flex items-start gap-3 p-4 rounded-xl border ${getActivityColor(activity.activity_type)}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                <Tr text={activity.title} />
              </p>
              {activity.description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                  <Tr text={activity.description} />
                </p>
              )}<p className="text-xs text-gray-400 mt-1">
                {getTimeAgo(activity.created_at)}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
