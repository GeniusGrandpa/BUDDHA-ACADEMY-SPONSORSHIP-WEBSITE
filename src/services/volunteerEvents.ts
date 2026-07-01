import { getSupabaseClient } from '../lib/supabase'
import type { VolunteerEvent, VolunteerEventSignup } from '../types/database'
const supabase = getSupabaseClient()

export async function getUpcomingEvents(): Promise<VolunteerEvent[]> {
  const { data, error } = await supabase
    .from('volunteer_events')
    .select('id, title, description, event_date, event_time, location, max_volunteers, current_volunteers, required_skills, responsibilities, category, image_url, is_active, created_by, created_at, updated_at')
    .eq('is_active', true)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })

  if (error) {
    return []
  }

  return data || []
}

export async function getAllEvents(): Promise<VolunteerEvent[]> {
  const { data, error } = await supabase
    .from('volunteer_events')
    .select('id, title, description, event_date, event_time, location, max_volunteers, current_volunteers, required_skills, responsibilities, category, image_url, is_active, created_by, created_at, updated_at')
    .eq('is_active', true)
    .order('event_date', { ascending: false })

  if (error) {
    return []
  }

  return data || []
}

export async function getVolunteerSignups(volunteerId: string): Promise<VolunteerEventSignup[]> {
  const { data, error } = await supabase
    .from('volunteer_event_signups')
    .select('id, event_id, volunteer_id, status, attended, hours_logged, notes, checked_in_at, created_at, volunteer_events(id, title, description, event_date, event_time, location, max_volunteers, current_volunteers, required_skills, responsibilities, category, image_url, is_active, created_by, created_at, updated_at)')
    .eq('volunteer_id', volunteerId)
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return data || []
}

export async function signUpForEvent(eventId: string, volunteerId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('volunteer_event_signups')
    .insert({
      event_id: eventId,
      volunteer_id: volunteerId,
      status: 'registered',
    })

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'You are already registered for this event.' }
    }
    return { success: false, error: error.message }
  }

  await supabase.rpc('increment_event_volunteers', { p_event_id: eventId })

  return { success: true }
}

export async function cancelSignup(eventId: string, volunteerId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('volunteer_event_signups')
    .delete()
    .eq('event_id', eventId)
    .eq('volunteer_id', volunteerId)

  if (error) {
    return { success: false, error: error.message }
  }

  await supabase.rpc('decrement_event_volunteers', { p_event_id: eventId })

  return { success: true }
}

export async function logVolunteerHours(
  signupId: string,
  hours: number,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('volunteer_event_signups')
    .update({
      hours_logged: hours,
      attended: true,
      notes: notes || null,
    })
    .eq('id', signupId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
