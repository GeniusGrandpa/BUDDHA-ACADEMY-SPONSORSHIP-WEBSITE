import { getSupabaseClient } from '../lib/supabase'
import type { ContactSubmission } from '../types/database'
const supabase = getSupabaseClient()

export async function createContactSubmission(submission: Omit<ContactSubmission, 'id' | 'created_at' | 'status'>): Promise<ContactSubmission> {
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert({ ...submission, status: 'unread' })
    .select('id, name, email, phone, subject, message, status, created_at')
    .single()

  if (error) throw error
  return data
}

export async function getAllContactSubmissions(): Promise<ContactSubmission[]> {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('id, name, email, phone, subject, message, status, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function updateContactSubmissionStatus(id: string, status: ContactSubmission['status']): Promise<ContactSubmission> {
  const { data, error } = await supabase
    .from('contact_submissions')
    .update({ status })
    .eq('id', id)
    .select('id, name, email, phone, subject, message, status, created_at')
    .single()

  if (error) throw error
  return data
}
