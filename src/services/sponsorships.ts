import { getSupabaseClient } from '../lib/supabase'
import type { Sponsorship } from '../types/database'
const supabase = getSupabaseClient()

export async function getSponsorshipsByDonor(donorId: string): Promise<Sponsorship[]> {
  const { data, error } = await supabase
    .from('sponsorships')
    .select(`
      *,
      student:students(*)
    `)
    .eq('donor_id', donorId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createSponsorship(sponsorship: Omit<Sponsorship, 'id' | 'created_at' | 'updated_at'>): Promise<Sponsorship> {
  const { data, error } = await supabase
    .from('sponsorships')
    .insert(sponsorship)
    .select()
    .single()

  if (error) throw error
  return data
}
