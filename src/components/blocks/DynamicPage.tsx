import { useEffect, useState, useCallback } from 'react'
import { BlockRenderer } from './BlockRenderer'
import { getPageBySlugWithBlocks } from '../../services/pageBlocks'
import type { PageBlock, PageBlockDB, SeoMetadata } from '../../types/cms'

function toPageBlock(b: PageBlockDB): PageBlock {
  return {
    id: b.id,
    type: b.block_type,
    title: b.title,
    content: b.content,
    settings: b.settings,
    is_visible: b.is_visible,
    is_draft: b.is_draft,
  }
}

interface DynamicPageProps {
  slug: string
  fallbackTitle?: string
}

export function DynamicPage({ slug, fallbackTitle }: DynamicPageProps) {
  const [blocks, setBlocks] = useState<PageBlock[]>([])
  const [seo, setSeo] = useState<SeoMetadata>({})
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setNotFound(false)
    try {
      const page = await getPageBySlugWithBlocks(slug)
      if (!page) {
        setNotFound(true)
        return
      }
      setBlocks((page.blocks || []).map(toPageBlock))
      setSeo(page.seo || {})
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (seo.title) document.title = seo.title
    const setMeta = (name: string, content: string, property?: string) => {
      let el = document.querySelector(`meta[${property ? 'property' : 'name'}="${property || name}"]`)
      if (!el) {
        el = document.createElement('meta')
        if (property) el.setAttribute('property', property)
        else el.setAttribute('name', name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }
    if (seo.description) setMeta('description', seo.description)
    if (seo.og_title) setMeta('og:title', seo.og_title, 'property')
    if (seo.og_description) setMeta('og:description', seo.og_description, 'property')
    if (seo.og_image) setMeta('og:image', seo.og_image, 'property')
    if (seo.no_index) setMeta('robots', 'noindex')
  }, [seo])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{fallbackTitle || 'Page Not Found'}</h1>
        <p className="text-gray-500">This page has not been published yet.</p>
      </div>
    )
  }

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{fallbackTitle || 'Page'}</h1>
        <p className="text-gray-500">This page has no content blocks yet.</p>
      </div>
    )
  }

  return (
    <>
      {blocks.filter(b => b.is_visible).map(block => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </>
  )
}
