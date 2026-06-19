import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { Notification } from '../../../types/database'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

const PAGE_SIZE = 20

export interface UseNotificationsOptions {
  pageSize?: number
  initialPage?: number
}

export interface UseNotificationsResult {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  totalCount: number
  page: number
  totalPages: number
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refresh: () => void
}

export function useNotifications(
  userId: string | undefined,
  options?: UseNotificationsOptions,
): UseNotificationsResult {
  const pageSize = options?.pageSize ?? PAGE_SIZE
  const [page, setPage] = useState(options?.initialPage ?? 1)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize])

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const [listResult, unreadResult, countResult] = await Promise.all([
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(from, to),
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('read', false),
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
      ])

      if (listResult.error) throw listResult.error

      setNotifications((listResult.data || []) as Notification[])
      setUnreadCount(unreadResult.count ?? 0)
      setTotalCount(countResult.count ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [userId, page, pageSize])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (updateError) throw updateError

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n)),
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
      throw err
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false)

      if (updateError) throw updateError

      setNotifications(prev =>
        prev.map(n => (n.read ? n : { ...n, read: true, read_at: new Date().toISOString() })),
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      throw err
    }
  }, [userId])

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
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (!userId) return

    const subscription = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          const newNotif = payload.new as Notification
          setNotifications(prev => [newNotif, ...prev].slice(0, pageSize))
          setUnreadCount(prev => prev + 1)
          setTotalCount(prev => prev + 1)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [userId, pageSize])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    totalCount,
    page,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  }
}
