import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { getHeroContent, getSectionContent, upsertHeroContent, upsertSectionContent } from '../../../services/cms-content'
import { FormSkeleton } from '../../../components/ui/LoadingSkeleton'
import { useCmsStrings } from '../../../context/CmsStringsContext'
import toast from 'react-hot-toast'
import type { HeroContent } from '../../../types/cms-content'

type DeviceType = 'desktop' | 'tablet' | 'mobile'
type PanelTab = 'sections' | 'theme' | 'settings'

interface PageDef {
  id: string
  name: string
  slug: string
  sections: SectionDef[]
}

interface SectionDef {
  id: string
  key: string
  name: string
  visible: boolean
  content: Record<string, unknown>
}

interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

interface ThemeConfig {
  colors: ThemeColors
  fontHeading: string
  fontBody: string
  buttonRadius: number
  buttonStyle: 'filled' | 'outline' | 'soft'
}

const defaultTheme: ThemeConfig = {
  colors: { primary: '#f59e0b', secondary: '#d97706', accent: '#fef3c7', background: '#FFF8F0', text: '#111827' },
  fontHeading: 'Inter, sans-serif',
  fontBody: 'Inter, sans-serif',
  buttonRadius: 8,
  buttonStyle: 'filled',
}

const pageDefs: PageDef[] = [
  {
    id: 'home', name: 'Home', slug: '/',
    sections: [
      { id: 'hero', key: 'hero', name: 'Hero Banner', visible: true, content: {} },
      { id: 'welcome', key: 'welcome', name: 'Welcome Section', visible: true, content: {} },
      { id: 'stats', key: 'stats', name: 'Statistics', visible: true, content: {} },
      { id: 'featured_students', key: 'featured_students', name: 'Featured Students', visible: true, content: {} },
      { id: 'testimonials', key: 'testimonials', name: 'Testimonials', visible: true, content: {} },
      { id: 'donation_cta', key: 'donation_cta', name: 'Donation CTA', visible: true, content: {} },
    ],
  },
  {
    id: 'about', name: 'About Us', slug: '/about',
    sections: [
      { id: 'about_header', key: 'about_header', name: 'Page Header', visible: true, content: {} },
      { id: 'about_mission', key: 'about_mission', name: 'Mission & Vision', visible: true, content: {} },
      { id: 'about_stats', key: 'about_stats', name: 'Statistics', visible: true, content: {} },
      { id: 'about_values', key: 'about_values', name: 'Core Values', visible: true, content: {} },
      { id: 'about_timeline', key: 'about_timeline', name: 'Timeline', visible: true, content: {} },
    ],
  },
  {
    id: 'sponsorship', name: 'Sponsorship', slug: '/sponsor',
    sections: [
      { id: 'sponsor_header', key: 'sponsor_header', name: 'Page Header', visible: true, content: {} },
      { id: 'sponsor_steps', key: 'sponsor_steps', name: 'How It Works', visible: true, content: {} },
      { id: 'sponsor_benefits', key: 'sponsor_benefits', name: 'Benefits', visible: true, content: {} },
      { id: 'sponsor_cta', key: 'sponsor_cta', name: 'Call to Action', visible: true, content: {} },
    ],
  },
  {
    id: 'donations', name: 'Donations', slug: '/donate',
    sections: [
      { id: 'donate_header', key: 'donate_header', name: 'Page Header', visible: true, content: {} },
      { id: 'donate_impact', key: 'donate_impact', name: 'Impact Cards', visible: true, content: {} },
      { id: 'donate_steps', key: 'donate_steps', name: 'How It Works', visible: true, content: {} },
    ],
  },
  {
    id: 'contact', name: 'Contact', slug: '/contact',
    sections: [
      { id: 'contact_header', key: 'contact_header', name: 'Page Header', visible: true, content: {} },
      { id: 'contact_info', key: 'contact_info', name: 'Contact Info', visible: true, content: {} },
      { id: 'contact_form', key: 'contact_form', name: 'Contact Form', visible: true, content: {} },
    ],
  },
  {
    id: 'gallery', name: 'Gallery', slug: '/gallery',
    sections: [
      { id: 'gallery_header', key: 'gallery_header', name: 'Page Header', visible: true, content: {} },
      { id: 'gallery_grid', key: 'gallery_grid', name: 'Gallery Grid', visible: true, content: {} },
    ],
  },
  {
    id: 'faq', name: 'FAQ', slug: '/faq',
    sections: [
      { id: 'faq_header', key: 'faq_header', name: 'Page Header', visible: true, content: {} },
      { id: 'faq_list', key: 'faq_list', name: 'FAQ List', visible: true, content: {} },
    ],
  },
]

const deviceWidths: Record<DeviceType, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
}

const availableSections = [
  { id: 'hero', name: 'Hero', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'mission', name: 'Mission', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'stats', name: 'Statistics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'testimonials', name: 'Testimonials', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { id: 'faq', name: 'FAQ', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  { id: 'donation_cta', name: 'Donation CTA', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'gallery', name: 'Gallery', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'video', name: 'Video', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { id: 'timeline', name: 'Timeline', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { id: 'team', name: 'Team Members', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
]

export function WebsiteBuilder() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activePage, setActivePage] = useState('home')
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [panelTab, setPanelTab] = useState<PanelTab>('sections')
  const [hasChanges, setHasChanges] = useState(false)
  const [showAddSection, setShowAddSection] = useState(false)
  const [pages, setPages] = useState<PageDef[]>(pageDefs)

  const [hero, setHero] = useState<HeroContent | null>(null)
  const [welcome, setWelcome] = useState({ title: '', content: '' })
  const [statsTitle, setStatsTitle] = useState('')
  const [featuredTitle, setFeaturedTitle] = useState('')
  const [testimonialTitle, setTestimonialTitle] = useState('')
  const [donationCta, setDonationCta] = useState({ title: '', description: '', button_text: '', button_link: '' })

  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme)
  const [showThemePanel, setShowThemePanel] = useState(false)

  const previewRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const { t } = useCmsStrings()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [heroData, welcomeData, statsData, featuredData, testimonialData, ctaData] = await Promise.all([
        getHeroContent(),
        getSectionContent('welcome'),
        getSectionContent('stats'),
        getSectionContent('featured_students'),
        getSectionContent('testimonials'),
        getSectionContent('donation_cta'),
      ])
      if (heroData) setHero(heroData)
      if (welcomeData?.content) {
        const c = welcomeData.content as { title?: string; content?: string }
        setWelcome({ title: c.title || '', content: c.content || '' })
      }
      if (statsData?.content) setStatsTitle((statsData.content as { title?: string })?.title || '')
      if (featuredData?.content) setFeaturedTitle((featuredData.content as { title?: string })?.title || '')
      if (testimonialData?.content) setTestimonialTitle((testimonialData.content as { title?: string })?.title || '')
      if (ctaData?.content) {
        const c = ctaData.content as { title?: string; description?: string; button_text?: string; button_link?: string }
        setDonationCta({ title: c.title || '', description: c.description || '', button_text: c.button_text || '', button_link: c.button_link || '' })
      }
    } catch { toast.error('Failed to load website content') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (selectedSection && sectionRefs.current[selectedSection]) {
      sectionRefs.current[selectedSection]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [selectedSection])

  const themeVars = {
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-accent': theme.colors.accent,
    '--theme-bg': theme.colors.background,
    '--theme-text': theme.colors.text,
    '--theme-font-heading': theme.fontHeading,
    '--theme-font-body': theme.fontBody,
    '--theme-button-radius': `${theme.buttonRadius}px`,
  } as React.CSSProperties

  const markChanged = () => { setHasChanges(true) }

  const currentPage = pages.find(p => p.id === activePage)

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        hero ? upsertHeroContent({ ...hero } as never) : Promise.resolve(),
        upsertSectionContent({ section_key: 'welcome', title: 'Welcome', content: welcome } as never),
        upsertSectionContent({ section_key: 'stats', title: 'Statistics', content: { title: statsTitle } } as never),
        upsertSectionContent({ section_key: 'featured_students', title: 'Featured Students', content: { title: featuredTitle } } as never),
        upsertSectionContent({ section_key: 'testimonials', title: 'Testimonials', content: { title: testimonialTitle } } as never),
        upsertSectionContent({ section_key: 'donation_cta', title: 'Donation CTA', content: donationCta } as never),
      ])
      toast.success('All changes published')
      setHasChanges(false)
    } catch { toast.error('Failed to publish changes') }
    finally { setSaving(false) }
  }

  const toggleSectionVisibility = (sectionId: string) => {
    const page = pages.find(p => p.id === activePage)
    if (!page) return
    const updated = page.sections.map(s => s.id === sectionId ? { ...s, visible: !s.visible } : s)
    setPages(prev => prev.map(p => p.id === activePage ? { ...p, sections: updated } : p))
    markChanged()
  }

  const addSection = (sectionType: string) => {
    const page = pages.find(p => p.id === activePage)
    if (!page) return
    const sectionDef = availableSections.find(s => s.id === sectionType)
    if (!sectionDef) return
    const newSection: SectionDef = {
      id: `${sectionType}_${Date.now()}`,
      key: sectionType,
      name: sectionDef.name,
      visible: true,
      content: {},
    }
    setPages(prev => prev.map(p => p.id === activePage ? { ...p, sections: [...p.sections, newSection] } : p))
    setShowAddSection(false)
    setSelectedSection(newSection.id)
    markChanged()
  }

  const duplicateSection = (sectionId: string) => {
    const page = pages.find(p => p.id === activePage)
    if (!page) return
    const source = page.sections.find(s => s.id === sectionId)
    if (!source) return
    const dup: SectionDef = { ...source, id: `${source.id}_copy_${Date.now()}`, name: `${source.name} (Copy)` }
    setPages(prev => prev.map(p => p.id === activePage ? { ...p, sections: [...p.sections, dup] } : p))
    markChanged()
  }

  const deleteSection = (sectionId: string) => {
    setPages(prev => prev.map(p => p.id === activePage ? { ...p, sections: p.sections.filter(s => s.id !== sectionId) } : p))
    if (selectedSection === sectionId) setSelectedSection(null)
    markChanged()
  }

  const reorderSections = (reordered: SectionDef[]) => {
    setPages(prev => prev.map(p => p.id === activePage ? { ...p, sections: reordered } : p))
    markChanged()
  }

  if (loading) return <FormSkeleton fields={8} />

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col" style={{ backgroundColor: 'var(--theme-bg, #FFF8F0)', ...themeVars }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b shrink-0" style={{ borderColor: `${theme.colors.accent}` }}>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold" style={{ color: theme.colors.text }}>Website Builder</h1>
          {hasChanges && (
            <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border" style={{ color: theme.colors.primary, backgroundColor: `${theme.colors.accent}`, borderColor: `${theme.colors.primary}40` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.colors.primary }} />
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 mr-4">
            {(['desktop', 'tablet', 'mobile'] as DeviceType[]).map(d => (
              <button key={d} onClick={() => setDevice(d)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${device === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {d === 'desktop' ? '🖥 Desktop' : d === 'tablet' ? '📱 Tablet' : '📱 Mobile'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowThemePanel(!showThemePanel)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            Theme
          </button>
          {hasChanges && (
            <button onClick={() => { setHasChanges(false); load() }}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Discard</button>
          )}
          <button onClick={handleSave} disabled={saving || !hasChanges}
            className="px-5 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: theme.colors.primary }}>
            {saving ? 'Publishing...' : hasChanges ? 'Publish Changes' : 'Published'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ fontFamily: theme.fontBody }}>
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r overflow-y-auto shrink-0" style={{ borderColor: `${theme.colors.accent}` }}>
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pages</h2>
              <div className="space-y-0.5">
                {pages.map(page => (
                  <button key={page.id}
                    onClick={() => { setActivePage(page.id); setSelectedSection(null); setShowAddSection(false) }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activePage === page.id ? 'text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    style={activePage === page.id ? { backgroundColor: theme.colors.primary } : {}}>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      {page.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {currentPage && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sections</h2>
                  <span className="text-[10px] text-gray-400">{currentPage.sections.filter(s => s.visible).length} visible</span>
                </div>
                <Reorder.Group axis="y" values={currentPage.sections} onReorder={reorderSections} className="space-y-0.5">
                  {currentPage.sections.map((sec) => (
                    <Reorder.Item key={sec.id} value={sec} className="group flex items-center gap-1">
                      <span className="cursor-grab active:cursor-grabbing p-0.5 text-gray-300 hover:text-gray-500 shrink-0 touch-none">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                        </svg>
                      </span>
                      <button onClick={() => { setSelectedSection(sec.id); setShowAddSection(false) }}
                        className={`flex-1 text-left px-2 py-1.5 rounded text-xs transition-colors truncate ${
                          selectedSection === sec.id ? 'text-white' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                        style={selectedSection === sec.id ? { backgroundColor: theme.colors.primary } : {}}>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${sec.visible ? '' : 'opacity-30'}`}
                            style={{ backgroundColor: selectedSection === sec.id ? 'white' : theme.colors.primary }} />
                          <span className={sec.visible ? '' : 'line-through opacity-50'}>{sec.name}</span>
                        </div>
                      </button>
                      <button onClick={() => toggleSectionVisibility(sec.id)}
                        className="p-1 text-gray-300 hover:text-gray-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title={sec.visible ? 'Hide' : 'Show'}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {sec.visible
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          }
                        </svg>
                      </button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            )}

            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Actions</h2>
              <div className="space-y-1">
                <button onClick={() => setShowAddSection(!showAddSection)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Section
                </button>
                {selectedSection && (
                  <>
                    <button onClick={() => duplicateSection(selectedSection)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      Duplicate Section
                    </button>
                    <button onClick={() => toggleSectionVisibility(selectedSection)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      {currentPage?.sections.find(s => s.id === selectedSection)?.visible ? 'Hide' : 'Show'} Section
                    </button>
                    <button onClick={() => deleteSection(selectedSection)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete Section
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showAddSection && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="border-t overflow-hidden" style={{ borderColor: `${theme.colors.accent}` }}>
                <div className="p-3 space-y-1">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Add New Section</h3>
                  {availableSections.map(s => (
                    <button key={s.id} onClick={() => addSection(s.id)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} /></svg>
                      {s.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center - Live Preview */}
        <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto" style={{ backgroundColor: theme.colors.background }}>
          <motion.div layout style={{ maxWidth: deviceWidths[device], ...themeVars, borderColor: theme.colors.accent }}
            className="w-full bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
            <div className="p-1 bg-gray-50 border-b border-gray-100 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="text-[10px] text-gray-400 ml-2 font-mono">{currentPage?.slug || '/'}</span>
            </div>

            <div ref={previewRef}>
              {currentPage?.sections.filter(s => s.visible).map((sec) => (
                  <SectionPreview key={sec.id}
                    id={sec.id}
                    selected={selectedSection === sec.id}
                    onClick={() => { setSelectedSection(sec.id); setShowAddSection(false) }}
                    label={sec.name}
                    sectionRef={el => sectionRefs.current[sec.id] = el}>
                  {renderSectionPreview(sec.id, { hero, welcome, statsTitle, featuredTitle, testimonialTitle, donationCta, theme, selectedSection, onEdit: { setHero, setWelcome, setStatsTitle, setFeaturedTitle, setTestimonialTitle, setDonationCta, markChanged } })}
                </SectionPreview>
              ))}
              {currentPage?.sections.filter(s => s.visible).length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <p>All sections are hidden</p>
                  <p className="text-sm mt-1">Click "Add Section" to add content</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Properties / Theme Panel */}
        <div className="w-80 bg-white border-l overflow-y-auto shrink-0" style={{ borderColor: `${theme.colors.accent}` }}>
          {showThemePanel ? (
            <div className="p-4 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: `${theme.colors.accent}` }}>
                <h2 className="text-sm font-bold" style={{ color: theme.colors.text }}>Theme & Branding</h2>
                <button onClick={() => setShowThemePanel(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Colors</h3>
                <div className="space-y-3">
                  {(['primary', 'secondary', 'accent', 'background', 'text'] as const).map(key => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{key} Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={theme.colors[key]}
                          onChange={v => setTheme(prev => ({ ...prev, colors: { ...prev.colors, [key]: v.target.value } }))}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer shrink-0" />
                        <input value={theme.colors[key]}
                          onChange={v => setTheme(prev => ({ ...prev, colors: { ...prev.colors, [key]: v.target.value } }))}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Typography</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Heading Font</label>
                    <select value={theme.fontHeading} onChange={e => setTheme(p => ({ ...p, fontHeading: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                      {['Inter, sans-serif', 'Georgia, serif', 'Arial, sans-serif', 'Trebuchet MS, sans-serif'].map(f => (
                        <option key={f} value={f}>{f.split(',')[0]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Body Font</label>
                    <select value={theme.fontBody} onChange={e => setTheme(p => ({ ...p, fontBody: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                      {['Inter, sans-serif', 'Georgia, serif', 'Arial, sans-serif', 'Trebuchet MS, sans-serif'].map(f => (
                        <option key={f} value={f}>{f.split(',')[0]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Buttons</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Border Radius: {theme.buttonRadius}px</label>
                    <input type="range" min="0" max="24" value={theme.buttonRadius}
                      onChange={e => setTheme(p => ({ ...p, buttonRadius: Number(e.target.value) }))}
                      className="w-full accent-amber-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Button Style</label>
                    <div className="flex gap-2">
                      {(['filled', 'outline', 'soft'] as const).map(s => (
                        <button key={s} onClick={() => setTheme(p => ({ ...p, buttonStyle: s }))}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                            theme.buttonStyle === s ? 'text-white' : 'bg-gray-50 text-gray-600 border border-gray-200'
                          }`}
                          style={theme.buttonStyle === s ? { backgroundColor: theme.colors.primary } : {}}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[10px] text-gray-400">Changes update instantly in the preview</p>
              </div>
            </div>
          ) : selectedSection ? (
            <div className="p-4 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: `${theme.colors.accent}` }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.colors.primary }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.colors.primary }}>Editing</span>
                <span className="text-xs text-gray-400 ml-1">{currentPage?.sections.find(s => s.id === selectedSection)?.name || selectedSection}</span>
              </div>

              {selectedSection === 'hero' && (
                <PropertyGroup title="Hero Banner">
                  <PropertyField label="Title" value={hero?.title || ''} onChange={v => { setHero(prev => prev ? { ...prev, title: v } : null); markChanged() }} />
                  <PropertyField label="Highlight" value={hero?.highlight || ''} onChange={v => { setHero(prev => prev ? { ...prev, highlight: v } : null); markChanged() }} />
                  <PropertyTextarea label="Description" value={hero?.description || ''} onChange={v => { setHero(prev => prev ? { ...prev, description: v } : null); markChanged() }} />
                  <PropertyField label="Primary Button" value={hero?.cta_primary_text || ''} onChange={v => { setHero(prev => prev ? { ...prev, cta_primary_text: v } : null); markChanged() }} />
                  <PropertyField label="Button Link" value={hero?.cta_primary_link || ''} onChange={v => { setHero(prev => prev ? { ...prev, cta_primary_link: v } : null); markChanged() }} />
                  <PropertyField label="Secondary Button" value={hero?.cta_secondary_text || ''} onChange={v => { setHero(prev => prev ? { ...prev, cta_secondary_text: v } : null); markChanged() }} />
                  <PropertyField label="Background Image URL" value={hero?.background_image || ''} onChange={v => { setHero(prev => prev ? { ...prev, background_image: v } : null); markChanged() }} />
                </PropertyGroup>
              )}

              {selectedSection === 'welcome' && (
                <PropertyGroup title="Welcome Section">
                  <PropertyField label="Title" value={welcome.title} onChange={v => { setWelcome(p => ({ ...p, title: v })); markChanged() }} />
                  <PropertyTextarea label="Content" value={welcome.content} onChange={v => { setWelcome(p => ({ ...p, content: v })); markChanged() }} />
                </PropertyGroup>
              )}

              {selectedSection === 'stats' && (
                <PropertyGroup title="Statistics">
                  <PropertyField label="Section Title" value={statsTitle} onChange={v => { setStatsTitle(v); markChanged() }} />
                  <p className="text-xs text-gray-400">Statistics values can be edited in the About page editor</p>
                </PropertyGroup>
              )}

              {selectedSection === 'featured_students' && (
                <PropertyGroup title="Featured Students">
                  <PropertyField label="Section Title" value={featuredTitle} onChange={v => { setFeaturedTitle(v); markChanged() }} />
                </PropertyGroup>
              )}

              {selectedSection === 'testimonials' && (
                <PropertyGroup title="Testimonials">
                  <PropertyField label="Section Title" value={testimonialTitle} onChange={v => { setTestimonialTitle(v); markChanged() }} />
                </PropertyGroup>
              )}

              {selectedSection === 'donation_cta' && (
                <PropertyGroup title="Donation Call to Action">
                  <PropertyField label="Title" value={donationCta.title} onChange={v => { setDonationCta(p => ({ ...p, title: v })); markChanged() }} />
                  <PropertyTextarea label="Description" value={donationCta.description} onChange={v => { setDonationCta(p => ({ ...p, description: v })); markChanged() }} />
                  <PropertyField label="Button Text" value={donationCta.button_text} onChange={v => { setDonationCta(p => ({ ...p, button_text: v })); markChanged() }} />
                  <PropertyField label="Button Link" value={donationCta.button_link} onChange={v => { setDonationCta(p => ({ ...p, button_link: v })); markChanged() }} />
                </PropertyGroup>
              )}

              {!['hero', 'welcome', 'stats', 'featured_students', 'testimonials', 'donation_cta'].includes(selectedSection) && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Content for this section can be edited in the dedicated page editor</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${theme.colors.accent}` }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.colors.primary }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <p className="text-sm" style={{ color: theme.colors.text }}>Select a section to edit</p>
              <p className="text-xs text-gray-400 mt-1">or click Theme to customize colors & fonts</p>
              <button onClick={() => setShowThemePanel(true)}
                className="mt-4 px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: theme.colors.primary }}>
                Open Theme Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function renderSectionPreview(id: string, data: {
  hero: HeroContent | null; welcome: { title: string; content: string }; statsTitle: string;
  featuredTitle: string; testimonialTitle: string; donationCta: { title: string; description: string; button_text: string; button_link: string };
  theme: ThemeConfig; selectedSection: string | null;
  onEdit: { setHero: (fn: HeroContent | null | ((prev: HeroContent | null) => HeroContent | null)) => void; setWelcome: (fn: { title: string; content: string } | ((prev: { title: string; content: string }) => { title: string; content: string })) => void; setStatsTitle: (v: string) => void; setFeaturedTitle: (v: string) => void; setTestimonialTitle: (v: string) => void; setDonationCta: (fn: { title: string; description: string; button_text: string; button_link: string } | ((prev: { title: string; description: string; button_text: string; button_link: string }) => { title: string; description: string; button_text: string; button_link: string })) => void; markChanged: () => void }
}) {
  const theme = data.theme
  const isSelected = (sectionId: string) => data.selectedSection === sectionId
  switch (id) {
    case 'hero':
      return (
        <div className="relative px-8 py-16 md:py-24 text-white" style={{ backgroundColor: theme.colors.secondary }}>
          <div className="max-w-3xl">
            <InlineEdit value={data.hero?.title || ''} live={isSelected('hero')}
              onSave={v => { data.onEdit.setHero(prev => prev ? { ...prev, title: v } : null); data.onEdit.markChanged() }}
              className="text-4xl md:text-5xl font-bold leading-tight"
              style={{ fontFamily: theme.fontHeading }} />
            <InlineEdit value={data.hero?.highlight || ''} live={isSelected('hero')}
              onSave={v => { data.onEdit.setHero(prev => prev ? { ...prev, highlight: v } : null); data.onEdit.markChanged() }}
              className="inline-block mt-2 text-lg font-semibold"
              style={{ color: theme.colors.accent }} />
            <InlineEdit value={data.hero?.description || ''} live={isSelected('hero')}
              onSave={v => { data.onEdit.setHero(prev => prev ? { ...prev, description: v } : null); data.onEdit.markChanged() }}
              className="mt-4 text-lg text-white/80 max-w-2xl" />
            <div className="flex gap-3 mt-6">
              <InlineEdit value={data.hero?.cta_primary_text || ''} live={isSelected('hero')}
                onSave={v => { data.onEdit.setHero(prev => prev ? { ...prev, cta_primary_text: v } : null); data.onEdit.markChanged() }}
                className="px-6 py-3 font-semibold text-sm"
                style={{ backgroundColor: 'white', color: theme.colors.primary, borderRadius: `${theme.buttonRadius}px` }} />
              <InlineEdit value={data.hero?.cta_secondary_text || ''} live={isSelected('hero')}
                onSave={v => { data.onEdit.setHero(prev => prev ? { ...prev, cta_secondary_text: v } : null); data.onEdit.markChanged() }}
                className="px-6 py-3 font-semibold text-sm border-2 border-white/50 text-white"
                style={{ borderRadius: `${theme.buttonRadius}px` }} />
            </div>
          </div>
        </div>
      )
    case 'welcome':
      return (
        <div className="px-8 py-12 text-center max-w-3xl mx-auto">
          <InlineEdit value={data.welcome.title} live={isSelected('welcome')}
            onSave={v => { data.onEdit.setWelcome(p => ({ ...p, title: v })); data.onEdit.markChanged() }}
            className="text-3xl font-bold"
            style={{ color: theme.colors.text, fontFamily: theme.fontHeading }} />
          <InlineEdit value={data.welcome.content} live={isSelected('welcome')}
            onSave={v => { data.onEdit.setWelcome(p => ({ ...p, content: v })); data.onEdit.markChanged() }}
            className="mt-4 leading-relaxed text-gray-600" />
        </div>
      )
    case 'stats':
      return (
        <div className="px-8 py-12" style={{ backgroundColor: theme.colors.accent }}>
          <InlineEdit value={data.statsTitle} live={isSelected('stats')}
            onSave={data.onEdit.setStatsTitle as (v: string) => void}
            className="text-2xl font-bold text-center mb-6"
            style={{ color: theme.colors.text, fontFamily: theme.fontHeading }} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[{ value: '49+', label: 'Years' }, { value: '2000+', label: 'Students' }, { value: '100%', label: 'Free' }, { value: '12+', label: 'Countries' }].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold" style={{ color: theme.colors.primary }}>{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )
    case 'featured_students':
      return (
        <div className="px-8 py-12">
          <InlineEdit value={data.featuredTitle} live={isSelected('featured_students')}
            onSave={data.onEdit.setFeaturedTitle as (v: string) => void}
            className="text-2xl font-bold text-center mb-8"
            style={{ color: theme.colors.text, fontFamily: theme.fontHeading }} />
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
                <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2" />
                <div className="h-3 bg-gray-100 rounded w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      )
    case 'testimonials':
      return (
        <div className="px-8 py-12 bg-gray-50">
          <InlineEdit value={data.testimonialTitle} live={isSelected('testimonials')}
            onSave={data.onEdit.setTestimonialTitle as (v: string) => void}
            className="text-2xl font-bold text-center mb-8"
            style={{ color: theme.colors.text, fontFamily: theme.fontHeading }} />
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-full mb-3" style={{ backgroundColor: theme.colors.accent }} />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      )
    case 'donation_cta':
      return (
        <div className="px-8 py-16 text-center" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>
          <InlineEdit value={data.donationCta.title} live={isSelected('donation_cta')}
            onSave={v => { data.onEdit.setDonationCta(p => ({ ...p, title: v })); data.onEdit.markChanged() }}
            className="text-3xl font-bold text-white"
            style={{ fontFamily: theme.fontHeading }} />
          <InlineEdit value={data.donationCta.description} live={isSelected('donation_cta')}
            onSave={v => { data.onEdit.setDonationCta(p => ({ ...p, description: v })); data.onEdit.markChanged() }}
            className="mt-3 text-white/80 max-w-xl mx-auto" />
          <InlineEdit value={data.donationCta.button_text} live={isSelected('donation_cta')}
            onSave={v => { data.onEdit.setDonationCta(p => ({ ...p, button_text: v })); data.onEdit.markChanged() }}
            className="inline-block mt-6 px-8 py-3 font-semibold"
            style={{ backgroundColor: 'white', color: theme.colors.primary, borderRadius: `${theme.buttonRadius}px` }} />
        </div>
      )
    default:
      return (
        <div className="px-8 py-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: theme.colors.accent }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.colors.primary }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Content section</p>
        </div>
      )
  }
}

function InlineEdit({ value, onSave, className, style, live }: {
  value: string; onSave: (val: string) => void; className?: string; style?: React.CSSProperties; live?: boolean
}) {
  const [editVal, setEditVal] = useState(value)
  const [editing, setEditing] = useState(false)
  const isDirty = editVal !== value

  useEffect(() => { if (!editing) setEditVal(value) }, [value, editing])

  const commit = () => { if (isDirty) onSave(editVal); setEditing(false) }

  if (editing) {
    return (
      <div className={`inline-block outline outline-2 outline-amber-400 rounded px-0.5 ${className || ''}`} style={style}>
        <input autoFocus value={editVal}
          onChange={e => setEditVal(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit() } }}
          className="bg-transparent border-none outline-none w-full" />
      </div>
    )
  }

  return (
    <span onClick={(e) => { e.stopPropagation(); setEditing(true) }}
      className={`cursor-pointer hover:outline hover:outline-2 hover:outline-amber-300/50 rounded px-0.5 inline-block ${className || ''}`}
      style={style}>
      {value || (live ? '' : <span className="text-gray-300 italic">Click to edit</span>)}
    </span>
  )
}

function SectionPreview({ id, selected, onClick, label, children, sectionRef }: {
  id: string; selected: boolean; onClick: () => void; label: string; children: React.ReactNode;
  sectionRef: (el: HTMLDivElement | null) => void
}) {
  return (
    <div ref={sectionRef} onClick={onClick}
      className={`relative cursor-pointer transition-all duration-200 ${
        selected
          ? 'ring-2 ring-amber-500 ring-inset shadow-[0_0_25px_rgba(245,158,11,0.2)]'
          : 'hover:ring-1 hover:ring-amber-300/50 hover:ring-inset'
      }`}>
      {selected && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500 text-white text-[10px] font-semibold shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          Currently Editing
        </div>
      )}
      {children}
    </div>
  )
}

function PropertyGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function PropertyField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors" />
    </div>
  )
}

function PropertyTextarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-vertical" />
    </div>
  )
}
