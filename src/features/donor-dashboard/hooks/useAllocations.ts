import { useCallback, useEffect, useState } from 'react'
import { getDonorAllocations } from '../../../services/allocations'
import type { DonationAllocation } from '../../../types/database'
import type { AllocationCategory } from '../../../types/features'

export interface AllocationSummary {
  category: AllocationCategory
  totalAmount: number
  percentage: number
  count: number
}

export interface UseAllocationsResult {
  allocations: DonationAllocation[]
  summary: AllocationSummary[]
  totalAllocated: number
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useAllocations(donorId: string | undefined): UseAllocationsResult {
  const [allocations, setAllocations] = useState<DonationAllocation[]>([])
  const [summary, setSummary] = useState<AllocationSummary[]>([])
  const [totalAllocated, setTotalAllocated] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const buildSummary = useCallback((allocs: DonationAllocation[]): AllocationSummary[] => {
    const groups = new Map<AllocationCategory, { totalAmount: number; count: number }>()

    for (const alloc of allocs) {
      const cat = alloc.category as AllocationCategory
      const existing = groups.get(cat) || { totalAmount: 0, count: 0 }
      existing.totalAmount += alloc.amount
      existing.count += 1
      groups.set(cat, existing)
    }

    const grandTotal = Array.from(groups.values()).reduce((sum, g) => sum + g.totalAmount, 0)

    return Array.from(groups.entries())
      .map(([category, data]) => ({
        category,
        totalAmount: data.totalAmount,
        percentage: grandTotal > 0 ? Math.round((data.totalAmount / grandTotal) * 100) : 0,
        count: data.count,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
  }, [])

  const fetchAllocations = useCallback(async () => {
    if (!donorId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getDonorAllocations(donorId)
      setAllocations(data)
      setTotalAllocated(data.reduce((sum, a) => sum + a.amount, 0))
      setSummary(buildSummary(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load allocations')
    } finally {
      setLoading(false)
    }
  }, [donorId, buildSummary])

  useEffect(() => {
    fetchAllocations()
  }, [fetchAllocations])

  return {
    allocations,
    summary,
    totalAllocated,
    loading,
    error,
    refresh: fetchAllocations,
  }
}
