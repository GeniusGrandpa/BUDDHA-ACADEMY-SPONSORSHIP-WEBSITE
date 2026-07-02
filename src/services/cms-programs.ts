import { getSupabaseClient } from '../lib/supabase'
import type { CmsProgram, CmsImpactStat } from '../types/database'

const supabase = getSupabaseClient()

const PROGRAM_COLS = 'id, title, slug, description, full_description, image_url, category, status, sort_order, is_active, features, impact, funding_goal, raised_amount, metadata, created_at, updated_at'
const IMPACT_COLS = 'id, label, value, prefix, suffix, icon, category, sort_order, is_active, created_at, updated_at'

export async function getCmsPrograms(activeOnly = true): Promise<CmsProgram[]> {
  let query = supabase.from('cms_programs').select(PROGRAM_COLS).order('sort_order', { ascending: true })
  if (activeOnly) query = query.eq('is_active', true).eq('status', 'active')
  const { data, error } = await query
  if (error) throw error
  return (data || []) as CmsProgram[]
}

export async function getCmsProgramBySlug(slug: string): Promise<CmsProgram | null> {
  const { data, error } = await supabase
    .from('cms_programs')
    .select(PROGRAM_COLS)
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data as CmsProgram | null
}

export async function upsertCmsProgram(program: Partial<CmsProgram>): Promise<void> {
  const { error } = await supabase.from('cms_programs').upsert(program as never)
  if (error) throw error
}

export async function deleteCmsProgram(id: string): Promise<void> {
  const { error } = await supabase.from('cms_programs').delete().eq('id', id as never)
  if (error) throw error
}

export async function getCmsImpactStats(activeOnly = true): Promise<CmsImpactStat[]> {
  let query = supabase.from('cms_impact_stats').select(IMPACT_COLS).order('sort_order', { ascending: true })
  if (activeOnly) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) throw error
  return (data || []) as CmsImpactStat[]
}

export async function upsertCmsImpactStat(stat: Partial<CmsImpactStat>): Promise<void> {
  const { error } = await supabase.from('cms_impact_stats').upsert(stat as never)
  if (error) throw error
}

export async function deleteCmsImpactStat(id: string): Promise<void> {
  const { error } = await supabase.from('cms_impact_stats').delete().eq('id', id as never)
  if (error) throw error
}
