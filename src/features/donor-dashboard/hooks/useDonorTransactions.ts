import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { getDonorPaymentSessions } from '../../../services/payments'
import { getDonorAllocations } from '../../../services/allocations'
import { getErrorMessage } from '../../../lib/errors'
import type { TransactionWithDetails } from '../../../types/features'
import type { DonationAllocation } from '../../../types/database'

interface UseDonorTransactionsResult {
  transactions: TransactionWithDetails[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useDonorTransactions(donorId: string | undefined): UseDonorTransactionsResult {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!donorId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: donationsData, error: donationsError } = await supabase
        .from('donations')
        .select(`
          *,
          payment_session:payment_sessions!inner(*),
          receipt:payment_receipts(*)
        `)
        .eq('donor_id', donorId)
        .in('payment_session.status', ['completed', 'payment_received'])
        .order('created_at', { ascending: false })

      if (donationsError) throw donationsError

      const pendingSessions = await getDonorPaymentSessions(donorId)
      const pendingTransactions = pendingSessions
        .filter((session) => session.status === 'processing')
        .map((session) => ({
          id: session.id,
          donor_id: session.donor_id,
          student_id: session.student_id,
          amount: Number(session.amount),
          frequency: session.frequency,
          status: 'processing' as const,
          verification_status: null,
          message: session.message,
          transaction_id: session.transaction_id,
          payment_method: session.gateway,
          payment_session_id: session.id,
          verified_at: null,
          verified_by: null,
          created_at: session.created_at,
          updated_at: session.updated_at,
          payment_session: session,
          receipt: null,
          allocations: [],
        }))

      const donations = [
        ...pendingTransactions,
        ...((donationsData || []) as unknown as TransactionWithDetails[]),
      ]

      const allocationsMap = new Map<string, DonationAllocation[]>()
      try {
        const allocations = await getDonorAllocations(donorId)
        for (const alloc of allocations) {
          const existing = allocationsMap.get(alloc.donation_id) || []
          existing.push(alloc)
          allocationsMap.set(alloc.donation_id, existing)
        }
      } catch {
      }

      const transactionsWithAllocs = donations.map((d) => ({
        ...d,
        status: d.payment_session?.status === 'completed' && d.status === 'pending' ? 'completed' : d.status,
        allocations: allocationsMap.get(d.id) || [],
      }))

      setTransactions(transactionsWithAllocs)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load transactions'))
    } finally {
      setLoading(false)
    }
  }, [donorId])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return { transactions, loading, error, refresh: fetchTransactions }
}
