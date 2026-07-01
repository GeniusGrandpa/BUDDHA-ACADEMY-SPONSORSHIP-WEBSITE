import { useState, useEffect, useMemo } from 'react'
import { fetchFullPageBySlug } from '../services/website-builder'
import type { WebsiteSection, WebsitePage } from '../types/website-builder'
import { DashboardSkeleton } from './ui/LoadingSkeleton'
import { SECTION_RENDERER_REGISTRY, DefaultSectionRenderer } from './website-builder/SectionRenderers'

interface DynamicPublicPageRendererProps {
  slug: string
  fallback?: React.ReactNode
}

const HEADER_TYPES = new Set(['hero', 'page_header', 'donate_hero', 'sponsor_hero', 'volunteer_hero'])

function sectionHasContent(s: WebsiteSection): boolean {
  if (s.description && s.description.trim().length > 0) return true
  if (s.subtitle && s.subtitle.trim().length > 0) return true
  if (s.content && Object.keys(s.content).length > 0) return true
  if (s.blocks && s.blocks.length > 0) return true
  return false
}

function hasPopulatedSections(sections: WebsiteSection[]): boolean {
  const nonHeader = sections.filter(s => !HEADER_TYPES.has(s.section_type))
  if (nonHeader.length === 0) return false
  return nonHeader.some(s => sectionHasContent(s))
}

function buildPageHeaderSection(page: WebsitePage): WebsiteSection {
  return {
    id: `__page_header_${page.id}`,
    page_id: page.id,
    section_key: 'page_header',
    section_type: 'page_header',
    title: page.title,
    subtitle: null,
    description: null,
    content: { description: page.meta_description },
    settings: {
      background_image: page.hero_background_image || undefined,
      overlay_color: page.hero_overlay_color,
      overlay_opacity: page.hero_overlay_opacity,
    },
    sort_order: -1,
    is_visible: true,
    is_draft: false,
    updated_by: null,
    created_at: '',
    updated_at: '',
  }
}

export function DynamicPublicPageRenderer({ slug, fallback }: DynamicPublicPageRendererProps) {
  const [page, setPage] = useState<WebsitePage | null>(null)
  const [sections, setSections] = useState<WebsiteSection[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    fetchFullPageBySlug(slug)
      .then(result => {
        if (cancelled) return
        if (result) {
          const visible = result.sections.filter(s => s.is_visible)
          if (hasPopulatedSections(visible)) {
            setPage(result.page)
            setSections(visible)
          } else {
            setError(true)
          }
        } else {
          setError(true)
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [slug])

  const allSections = useMemo(() => {
    if (!sections || sections.length === 0) return sections
    if (!page) return sections
    const hasHeader = sections.some(s => HEADER_TYPES.has(s.section_type))
    if (hasHeader) return sections
    return [buildPageHeaderSection(page), ...sections]
  }, [sections, page])

  if (loading) {
    return <div className="p-8"><DashboardSkeleton /></div>
  }

  if (error || !allSections || allSections.length === 0) {
    return fallback || null
  }

  return (
    <div>
      {allSections.map(section => {
        const Renderer = SECTION_RENDERER_REGISTRY[section.section_type] || DefaultSectionRenderer
        return <Renderer key={section.id} section={section} />
      })}
    </div>
  )
}

export function usePageContent(slug: string) {
  const [data, setData] = useState<{ page: WebsitePage; sections: WebsiteSection[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchFullPageBySlug(slug)
      .then(result => {
        if (!cancelled && result) {
          setData(result)
        }
      })
      .catch(() => { })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  return { data, loading }
}
