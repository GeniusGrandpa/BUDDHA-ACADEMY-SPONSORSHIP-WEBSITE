import { getSupabaseClient } from '../lib/supabase'
import { markDonorAsVerified } from './profiles'
import type { Donation } from '../types/database'
const supabase = getSupabaseClient()

export async function createDonation(_donation: Omit<Donation, 'id' | 'created_at' | 'updated_at'>): Promise<Donation> {
  throw new Error('Direct donation creation is disabled. Donations are created only after payment verification.')
}

export async function getDonationsByDonor(donorId: string): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('*, verified_by_profile:profiles!donations_verified_by_fkey(full_name)')
    .eq('donor_id', donorId)
    .order('created_at', { ascending: false })

  if (error) throw error
  const donations = data as unknown as Donation[]
  return donations.map((d) => ({
    ...d,
    status: d.verified_at && d.status === 'pending' ? 'completed' : d.status,
  }))
}

export async function getAllDonations(): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Donation[]
}

export async function updateDonationStatus(id: string, status: Donation['status']): Promise<Donation> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  
  // First get the donation to get donor_id
  const { data: donationBefore, error: getError } = await supabase
    .from('donations')
    .select('donor_id')
    .eq('id', id)
    .single()
  
  if (getError) throw getError
  
  const updates: Partial<Donation> = { status }
  if (status === 'completed') {
    updates.verified_by = userId
    updates.verified_at = new Date().toISOString()
  }
  const { data, error } = await supabase
    .from('donations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  if (status === 'completed' && donationBefore?.donor_id) {
    await markDonorAsVerified(donationBefore.donor_id)
  }

  return data
}
