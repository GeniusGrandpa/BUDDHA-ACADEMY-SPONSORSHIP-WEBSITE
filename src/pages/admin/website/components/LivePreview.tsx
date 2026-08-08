import { useMemo } from 'react'
import type { WebsiteSection, WebsitePage } from '../../../../types/website-builder'
import { SECTION_TYPE_LABELS } from '../../../../types/website-builder'
import { resolveOverlayColor } from '../../../../lib/color'

const DEVICE_SIZES = {
  desktop: { width: '100%', maxWidth: '100%' },
  tablet: { width: '768px', maxWidth: '768px' },
  mobile: { width: '375px', maxWidth: '375px' },
} as const

export type PreviewDevice = keyof typeof DEVICE_SIZES

interface LivePreviewProps {
  page: WebsitePage
  sections: WebsiteSection[]
  device: PreviewDevice
  isPreview?: boolean
  selectedSectionId?: string | null
  onSelectSection?: (id: string) => void
}

function HeroPreview({ hero }: { hero: { title?: string; highlight?: string; description?: string; background_image?: string; overlay_color?: string; overlay_opacity?: number; cta_primary_text?: string; cta_secondary_text?: string; is_visible?: boolean } | null }) {
  if (!hero?.is_visible) return null
  
  return (
    <section 
      className="relative min-h-[500px] sm:min-h-[600px] flex items-center overflow-hidden"
      aria-label="Hero preview"
    >
      {hero.background_image && (
        <img
          src={hero.background_image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: hero.overlay_opacity ?? 0.5 }}
        />
      )}
      <div 
        className="absolute inset-0"
        style={{ 
          background: 'linear-gradient(135deg, rgba(17,17,17,0.8), rgba(68,68,68,0.6), transparent)',
          backgroundColor: resolveOverlayColor(hero.overlay_color),
          opacity: hero.overlay_opacity ?? 0.5,
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl">
          {hero.title && (
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              {hero.title}
              {hero.highlight && <><br /><span className="text-[var(--color-accent)]">{hero.highlight}</span></>}
            </h1>
          )}
          {hero.description && (
            <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8 leading-relaxed">{hero.description}</p>
          )}
          {(hero.cta_primary_text || hero.cta_secondary_text) && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {hero.cta_primary_text && (
                <button className="px-6 py-3 rounded-full font-medium text-white bg-[var(--color-primary)] hover:opacity-90 transition-opacity">
                  {hero.cta_primary_text}
                </button>
              )}
              {hero.cta_secondary_text && (
                <button className="px-6 py-3 rounded-full font-medium bg-white/90 text-gray-800 hover:bg-white transition-opacity">
                  {hero.cta_secondary_text}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function SectionPreviewRenderer({ section }: { section: WebsiteSection }) {
  const s = section.settings || {}
  const content = (section.content || {}) as Record<string, React.ReactNode>
  
  const style: React.CSSProperties = {
    color: s.text_color || undefined,
    backgroundColor: s.background_color || undefined,
    borderRadius: s.border_radius || undefined,
    paddingTop: s.padding_top || undefined,
    paddingBottom: s.padding_bottom || undefined,
    textAlign: s.text_alignment || undefined,
  }

  if (s.background_image) {
    style.backgroundImage = `url(${s.background_image})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
  }

  if (!section.is_visible) {
    return (
      <div className="border-2 border-dashed border-gray-200 opacity-50">
        <div className="p-8 text-center text-gray-400 text-sm">
          {SECTION_TYPE_LABELS[section.section_type] || section.section_key} (hidden)
        </div>
      </div>
    )
  }

  switch (section.section_type) {
    case 'hero': {
      return (
        <HeroPreview hero={{
          title: section.title || '',
          highlight: content.highlight as string || '',
          description: section.description || '',
          background_image: s.background_image as string || '',
          overlay_color: s.overlay_color as string || '#000000',
          overlay_opacity: s.overlay_opacity ?? 0.5,
          cta_primary_text: (content.cta_primary as { text?: string })?.text || '',
          cta_secondary_text: (content.cta_secondary as { text?: string })?.text || '',
          is_visible: section.is_visible,
        }} />
      )
    }
    case 'welcome':
      return (
        <div style={style} className="min-h-[120px] p-6">
          {content.title && <h2 className="text-xl font-bold mb-2" style={{ color: s.text_color }}>{content.title}</h2>}
          {content.content && <p className="text-sm opacity-80">{content.content}</p>}
        </div>
      )
    case 'stats': {
      const stats = (content.statistics as { value: string; label: string }[]) || []
      return (
        <div style={style} className="min-h-[120px] p-6">
          {content.title && <h2 className="text-xl font-bold mb-4 text-center">{content.title}</h2>}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div className="text-2xl font-bold" style={{ color: s.text_color }}>{stat.value}</div>
                <div className="text-xs opacity-70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    case 'testimonials':
      return (
        <div style={style} className="min-h-[120px] p-6">
          {content.title && <h2 className="text-xl font-bold mb-4 text-center">{content.title}</h2>}
          <p className="text-xs opacity-60 text-center">Testimonials will appear here from the database</p>
        </div>
      )
    case 'donation_cta':
    case 'sponsor_cta':
    case 'about_cta':
      return (
        <div style={style} className="min-h-[120px] p-6 text-center">
          {content.title && <h2 className="text-xl font-bold mb-2">{content.title}</h2>}
          {content.description && <p className="text-sm mb-4">{content.description}</p>}
          {content.button_text && (
            <button className="px-6 py-2 rounded-full font-medium text-white bg-[var(--color-primary)]">
              {content.button_text}
            </button>
          )}
        </div>
      )
    case 'sponsorship_steps':
    case 'sponsor_steps': {
      const steps = (content.steps as { title: string; desc: string }[]) || []
      return (
        <div style={style} className="min-h-[120px] p-6">
          {content.title && <h2 className="text-xl font-bold mb-4 text-center">{content.title}</h2>}
          {content.description && <p className="text-sm text-center mb-4 opacity-80">{content.description}</p>}
          <div className="space-y-2">
            {steps.slice(0, 4).map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center">{idx + 1}</span>
                <span className="text-sm font-medium">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    case 'featured_students':
      return (
        <div style={style} className="min-h-[120px] p-6">
          {content.title && <h2 className="text-xl font-bold mb-2">{content.title}</h2>}
          <p className="text-xs opacity-60">Student profiles are loaded dynamically from the database</p>
        </div>
      )
    default:
      return (
        <div style={style} className="min-h-[80px] p-6 border border-dashed border-gray-200">
          <h3 className="font-medium text-sm mb-1">{SECTION_TYPE_LABELS[section.section_type] || section.section_key}</h3>
          {section.title && <p className="text-xs opacity-70">{section.title}</p>}
          {section.description && <p className="text-xs opacity-60 mt-1">{section.description}</p>}
        </div>
      )
  }
}

export function LivePreview({ sections, device = 'desktop', selectedSectionId, onSelectSection }: LivePreviewProps) {
  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => a.sort_order - b.sort_order)
  }, [sections])

  const sizeStyle = DEVICE_SIZES[device]

  return (
    <div 
      className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 mx-auto"
      style={{ 
        width: sizeStyle.width, 
        maxWidth: sizeStyle.maxWidth,
        minHeight: '400px',
      }}
    >
      {sortedSections.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          <p className="text-sm font-medium">No sections configured</p>
          <p className="text-xs mt-1">Add sections to see them appear in the preview</p>
        </div>
      ) : (
        sortedSections.map(section => (
          <div
            key={section.id}
            className={`transition-all cursor-pointer group/preview ${selectedSectionId === section.id ? 'ring-2 ring-amber-500 ring-inset' : 'hover:ring-2 hover:ring-amber-300/70 hover:ring-inset'}`}
            onClick={() => onSelectSection?.(section.id)}
            title="Click to edit this section"
          >
            <SectionPreviewRenderer key={section.id} section={section} />
          </div>
        ))
      )}
    </div>
  )
}

export function DeviceSwitcher({ device, onChange }: { device: PreviewDevice; onChange: (d: PreviewDevice) => void }) {
  const devices: PreviewDevice[] = ['desktop', 'tablet', 'mobile']
  
  const icons = {
    desktop: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="4" width="18" height="14" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 20h20" /></svg>,
    tablet: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="5" y="2" width="14" height="20" rx="2" /><circle cx="12" cy="18" r="1" /></svg>,
    mobile: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="7" y="2" width="10" height="20" rx="2" /><circle cx="12" cy="18" r="1" /></svg>,
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {devices.map(d => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`p-2 rounded-md transition-colors ${device === d ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
          title={`${d.charAt(0).toUpperCase() + d.slice(1)} view`}
        >
          {icons[d]}
        </button>
      ))}
    </div>
  )
}