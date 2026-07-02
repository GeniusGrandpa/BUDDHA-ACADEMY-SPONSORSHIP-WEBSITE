import { getSupabaseClient } from '../lib/supabase'
const supabase = getSupabaseClient()

export interface VolunteerApplicationData {
  full_name: string
  email: string
  phone: string
  country?: string
  expertise?: string
  availability?: string
  motivation?: string
}

export async function submitVolunteerApplication(
  data: VolunteerApplicationData,
): Promise<void> {

  const { error } = await supabase
    .from('volunteer_applications')
    .insert({
      ...data,
      status: 'pending',
    })

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Volunteer applications are temporarily unavailable. Please email us at info@buddhaacademy.org')
    }
    throw new Error('Failed to submit volunteer application. Please try again later.')
  }
}
