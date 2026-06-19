import { getSupabaseClient } from '../lib/supabase'
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
  return data as unknown as Donation[]
}

export async function getAllDonations(): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Donation[]
}

export async function updateDonationStatus(id: string, status: Donation['status']): Promise<Donation> {
  const { data, error } = await supabase
    .from('donations')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
