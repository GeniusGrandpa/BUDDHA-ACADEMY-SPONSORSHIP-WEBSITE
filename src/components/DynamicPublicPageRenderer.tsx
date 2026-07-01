import { useState, useEffect } from 'react'
import { fetchFullPageBySlug } from '../services/website-builder'
import type { WebsiteSection } from '../types/website-builder'
import { DashboardSkeleton } from './ui/LoadingSkeleton'

interface DynamicPublicPageRendererProps {
  slug: string
  fallback?: React.ReactNode
  children?: (sections: WebsiteSection[], page: any) => React.ReactNode
}

export function DynamicPublicPageRenderer({ slug, fallback, children }: DynamicPublicPageRendererProps) {
  const [sections, setSections] = useState<WebsiteSection[] | null>(null)
  const [page, setPage] = useState<any>(null)
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
          setPage(result.page)
          setSections(result.sections.filter(s => s.is_visible))
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

  if (loading) {
    return fallback || <div className="p-8"><DashboardSkeleton /></div>
  }

  if (error || !sections) {
    return null
  }

  if (children) {
    return <>{children(sections, page)}</>
  }

  return (
    <div>
      {sections.map(section => (
        <DynamicSectionRenderer key={section.id} section={section} />
      ))}
    </div>
  )
}

function DynamicSectionRenderer({ section }: { section: WebsiteSection }) {
  const s = section.settings || {}
  const style: React.CSSProperties = {}

  if (s.text_color) style.color = String(s.text_color)
  if (s.background_color) style.backgroundColor = String(s.background_color)
  if (s.border_radius) style.borderRadius = String(s.border_radius)
  if (s.padding_top) style.paddingTop = String(s.padding_top)
  if (s.padding_bottom) style.paddingBottom = String(s.padding_bottom)
  if (s.text_alignment) style.textAlign = String(s.text_alignment) as React.CSSProperties['textAlign']

  if (s.background_image) {
    style.backgroundImage = `url(${s.background_image})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
    style.position = 'relative'
  }

  let additionalClasses = ''
  if (s.font_size_preset === 'sm') additionalClasses = 'text-sm'
  else if (s.font_size_preset === 'lg') additionalClasses = 'text-lg'
  else if (s.font_size_preset === 'xl') additionalClasses = 'text-xl'
  else if (s.font_size_preset === '2xl') additionalClasses = 'text-2xl'
  else if (s.font_size_preset === '3xl') additionalClasses = 'text-3xl'
  else if (s.font_size_preset === '4xl') additionalClasses = 'text-4xl'

  if (s.layout_preset === 'wide') additionalClasses += ' max-w-7xl mx-auto'
  else if (s.layout_preset === 'narrow') additionalClasses += ' max-w-3xl mx-auto'
  else if (s.layout_preset === 'full_width') additionalClasses += ' w-full'

  return (
    <section style={style} className={`relative ${additionalClasses}`}>
      {s.overlay_color && s.overlay_opacity !== undefined && (
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: String(s.overlay_color), opacity: Number(s.overlay_opacity) }} />
      )}
      <div className="relative z-[1] px-4 py-8 md:px-8">
        {section.title && (
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: s.text_color }}>
            {section.title}
          </h2>
        )}
        {section.subtitle && (
          <p className="text-base md:text-lg mb-4 opacity-80" style={{ color: s.text_color }}>
            {section.subtitle}
          </p>
        )}
        {section.description && (
          <div className="prose max-w-none" style={{ color: s.text_color }}>
            <p>{section.description}</p>
          </div>
        )}
        {section.blocks && section.blocks.length > 0 && (
          <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {section.blocks.filter(b => b.is_visible).sort((a, b) => a.sort_order - b.sort_order).map(block => {
              const content = block.content || {}
              return (
              <div key={block.id} className="p-4 rounded-lg border" style={{ backgroundColor: s.background_color ? String(s.background_color) : '#fff', borderColor: s.text_color ? `${String(s.text_color)}20` : '#e5e7eb' }}>
                {block.title && <h4 className="font-semibold mb-1">{block.title}</h4>}
                {block.block_type === 'image' && !!content.src && (
                  <img src={String(content.src)} alt={content.alt ? String(content.alt) : block.title || ''} className="w-full h-48 object-cover rounded-lg" loading="lazy" decoding="async" />
                )}
                {block.block_type === 'text' && !!content.text && (
                  <p className="text-sm opacity-80">{String(content.text)}</p>
                )}
                {block.block_type === 'button' && (
                  <a href={content.link ? String(content.link) : '#'} className="inline-block px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: s.button_color ? String(s.button_color) : '#f59e0b', color: s.button_text_color ? String(s.button_text_color) : '#fff' }}>
                    {block.title || (content.text ? String(content.text) : 'Click Here')}
                  </a>
                )}
              </div>
              )
            })}
          </div>
        )}
        {!section.title && !section.subtitle && !section.description && (!section.blocks || section.blocks.length === 0) && (
          <p className="text-gray-300 italic text-sm">This section is empty</p>
        )}
      </div>
    </section>
  )
}

export function usePageContent(slug: string) {
  const [data, setData] = useState<{ page: any; sections: WebsiteSection[] } | null>(null)
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
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  return { data, loading }
}
