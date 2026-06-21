import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { RecurringSubscription } from '../../../types/features'
type DbQuery = ReturnType<typeof supabase.from>
interface RecurringDonationsReturn {
  subscriptions: RecurringSubscription[]
  loading: boolean
  createSubscription: (data: Omit<RecurringSubscription, 'id' | 'status' | 'paused_at' | 'cancelled_at' | 'next_payment_date' | 'created_at' | 'updated_at'>) => Promise<void>
  pauseSubscription: (id: string) => Promise<void>
  resumeSubscription: (id: string) => Promise<void>
  cancelSubscription: (id: string) => Promise<void>
}

export function useRecurringDonations(userId: string | undefined): RecurringDonationsReturn {
  const [subscriptions, setSubscriptions] = useState<RecurringSubscription[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSubscriptions = useCallback(async () => {
    if (!userId) {
      setSubscriptions([])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('recurring_subscriptions')
        .select('*')
        .eq('donor_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSubscriptions((data || []) as RecurringSubscription[])
    } catch {
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const createSubscription = useCallback(async (
    data: Omit<RecurringSubscription, 'id' | 'status' | 'paused_at' | 'cancelled_at' | 'next_payment_date' | 'created_at' | 'updated_at'>
  ) => {
    if (!userId) return

    try {
      await (supabase.from('recurring_subscriptions') as unknown as DbQuery)
        .insert({
          donor_id: userId,
          student_id: data.student_id,
          amount: data.amount,
          frequency: data.frequency,
          status: 'active',
        } as never)
      await fetchSubscriptions()
    } catch {
      await fetchSubscriptions()
    }
  }, [userId, fetchSubscriptions])

  const pauseSubscription = useCallback(async (id: string) => {
    const now = new Date().toISOString()
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === id ? { ...sub, status: 'paused', paused_at: now } : sub
      )
    )

    try {
      await (supabase
        .from('recurring_subscriptions') as unknown as DbQuery)
        .update({ status: 'paused', paused_at: now } as never)
        .eq('id', id)
      await fetchSubscriptions()
    } catch {
      await fetchSubscriptions()
    }
  }, [fetchSubscriptions])

  const resumeSubscription = useCallback(async (id: string) => {
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === id ? { ...sub, status: 'active', paused_at: null } : sub
      )
    )

    try {
      await (supabase
        .from('recurring_subscriptions') as unknown as DbQuery)
        .update({ status: 'active', paused_at: null } as never)
        .eq('id', id)
      await fetchSubscriptions()
    } catch {
      await fetchSubscriptions()
    }
  }, [fetchSubscriptions])

  const cancelSubscription = useCallback(async (id: string) => {
    const now = new Date().toISOString()
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === id ? { ...sub, status: 'cancelled', cancelled_at: now } : sub
      )
    )

    try {
      await (supabase
        .from('recurring_subscriptions') as unknown as DbQuery)
        .update({ status: 'cancelled', cancelled_at: now } as never)
        .eq('id', id)
      await fetchSubscriptions()
    } catch {
      await fetchSubscriptions()
    }
  }, [fetchSubscriptions])

  return {
    subscriptions,
    loading,
    createSubscription,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
  }
}
