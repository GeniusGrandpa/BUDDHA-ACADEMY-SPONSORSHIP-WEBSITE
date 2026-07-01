import { getSupabaseClient } from '../lib/supabase'
import type { Sponsorship } from '../types/database'
const supabase = getSupabaseClient()

export async function getSponsorshipsByDonor(donorId: string): Promise<Sponsorship[]> {
  const { data, error } = await supabase
    .from('sponsorships')
    .select(`
      id, donor_id, student_id, amount, status, start_date, end_date, created_at, updated_at,
      student:students(id, name, age, grade, class_section, photo_url, bio, family_background, hobbies, dream_career, education_goals, achievements, gallery_urls, date_of_birth, enrolled_date, sponsorship_status, sponsorship_amount, current_sponsorship, created_at, updated_at)
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
    .select('id, donor_id, student_id, amount, status, start_date, end_date, created_at, updated_at')
    .single()

  if (error) throw error
  return data
}
