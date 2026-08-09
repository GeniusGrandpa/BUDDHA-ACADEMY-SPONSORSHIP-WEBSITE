import { supabase } from '../lib/supabase'
import { isPreviewMode } from '../lib/preview-mode'
import { logAuditEvent } from '../lib/audit'
import type { LegalPage, LegalPageSection, LegalPageVersion } from '../types/database'
import { getLocalizedContent } from './content-localization'

export type LegalPageType = 'privacy_policy' | 'terms_conditions' | 'cookie_policy' | 'donation_policy'
export type LegalPageStatus = 'draft' | 'published' | 'hidden'

export interface LegalPageWithSections extends LegalPage {
  sections: LegalPageSection[]
}

export async function getLegalPageByType(type: LegalPageType): Promise<LegalPageWithSections | null> {
  const { data: page, error } = await supabase
    .from('legal_pages')
    .select('id, type, title, slug, meta_title, meta_description, status, effective_date, published_at, created_at')
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!page) return null

  const { data: sections } = await supabase
    .from('legal_page_sections')
    .select('id, legal_page_id, heading, content, sort_order, is_visible')
    .eq('legal_page_id', page.id)
    .order('sort_order', { ascending: true })

  return { ...page, sections: sections || [] } as LegalPageWithSections
}

export async function getPublishedLegalPageByType(type: LegalPageType, language = 'en'): Promise<LegalPageWithSections | null> {
  if (isPreviewMode()) {
    return getLegalPageByType(type)
  }

  const { data: page, error } = await supabase
    .from('legal_pages')
    .select('id, type, title, slug, meta_title, meta_description, status, effective_date, published_at, created_at')
    .eq('type', type)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!page) return null

  const { data: sections } = await supabase
    .from('legal_page_sections')
    .select('id, legal_page_id, heading, content, sort_order, is_visible')
    .eq('legal_page_id', page.id)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  const localizedPage = await getLocalizedContent('legal_pages', page.id, language, async () => page)
  const localizedSections = await Promise.all((sections || []).map((section) =>
    getLocalizedContent('legal_page_sections', section.id, language, async () => section) as Promise<LegalPageSection>,
  ))
  return { ...localizedPage, sections: localizedSections } as LegalPageWithSections
}

export async function upsertLegalPage(
  type: LegalPageType,
  data: {
    title: string
    slug: string
    meta_title?: string
    meta_description?: string
    status?: LegalPageStatus
    effective_date?: string | null
  },
): Promise<LegalPage> {
  const user = (await supabase.auth.getSession()).data.session?.user
  const userId = user?.id || null

  const existing = await getLegalPageByType(type)

  if (existing) {
    const { data: updated, error } = await supabase
      .from('legal_pages')
      .update({
        title: data.title,
        slug: data.slug,
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        status: data.status || existing.status,
        effective_date: data.effective_date || existing.effective_date,
        updated_by: userId,
        ...(data.status === 'published' && existing.status !== 'published' ? { published_at: new Date().toISOString() } : {}),
      })
      .eq('id', existing.id)
      .select('id, type, title, slug, meta_title, meta_description, status, effective_date, published_at, created_at')
      .single()

    if (error) throw error
    await logAuditEvent({
      action: data.status === 'published' ? `Published legal page: ${type}` : `Updated legal page: ${type}`,
      entityType: 'legal_pages',
      entityId: existing.id,
    })
    return updated as LegalPage
  }

  const { data: created, error } = await supabase
    .from('legal_pages')
    .insert({
      type,
      title: data.title,
      slug: data.slug,
      meta_title: data.meta_title || '',
      meta_description: data.meta_description || '',
      status: data.status || 'draft',
      effective_date: data.effective_date || null,
      created_by: userId,
      updated_by: userId,
    })
    .select('id, type, title, slug, meta_title, meta_description, status, effective_date, published_at, created_at')
    .single()

  if (error) throw error
  await logAuditEvent({
    action: `Created legal page: ${type}`,
    entityType: 'legal_pages',
    entityId: created.id,
  })
  return created as LegalPage
}

export async function updateLegalPageStatus(
  type: LegalPageType,
  status: LegalPageStatus,
): Promise<void> {
  const existing = await getLegalPageByType(type)
  if (!existing) throw new Error('Legal page not found')

  const updateData: Partial<LegalPage> = { status }
  if (status === 'published') {
    updateData.published_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('legal_pages')
    .update(updateData)
    .eq('id', existing.id)

  if (error) throw error
  await logAuditEvent({
    action: `Changed legal page status to ${status}: ${type}`,
    entityType: 'legal_pages',
    entityId: existing.id,
  })
}

export async function upsertLegalPageSections(
  legalPageId: string,
  sections: { heading: string; content: string; sort_order: number; is_visible?: boolean }[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('legal_page_sections')
    .delete()
    .eq('legal_page_id', legalPageId)

  if (deleteError) throw deleteError

  if (sections.length === 0) return

  const { error: insertError } = await supabase
    .from('legal_page_sections')
    .insert(
      sections.map(s => ({
        legal_page_id: legalPageId,
        heading: s.heading,
        content: s.content,
        sort_order: s.sort_order,
        is_visible: s.is_visible ?? true,
      })),
    )

  if (insertError) throw insertError
}

export async function saveLegalPageVersion(type: LegalPageType): Promise<void> {
  const existing = await getLegalPageByType(type)
  if (!existing) throw new Error('Legal page not found')

  const user = (await supabase.auth.getSession()).data.session?.user
  const userId = user?.id || null

  const sections = existing.sections || []
  const { data: maxVersion } = await supabase
    .from('legal_page_versions')
    .select('version_number')
    .eq('legal_page_id', existing.id)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextVersion = (maxVersion?.version_number || 0) + 1

  const { error } = await supabase
    .from('legal_page_versions')
    .insert({
      legal_page_id: existing.id,
      version_number: nextVersion,
      snapshot: {
        page: {
          title: existing.title,
          slug: existing.slug,
          meta_title: existing.meta_title,
          meta_description: existing.meta_description,
          status: existing.status,
          effective_date: existing.effective_date,
        },
        sections: sections.map(s => ({
          heading: s.heading,
          content: s.content,
          sort_order: s.sort_order,
          is_visible: s.is_visible,
        })),
      },
      created_by: userId,
    })

  if (error) throw error
}

export async function getLegalPageVersions(type: LegalPageType): Promise<LegalPageVersion[]> {
  const page = await getLegalPageByType(type)
  if (!page) return []

  const { data } = await supabase
    .from('legal_page_versions')
    .select('id, legal_page_id, version_number, snapshot, created_at')
    .eq('legal_page_id', page.id)
    .order('version_number', { ascending: false })

  return (data || []) as LegalPageVersion[]
}
