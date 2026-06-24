import { getSupabaseClient } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
import type { SeoMetadata, PageBlockType, PageBlockDB } from '../types/cms'
import type { Page, Json } from '../types/database'

const supabase = getSupabaseClient()

export async function getPageBySlugWithBlocks(slug: string): Promise<Page & { blocks: PageBlockDB[]; seo: SeoMetadata } | null> {
  const { data, error } = await supabase.from('pages').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  if (!data) return null

  const { data: blocks } = await supabase
    .from('page_blocks')
    .select('*')
    .eq('page_id', data.id)
    .order('sort_order', { ascending: true })

  return {
    ...data,
    blocks: (blocks || []) as unknown as PageBlockDB[],
    seo: (data.seo as unknown as SeoMetadata) || {},
  } as Page & { blocks: PageBlockDB[]; seo: SeoMetadata }
}

export async function getPageBlocks(slug: string): Promise<PageBlockDB[]> {
  const { data: page } = await supabase.from('pages').select('id').eq('slug', slug).maybeSingle()
  if (!page) return []

  const { data, error } = await supabase
    .from('page_blocks')
    .select('*')
    .eq('page_id', page.id)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data || []) as PageBlockDB[]
}

export async function createPageBlock(
  slug: string,
  block: { block_type: PageBlockType; title?: string; content?: Record<string, unknown> }
): Promise<PageBlockDB> {
  const { data: page } = await supabase.from('pages').select('id').eq('slug', slug).maybeSingle()
  if (!page) throw new Error('Page not found')

  const { data: maxOrder } = await supabase
    .from('page_blocks')
    .select('sort_order')
    .eq('page_id', page.id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = (maxOrder?.[0]?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from('page_blocks')
    .insert({
      page_id: page.id,
      block_type: block.block_type,
      title: block.title || '',
      content: (block.content || {}) as Json,
      settings: {},
      sort_order: nextOrder,
      is_visible: true,
      is_draft: false,
    })
    .select()
    .single()
  if (error) throw error

  await syncPageBlocksJson(page.id)
  await logAuditEvent({
    action: `Created block: ${block.block_type} on page: ${slug}`,
    entityType: 'page_blocks',
    entityId: data.id,
  })
  return data as PageBlockDB
}

export async function updatePageBlock(
  blockId: string,
  updates: Partial<{
    block_type: PageBlockType
    title: string
    content: Record<string, unknown>
    settings: Record<string, unknown>
    sort_order: number
    is_visible: boolean
    is_draft: boolean
  }>
): Promise<PageBlockDB> {
  const { data, error } = await supabase
    .from('page_blocks')
    .update({
      ...updates,
      content: updates.content as Json | undefined,
      settings: updates.settings as Json | undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', blockId)
    .select()
    .single()
  if (error) throw error

  const { data: block } = await supabase.from('page_blocks').select('page_id').eq('id', blockId).maybeSingle()
  if (block) await syncPageBlocksJson(block.page_id)

  await logAuditEvent({
    action: `Updated block: ${data.block_type}`,
    entityType: 'page_blocks',
    entityId: blockId,
    changes: updates as Record<string, unknown>,
  })
  return data as PageBlockDB
}

export async function deletePageBlock(blockId: string): Promise<void> {
  const { data: block } = await supabase.from('page_blocks').select('page_id, block_type').eq('id', blockId).maybeSingle()
  if (!block) throw new Error('Block not found')

  await logAuditEvent({
    action: `Deleted block: ${block.block_type}`,
    entityType: 'page_blocks',
    entityId: blockId,
  })

  const { error } = await supabase.from('page_blocks').delete().eq('id', blockId)
  if (error) throw error

  await syncPageBlocksJson(block.page_id)
}

export async function duplicatePageBlock(blockId: string): Promise<PageBlockDB> {
  const { data: original } = await supabase.from('page_blocks').select('*').eq('id', blockId).maybeSingle()
  if (!original) throw new Error('Block not found')

  const { data: maxOrder } = await supabase
    .from('page_blocks')
    .select('sort_order')
    .eq('page_id', original.page_id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = (maxOrder?.[0]?.sort_order ?? 0) + 1

  const { data, error } = await supabase
    .from('page_blocks')
    .insert({
      page_id: original.page_id,
      block_type: original.block_type,
      title: (original.title || '') + ' (Copy)',
      content: original.content,
      settings: original.settings,
      sort_order: nextOrder,
      is_visible: original.is_visible,
      is_draft: original.is_draft,
    })
    .select()
    .single()
  if (error) throw error

  await syncPageBlocksJson(original.page_id)
  await logAuditEvent({
    action: `Duplicated block: ${original.block_type}`,
    entityType: 'page_blocks',
    entityId: data.id,
  })
  return data as PageBlockDB
}

export async function reorderPageBlocks(pageId: string, blockIds: string[]): Promise<void> {
  const updates = blockIds.map((id, index) => ({
    id,
    sort_order: index,
  }))

  for (const u of updates) {
    await supabase.from('page_blocks').update({ sort_order: u.sort_order }).eq('id', u.id)
  }

  await syncPageBlocksJson(pageId)
  await logAuditEvent({
    action: `Reordered blocks on page`,
    entityType: 'page_blocks',
    entityId: pageId,
  })
}

export async function toggleBlockVisibility(blockId: string): Promise<PageBlockDB> {
  const { data: current } = await supabase.from('page_blocks').select('is_visible').eq('id', blockId).maybeSingle()
  return updatePageBlock(blockId, { is_visible: !current?.is_visible })
}

export async function toggleBlockDraft(blockId: string): Promise<PageBlockDB> {
  const { data: current } = await supabase.from('page_blocks').select('is_draft').eq('id', blockId).maybeSingle()
  return updatePageBlock(blockId, { is_draft: !current?.is_draft })
}

async function syncPageBlocksJson(pageId: string): Promise<void> {
  const { data: blocks } = await supabase
    .from('page_blocks')
    .select('id, block_type, title, content, settings, sort_order, is_visible, is_draft')
    .eq('page_id', pageId)
    .order('sort_order', { ascending: true })

  await supabase
    .from('pages')
    .update({ blocks: (blocks || []) as unknown as Json })
    .eq('id', pageId)
}

export async function getPageSeo(slug: string): Promise<SeoMetadata> {
  const { data, error } = await supabase
    .from('pages')
    .select('seo')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return (data?.seo as unknown as SeoMetadata) || {}
}

export async function updatePageSeo(slug: string, seo: SeoMetadata): Promise<void> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const { error } = await supabase
    .from('pages')
    .update({ seo: seo as unknown as Json, updated_by: userId })
    .eq('slug', slug)
  if (error) throw error

  await logAuditEvent({
    action: `Updated SEO for page: ${slug}`,
    entityType: 'pages',
    entityId: slug,
    changes: seo as Record<string, unknown>,
  })
}

export { getPageBySlugWithBlocks as getPageBySlugWithBlocksLegacy }
