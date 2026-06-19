import { getSupabaseClient } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
import type { PageBlock, SeoMetadata } from '../types/cms'
import type { Page } from '../types/database'

const supabase = getSupabaseClient()

export async function getPageBlocks(slug: string): Promise<PageBlock[]> {
  const { data, error } = await supabase
    .from('pages')
    .select('blocks')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return (data?.blocks as PageBlock[]) || []
}

export async function updatePageBlocks(slug: string, blocks: PageBlock[]): Promise<void> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const { error } = await supabase
    .from('pages')
    .update({ blocks: blocks as unknown as Record<string, unknown>, updated_by: userId })
    .eq('slug', slug)
  if (error) throw error
  await logAuditEvent({ action: `Updated page blocks for: ${slug}`, entityType: 'pages', entityId: slug })
}

export async function getPageSeo(slug: string): Promise<SeoMetadata> {
  const { data, error } = await supabase
    .from('pages')
    .select('seo')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return (data?.seo as SeoMetadata) || {}
}

export async function updatePageSeo(slug: string, seo: SeoMetadata): Promise<void> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const { error } = await supabase
    .from('pages')
    .update({ seo: seo as unknown as Record<string, unknown>, updated_by: userId })
    .eq('slug', slug)
  if (error) throw error
}

export async function getPageBySlugWithBlocks(slug: string): Promise<Page & { blocks: PageBlock[]; seo: SeoMetadata } | null> {
  const { data, error } = await supabase.from('pages').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    ...data,
    blocks: (data.blocks as PageBlock[]) || [],
    seo: (data.seo as SeoMetadata) || {},
  }
}
