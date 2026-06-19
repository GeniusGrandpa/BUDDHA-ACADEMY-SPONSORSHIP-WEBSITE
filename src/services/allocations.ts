import { getSupabaseClient } from '../lib/supabase'
import type { DonationAllocation } from '../types/database'
const supabase = getSupabaseClient()

export async function getDonationAllocations(donationId: string): Promise<DonationAllocation[]> {
  const { data, error } = await supabase
    .from('donation_allocations')
    .select('*')
    .eq('donation_id', donationId)
    .order('allocation_percentage', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getDonorAllocations(donorId: string): Promise<DonationAllocation[]> {
  const { data, error } = await supabase
    .rpc('get_donor_allocations', { p_donor_id: donorId })

  if (error) throw error
  return (data || []) as unknown as DonationAllocation[]
}

export async function getDonationsWithAllocations(donorId: string): Promise<{ donationId: string; allocations: DonationAllocation[] }[]> {
  const allocations = await getDonorAllocations(donorId)

  const grouped = new Map<string, DonationAllocation[]>()
  for (const alloc of allocations) {
    const existing = grouped.get(alloc.donation_id) || []
    existing.push(alloc)
    grouped.set(alloc.donation_id, existing)
  }

  return Array.from(grouped.entries()).map(([donationId, allocs]) => ({
    donationId,
    allocations: allocs,
  }))
}
