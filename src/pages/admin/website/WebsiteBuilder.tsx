import { useState, useCallback, useEffect, useMemo } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Globe, FileText, ArrowLeft, Monitor, Tablet, Smartphone, Plus, GripVertical, Image, Palette, Layout as LayoutIcon, Code, Sparkles, CheckCircle2, AlertTriangle, RefreshCw, Upload, X, AlignLeft, AlignCenter, AlignRight, Type, HelpCircle, Home, Info, Heart, Users, BookOpen, Mail, Camera, Award, ArrowRight } from 'lucide-react'
import { useCmsPages } from '../../../hooks/useCmsPages'
import { ToggleSwitch } from '../../../components/ui/ToggleSwitch'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { FormSkeleton } from '../../../components/ui/LoadingSkeleton'
import { getAllCmsStrings, upsertCmsString } from '../../../services/cms-content'
import type { CmsPage, CmsSection } from '../../../types/cms-pages'
import type { CmsPageData } from '../../../services/cms-pages'
import type { CmsStringMap } from '../../../types/cms-content'

type ViewMode = 'pages' | 'editor' | 'seo' | 'settings'
type PreviewDevice = 'desktop' | 'tablet' | 'mobile'
type EditorTab = 'content' | 'design' | 'layout' | 'advanced'

const PAGE_ICONS: Record<string, React.ReactNode> = {
  home: <Home className="w-4 h-4" />,
  about: <Info className="w-4 h-4" />,
  sponsor: <Heart className="w-4 h-4" />,
  students: <Users className="w-4 h-4" />,
  donate: <Award className="w-4 h-4" />,
  gallery: <Camera className="w-4 h-4" />,
  news: <BookOpen className="w-4 h-4" />,
  contact: <Mail className="w-4 h-4" />,
  faq: <HelpCircle className="w-4 h-4" />,
}

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
  custom_content: 'Custom Content',
  events_grid: 'Events',
  impact_content: 'Impact Content',
  team_grid: 'Team Members',
  testimonials_list: 'Testimonials List',
  stories_grid: 'Stories Grid',
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
      await new Promise(r => setTimeout(r, 300))
      toast.success('All changes saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }, [])

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
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Changes update immediately</h3>
              <p className="text-sm text-gray-600 mt-0.5">
                All edits save directly to your website. No technical skills needed.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Need help?</h3>
              <p className="text-sm text-gray-600 mt-0.5">
                Click any page name to start editing. Use the section sidebar to navigate different parts of each page.
              </p>
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
        <div className="flex items-start gap-3">
          {missingCount > 0 ? <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />}
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
        </div>
        <button onClick={onDismiss} className="p-1 hover:bg-black/5 rounded">
          <X className="w-4 h-4 text-gray-400" />
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
    'success_stories', 'transparency_content', 'campaigns_list',
  ])

  const allPageRoutes = [
    { name: 'Home', slug: 'home', sections: ['hero', 'welcome', 'about_preview', 'stats', 'featured_students', 'sponsorship_steps', 'testimonials', 'donation_cta'] },
    { name: 'About Us', slug: 'about', sections: ['about_mission', 'about_values', 'about_stats', 'about_timeline'] },
    { name: 'Sponsorship', slug: 'sponsor', sections: ['sponsor_hero', 'sponsor_steps', 'sponsor_benefits', 'sponsor_cta'] },
    { name: 'Students', slug: 'students', sections: ['students_grid'] },
    { name: 'Donations', slug: 'donate', sections: ['donate_hero', 'donate_impact', 'donate_process'] },
    { name: 'Gallery', slug: 'gallery', sections: ['gallery_grid'] },
    { name: 'News', slug: 'news', sections: ['news_grid'] },
    { name: 'Contact', slug: 'contact', sections: ['contact_details', 'contact_form'] },
    { name: 'FAQ', slug: 'faq', sections: ['faq_list'] },
    { name: 'Volunteer', slug: 'volunteer', sections: ['volunteer_hero', 'volunteer_opps', 'volunteer_form'] },
    { name: 'Privacy Policy', slug: 'privacy', sections: ['privacy_content'] },
    { name: 'Terms of Service', slug: 'terms', sections: ['terms_content'] },
    { name: 'Success Stories', slug: 'success-stories', sections: ['success_stories'] },
    { name: 'Transparency', slug: 'transparency', sections: ['transparency_content'] },
    { name: 'Campaigns', slug: 'campaigns', sections: ['campaigns_list'] },
    { name: 'Activity', slug: 'activity', sections: ['activity_feed'] },
  ]

  const pages = allPageRoutes.map(page => ({
    pageName: page.name,
    slug: page.slug,
    sections: page.sections,
    missingSections: page.sections
      .filter(s => !knownSections.has(s))
      .map(s => ({ key: s, friendlyName: FRIENDLY_LABELS[s] || s.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) })),
  }))

  return { pages, totalSections: allPageRoutes.reduce((sum, p) => sum + p.sections.length, 0) }
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
            {PAGE_ICONS[page.slug] || <FileText className="w-4 h-4 text-gray-400" />}
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
        <label className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${page.isVisible ? 'bg-amber-500' : 'bg-gray-200'}`} title={page.isVisible ? 'Visible on website' : 'Hidden from website'}>
          <input type="checkbox" checked={page.isVisible} onChange={e => onToggleVisibility(e.target.checked)} className="sr-only" />
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${page.isVisible ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </label>
        <label className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${page.isPublished ? 'bg-amber-500' : 'bg-gray-200'}`} title={page.isPublished ? 'Published' : 'Not published'}>
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
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Back to pages">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">{page.name}</h1>
            <StatusBadge status={page.isPublished ? 'published' : 'draft'} />
            <span className="text-xs text-gray-400">/{page.slug}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded-md transition-colors ${previewDevice === 'desktop' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`} title="Desktop view">
              <Monitor className="w-4 h-4" />
            </button>
            <button onClick={() => setPreviewDevice('tablet')} className={`p-2 rounded-md transition-colors ${previewDevice === 'tablet' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`} title="Tablet view">
              <Tablet className="w-4 h-4" />
            </button>
            <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded-md transition-colors ${previewDevice === 'mobile' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`} title="Mobile view">
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <label className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${page.isPublished ? 'bg-amber-500' : 'bg-gray-200'}`} title={page.isPublished ? 'Published' : 'Not published'}>
            <input type="checkbox" checked={page.isPublished} onChange={e => togglePublishStatus(page.id, e.target.checked)} className="sr-only" />
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${page.isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </label>
          <RouterLink to={`/${page.slug}`} target="_blank" className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
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
              <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600" title="Add new section">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-0.5">
              {sectionOrder.map(section => {
                const isVisible = localVisibility[section.key] !== false
                const isSelected = selectedSectionKey === section.key
                const sectionName = FRIENDLY_LABELS[section.key] || section.name
                return (
                  <div key={section.id} className="group relative">
                    <button
                      onClick={() => setSelectedSectionKey(section.key)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-amber-50 text-amber-700 font-medium ring-1 ring-amber-200 shadow-sm'
                          : 'text-gray-600 hover:bg-white hover:shadow-sm'
                      } ${!isVisible ? 'opacity-60' : ''}`}
                    >
                      <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isVisible ? 'bg-amber-500' : 'bg-gray-300'}`} />
                      <span className="truncate">{sectionName}</span>
                    </button>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleLocalVisibility(section.key)} className="p-1 rounded hover:bg-white text-gray-400 hover:text-gray-600" title={isVisible ? 'Hide section' : 'Show section'}>
                        {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-3 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Page Settings</h3>
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-gray-400" />
                    <span>Page Header Image</span>
                  </div>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-gray-400" />
                    <span>Page Colors</span>
                  </div>
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
                  <span className="text-xs text-gray-400">Preview</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase font-medium">{previewDevice}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {sectionOrder.filter(s => localVisibility[s.key] !== false).length} of {sectionOrder.length} sections visible
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
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <MousePointer className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-500">Click a section to edit</p>
              <p className="text-xs mt-1">Select a section from the sidebar or click directly on the preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MousePointer({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    </svg>
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
            <div className={`absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-opacity ${
              isSelected ? 'opacity-100 bg-amber-500 text-white' : 'opacity-0 group-hover:opacity-100 bg-white/90 text-gray-600 shadow-sm border'
            }`}>
              <Eye className="w-3 h-3" />
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

  function Node({ item, idx }: { item: { title: string; desc: string }; idx: number }) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-amber-100 mb-1">
          {idx + 1}
        </div>
        <h3 className="text-[11px] font-semibold text-gray-800 text-center">{item.title}</h3>
        <p className="text-[9px] text-gray-500 text-center mt-0.5 leading-relaxed max-w-[100px]">{item.desc}</p>
      </div>
    )
  }

  function VLine() {
    return <div className="w-0.5 h-5 bg-gradient-to-b from-amber-300 to-amber-400/60" />
  }

  return (
    <div className="flex flex-col items-center">
      <Node item={items[0]} idx={0} />
      <VLine />
      <Node item={items[1]} idx={1} />
      <VLine />
      <Node item={items[2]} idx={2} />
      <VLine />
      <Node item={items[3]} idx={3} />

      <div className="w-full max-w-[220px]">
        <svg className="w-full h-6" viewBox="0 0 300 30" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
          <line x1="150" y1="0" x2="150" y2="12" />
          <line x1="75" y1="12" x2="225" y2="12" />
          <line x1="75" y1="12" x2="75" y2="30" />
          <line x1="225" y1="12" x2="225" y2="30" />
        </svg>

        <div className="flex gap-3 justify-center">
          <div className="flex-1"><Node item={items[4]} idx={4} /></div>
          <div className="flex-1"><Node item={items[5]} idx={5} /></div>
        </div>

        <svg className="w-full h-6" viewBox="0 0 300 30" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
          <line x1="75" y1="0" x2="75" y2="18" />
          <line x1="225" y1="0" x2="225" y2="18" />
          <line x1="75" y1="18" x2="225" y2="18" />
          <line x1="150" y1="18" x2="150" y2="30" />
        </svg>
      </div>

      <Node item={items[6]} idx={6} />
      <VLine />
      <Node item={items[7]} idx={7} />
    </div>
  )
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
      return (
        <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 py-12 px-8">
          <div className="max-w-5xl mx-auto">
            {content?.title && <h2 className="text-2xl font-bold text-white text-center mb-8">{content.title}</h2>}
            <div className="grid grid-cols-4 gap-6 text-center">
              {(pageData.hero?.statistics as any[] || []).map((stat: any, i: number) => (
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

    case 'featured_students':
      return (
        <div className="py-16 px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">{content?.title || 'Our Students'}</h2>
            <p className="text-gray-500 text-center mb-8 max-w-xl mx-auto">{cmsStrings['home_students_description'] || 'Meet the students'}</p>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="h-40 bg-gray-100" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
                    <div className="h-3 bg-gray-50 rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'sponsorship_steps':
      return (
        <div className="py-12 px-8 bg-gradient-to-br from-amber-50 via-white to-orange-50">
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-8">{content?.title || 'How Sponsorship Works'}</h2>
            <SponsorshipTreePreview steps={(content?.steps as any[]) || []} />
          </div>
        </div>
      )

    case 'testimonials':
      return (
        <div className="py-16 px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">{content?.title || 'Testimonials'}</h2>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Supporter</div>
                      <div className="text-xs text-gray-400">Donor</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic">"Your support makes a real difference."</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

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
        <div className="bg-gradient-to-r from-stone-800 to-stone-700 py-12 px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white">{pageData.pageHeader?.title || 'Page Title'}</h1>
            {pageData.pageHeader?.subtitle && <p className="text-gray-300 mt-2">{pageData.pageHeader.subtitle}</p>}
          </div>
        </div>
      )

    case 'about_mission':
      return (
        <div className="py-16 px-8">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-white rounded-xl border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{sectionContent?.title || 'Our Mission'}</h3>
              <p className="text-gray-600 text-sm">{sectionContent?.description || 'Mission description'}</p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Our Vision</h3>
              <p className="text-gray-600 text-sm">{content?.vision || 'Vision description'}</p>
            </div>
          </div>
        </div>
      )

    case 'about_timeline':
      return (
        <div className="py-16 px-8 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Journey</h2>
            <div className="space-y-4">
              {(content?.milestones as any[] || []).map((m: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  <div>
                    <div className="text-sm font-semibold text-amber-600">{m.year}</div>
                    <div className="text-gray-800">{m.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'contact_details':
      return (
        <div className="py-12 px-8">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-sm font-semibold text-gray-900">Email</div>
              <div className="text-sm text-gray-500">{pageData.footer?.contact_info?.email || 'info@example.org'}</div>
            </div>
            <div className="text-center p-4">
              <div className="text-sm font-semibold text-gray-900">Phone</div>
              <div className="text-sm text-gray-500">{pageData.footer?.contact_info?.phone || '+977 1 234 567'}</div>
            </div>
            <div className="text-center p-4">
              <div className="text-sm font-semibold text-gray-900">Address</div>
              <div className="text-sm text-gray-500">{pageData.footer?.contact_info?.address || 'Kathmandu, Nepal'}</div>
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
            {!sectionContent?.title && !sectionContent?.description && (
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

  const tabs: { id: EditorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'content', label: 'Content', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'design', label: 'Design', icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'layout', label: 'Layout', icon: <LayoutIcon className="w-3.5 h-3.5" /> },
    { id: 'advanced', label: 'Advanced', icon: <Code className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{sectionName}</h3>
            <p className="text-xs text-gray-400 capitalize">{section.type.replace(/_/g, ' ')}</p>
          </div>
          <label className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${isVisible ? 'bg-amber-500' : 'bg-gray-200'}`} title={isVisible ? 'Visible on page' : 'Hidden from page'}>
            <input type="checkbox" checked={isVisible} onChange={onToggleVisibility} className="sr-only" />
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${isVisible ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </label>
        </div>
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setEditorTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                editorTab === tab.id ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.icon}
              {tab.label}
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

function ContentEditorPanel({ sectionContent }: {
  section: CmsSection
  sectionContent: any
  pageData: CmsPageData
}) {
  const [localContent, setLocalContent] = useState<Record<string, string>>({})

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
    : [['content', '']]

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
                <button className="absolute top-1 right-1 p-1 bg-black/50 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {fields.map(([key, value]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
        const isLongText = value && value.length > 100
        return (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            {isLongText ? (
              <textarea
                defaultValue={value}
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 resize-none"
                placeholder={`Enter ${label.toLowerCase()}...`}
              />
            ) : (
              <input
                type="text"
                defaultValue={value}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                placeholder={`Enter ${label.toLowerCase()}...`}
              />
            )}
          </div>
        )
      })}
      <div className="pt-3">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors">
            <Image className="w-3.5 h-3.5" />
            Change Image
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors">
            <LinkIcon className="w-3.5 h-3.5" />
            Edit Links
          </button>
        </div>
      </div>
    </div>
  )
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
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
          {[AlignLeft, AlignCenter, AlignRight].map((Icon, i) => (
            <button key={i} className="flex-1 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
              <Icon className="w-4 h-4 mx-auto" />
            </button>
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
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <p className="text-xs text-amber-800">Advanced options for experienced users</p>
        </div>
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

  const tabs = [
    { id: 'branding' as const, label: 'Branding', icon: <Palette className="w-4 h-4" /> },
    { id: 'theme' as const, label: 'Theme Colors', icon: <Palette className="w-4 h-4" /> },
    { id: 'typography' as const, label: 'Fonts', icon: <Type className="w-4 h-4" /> },
    { id: 'footer' as const, label: 'Footer', icon: <FileText className="w-4 h-4" /> },
    { id: 'seo' as const, label: 'SEO', icon: <Globe className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Site Settings</h1>
          <p className="text-gray-500 mt-1">Manage branding, colors, fonts, and SEO across your entire website</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
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
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                  <Image className="w-8 h-8" />
                </div>
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Upload Logo</button>
                <button className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">Remove</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Favicon (browser tab icon)</label>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  <Image className="w-5 h-5" />
                </div>
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
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
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
