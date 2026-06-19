import { useEffect, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet'
import { BlockRenderer } from './BlockRenderer'
import { getPageBySlugWithBlocks } from '../../services/pageBlocks'
import type { PageBlock, SeoMetadata } from '../../types/cms'

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
      setBlocks(page.blocks || [])
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
      <Helmet>
        {seo.title && <title>{seo.title}</title>}
        {seo.description && <meta name="description" content={seo.description} />}
        {seo.og_title && <meta property="og:title" content={seo.og_title} />}
        {seo.og_description && <meta property="og:description" content={seo.og_description} />}
        {seo.og_image && <meta property="og:image" content={seo.og_image} />}
        {seo.canonical_url && <link rel="canonical" href={seo.canonical_url} />}
        {seo.no_index && <meta name="robots" content="noindex" />}
      </Helmet>
      {blocks.filter(b => b.is_visible).map(block => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </>
  )
}
