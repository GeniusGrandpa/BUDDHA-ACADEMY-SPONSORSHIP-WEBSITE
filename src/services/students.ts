import { getSupabaseClient } from '../lib/supabase'
import type { Database, Student } from '../types/database'
const supabase = getSupabaseClient()

type StudentInsert = Database['public']['Tables']['students']['Insert']

export async function getStudents(status?: string, opts?: { limit?: number }): Promise<Student[]> {
  let query = supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('sponsorship_status', status as Student['sponsorship_status'])
  }

  if (opts?.limit) {
    query = query.limit(opts.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getStudentById(id: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createStudent(student: StudentInsert): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .insert(student)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id)

  if (error) throw error
}
