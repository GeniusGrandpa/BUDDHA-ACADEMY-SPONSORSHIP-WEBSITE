import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { ActivityItem, ActivityType } from '../../../types/features'

const PAGE_SIZE = 15

export interface UseActivityFeedOptions {
  pageSize?: number
  activityTypes?: ActivityType[]
}

export interface UseActivityFeedResult {
  activities: ActivityItem[]
  loading: boolean
  error: string | null
  totalCount: number
  page: number
  totalPages: number
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  refresh: () => void
}

export function useActivityFeed(
  userId: string | undefined,
  options?: UseActivityFeedOptions,
): UseActivityFeedResult {
  const pageSize = options?.pageSize ?? PAGE_SIZE
  const [page, setPage] = useState(1)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize])

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from('activities')
        .select('*', { count: 'exact' })

      if (userId) {
        query = query.or(`user_id.eq.${userId},is_public.eq.true`)
      } else {
        query = query.eq('is_public', true)
      }

      if (options?.activityTypes && options.activityTypes.length > 0) {
        query = query.in('activity_type', options.activityTypes)
      }

      const { data, error: fetchError, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (fetchError) throw fetchError

      setActivities((data || []) as ActivityItem[])
      setTotalCount(count ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }, [userId, page, pageSize, options?.activityTypes])

  const goToPage = useCallback((p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages || 1)))
  }, [totalPages])

  const nextPage = useCallback(() => {
    goToPage(page + 1)
  }, [page, goToPage])

  const prevPage = useCallback(() => {
    goToPage(page - 1)
  }, [page, goToPage])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  return {
    activities,
    loading,
    error,
    totalCount,
    page,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    refresh: fetchActivities,
  }
}
