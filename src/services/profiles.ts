import { getSupabaseClient } from '../lib/supabase'
import type { Profile } from '../types/database'
const supabase = getSupabaseClient()

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data as unknown as Profile
}

export async function markDonorAsVerified(donorId: string): Promise<void> {
  // Check if donor already has any completed donations first OR if already verified
  const { data: existing } = await supabase
    .from('donations')
    .select('id')
    .eq('donor_id', donorId)
    .eq('status', 'completed')
    .limit(1)

  if (existing && existing.length > 0) {
    // Mark them as verified if they have a completed donation
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', donorId)

    if (error) throw error
  }
}
