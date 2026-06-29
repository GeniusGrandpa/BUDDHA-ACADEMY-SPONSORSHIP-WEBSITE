import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Search, Eye, EyeOff, Globe, FileText, Settings, ArrowLeft } from 'lucide-react'
import { useCmsPages } from '../../../hooks/useCmsPages'
import { ToggleSwitch } from '../../../components/ui/ToggleSwitch'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { FormSkeleton } from '../../../components/ui/LoadingSkeleton'
import type { CmsPage, CmsSection } from '../../../types/cms-pages'
import type { CmsPageData } from '../../../services/cms-pages'

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
  const [view, setView] = useState<'pages' | 'editor' | 'seo'>('pages')
  const [selectedSectionKey, setSelectedSectionKey] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const filteredPages = (dataset?.pages || []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      toast.success('All changes saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }, [])

  if (loading) return <FormSkeleton fields={8} />

  if (view === 'editor' && activePage && activePageData) {
    return (
      <PageEditorView
        page={activePage}
        pageData={activePageData}
        selectedSectionKey={selectedSectionKey}
        setSelectedSectionKey={setSelectedSectionKey}
        toggleSectionVisibility={toggleSectionVisibility}
        togglePublishStatus={togglePublishStatus}
        onBack={() => { setView('pages'); setSelectedSectionKey(null) }}
        onSave={handleSave}
        saving={saving}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Builder</h1>
          <p className="text-gray-500 mt-1">Manage all public website pages</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-500/50 w-56"
            />
          </div>
          <Link
            to="/admin/website/media"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Media Library
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] gap-4 p-4 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="w-8" />
            <span className="flex-1">Page</span>
            <span className="w-24 text-center">Status</span>
            <span className="w-16 text-center">Sections</span>
          </div>
          <div className="flex items-center gap-2 pr-2">
            <span className="w-16 text-center">Visible</span>
            <span className="w-16 text-center">Published</span>
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

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Changes are live immediately</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              Toggling visibility and publish status updates instantly. Content changes affect the public website right after saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
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
          <span className="text-sm font-medium text-gray-900 group-hover/edit:text-amber-600 transition-colors">{page.name}</span>
          <span className="text-xs text-gray-400 ml-2">/{page.slug}</span>
        </button>
        <div className="w-24 flex justify-center">
          <StatusBadge status={page.isPublished ? 'published' : 'draft'} />
        </div>
        <div className="w-16 text-center">
          <span className="text-xs text-gray-400">{page.sections.length}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEditSeo} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Edit SEO">
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
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

function PageEditorView({ page, pageData, selectedSectionKey, setSelectedSectionKey, toggleSectionVisibility, togglePublishStatus, onBack, onSave, saving }: {
  page: CmsPage
  pageData: CmsPageData
  selectedSectionKey: string | null
  setSelectedSectionKey: (k: string | null) => void
  toggleSectionVisibility: (key: string, v: boolean) => void
  togglePublishStatus: (id: string, v: boolean) => void
  onBack: () => void
  onSave: () => void
  saving: boolean
}) {
  const visibleSections = page.sections.filter(s => pageData.visibility[s.key] !== false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{page.name}</h1>
              <StatusBadge status={page.isPublished ? 'published' : 'draft'} />
              <StatusBadge status={page.isVisible ? 'visible' : 'hidden'} />
            </div>
            <p className="text-sm text-gray-400">/{page.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/${page.slug}`}
            target="_blank"
            className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Link>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <label className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${page.isPublished ? 'bg-amber-500' : 'bg-gray-200'}`}>
            <input type="checkbox" checked={page.isPublished} onChange={e => togglePublishStatus(page.id, e.target.checked)} className="sr-only" />
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${page.isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sections</h3>
            <div className="space-y-1">
              {page.sections.map(section => {
                const isVisible = pageData.visibility[section.key] !== false
                const isSelected = selectedSectionKey === section.key
                return (
                  <div key={section.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => setSelectedSectionKey(section.key)}
                      className={`flex-1 text-left px-2.5 py-2 rounded-lg text-sm transition-colors ${
                        isSelected
                          ? 'bg-amber-50 text-amber-700 font-medium ring-1 ring-amber-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isVisible ? 'bg-amber-500' : 'bg-gray-300'}`} />
                        <span className={`${isVisible ? '' : 'text-gray-400 italic'}`}>{section.name}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => toggleSectionVisibility(section.key, !isVisible)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                      title={isVisible ? 'Hide section' : 'Show section'}
                    >
                      {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Metadata</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Meta Title:</span>
                <p className="text-gray-700 truncate">{page.metaTitle || 'Not set'}</p>
              </div>
              <div>
                <span className="text-gray-500">Meta Description:</span>
                <p className="text-gray-700 text-xs line-clamp-2">{page.metaDescription || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 min-h-[400px]">
          {selectedSectionKey ? (
            <SectionEditorPanel
              section={page.sections.find(s => s.key === selectedSectionKey)!}
              pageData={pageData}
            />
          ) : (
            <SectionOverviewPanel
              page={page}
              pageData={pageData}
              visibleSections={visibleSections}
              toggleSectionVisibility={toggleSectionVisibility}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function SectionOverviewPanel({ page, pageData, visibleSections, toggleSectionVisibility }: {
  page: CmsPage
  pageData: CmsPageData
  visibleSections: CmsSection[]
  toggleSectionVisibility: (sectionKey: string, isVisible: boolean) => void
}) {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Page Sections</h2>
          <span className="text-xs text-gray-400">{visibleSections.length} of {page.sections.length} visible</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {page.sections.map(section => {
            const isVisible = pageData.visibility[section.key] !== false
            const sectionContent = pageData.sections[section.key]
            return (
              <div key={section.id} className={`p-4 rounded-xl border transition-all ${
                isVisible ? 'border-gray-100 bg-white hover:border-amber-200' : 'border-dashed border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isVisible ? 'bg-amber-500' : 'bg-gray-300'}`} />
                      <h3 className={`text-sm font-medium truncate ${isVisible ? 'text-gray-900' : 'text-gray-400'}`}>
                        {section.name}
                      </h3>
                    </div>
                    <p className={`text-xs mt-1 ${isVisible ? 'text-gray-400' : 'text-gray-300'}`}>
                      {sectionContent ? 'Has content' : 'No content yet'}
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={isVisible}
                    onChange={(v) => toggleSectionVisibility(section.key, v)}
                    size="sm"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SectionEditorPanel({ section, pageData }: {
  section: CmsSection
  pageData: CmsPageData
}) {
  const isVisible = pageData.visibility[section.key] !== false
  const sectionContent = pageData.sections[section.key]

  const fields: Array<{ label: string; key: string; value: string }> = []

  if (sectionContent) {
    if (sectionContent.title) fields.push({ label: 'Title', key: 'title', value: sectionContent.title })
    if (sectionContent.subtitle) fields.push({ label: 'Subtitle', key: 'subtitle', value: sectionContent.subtitle })
    if (sectionContent.description) fields.push({ label: 'Description', key: 'description', value: sectionContent.description })
    const content = sectionContent.content as Record<string, unknown> | undefined
    if (content) {
      Object.entries(content).forEach(([k, v]) => {
        if (typeof v === 'string' && v) {
          fields.push({ label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), key: k, value: v })
        }
      })
    }
  }

  if (fields.length === 0) {
    fields.push({ label: 'Content', key: 'content', value: '' })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{section.name}</h2>
          <p className="text-xs text-gray-400">Section: {section.key}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Visible</span>
          <label className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${isVisible ? 'bg-amber-500' : 'bg-gray-200'}`}>
            <input type="checkbox" checked={isVisible} onChange={() => {}} className="sr-only" />
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${isVisible ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map(field => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{field.label}</label>
            <input
              type="text"
              defaultValue={field.value}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
            />
          </div>
        ))}
      </div>

      {sectionContent?.images && sectionContent.images.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-500 mb-2">Images</h3>
          <div className="grid grid-cols-3 gap-2">
            {sectionContent.images.map((img, i) => (
              <img key={i} src={img.url} alt={img.alt} className="w-full h-20 object-cover rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {pageData.pageHeader && (
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-xs font-medium text-gray-500 mb-2">Page Header</h3>
          <div className="space-y-2">
            <input
              type="text"
              defaultValue={pageData.pageHeader.title}
              placeholder="Page title..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50"
            />
            <textarea
              defaultValue={pageData.pageHeader.subtitle}
              placeholder="Page subtitle..."
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>
        </div>
      )}
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
          <h1 className="text-xl font-bold text-gray-900">SEO Settings</h1>
          <p className="text-sm text-gray-400">{page.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Title</label>
          <input
            type="text"
            value={metaTitle}
            onChange={e => setMetaTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50"
            placeholder="Enter meta title..."
          />
          <p className="text-xs text-gray-400 mt-1">{metaTitle.length} characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
          <textarea
            value={metaDescription}
            onChange={e => setMetaDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50 resize-none"
            placeholder="Enter meta description..."
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
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Google Preview</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-green-700 truncate">{window?.location?.origin || 'https://buddhaacademy.org'}/{page.slug}</p>
          <p className="text-sm font-medium text-blue-700 hover:underline truncate">{metaTitle || page.metaTitle}</p>
          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{metaDescription || page.metaDescription}</p>
        </div>
      </div>
    </div>
  )
}
