import { useState, useCallback, useEffect, useMemo } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowRight, FileText, Globe, Eye, Layers } from 'lucide-react'
import { useCmsPages } from '../../../hooks/useCmsPages'
import { ToggleSwitch } from '../../../components/ui/ToggleSwitch'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { FormSkeleton } from '../../../components/ui/LoadingSkeleton'
import { getAllCmsStrings, upsertCmsString, upsertSectionContent, upsertHeroContent, upsertPageHeader } from '../../../services/cms-content'
import type { CmsPage, CmsSection } from '../../../types/cms-pages'
import type { CmsPageData } from '../../../services/cms-pages'
import type { CmsStringMap } from '../../../types/cms-content'

type ViewMode = 'pages' | 'editor' | 'seo' | 'settings'
type PreviewDevice = 'desktop' | 'tablet' | 'mobile'
type EditorTab = 'content' | 'design' | 'layout' | 'advanced'

const PAGE_CATEGORIES: { label: string; pageIds: string[] }[] = [
  { label: 'Main Pages', pageIds: ['home', 'about', 'sponsorship', 'students', 'donations'] },
  { label: 'Content', pageIds: ['gallery', 'news', 'success-stories', 'testimonials_page', 'activity'] },
  { label: 'Engagement', pageIds: ['contact', 'faq', 'volunteer', 'campaigns'] },
  { label: 'Legal & Info', pageIds: ['privacy', 'terms', 'transparency'] },
  { label: 'Additional', pageIds: ['events', 'impact', 'team'] },
]

const FRIENDLY_LABELS: Record<string, string> = {
  hero: 'Hero Banner',
  page_header: 'Page Header',
  welcome: 'Welcome Text',
  about_preview: 'About Preview',
  stats: 'Statistics',
  featured_students: 'Featured Students',
  sponsorship_steps: 'How Sponsorship Works',
  testimonials: 'Testimonials',
  donation_cta: 'Donation Call-to-Action',
  about_mission: 'Mission & Vision',
  about_values: 'Core Values',
  about_timeline: 'History Timeline',
  sponsor_hero: 'Sponsorship Banner',
  sponsor_steps: 'How to Sponsor',
  sponsor_benefits: 'Sponsorship Benefits',
  sponsor_cta: 'Sponsorship CTA',
  donate_hero: 'Donation Banner',
  donate_impact: 'Impact Cards',
  donate_process: 'Donation Process',
  contact_details: 'Contact Information',
  contact_form: 'Contact Form',
  faq_list: 'FAQ List',
  gallery_grid: 'Photo Gallery',
  volunteer_hero: 'Volunteer Banner',
  volunteer_opps: 'Opportunities',
  volunteer_form: 'Application Form',
  privacy_content: 'Privacy Policy Text',
  terms_content: 'Terms of Service Text',
  news_grid: 'News Articles',
  students_grid: 'Student Profiles',
  activity_feed: 'Activity Feed',
  success_stories: 'Success Stories',
  transparency_content: 'Transparency Content',
  campaigns_list: 'Campaigns',
  cta_banner: 'CTA Banner',
  custom_content: 'Custom Content',
  events_grid: 'Events',
  impact_content: 'Impact Content',
  team_grid: 'Team Members',
  testimonials_list: 'Testimonials List',
  stories_grid: 'Stories Grid',
  donation_form: 'Donation Form',
  student_story: 'Student Story',
  map_location: 'Map Location',
}

export function WebsiteBuilder() {
  const {
    loading,
    dataset,
    activePageData,
    activePage,
    setActivePage,
    togglePageVisibility,
    toggleSectionVisibility,
    togglePublishStatus,
    updateSeo,
  } = useCmsPages()

  const [search, setSearch] = useState('')
  const [view, setView] = useState<ViewMode>('pages')
  const [selectedSectionKey, setSelectedSectionKey] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop')
  const [editorTab, setEditorTab] = useState<EditorTab>('content')
  const [cmsStrings, setCmsStrings] = useState<CmsStringMap>({})
  const [contentAudit, setContentAudit] = useState<ContentAudit | null>(null)

  useEffect(() => {
    getAllCmsStrings().then(setCmsStrings).catch(() => {})
  }, [])

  const filteredPages = (dataset?.pages || []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      if (activePage && activePageData) {
        for (const section of activePage.sections) {
          const sectionContent = activePageData.sections[section.key]
          if (sectionContent) {
            const content = sectionContent.content as Record<string, any> | undefined
            if (content && Object.keys(content).length > 0) {
              await upsertSectionContent({
                section_key: section.key,
                title: sectionContent.title,
                subtitle: sectionContent.subtitle,
                description: sectionContent.description,
                content,
              }).catch(() => {})
            }
          }
        }
      }
      toast.success('All changes saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }, [activePage, activePageData])

  const handleUpdateString = useCallback(async (key: string, value: string) => {
    setCmsStrings(prev => ({ ...prev, [key]: value }))
    try {
      await upsertCmsString({ key, value, category: 'general' })
    } catch {
      toast.error('Failed to save text')
    }
  }, [])

  if (loading) return <FormSkeleton fields={8} />

  if (view === 'editor' && activePage && activePageData) {
    return (
      <VisualPageEditor
        page={activePage}
        pageData={activePageData}
        selectedSectionKey={selectedSectionKey}
        setSelectedSectionKey={setSelectedSectionKey}
        toggleSectionVisibility={toggleSectionVisibility}
        togglePublishStatus={togglePublishStatus}
        previewDevice={previewDevice}
        setPreviewDevice={setPreviewDevice}
        editorTab={editorTab}
        setEditorTab={setEditorTab}
        onBack={() => { setView('pages'); setSelectedSectionKey(null) }}
        onSave={handleSave}
        saving={saving}
        cmsStrings={cmsStrings}
        onUpdateString={handleUpdateString}
      />
    )
  }

  if (view === 'seo' && activePage) {
    return (
      <SeoEditorView
        page={activePage}
        onSave={(title, desc) => {
          updateSeo(activePage.id, title, desc)
          setView('editor')
        }}
        onBack={() => setView('editor')}
      />
    )
  }

  if (view === 'settings') {
    return (
      <SiteSettingsView
        onBack={() => setView('pages')}
        cmsStrings={cmsStrings}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Builder</h1>
          <p className="text-gray-500 mt-1">Design and manage your website visually</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search pages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-3 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-500/50 w-44"
            />
          </div>
          <button
            onClick={async () => {
              toast.loading('Scanning website...')
              const audit = await scanWebsiteContent()
              setContentAudit(audit)
              toast.dismiss()
              toast.success(`Found ${audit.totalSections} sections across ${audit.pages.length} pages`)
            }}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Scan
          </button>
          <button
            onClick={() => setView('settings')}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Site Settings
          </button>
          <RouterLink
            to="/admin/website/media"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Media Library
          </RouterLink>
        </div>
      </div>

      {contentAudit && <ContentAuditBanner audit={contentAudit} onDismiss={() => setContentAudit(null)} />}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Page Navigator</h3>
            </div>
            <div className="p-2 space-y-1 max-h-[500px] overflow-y-auto">
              {PAGE_CATEGORIES.map(cat => {
                const catPages = filteredPages.filter(p => cat.pageIds.includes(p.id))
                if (catPages.length === 0) return null
                return (
                  <div key={cat.label}>
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{cat.label}</div>
                    {catPages.map(page => (
                        <button
                          key={page.id}
                          onClick={() => {
                            setActivePage(page.id)
                            setView('editor')
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                            activePage?.id === page.id ? 'bg-amber-50 text-amber-700 font-medium ring-1 ring-amber-200' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="flex-1 text-left truncate">{page.name}</span>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${page.isVisible ? 'bg-green-400' : 'bg-gray-300'}`} />
                        </button>
                      )
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] gap-4 p-4 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center gap-4">
                <span className="w-8" />
                <span className="flex-1">Page</span>
                <span className="w-24 text-center">Status</span>
                <span className="w-16 text-center">Sections</span>
              </div>
              <div className="flex items-center gap-4 pr-2">
                <span className="w-14 text-center">Show</span>
                <span className="w-14 text-center">Publish</span>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {filteredPages.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pages found</p>
                </div>
              ) : (
                filteredPages.map(page => (
                  <PageListItem
                    key={page.id}
                    page={page}
                    onEdit={() => {
                      setActivePage(page.id)
                      setView('editor')
                    }}
                    onToggleVisibility={(v) => togglePageVisibility(page.id, v)}
                    onTogglePublished={(v) => togglePublishStatus(page.id, v)}
                    onEditSeo={() => {
                      setActivePage(page.id)
                      setView('seo')
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Live Preview</h3>
              <p className="text-sm text-gray-600 mt-0.5">{dataset?.pages.filter(p => p.isPublished).length || 0} published pages</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Real Data</h3>
              <p className="text-sm text-gray-600 mt-0.5">{dataset?.pages.reduce((s, p) => s + p.sections.length, 0) || 0} editable sections</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Click & Edit</h3>
              <p className="text-sm text-gray-600 mt-0.5">Select a page from the navigator to start editing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContentAuditBanner({ audit, onDismiss }: { audit: ContentAudit; onDismiss: () => void }) {
  const missingCount = audit.pages.reduce((sum, p) => sum + p.missingSections.length, 0)
  return (
    <div className={`rounded-xl border px-5 py-4 ${missingCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {missingCount > 0
              ? `Found ${missingCount} section${missingCount > 1 ? 's' : ''} not in the builder`
              : 'All website content is connected to the builder'}
          </h3>
          <div className="mt-2 space-y-1">
            {audit.pages.filter(p => p.missingSections.length > 0).map(p => (
              <div key={p.pageName} className="text-sm text-gray-600">
                <span className="font-medium">{p.pageName}:</span>{' '}
                {p.missingSections.map(s => s.friendlyName).join(', ')}
              </div>
            ))}
          </div>
          {missingCount > 0 && (
            <button className="mt-3 text-sm font-medium text-amber-600 hover:text-amber-700">
              Import missing content into builder
            </button>
          )}
        </div>
        <button onClick={onDismiss} className="text-xs text-gray-400 hover:text-gray-600">
          Close
        </button>
      </div>
    </div>
  )
}

interface ContentAudit {
  pages: { pageName: string; slug: string; sections: string[]; missingSections: { key: string; friendlyName: string }[] }[]
  totalSections: number
}

async function scanWebsiteContent(): Promise<ContentAudit> {
  const knownSections = new Set([
    'hero', 'page_header', 'welcome', 'about_preview', 'stats', 'featured_students',
    'sponsorship_steps', 'testimonials', 'donation_cta', 'about_mission', 'about_values',
    'about_timeline', 'sponsor_hero', 'sponsor_steps', 'sponsor_benefits', 'sponsor_cta',
    'donate_hero', 'donate_impact', 'donate_process', 'contact_details', 'contact_form',
    'faq_list', 'gallery_grid', 'volunteer_hero', 'volunteer_opps', 'volunteer_form',
    'privacy_content', 'terms_content', 'news_grid', 'students_grid', 'activity_feed',
    'success_stories', 'transparency_content', 'campaigns_list', 'cta_banner',
    'donation_form', 'student_story', 'map_location',
  ])

  const allPageRoutes = [
    { name: 'Home', slug: 'home', sections: ['hero', 'stats', 'welcome', 'about_preview', 'featured_students', 'sponsorship_steps', 'testimonials', 'donation_cta', 'cta_banner'] },
    { name: 'About Us', slug: 'about', sections: ['about_mission', 'about_values', 'about_stats', 'about_timeline', 'about_cta'] },
    { name: 'Sponsorship', slug: 'sponsor', sections: ['sponsor_hero', 'sponsor_steps', 'sponsor_benefits', 'sponsor_cta'] },
    { name: 'Students', slug: 'students', sections: ['students_grid'] },
    { name: 'Donations', slug: 'donate', sections: ['donate_hero', 'donate_impact', 'donate_process', 'donation_form', 'student_story'] },
    { name: 'Gallery', slug: 'gallery', sections: ['gallery_grid'] },
    { name: 'News', slug: 'news', sections: ['news_grid'] },
    { name: 'Contact', slug: 'contact', sections: ['contact_details', 'contact_form', 'map_location'] },
    { name: 'FAQ', slug: 'faq', sections: ['faq_list'] },
    { name: 'Volunteer', slug: 'volunteer', sections: ['volunteer_hero', 'volunteer_opps', 'volunteer_form'] },
    { name: 'Privacy Policy', slug: 'privacy', sections: ['privacy_content'] },
    { name: 'Terms of Service', slug: 'terms', sections: ['terms_content'] },
    { name: 'Success Stories', slug: 'success-stories', sections: ['success_stories'] },
    { name: 'Transparency', slug: 'transparency', sections: ['transparency_content'] },
    { name: 'Campaigns', slug: 'campaigns', sections: ['campaigns_list'] },
    { name: 'Activity', slug: 'activity', sections: ['activity_feed'] },
  ]

  const pages = allPageRoutes.map(page => {
    const missingSections = page.sections
      .filter(s => !knownSections.has(s))
      .map(s => ({ key: s, friendlyName: FRIENDLY_LABELS[s] || s.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) }))
    return { pageName: page.name, slug: page.slug, sections: page.sections, missingSections }
  })

  const totalSections = allPageRoutes.reduce((sum, p) => sum + p.sections.length, 0)
  const totalMissing = pages.reduce((sum, p) => sum + p.missingSections.length, 0)
  return { pages, totalSections }
}

function PageListItem({ page, onEdit, onToggleVisibility, onTogglePublished, onEditSeo }: {
  page: CmsPage
  onEdit: () => void
  onToggleVisibility: (v: boolean) => void
  onTogglePublished: (v: boolean) => void
  onEditSeo: () => void
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 items-center px-4 py-3 hover:bg-gray-50/50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full shrink-0 ${page.isVisible ? 'bg-green-400' : 'bg-gray-300'}`} />
        <button onClick={onEdit} className="flex-1 text-left group/edit">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 group-hover/edit:text-amber-600 transition-colors">{page.name}</span>
            <span className="text-xs text-gray-400">/{page.slug}</span>
          </div>
        </button>
        <div className="w-24 flex justify-center">
          <StatusBadge status={page.isPublished ? 'published' : 'draft'} />
        </div>
        <div className="w-16 text-center">
          <span className="text-xs text-gray-400">{page.sections.length}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onEditSeo} className="text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors opacity-0 group-hover:opacity-100">
          SEO
        </button>
        <label className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${page.isVisible ? 'bg-amber-500' : 'bg-gray-200'}`}>
          <input type="checkbox" checked={page.isVisible} onChange={e => onToggleVisibility(e.target.checked)} className="sr-only" />
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${page.isVisible ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </label>
        <label className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${page.isPublished ? 'bg-amber-500' : 'bg-gray-200'}`}>
          <input type="checkbox" checked={page.isPublished} onChange={e => onTogglePublished(e.target.checked)} className="sr-only" />
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${page.isPublished ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </label>
      </div>
    </div>
  )
}

function VisualPageEditor({ page, pageData, selectedSectionKey, setSelectedSectionKey, toggleSectionVisibility, togglePublishStatus, previewDevice, setPreviewDevice, editorTab, setEditorTab, onBack, onSave, saving, cmsStrings }: {
  page: CmsPage
  pageData: CmsPageData
  selectedSectionKey: string | null
  setSelectedSectionKey: (k: string | null) => void
  toggleSectionVisibility: (key: string, v: boolean) => void
  togglePublishStatus: (id: string, v: boolean) => void
  previewDevice: PreviewDevice
  setPreviewDevice: (d: PreviewDevice) => void
  editorTab: EditorTab
  setEditorTab: (t: EditorTab) => void
  onBack: () => void
  onSave: () => void
  saving: boolean
  cmsStrings: CmsStringMap
  onUpdateString: (key: string, value: string) => Promise<void>
}) {
  const [localVisibility, setLocalVisibility] = useState<Record<string, boolean>>(pageData.visibility)
  const sectionOrder = useMemo(() =>
    [...page.sections].sort((a, b) => a.displayOrder - b.displayOrder),
    [page.sections]
  )

  const toggleLocalVisibility = useCallback((key: string) => {
    setLocalVisibility(prev => ({ ...prev, [key]: !prev[key] }))
    toggleSectionVisibility(key, !localVisibility[key])
  }, [localVisibility, toggleSectionVisibility])

  const previewWidths: Record<PreviewDevice, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -mx-6 -mb-6">
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Back
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">{page.name}</h1>
            <StatusBadge status={page.isPublished ? 'published' : 'draft'} />
            <span className="text-xs text-gray-400">/{page.slug}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            {(['desktop', 'tablet', 'mobile'] as const).map(d => (
              <button key={d} onClick={() => setPreviewDevice(d)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${previewDevice === d ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <label className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${page.isPublished ? 'bg-amber-500' : 'bg-gray-200'}`}>
            <input type="checkbox" checked={page.isPublished} onChange={e => togglePublishStatus(page.id, e.target.checked)} className="sr-only" />
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${page.isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </label>
          <RouterLink to={`/${page.slug}`} target="_blank" className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            View Live
          </RouterLink>
          <button onClick={onSave} disabled={saving} className="px-5 py-2 text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-gray-50 border-r border-gray-100 overflow-y-auto shrink-0">
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Page Sections</h3>
              <button className="text-xs text-gray-400 hover:text-gray-600">
                Add
              </button>
            </div>
            <div className="space-y-0.5">
              {sectionOrder.map(section => {
                const isVisible = localVisibility[section.key] !== false
                const isSelected = selectedSectionKey === section.key
                const sectionName = FRIENDLY_LABELS[section.key] || section.name
                const sectionContent = pageData.sections[section.key]
                const hasRealContent = sectionContent?.title || sectionContent?.description || sectionContent?.content
                const dynamicCount = section.key === 'featured_students' || section.key === 'students_grid' ? pageData.students?.length
                  : section.key === 'gallery_grid' ? pageData.galleryItems?.length
                  : section.key === 'news_grid' ? pageData.news?.length
                  : section.key === 'testimonials' ? pageData.testimonials?.length
                  : section.key === 'faq_list' ? pageData.faqs?.length
                  : section.key === 'success_stories' ? pageData.studentStories?.length
                  : section.key === 'activity_feed' ? pageData.activities?.length
                  : null
                return (
                  <div key={section.id} className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSectionKey(section.key)}
                      className={`flex-1 text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                        isSelected
                          ? 'bg-amber-50 text-amber-700 font-medium ring-1 ring-amber-200 shadow-sm'
                          : 'text-gray-600 hover:bg-white hover:shadow-sm'
                      } ${!isVisible ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{sectionName}</span>
                        {dynamicCount !== null && dynamicCount !== undefined && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${dynamicCount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                            {dynamicCount}
                          </span>
                        )}
                        {!hasRealContent && dynamicCount === null && (
                          <span className="text-[10px] text-gray-300">empty</span>
                        )}
                      </div>
                    </button>
                    <button onClick={() => toggleLocalVisibility(section.key)} className="text-xs text-gray-400 hover:text-gray-600 shrink-0">
                      {isVisible ? 'Hide' : 'Show'}
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="pt-3 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Page Settings</h3>
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-white hover:shadow-sm transition-all">
                  Page Header Image
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-white hover:shadow-sm transition-all">
                  Page Colors
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
          <div className="flex-1 overflow-y-auto p-6 flex justify-center">
            <div
              className="bg-white shadow-lg rounded-lg overflow-visible transition-all duration-300"
              style={{ width: previewWidths[previewDevice], maxWidth: '100%' }}
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-medium text-gray-700">Live Preview</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 uppercase font-medium">{previewDevice}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {sectionOrder.filter(s => localVisibility[s.key] !== false).length} of {sectionOrder.length} sections visible
                  </span>
                  <div className="w-px h-4 bg-gray-200" />
                  <span className="text-xs text-gray-400">
                    {pageData.students?.length || 0} students · {pageData.news?.length || 0} news · {pageData.galleryItems?.length || 0} gallery
                  </span>
                </div>
              </div>
              <PreviewContent
                page={page}
                pageData={pageData}
                localVisibility={localVisibility}
                selectedSectionKey={selectedSectionKey}
                onSelectSection={setSelectedSectionKey}
                cmsStrings={cmsStrings}
              />
            </div>
          </div>
        </div>

        <div className="w-80 bg-white border-l border-gray-100 overflow-y-auto shrink-0">
          {selectedSectionKey ? (
            <SectionSettingsPanel
              section={page.sections.find(s => s.key === selectedSectionKey)!}
              pageData={pageData}
              editorTab={editorTab}
              setEditorTab={setEditorTab}
              isVisible={localVisibility[selectedSectionKey] !== false}
              onToggleVisibility={() => toggleLocalVisibility(selectedSectionKey)}
            />
          ) : (
            <div className="p-6 text-center text-gray-400">
              <p className="text-sm font-medium text-gray-500">Click a section to edit</p>
              <p className="text-xs mt-1">Select a section from the sidebar or click directly on the preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PreviewContent({ page, pageData, localVisibility, selectedSectionKey, onSelectSection, cmsStrings }: {
  page: CmsPage
  pageData: CmsPageData
  localVisibility: Record<string, boolean>
  selectedSectionKey: string | null
  onSelectSection: (key: string | null) => void
  cmsStrings: CmsStringMap
}) {
  const sectionOrder = [...page.sections].sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <div className="min-h-[400px]">
      {sectionOrder.map(section => {
        const isVisible = localVisibility[section.key] !== false
        const isSelected = selectedSectionKey === section.key
        const sectionContent = pageData.sections[section.key]
        const sectionName = FRIENDLY_LABELS[section.key] || section.name

        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(section.key)}
            className={`relative cursor-pointer border-2 transition-all ${
              isSelected
                ? 'border-amber-400 ring-2 ring-amber-200'
                : isVisible
                  ? 'border-transparent hover:border-amber-200/50'
                  : 'border-dashed border-gray-200'
            } ${!isVisible ? 'opacity-30' : ''}`}
          >
            <div className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-md text-xs font-medium transition-opacity ${
              isSelected ? 'opacity-100 bg-amber-500 text-white' : 'opacity-0 group-hover:opacity-100 bg-white/90 text-gray-600 shadow-sm border'
            }`}>
              {sectionName}
            </div>
            <RenderSectionPreview
              section={section}
              sectionContent={sectionContent}
              isVisible={isVisible}
              pageData={pageData}
              cmsStrings={cmsStrings}
            />
          </div>
        )
      })}
    </div>
  )
}

function SponsorshipTreePreview({ steps }: { steps: { title: string; desc: string }[] }) {
  const items = steps.length >= 8 ? steps : [
    { title: 'Browse Profiles', desc: 'Review children waiting for sponsors' },
    { title: 'Choose a Child', desc: 'Select a student to sponsor' },
    { title: 'Make Your Pledge', desc: 'Complete donation form securely' },
    { title: 'We Connect', desc: 'Link you with your sponsored child' },
    { title: 'Receive Updates', desc: 'Get progress reports & photos' },
    { title: 'Build Connection', desc: 'Exchange letters & messages' },
    { title: 'Track Impact', desc: 'See your contribution at work' },
    { title: 'Join Community', desc: 'Connect with other sponsors' },
  ]

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-amber-300 -translate-x-1/2 hidden md:block" />
      {items.map((item, i) => {
        const isLeft = i % 2 === 0
        return (
          <div key={i} className="relative flex items-center w-full max-w-md mb-3 last:mb-0">
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-2 h-2 rounded-full bg-amber-500 border-2 border-amber-100" />
            </div>
            <div className={`w-full md:w-[calc(50%-1rem)] ${isLeft ? 'md:pr-4 md:text-right' : 'md:ml-auto md:pl-4'}`}>
              <div className="bg-white rounded-lg border border-amber-200 p-2.5 shadow-sm">
                <div className={`flex items-center gap-1.5 mb-1 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-[10px] font-bold shrink-0">{i + 1}</span>
                  <h3 className="text-xs font-bold text-gray-900">{item.title}</h3>
                </div>
                <p className={`text-[10px] text-gray-600 leading-relaxed ${isLeft ? 'md:text-right' : ''}`}>{item.desc}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function sponsorshipVariant(status: string) {
  const map: Record<string, string> = { available: 'bg-emerald-500', partially_sponsored: 'bg-amber-500', fully_sponsored: 'bg-blue-500' }
  return map[status] || 'bg-gray-400'
}

function RenderSectionPreview({ section, sectionContent, isVisible, pageData, cmsStrings }: {
  section: CmsSection
  sectionContent: any
  isVisible: boolean
  pageData: CmsPageData
  cmsStrings: CmsStringMap
}) {
  if (!isVisible) {
    return <div className="h-24 flex items-center justify-center text-gray-300 text-sm">Section hidden</div>
  }

  const content = sectionContent?.content as Record<string, any> | undefined

  switch (section.type) {
    case 'hero':
      return (
        <div className="relative min-h-[400px] flex items-center bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900">
          {pageData.hero?.background_image && (
            <img src={pageData.hero.background_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="relative w-full px-8 py-16">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold text-white mb-4">
                {pageData.hero?.title || 'Your Hero Title'}
                {pageData.hero?.highlight && <><br /><span className="text-amber-400">{pageData.hero.highlight}</span></>}
              </h1>
              <p className="text-lg text-gray-300 mb-6">{pageData.hero?.description || 'Hero description goes here'}</p>
              <div className="flex gap-4">
                {pageData.hero?.cta_primary_text && <span className="px-6 py-3 rounded-lg bg-amber-500 text-white text-sm font-medium">{pageData.hero.cta_primary_text}</span>}
                {pageData.hero?.cta_secondary_text && <span className="px-6 py-3 rounded-lg border border-white/30 text-white text-sm font-medium">{pageData.hero.cta_secondary_text}</span>}
              </div>
            </div>
          </div>
        </div>
      )

    case 'stats':
      const stats = (content?.stats as any[]) || (pageData.hero?.statistics as any[]) || []
      return (
        <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 py-12 px-8">
          <div className="max-w-5xl mx-auto">
            {content?.title && <h2 className="text-2xl font-bold text-white text-center mb-8">{content.title}</h2>}
            <div className="grid grid-cols-4 gap-6 text-center">
              {stats.map((stat: any, i: number) => (
                <div key={i}>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/80 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'welcome':
      return (
        <div className="py-16 px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{content?.title || 'Welcome Section'}</h2>
            <p className="text-gray-600">{content?.content || 'Welcome content goes here'}</p>
          </div>
        </div>
      )

    case 'about_preview':
      return (
        <div className="py-16 px-8 bg-gray-50">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{sectionContent?.title || 'About Us'}</h2>
              <p className="text-gray-600 mb-4">{sectionContent?.description || 'About description goes here'}</p>
              <span className="inline-flex items-center gap-2 text-amber-600 text-sm font-medium">
                Learn more <ArrowRight className="w-4 h-4" />
              </span>
            </div>
            <div className="text-gray-400 text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">About Image</div>
          </div>
        </div>
      )

    case 'featured_students': {
      const students = pageData.students || []
      return (
        <div className="py-16 px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">{content?.title || 'Our Students'}</h2>
            <p className="text-gray-500 text-center mb-8 max-w-xl mx-auto">{cmsStrings['home_students_description'] || 'Meet the students waiting for sponsorship'}</p>
            <div className="grid grid-cols-3 gap-6">
              {students.length > 0 ? students.slice(0, 3).map((student: any) => (
                <div key={student.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  {student.photo_url ? (
                    <img src={student.photo_url} alt={student.name} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-amber-100 to-amber-200" />
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">{student.name}</h3>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full text-white ${sponsorshipVariant(student.sponsorship_status)}`}>
                        {student.sponsorship_status?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Available'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{student.age ? `Age ${student.age}` : ''} {student.grade ? `· ${student.grade}` : ''}</p>
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center py-12 text-sm text-gray-400">Add students to display here</div>
              )}
            </div>
          </div>
        </div>
      )
    }

    case 'sponsorship_steps':
      return (
        <div className="py-12 px-8 bg-gradient-to-br from-amber-50 via-white to-orange-50">
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-8">{content?.title || 'How Sponsorship Works'}</h2>
            <SponsorshipTreePreview steps={(content?.steps as any[]) || []} />
          </div>
        </div>
      )

    case 'testimonials': {
      const testimonials = pageData.testimonials || []
      return (
        <div className="py-16 px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">{content?.title || 'Testimonials'}</h2>
            <div className="grid grid-cols-2 gap-4">
              {testimonials.length > 0 ? testimonials.slice(0, 4).map((t: any) => (
                <div key={t.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                      {(t.author_name || t.name || 'S').charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">{t.author_name || t.name || 'Supporter'}</div>
                      <div className="text-xs text-gray-400">{t.role || t.author_role || 'Donor'}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic">"{t.content || t.text || t.quote || 'Testimonial text'}"</p>
                </div>
              )) : (
                <div className="col-span-2 text-center py-12 text-sm text-gray-400">Add testimonials to display here</div>
              )}
            </div>
          </div>
        </div>
      )
    }

    case 'donation_cta':
      return (
        <div className="py-16 px-8 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">{content?.title || 'Support Our Mission'}</h2>
            <p className="text-white/90 mb-6">{content?.description || 'Your donation makes a difference'}</p>
            <span className="inline-block px-6 py-3 rounded-lg bg-white text-amber-600 font-medium text-sm">{content?.button_text || 'Donate Now'}</span>
          </div>
        </div>
      )

    case 'page_header':
      return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900">{pageData.pageHeader?.title || 'Page Title'}</h1>
            {pageData.pageHeader?.subtitle && <p className="text-gray-500 mt-2">{pageData.pageHeader.subtitle}</p>}
          </div>
        </div>
      )

    case 'about_mission':
      return (
        <div className="py-16 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{cmsStrings['about_mission_heading'] || 'Our Mission'}</h2>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{sectionContent?.description || content?.mission || 'Mission description goes here'}</p>
                {content?.vision && <p className="text-sm text-gray-600 mb-4 leading-relaxed">{content.vision}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-48 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200" />
                <div className="h-48 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 mt-4" />
              </div>
            </div>
          </div>
        </div>
      )

    case 'about_values':
      return (
        <div className="py-16 px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{cmsStrings['about_values_heading'] || 'Our Core Values'}</h2>
              <p className="text-sm text-gray-500 max-w-2xl mx-auto">{cmsStrings['about_values_description'] || 'The principles that guide our work'}</p>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {((content?.values as any[])?.length ? content!.values : [
                { title: 'Education', desc: 'Quality education for every child' },
                { title: 'Compassion', desc: 'Supporting with kindness and care' },
                { title: 'Integrity', desc: 'Transparent and accountable' },
                { title: 'Community', desc: 'Building strong communities' },
              ]).map((v: any, i: number) => (
                <div key={i} className="p-5 bg-white rounded-xl border border-gray-100 text-center shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{v.title || 'Value'}</h3>
                  <p className="text-xs text-gray-500">{v.desc || 'Description'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'about_timeline': {
      const items = ((content?.timeline || content?.milestones) as any[]) || []
      return (
        <div className="py-16 px-8 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Journey</h2>
            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-200 to-amber-300 -translate-x-1/2 hidden md:block" />
              <div className="space-y-6">
                {items.length > 0 ? items.map((m: any, i: number) => {
                  const isLeft = i % 2 === 0
                  const title = m.title || m.event || ''
                  const desc = m.desc || m.description || ''
                  return (
                    <div key={i} className={`relative md:flex md:items-start ${!isLeft ? 'md:flex-row-reverse' : ''}`}>
                      <div className={`flex-1 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
                          <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold uppercase tracking-wider mb-2">{m.year}</span>
                          {title && <h3 className="text-gray-900 text-sm font-semibold mb-1">{title}</h3>}
                          {desc && <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>}
                        </div>
                      </div>
                      <div className="hidden md:flex items-center justify-center w-12 shrink-0 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-amber-500 border-3 border-white shadow" />
                      </div>
                      <div className="hidden md:block flex-1" />
                    </div>
                  )
                }) : (
                  <p className="text-center text-gray-300 italic">Add timeline milestones to show your journey</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    case 'contact_details':
      return (
        <div className="py-12 px-8">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 mx-auto mb-3 flex items-center justify-center text-amber-600 font-bold text-sm">@</div>
              <div className="text-sm font-semibold text-gray-900">Email</div>
              <div className="text-sm text-gray-500">{pageData.footer?.contact_info?.email || 'info@example.org'}</div>
            </div>
            <div className="text-center p-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 mx-auto mb-3 flex items-center justify-center text-amber-600 font-bold text-sm">P</div>
              <div className="text-sm font-semibold text-gray-900">Phone</div>
              <div className="text-sm text-gray-500">{pageData.footer?.contact_info?.phone || '+977 1 234 567'}</div>
            </div>
            <div className="text-center p-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 mx-auto mb-3 flex items-center justify-center text-amber-600 font-bold text-sm">A</div>
              <div className="text-sm font-semibold text-gray-900">Address</div>
              <div className="text-sm text-gray-500">{pageData.footer?.contact_info?.address || 'Kathmandu, Nepal'}</div>
            </div>
          </div>
        </div>
      )

    case 'contact_form':
      return (
        <div className="py-12 px-8 bg-gray-50">
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{content?.title || 'Get in Touch'}</h2>
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600">Name</div>
                <div className="h-9 bg-gray-50 rounded-lg border border-gray-200 w-full" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600">Email</div>
                <div className="h-9 bg-gray-50 rounded-lg border border-gray-200 w-full" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600">Phone</div>
                <div className="flex gap-2">
                  <div className="h-9 bg-gray-50 rounded-lg border border-gray-200 w-24" />
                  <div className="h-9 bg-gray-50 rounded-lg border border-gray-200 flex-1" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600">Subject</div>
                <div className="h-9 bg-gray-50 rounded-lg border border-gray-200 w-full" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600">Message</div>
                <div className="h-20 bg-gray-50 rounded-lg border border-gray-200 w-full" />
              </div>
              <div className="h-9 bg-amber-500 rounded-lg w-28" />
            </div>
          </div>
        </div>
      )

    case 'sponsor_hero':
    case 'donate_hero':
    case 'volunteer_hero':
      return (
        <div className="relative min-h-[250px] flex items-center bg-gradient-to-br from-stone-800 to-amber-900">
          <div className="relative w-full px-8 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl font-bold text-white mb-3">{sectionContent?.title || (section.type === 'donate_hero' ? 'Make a Donation' : section.type === 'volunteer_hero' ? 'Volunteer With Us' : 'Sponsorship Program')}</h1>
              {sectionContent?.description && <p className="text-base text-gray-300">{sectionContent.description}</p>}
              <div className="flex gap-3 justify-center mt-6">
                <span className="px-5 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium">Get Started</span>
              </div>
            </div>
          </div>
        </div>
      )

    case 'sponsor_steps':
    case 'donate_process':
      const stepsData = (content?.process_steps || content?.steps || []) as any[]
      const steps = stepsData.length > 0 ? stepsData : [
        { title: 'Browse', desc: 'Find a child to sponsor' },
        { title: 'Donate', desc: 'Set up your contribution' },
        { title: 'Connect', desc: 'Build a relationship' },
      ]
      return (
        <div className="py-12 px-8">
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-8">{content?.title || (section.type === 'donate_process' ? 'How It Works' : 'How to Sponsor')}</h2>
            <div className="space-y-4">
              {steps.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-4 bg-white rounded-lg border border-amber-100 p-4">
                  <span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{s.title}</h3>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'donation_form':
      return (
        <div className="py-12 px-8 bg-gray-50">
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{content?.title || 'Make a Donation'}</h2>
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <div className="flex gap-3">
                {['$25', '$50', '$100', '$250'].map((amt) => (
                  <div key={amt} className="flex-1 h-10 border border-amber-200 rounded-lg flex items-center justify-center text-sm font-medium text-amber-700 bg-amber-50">{amt}</div>
                ))}
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600">Custom Amount</div>
                <div className="h-9 bg-gray-50 rounded-lg border border-gray-200 w-full" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600">Name</div>
                <div className="h-9 bg-gray-50 rounded-lg border border-gray-200 w-full" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600">Email</div>
                <div className="h-9 bg-gray-50 rounded-lg border border-gray-200 w-full" />
              </div>
              <div className="h-9 bg-amber-500 rounded-lg w-full" />
            </div>
          </div>
        </div>
      )

    case 'student_story':
      return (
        <div className="py-12 px-8">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            <div className="h-56 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{content?.title || 'Student Success Story'}</h2>
              <p className="text-sm text-gray-500 mb-4">{content?.description || 'Read how sponsorship has transformed the life of a student at Buddha Academy.'}</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-400" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">{content?.student_name || 'Student Name'}</div>
                  <div className="text-xs text-gray-400">{content?.student_grade || 'Grade 5'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )

    case 'sponsor_benefits':
      return (
        <div className="py-12 px-8 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{sectionContent?.title || content?.title || 'Sponsorship Benefits'}</h2>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-sm text-gray-600 mb-4">{sectionContent?.description || content?.description || 'When you sponsor a child, you provide them with the resources they need to thrive.'}</p>
                <div className="space-y-3">
                  {((content?.benefits as any[])?.length ? content!.benefits : [
                    { text: 'Education support for a child' },
                    { text: 'Monthly progress updates' },
                    { text: 'Direct connection with your sponsored child' },
                    { text: 'Tax-deductible contributions' },
                  ]).map((b: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 p-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                      <span className="text-sm text-gray-700">{b.text || b.title || 'Benefit description'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-64 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 hidden lg:block" />
            </div>
          </div>
        </div>
      )

    case 'sponsor_cta':
      return (
        <div className="py-12 px-8 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-3">{content?.title || 'Make a Difference Today'}</h2>
            <p className="text-white/90 text-sm mb-5">{content?.description || 'Sponsor a child and change a life'}</p>
            <span className="inline-block px-5 py-2.5 rounded-lg bg-white text-amber-600 font-medium text-sm">{content?.button_text || 'Sponsor Now'}</span>
          </div>
        </div>
      )

    case 'cta_banner':
      return (
        <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 py-16 px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">{cmsStrings['cta_banner_title'] || 'Make a Difference Today'}</h3>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">{cmsStrings['cta_banner_subtitle'] || 'Your support provides education, meals, and hope to children in Nepal.'}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <span className="bg-white text-amber-700 px-8 py-3.5 rounded-full font-semibold shadow-lg">{cmsStrings['cta_banner_primary_text'] || 'Sponsor a Child'}</span>
              <span className="bg-white/10 border border-white/30 text-white px-8 py-3.5 rounded-full font-semibold backdrop-blur-sm">{cmsStrings['cta_banner_secondary_text'] || 'Donate Now'}</span>
            </div>
          </div>
        </div>
      )

    case 'map_location':
      return (
        <div className="py-12 px-8 bg-orange-50 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-orange-100 mx-auto mb-3 flex items-center justify-center text-orange-500 font-bold text-sm">M</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Location</h2>
            <p className="text-gray-600 mb-6">{pageData.footer?.contact_info?.address || 'Kathmandu, Nepal'}</p>
            <span className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-full font-semibold text-sm">View on Map</span>
          </div>
        </div>
      )

    case 'donate_impact': {
      const donation = pageData.donation
      const impactCards = content?.impact_cards as any[] || (donation?.impact_cards as any[])
      return (
        <div className="py-12 px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{content?.title || 'Your Impact'}</h2>
            <div className="grid grid-cols-3 gap-4">
              {impactCards?.length > 0 ? impactCards.slice(0, 3).map((c: any, i: number) => (
                <div key={i} className="bg-white rounded-xl border border-amber-100 p-5 text-center shadow-sm">
                  <div className="text-lg font-bold text-amber-600">${c.amount || c.label || '50'}</div>
                  <p className="text-xs text-gray-500 mt-1">{c.description || c.label || 'Provides school supplies for a month'}</p>
                </div>
              )) : (
                <>
                  <div className="bg-white rounded-xl border border-amber-100 p-5 text-center shadow-sm">
                    <div className="text-lg font-bold text-amber-600">$50</div>
                    <p className="text-xs text-gray-500 mt-1">School supplies for a month</p>
                  </div>
                  <div className="bg-white rounded-xl border border-amber-100 p-5 text-center shadow-sm">
                    <div className="text-lg font-bold text-amber-600">$100</div>
                    <p className="text-xs text-gray-500 mt-1">Nutrition program</p>
                  </div>
                  <div className="bg-white rounded-xl border border-amber-100 p-5 text-center shadow-sm">
                    <div className="text-lg font-bold text-amber-600">$200</div>
                    <p className="text-xs text-gray-500 mt-1">Full sponsorship</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )
    }

    case 'faq_list': {
      const faqs = pageData.faqs || []
      return (
        <div className="py-12 px-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{content?.title || 'Frequently Asked Questions'}</h2>
            <div className="space-y-2">
              {faqs.length > 0 ? faqs.slice(0, 6).map((f: any) => (
                <div key={f.id} className="border border-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">{f.question || 'Question?'}</h3>
                  <p className="text-xs text-gray-500">{f.answer || 'Answer goes here'}</p>
                </div>
              )) : (
                <div className="text-center py-12 text-sm text-gray-400">Add FAQs to display here</div>
              )}
            </div>
          </div>
        </div>
      )
    }

    case 'gallery_grid': {
      const galleryItems = pageData.galleryItems || []
      return (
        <div className="py-12 px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{content?.title || 'Photo Gallery'}</h2>
            <div className="grid grid-cols-3 gap-3">
              {galleryItems.length > 0 ? galleryItems.slice(0, 9).filter((item: any) => item.type === 'photo').map((item: any) => (
                <div key={item.id} className="aspect-square rounded-lg overflow-hidden">
                  <img src={item.url || item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )) : (
                [1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg" />
                ))
              )}
            </div>
            {galleryItems.length > 0 && <p className="text-xs text-gray-400 text-center mt-3">{galleryItems.filter((i: any) => i.type === 'photo').length} photos</p>}
          </div>
        </div>
      )
    }

    case 'news_grid': {
      const news = pageData.news || []
      return (
        <div className="py-12 px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{content?.title || 'Latest News'}</h2>
            <div className="grid grid-cols-3 gap-6">
              {news.length > 0 ? news.slice(0, 6).map((article: any) => (
                <div key={article.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className={`h-32 ${article.featured_image ? '' : 'bg-gradient-to-br from-amber-50 to-amber-100'}`}>
                    {article.featured_image && <img src={article.featured_image} alt={article.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] text-amber-600 font-medium capitalize">{article.category || 'News'}</span>
                    <h3 className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2">{article.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{article.excerpt || article.content?.substring(0, 80) || ''}</p>
                  </div>
                </div>
              )) : (
                [1, 2, 3].map(i => (
                  <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-amber-50 to-amber-100" />
                    <div className="p-4">
                      <span className="text-[10px] text-amber-600 font-medium">News</span>
                      <h3 className="text-sm font-semibold text-gray-900 mt-1">News Article Title {i}</h3>
                      <p className="text-xs text-gray-500 mt-1">Short description of the news article...</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )
    }

    case 'students_grid': {
      const students = pageData.students || []
      return (
        <div className="py-12 px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{content?.title || 'Our Students'}</h2>
            <div className="grid grid-cols-3 gap-6">
              {students.length > 0 ? students.slice(0, 6).map((student: any) => {
                const raised = student.current_sponsorship || 0
                const goal = student.sponsorship_amount || 1
                const progress = Math.min((raised / goal) * 100, 100)
                return (
                  <div key={student.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    {student.photo_url ? (
                      <img src={student.photo_url} alt={student.name} className="h-36 w-full object-cover" />
                    ) : (
                      <div className="h-36 bg-gradient-to-br from-amber-100 to-amber-200" />
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{student.name}</h3>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full text-white ${sponsorshipVariant(student.sponsorship_status)}`}>
                          {student.sponsorship_status?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Available'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{student.age ? `Age ${student.age}` : ''}{student.grade ? ` · Class ${student.grade}` : ''}</p>
                      {student.bio && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{student.bio}</p>}
                      <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
                        <span>${goal}/mo</span>
                        <span>${raised} raised</span>
                      </div>
                      <div className="mt-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-amber-500 rounded-full h-1.5" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="mt-2 inline-block text-[10px] font-medium text-amber-600">View Profile →</span>
                    </div>
                  </div>
                )
              }) : (
                [1, 2, 3].map(i => (
                  <div key={i} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-36 bg-gradient-to-br from-amber-100 to-amber-200" />
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900">Student {i}</h3>
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Available</span>
                      <p className="text-xs text-gray-500 mt-1">Age {8 + i} · Class {1 + i}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">Student bio and background information would appear here.</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
                        <span>$50/mo</span>
                        <span>$0 raised</span>
                      </div>
                      <div className="mt-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-amber-500 rounded-full h-1.5" style={{ width: '0%' }} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )
    }

    case 'success_stories': {
      const stories = pageData.studentStories || []
      return (
        <div className="py-12 px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{content?.title || 'Success Stories'}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {stories.length > 0 ? stories.slice(0, 4).map((story: any) => (
                <div key={story.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                      {(story.student_name || story.title || 'S').charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{story.student_name || story.title || 'Student'}</h3>
                      <p className="text-xs text-gray-400">{story.graduation_year || story.year || 'Graduate'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{story.content || story.story || story.description || 'Success story text'}</p>
                </div>
              )) : (
                [1, 2].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Student Name</h3>
                        <p className="text-xs text-gray-400">Graduate {2024 - i}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">Through sponsorship, this student was able to complete their education and pursue their dreams.</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )
    }

    case 'activity_feed': {
      const activities = pageData.activities || []
      return (
        <div className="py-12 px-8">
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{content?.title || 'Recent Activity'}</h2>
            <div className="space-y-3">
              {activities.length > 0 ? activities.slice(0, 10).map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 bg-white rounded-lg border border-gray-100 p-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-700">{a.title || 'Activity'}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )) : (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex items-start gap-3 bg-white rounded-lg border border-gray-100 p-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-700">Activity update {i}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{i}h ago</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )
    }

    case 'volunteer_opps':
      return (
        <div className="py-12 px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{content?.title || 'Volunteer Opportunities'}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {((content?.opportunities as any[])?.length ? content!.opportunities : [
                { title: 'Teaching Assistant', desc: 'Help in classrooms', location: 'Kathmandu' },
                { title: 'Event Coordinator', desc: 'Organize fundraising events', location: 'Remote' },
              ]).map((o: any, i: number) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900">{o.title || 'Opportunity'}</h3>
                  <p className="text-xs text-gray-500 mt-1">{o.desc || 'Description'}</p>
                  <span className="text-[10px] text-amber-600 font-medium mt-2 inline-block">{o.location || 'Various'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'volunteer_form':
      return (
        <div className="py-12 px-8 bg-gray-50">
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{content?.title || 'Apply to Volunteer'}</h2>
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <div className="h-10 bg-gray-50 rounded-lg w-full" />
              <div className="h-10 bg-gray-50 rounded-lg w-full" />
              <div className="h-10 bg-gray-50 rounded-lg w-full" />
              <div className="h-24 bg-gray-50 rounded-lg w-full" />
              <div className="h-10 bg-amber-500 rounded-lg w-32" />
            </div>
          </div>
        </div>
      )

    case 'privacy_content':
    case 'terms_content':
    case 'transparency_content':
      return (
        <div className="py-12 px-8 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{sectionContent?.title || (section.type === 'privacy_content' ? 'Privacy Policy' : section.type === 'terms_content' ? 'Terms of Service' : 'Transparency')}</h1>
          <div className="prose prose-sm text-gray-600 space-y-3">
            <p>{sectionContent?.description || 'This section contains the full text content. Click to edit and add your content here.'}</p>
            {content?.sections?.map?.((s: any, i: number) => (
              <div key={i}>
                <h3 className="text-base font-semibold text-gray-900">{s.heading}</h3>
                <p className="text-sm">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'campaigns_list':
      return (
        <div className="py-12 px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{content?.title || 'Our Campaigns'}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="h-28 bg-gradient-to-br from-amber-100 to-orange-100" />
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900">Campaign {i}</h3>
                    <div className="mt-2 bg-gray-100 rounded-full h-2">
                      <div className="bg-amber-500 rounded-full h-2" style={{ width: `${40 + i * 20}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{40 + i * 20}% funded</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    default:
      return (
        <div className="py-12 px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{sectionContent?.title || section.name}</h2>
            {sectionContent?.description && <p className="text-gray-600">{sectionContent.description}</p>}
            {content && Object.keys(content).length > 0 && (
              <div className="mt-3 text-xs text-gray-400">
                {Object.entries(content).slice(0, 5).map(([k, v]) => (
                  <div key={k} className="truncate"><span className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}:</span> {typeof v === 'string' ? v : Array.isArray(v) ? `${v.length} items` : '...'}</div>
                ))}
                {Object.keys(content).length > 5 && <div className="text-gray-300">+{Object.keys(content).length - 5} more fields</div>}
              </div>
            )}
            {!sectionContent?.title && !sectionContent?.description && (!content || Object.keys(content).length === 0) && (
              <p className="text-gray-300 italic">Click to edit this section</p>
            )}
          </div>
        </div>
      )
  }
}

function SectionSettingsPanel({ section, pageData, editorTab, setEditorTab, isVisible, onToggleVisibility }: {
  section: CmsSection
  pageData: CmsPageData
  editorTab: EditorTab
  setEditorTab: (t: EditorTab) => void
  isVisible: boolean
  onToggleVisibility: () => void
}) {
  const sectionContent = pageData.sections[section.key]
  const sectionName = FRIENDLY_LABELS[section.key] || section.name

  const tabs: EditorTab[] = ['content', 'design', 'layout', 'advanced']

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{sectionName}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-gray-400 capitalize">{section.type.replace(/_/g, ' ')}</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">Editor</span>
            </div>
          </div>
          <label className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${isVisible ? 'bg-amber-500' : 'bg-gray-200'}`}>
            <input type="checkbox" checked={isVisible} onChange={onToggleVisibility} className="sr-only" />
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${isVisible ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </label>
        </div>
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setEditorTab(tab)}
              className={`px-3 py-2 text-xs font-medium capitalize border-b-2 transition-colors ${
                editorTab === tab ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {editorTab === 'content' && (
          <ContentEditorPanel section={section} sectionContent={sectionContent} pageData={pageData} />
        )}
        {editorTab === 'design' && (
          <DesignEditorPanel section={section} sectionContent={sectionContent} />
        )}
        {editorTab === 'layout' && (
          <LayoutEditorPanel section={section} sectionContent={sectionContent} />
        )}
        {editorTab === 'advanced' && (
          <AdvancedEditorPanel section={section} sectionContent={sectionContent} />
        )}
      </div>
    </div>
  )
}

function ContentEditorPanel({ section, sectionContent, pageData }: {
  section: CmsSection
  sectionContent: any
  pageData: CmsPageData
}) {
  const [localContent, setLocalContent] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fields: Record<string, string> = {}
    if (sectionContent?.title) fields.title = sectionContent.title
    if (sectionContent?.subtitle) fields.subtitle = sectionContent.subtitle
    if (sectionContent?.description) fields.description = sectionContent.description
    const content = sectionContent?.content as Record<string, any> | undefined
    if (content) {
      Object.entries(content).forEach(([k, v]) => {
        if (typeof v === 'string') fields[k] = v
      })
    }
    setLocalContent(fields)
  }, [sectionContent])

  const fields = Object.keys(localContent).length > 0
    ? Object.entries(localContent)
    : [['title', sectionContent?.title || section.name], ['description', '']]

  const handleChange = useCallback((key: string, value: string) => {
    setLocalContent(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const sectionKey = section.key
      const content = sectionContent?.content as Record<string, any> | undefined

      const stringFields: Record<string, string> = {}
      const nonStringContent: Record<string, any> = {}
      if (content) {
        Object.entries(content).forEach(([k, v]) => {
          if (typeof v === 'string' && localContent[k] !== undefined) {
            stringFields[k] = v
          } else {
            nonStringContent[k] = v
          }
        })
      }

      const payload: Record<string, any> = {}
      if (localContent.title) payload.title = localContent.title
      if (localContent.subtitle) payload.subtitle = localContent.subtitle
      if (localContent.description) payload.description = localContent.description

      const mergedContent = {
        ...nonStringContent,
        ...Object.fromEntries(
          Object.entries(localContent).filter(([k]) => k !== 'title' && k !== 'subtitle' && k !== 'description')
        ),
      }

      if (Object.keys(mergedContent).length > 0) {
        payload.content = mergedContent
      }

      payload.section_key = sectionKey

      await upsertSectionContent(payload)
      toast.success('Section content saved')
    } catch {
      toast.error('Failed to save section content')
    } finally {
      setSaving(false)
    }
  }, [section.key, sectionContent, localContent])

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 mb-2">Edit the text and media shown in this section</p>

      {sectionContent?.images && sectionContent.images.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Images</label>
          <div className="grid grid-cols-2 gap-2">
            {sectionContent.images.map((img: any, i: number) => (
              <div key={i} className="relative group">
                <img src={img.url} alt={img.alt} className="w-full h-16 object-cover rounded-lg" />
                <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-[10px] text-white font-medium">
                  Replace
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {fields.map(([key, value]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
        const isLongText = (value && value.length > 100) || key === 'description' || key === 'content'
        return (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            {isLongText ? (
              <textarea
                value={localContent[key] || value || ''}
                onChange={e => handleChange(key, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 resize-none"
                placeholder={`Enter ${label.toLowerCase()}...`}
              />
            ) : (
              <input
                type="text"
                value={localContent[key] || value || ''}
                onChange={e => handleChange(key, e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                placeholder={`Enter ${label.toLowerCase()}...`}
              />
            )}
          </div>
        )
      })}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      <div className="pt-3 border-t border-gray-100">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button className="px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors">
            Change Image
          </button>
          <button className="px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors">
            Edit Links
          </button>
        </div>
      </div>
    </div>
  )
}

function DesignEditorPanel({}: { section: CmsSection; sectionContent: any }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-gray-400">Customize the look and feel of this section</p>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Background Color</label>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border border-gray-200 bg-white" />
          <input type="text" defaultValue="#ffffff" className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Text Color</label>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-900" />
          <input type="text" defaultValue="#111827" className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Text Alignment</label>
        <div className="flex gap-1">
          {['Left', 'Center', 'Right'].map(a => (
            <button key={a} className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors">{a}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Font Size</label>
        <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500">
          <option>Small</option>
          <option selected>Normal</option>
          <option>Large</option>
          <option>Extra Large</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Padding</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-gray-400">Top</span>
            <input type="text" defaultValue="24" className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400">Bottom</span>
            <input type="text" defaultValue="24" className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

function LayoutEditorPanel({}: { section: CmsSection; sectionContent: any }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-gray-400">Change how content is arranged in this section</p>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Layout</label>
        <div className="grid grid-cols-2 gap-2">
          <button className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-700">Single Column</button>
          <button className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100">Two Columns</button>
          <button className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100">Three Columns</button>
          <button className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100">Grid</button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Content Width</label>
        <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500">
          <option>Full Width</option>
          <option selected>Contained (Max 1280px)</option>
          <option>Narrow (Max 768px)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Image Position</label>
        <div className="flex gap-1">
          {['Left', 'Right', 'Top', 'Background'].map(pos => (
            <button key={pos} className="flex-1 px-2 py-1.5 bg-gray-50 rounded text-xs text-gray-600 hover:bg-gray-100">{pos}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdvancedEditorPanel({}: { section: CmsSection; sectionContent: any }) {
  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-800">Advanced options for experienced users</p>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-500">Animation</label>
          <ToggleSwitch checked={true} onChange={() => {}} size="sm" />
        </div>
        <select className="w-full mt-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
          <option>Fade In</option>
          <option>Slide Up</option>
          <option>Slide In Left</option>
          <option>Zoom In</option>
          <option>None</option>
        </select>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-500">Show on Desktop</label>
          <ToggleSwitch checked={true} onChange={() => {}} size="sm" />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-500">Show on Tablet</label>
          <ToggleSwitch checked={true} onChange={() => {}} size="sm" />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-500">Show on Mobile</label>
          <ToggleSwitch checked={true} onChange={() => {}} size="sm" />
        </div>
      </div>
      <div className="pt-3 border-t border-gray-100">
        <label className="block text-xs font-medium text-gray-500 mb-1">Custom CSS Class</label>
        <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono" placeholder=".my-custom-class" />
        <p className="text-[10px] text-gray-400 mt-1">Super Admin only</p>
      </div>
    </div>
  )
}

function SiteSettingsView({ onBack, cmsStrings }: {
  onBack: () => void
  cmsStrings: CmsStringMap
}) {
  const [activeTab, setActiveTab] = useState<'branding' | 'theme' | 'typography' | 'footer' | 'seo'>('branding')

  const tabs = ['branding', 'theme', 'typography', 'footer', 'seo'] as const
  const tabLabels: Record<string, string> = { branding: 'Branding', theme: 'Theme Colors', typography: 'Fonts', footer: 'Footer', seo: 'SEO' }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Site Settings</h1>
          <p className="text-gray-500 mt-1">Manage branding, colors, fonts, and SEO across your entire website</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {activeTab === 'branding' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
              <input type="text" defaultValue={cmsStrings['site_name'] || 'Buddha Academy'} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-xl" />
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Upload Logo</button>
                <button className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">Remove</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Favicon (browser tab icon)</label>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Upload Favicon</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
              <input type="text" defaultValue={cmsStrings['site_tagline'] || 'Empowering Through Education'} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
            </div>
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg border-2 border-amber-500 bg-amber-500" />
                  <input type="text" defaultValue="#F59E0B" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg border-2 border-stone-700 bg-stone-700" />
                  <input type="text" defaultValue="#44403C" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg border-2 border-orange-500 bg-orange-500" />
                  <input type="text" defaultValue="#F97316" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-amber-500" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Theme Presets</label>
              <div className="flex gap-3">
                {[
                  { name: 'Default', colors: ['bg-amber-500', 'bg-stone-700', 'bg-orange-500'] },
                  { name: 'Forest', colors: ['bg-emerald-600', 'bg-stone-800', 'bg-green-500'] },
                  { name: 'Ocean', colors: ['bg-blue-600', 'bg-slate-700', 'bg-cyan-500'] },
                  { name: 'Sunset', colors: ['bg-rose-500', 'bg-stone-800', 'bg-pink-500'] },
                ].map(preset => (
                  <button key={preset.name} className="group text-center">
                    <div className="flex -space-x-1 mb-1">
                      {preset.colors.map((c, i) => (
                        <div key={i} className={`w-6 h-6 rounded-full border-2 border-white ${c}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 group-hover:text-gray-700">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heading Font</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500">
                <option>Inter (current)</option>
                <option>Merriweather</option>
                <option>Lora</option>
                <option>Playfair Display</option>
                <option>Nunito</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Body Font</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500">
                <option selected>Inter (current)</option>
                <option>Open Sans</option>
                <option>Roboto</option>
                <option>Lato</option>
                <option>Nunito</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Font Size</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
                  <option>14px</option>
                  <option selected>16px</option>
                  <option>18px</option>
                  <option>20px</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Line Height</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
                  <option>1.5 (Normal)</option>
                  <option selected>1.75 (Relaxed)</option>
                  <option>2.0 (Double)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea rows={2} defaultValue={cmsStrings['footer_address'] || 'Kathmandu, Nepal'} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" defaultValue={cmsStrings['footer_email'] || 'info@buddhaacademy.org'} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Phone</label>
                <input type="text" defaultValue={cmsStrings['footer_phone'] || '+977 1 234 567'} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Social Media Links</label>
              <div className="space-y-2">
                {[
                  { label: 'Facebook', key: 'social_facebook' },
                  { label: 'Instagram', key: 'social_instagram' },
                  { label: 'Twitter/X', key: 'social_twitter' },
                  { label: 'YouTube', key: 'social_youtube' },
                  { label: 'LinkedIn', key: 'social_linkedin' },
                ].map(social => (
                  <div key={social.key} className="flex items-center gap-2">
                    <span className="w-24 text-xs text-gray-500">{social.label}</span>
                    <input type="url" defaultValue={cmsStrings[social.key] || ''} placeholder={`https://${social.label.toLowerCase()}.com/...`} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text</label>
              <input type="text" defaultValue={cmsStrings['footer_copyright'] || '© 2024 Buddha Academy. All rights reserved.'} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Meta Title</label>
              <input type="text" defaultValue={cmsStrings['seo_default_title'] || 'Buddha Academy - Empowering Through Education'} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
              <p className="text-xs text-gray-400 mt-1">Used when a page does not have its own title set</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Meta Description</label>
              <textarea rows={3} defaultValue={cmsStrings['seo_default_description'] || 'Buddha Academy provides quality education and sponsorship opportunities for children in need.'} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Social Share Image (Open Graph)</label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">Preview</div>
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Upload Image</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors">
          Save Settings
        </button>
        <button className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}

function SeoEditorView({ page, onSave, onBack }: {
  page: CmsPage
  onSave: (title: string, desc: string) => void
  onBack: () => void
}) {
  const [metaTitle, setMetaTitle] = useState(page.metaTitle)
  const [metaDescription, setMetaDescription] = useState(page.metaDescription)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">
          Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">SEO Settings for {page.name}</h1>
          <p className="text-sm text-gray-400">Control how this page appears in search results</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Page Title (for search results)</label>
          <input
            type="text"
            value={metaTitle}
            onChange={e => setMetaTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50"
            placeholder="Enter page title..."
          />
          <p className="text-xs text-gray-400 mt-1">{metaTitle.length} characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (shown in search results)</label>
          <textarea
            value={metaDescription}
            onChange={e => setMetaDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50 resize-none"
            placeholder="Enter description..."
          />
          <p className="text-xs text-gray-400 mt-1">{metaDescription.length} characters</p>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => onSave(metaTitle, metaDescription)}
            className="px-5 py-2 text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition-colors"
          >
            Save SEO
          </button>
          <button onClick={onBack} className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Google Search Preview</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-green-700 truncate">{window?.location?.origin || 'https://buddhaacademy.org'}/{page.slug}</p>
          <p className="text-sm font-medium text-blue-700 hover:underline truncate">{metaTitle || page.metaTitle}</p>
          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{metaDescription || page.metaDescription}</p>
        </div>
      </div>
    </div>
  )
}
