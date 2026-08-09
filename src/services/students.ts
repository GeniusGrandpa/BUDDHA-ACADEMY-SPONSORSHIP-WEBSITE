import { getSupabaseClient } from '../lib/supabase'
import { requireRole } from '../lib/auth/secureService'
import type { Database, Student } from '../types/database'
import { getLocalizedContent } from './content-localization'
const supabase = getSupabaseClient()

type StudentInsert = Database['public']['Tables']['students']['Insert']

export async function getStudents(status?: string, opts?: { limit?: number }, language = 'en'): Promise<Student[]> {
  let query = supabase
    .from('students')
    .select('id, name, age, grade, class_section, photo_url, bio, family_background, hobbies, dream_career, education_goals, achievements, gallery_urls, date_of_birth, enrolled_date, sponsorship_status, sponsorship_amount, current_sponsorship, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('sponsorship_status', status as Student['sponsorship_status'])
  }

  if (opts?.limit) {
    query = query.limit(opts.limit)
  }

  const { data, error } = await query
  if (error) throw error
  return Promise.all((data || []).map((student) => getLocalizedContent('students', student.id, language, async () => student) as Promise<Student>))
}

export async function getStudentById(id: string, language = 'en'): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('id, name, age, grade, class_section, photo_url, bio, family_background, hobbies, dream_career, education_goals, achievements, gallery_urls, date_of_birth, enrolled_date, sponsorship_status, sponsorship_amount, current_sponsorship, created_at, updated_at')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return getLocalizedContent('students', id, language, async () => data)
}

export async function createStudent(student: StudentInsert): Promise<Student> {
  await requireRole(['admin', 'super_admin'])

  const { data, error } = await supabase
    .from('students')
    .insert(student)
    .select('id, name, age, grade, class_section, photo_url, bio, family_background, hobbies, dream_career, education_goals, achievements, gallery_urls, date_of_birth, enrolled_date, sponsorship_status, sponsorship_amount, current_sponsorship, created_at, updated_at')
    .single()

  if (error) throw error
  return data
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
  await requireRole(['admin', 'super_admin'])

  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select('id, name, age, grade, class_section, photo_url, bio, family_background, hobbies, dream_career, education_goals, achievements, gallery_urls, date_of_birth, enrolled_date, sponsorship_status, sponsorship_amount, current_sponsorship, created_at, updated_at')
    .single()

  if (error) throw error
  return data
}

export async function deleteStudent(id: string): Promise<void> {
  await requireRole(['admin', 'super_admin'])

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id)

  if (error) throw error
}
