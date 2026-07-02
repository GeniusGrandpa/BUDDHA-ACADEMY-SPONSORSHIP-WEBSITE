import { useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Search, Eye, EyeOff, Save, Send, ArrowUp, ArrowDown, Image, FileText, Smartphone, Tablet, Monitor, Globe, Layers, ChevronLeft, MoveVertical, Check, X } from 'lucide-react'
import { useWebsiteBuilder } from '../../../hooks/useWebsiteBuilder'
import { ColorPicker } from '../../../components/ui/ColorPicker'
import { ImagePicker } from '../../../components/ui/ImagePicker'
import { Select } from '../../../components/ui/Select'
import { DashboardSkeleton } from '../../../components/ui/LoadingSkeleton'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { SectionContentEditor } from './components/SectionContentEditor'
import { SECTION_TYPE_LABELS, FONT_SIZE_OPTIONS, LAYOUT_PRESET_OPTIONS, PADDING_OPTIONS, BORDER_RADIUS_OPTIONS } from '../../../types/website-builder'
import type { WebsitePage, WebsiteSection, PageStatus, SectionSettings } from '../../../types/website-builder'

type ViewMode = 'list' | 'editor'
type PreviewDevice = 'desktop' | 'tablet' | 'mobile'
type EditorTab = 'content' | 'design' | 'seo'

const previewWidths: Record<PreviewDevice, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
}

export function WebsiteBuilder() {
  const {
    pages, loading, activePage, activeSections,
    selectedSectionId, isSaving, setSelectedSectionId,
    selectPage, handleUpdatePage, handleUpdateSection,
    handleUpdateSectionSettings, handleToggleSectionVisibility,
    handleReorderSections, handlePublish, handleSaveDraft,
    handleChangeStatus, refreshPages,
  } = useWebsiteBuilder()

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PageStatus | 'all'>('all')
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop')
  const [editorTab, setEditorTab] = useState<EditorTab>('content')

  const filteredPages = useMemo(() => {
    return pages.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.slug.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [pages, searchQuery, statusFilter])

  const handleOpenEditor = useCallback((pageId: string) => {
    selectPage(pageId)
    setViewMode('editor')
    setEditorTab('content')
  }, [selectPage])

  const selectedSection = activeSections.find(s => s.id === selectedSectionId) || null

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-72 animate-pulse" />
        <DashboardSkeleton />
      </div>
    )
  }

  if (viewMode === 'editor' && activePage) {
    return (
      <PageEditorView
        page={activePage}
        sections={activeSections}
        selectedSection={selectedSection}
        selectedSectionId={selectedSectionId}
        onSelectSection={setSelectedSectionId}
        onUpdatePage={handleUpdatePage}
        onUpdateSection={handleUpdateSection}
        onUpdateSettings={handleUpdateSectionSettings}
        onToggleVisibility={handleToggleSectionVisibility}
        onReorder={handleReorderSections}
        onPublish={handlePublish}
        onSaveDraft={handleSaveDraft}
        onBack={() => { setViewMode('list'); setSelectedSectionId(null) }}
        previewDevice={previewDevice}
        setPreviewDevice={setPreviewDevice}
        editorTab={editorTab}
        setEditorTab={setEditorTab}
        isSaving={isSaving}
      />
    )
  }

  return (
    <PageListView
      pages={filteredPages}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      onEditPage={handleOpenEditor}
      onToggleStatus={handleChangeStatus}
      onRefresh={refreshPages}
    />
  )
}

function PageListView({ pages, searchQuery, onSearchChange, statusFilter, onStatusFilterChange, onEditPage, onToggleStatus, onRefresh }: {
  pages: WebsitePage[]
  searchQuery: string
  onSearchChange: (q: string) => void
  statusFilter: PageStatus | 'all'
  onStatusFilterChange: (s: PageStatus | 'all') => void
  onEditPage: (id: string) => void
  onToggleStatus: (id: string, status: PageStatus) => void
  onRefresh: () => void
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Builder</h1>
          <p className="text-gray-500 mt-1">Manage and edit all your website pages visually</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/website/media" className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Image className="w-4 h-4 inline mr-1.5" />
            Media Library
          </Link>
          <button onClick={onRefresh} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{pages.filter(p => p.status === 'published').length} Published</p>
              <p className="text-xs text-gray-500">Pages live on your website</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{pages.filter(p => p.status === 'draft').length} Drafts</p>
              <p className="text-xs text-gray-500">Pages with unpublished changes</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <EyeOff className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{pages.filter(p => p.status === 'hidden').length} Hidden</p>
              <p className="text-xs text-gray-500">Pages not visible to visitors</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pages by name or URL..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            {(['all', 'published', 'draft', 'hidden'] as const).map(s => (
              <button key={s} onClick={() => onStatusFilterChange(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${statusFilter === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 text-left">
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Page</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Updated</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No pages found</p>
                  </td>
                </tr>
              ) : (
                pages.map(page => (
                  <tr key={page.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <button onClick={() => onEditPage(page.id)} className="text-sm font-medium text-gray-900 hover:text-amber-600 transition-colors text-left">
                        {page.title}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">/{page.slug}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={page.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {page.updated_at ? new Date(page.updated_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/${page.slug}`} target="_blank" className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Preview">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => onEditPage(page.id)} className="px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          Edit
                        </button>
                        {confirmId === page.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => { onToggleStatus(page.id, page.status === 'hidden' ? 'published' : 'hidden'); setConfirmId(null) }} className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200" title="Confirm">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setConfirmId(null)} className="p-1.5 rounded bg-gray-100 text-gray-400 hover:bg-gray-200" title="Cancel">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmId(page.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title={page.status === 'hidden' ? 'Show page' : 'Hide page'}>
                            {page.status === 'hidden' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Layers className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Click & Edit</p>
            <p className="text-sm text-gray-600 mt-0.5">Click any page name to open the visual editor. Changes save as drafts until you publish.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PageEditorView({ page, sections, selectedSection, selectedSectionId, onSelectSection, onUpdatePage, onUpdateSection, onUpdateSettings, onToggleVisibility, onReorder, onPublish, onSaveDraft, onBack, previewDevice, setPreviewDevice, editorTab, setEditorTab, isSaving }: {
  page: WebsitePage
  sections: WebsiteSection[]
  selectedSection: WebsiteSection | null
  selectedSectionId: string | null
  onSelectSection: (id: string | null) => void
  onUpdatePage: (id: string, updates: Partial<WebsitePage>) => void
  onUpdateSection: (id: string, updates: Partial<WebsiteSection>) => void
  onUpdateSettings: (id: string, settings: SectionSettings) => void
  onToggleVisibility: (id: string, v: boolean) => void
  onReorder: (pageId: string, orderedIds: string[]) => void
  onPublish: (id: string) => void
  onSaveDraft: (id: string) => void
  onBack: () => void
  previewDevice: PreviewDevice
  setPreviewDevice: (d: PreviewDevice) => void
  editorTab: EditorTab
  setEditorTab: (t: EditorTab) => void
  isSaving: boolean
}) {
  const [metaTitle, setMetaTitle] = useState(page.meta_title || '')
  const [metaDesc, setMetaDesc] = useState(page.meta_description || '')
  const [showMobileNav, setShowMobileNav] = useState(false)

  const sectionOrder = useMemo(() =>
    [...sections].sort((a, b) => a.sort_order - b.sort_order),
    [sections]
  )

  const moveSection = useCallback((id: string, direction: 'up' | 'down') => {
    const idx = sectionOrder.findIndex(s => s.id === id)
    if (idx === -1) return
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === sectionOrder.length - 1) return
    const newOrder = [...sectionOrder]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      ;[newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]]
    onReorder(page.id, newOrder.map(s => s.id))
  }, [sectionOrder, page.id, onReorder])

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -mx-6 -mb-6">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Back to pages">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <h1 className="text-base font-bold text-gray-900">{page.title}</h1>
            <StatusBadge status={page.status} />
            <span className="text-xs text-gray-400">/{page.slug}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-0.5">
            {(['desktop', 'tablet', 'mobile'] as const).map(d => {
              const Icon = d === 'desktop' ? Monitor : d === 'tablet' ? Tablet : Smartphone
              return (
                <button key={d} onClick={() => setPreviewDevice(d)} className={`p-2 rounded-md transition-colors ${previewDevice === d ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`} title={d}>
                  <Icon className="w-4 h-4" />
                </button>
              )
            })}
          </div>
          <div className="w-px h-6 bg-gray-200 hidden md:block" />
          <Link to={`/${page.slug}`} target="_blank" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="w-4 h-4" />
            View Live
          </Link>
          <button onClick={() => onSaveDraft(page.id)} disabled={isSaving} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4 inline mr-1" />
            Draft
          </button>
          <button onClick={() => onPublish(page.id)} disabled={isSaving} className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 transition-colors">
            <Send className="w-4 h-4 inline mr-1" />
            {isSaving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="md:hidden border-b border-gray-200 bg-white">
        <button onClick={() => setShowMobileNav(!showMobileNav)} className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 flex items-center justify-between">
          <span>{selectedSection ? (SECTION_TYPE_LABELS[selectedSection.section_type] || selectedSection.section_key) : 'Select a section...'}</span>
          <ChevronLeft className={`w-4 h-4 transition-transform ${showMobileNav ? '-rotate-90' : ''}`} />
        </button>
        {showMobileNav && (
          <div className="px-3 pb-3 space-y-0.5 max-h-48 overflow-y-auto">
            {sectionOrder.map(s => (
              <button key={s.id} onClick={() => { onSelectSection(s.id); setShowMobileNav(false) }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedSectionId === s.id ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${s.is_visible ? 'bg-green-400' : 'bg-gray-300'}`} />
                {SECTION_TYPE_LABELS[s.section_type] || s.section_key}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex md:flex-col w-64 lg:w-80 bg-gray-50 border-r border-gray-200 shrink-0">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sections</h3>
            <p className="text-xs text-gray-400 mt-0.5">{sectionOrder.filter(s => s.is_visible).length} visible · {sectionOrder.length} total</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {sectionOrder.map((section, idx) => {
              const label = SECTION_TYPE_LABELS[section.section_type] || section.section_key
              const isSelected = selectedSectionId === section.id
              return (
                <div key={section.id} className="group">
                  <button
                    onClick={() => onSelectSection(section.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${isSelected ? 'bg-amber-50 text-amber-700 font-medium ring-1 ring-amber-200' : 'text-gray-600 hover:bg-white'
                      } ${!section.is_visible ? 'opacity-60' : ''}`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${section.is_visible ? 'bg-green-400' : 'bg-gray-300'}`} />
                    <span className="flex-1 text-left truncate">{label}</span>
                  </button>
                  {isSelected && (
                    <div className="flex items-center gap-0.5 mt-0.5 ml-7">
                      <button onClick={() => moveSection(section.id, 'up')} disabled={idx === 0} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed" title="Move up">
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button onClick={() => moveSection(section.id, 'down')} disabled={idx === sectionOrder.length - 1} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed" title="Move down">
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button onClick={() => onToggleVisibility(section.id, !section.is_visible)} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600" title={section.is_visible ? 'Hide' : 'Show'}>
                        {section.is_visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
          <div className="hidden md:flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2">
              {sectionOrder.filter(s => s.is_visible).length === 0 && (
                <span className="text-xs text-amber-600 font-medium">All sections hidden — page will be blank on live site</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{sectionOrder.length} sections</span>
              <span>{sections.filter(s => s.is_visible).length} visible</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex justify-center">
            <div
              className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
              style={{ width: previewWidths[previewDevice], maxWidth: '100%' }}
            >
              {sectionOrder.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium">No sections yet</p>
                  <p className="text-xs mt-1">This page has no content sections defined</p>
                </div>
              ) : (
                <div className="min-h-[400px]">
                  {sectionOrder.map(section => (
                    <SectionPreview
                      key={section.id}
                      section={section}
                      isSelected={selectedSectionId === section.id}
                      onSelect={() => onSelectSection(section.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:flex-col w-96 bg-white border-l border-gray-200 shrink-0">
          {selectedSection ? (
            <>
              <div className="flex border-b border-gray-200">
                {(['content', 'design', 'seo'] as const).map(tab => (
                  <button key={tab} onClick={() => setEditorTab(tab)} className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${editorTab === tab ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/30' : 'text-gray-500 hover:text-gray-700'}`}>
                    {tab === 'content' ? 'Content' : tab === 'design' ? 'Design' : 'SEO'}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {editorTab === 'content' && (
                  <ContentEditorPanel section={selectedSection} onUpdate={onUpdateSection} />
                )}
                {editorTab === 'design' && (
                  <DesignControlsPanel section={selectedSection} onUpdateSettings={onUpdateSettings} />
                )}
                {editorTab === 'seo' && (
                  <SeoEditorPanel page={page} metaTitle={metaTitle} metaDesc={metaDesc} onMetaTitleChange={setMetaTitle} onMetaDescChange={setMetaDesc} onSave={() => onUpdatePage(page.id, { meta_title: metaTitle, meta_description: metaDesc })} />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                  <MoveVertical className="w-6 h-6 text-amber-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">Select a section</p>
                <p className="text-xs text-gray-400 mt-1">Click a section in the sidebar or on the preview to edit its content and design</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ContentEditorPanel({ section, onUpdate }: { section: WebsiteSection; onUpdate: (id: string, updates: Partial<WebsiteSection>) => void }) {
  return (
    <div className="space-y-4">
      <div className="px-1">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Section</p>
        <p className="text-sm font-semibold text-gray-700">{SECTION_TYPE_LABELS[section.section_type] || section.section_key}</p>
        <p className="text-xs text-gray-400 mt-0.5">Key: {section.section_key}</p>
      </div>
      <div className="border-t border-gray-100 pt-3">
        <SectionContentEditor key={section.id} section={section} onUpdate={onUpdate} />
      </div>
    </div>
  )
}

function DesignControlsPanel({ section, onUpdateSettings }: { section: WebsiteSection; onUpdateSettings: (id: string, settings: SectionSettings) => void }) {
  const settings = section.settings || {}

  const [textColor, setTextColor] = useState(settings.text_color || '#111827')
  const [bgColor, setBgColor] = useState(settings.background_color || '#ffffff')
  const [buttonColor, setButtonColor] = useState(settings.button_color || '#f59e0b')
  const [buttonTextColor, setButtonTextColor] = useState(settings.button_text_color || '#ffffff')
  const [bgImage, setBgImage] = useState(settings.background_image || '')
  const [overlayColor, setOverlayColor] = useState(settings.overlay_color || '#000000')
  const [overlayOpacity, setOverlayOpacity] = useState(settings.overlay_opacity ?? 0.5)
  const [borderRadius, setBorderRadius] = useState(settings.border_radius || '0.5rem')
  const [paddingTop, setPaddingTop] = useState(settings.padding_top || '2rem')
  const [paddingBottom, setPaddingBottom] = useState(settings.padding_bottom || '2rem')
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>(settings.text_alignment || 'left')
  const [fontSizePreset, setFontSizePreset] = useState(settings.font_size_preset || 'base')
  const [layoutPreset, setLayoutPreset] = useState(settings.layout_preset || 'default')

  const applySettings = useCallback(() => {
    onUpdateSettings(section.id, {
      text_color: textColor,
      background_color: bgColor,
      button_color: buttonColor,
      button_text_color: buttonTextColor,
      background_image: bgImage,
      overlay_color: overlayColor,
      overlay_opacity: overlayOpacity,
      border_radius: borderRadius,
      padding_top: paddingTop,
      padding_bottom: paddingBottom,
      text_alignment: textAlignment,
      font_size_preset: fontSizePreset,
      layout_preset: layoutPreset,
    })
    toast.success('Design updated')
  }, [section.id, textColor, bgColor, buttonColor, buttonTextColor, bgImage, overlayColor, overlayOpacity, borderRadius, paddingTop, paddingBottom, textAlignment, fontSizePreset, layoutPreset, onUpdateSettings])

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Colors</p>

      <ColorPicker label="Text Color" value={textColor} onChange={setTextColor} />
      <ColorPicker label="Background Color" value={bgColor} onChange={setBgColor} />
      <ColorPicker label="Button Color" value={buttonColor} onChange={setButtonColor} />
      <ColorPicker label="Button Text Color" value={buttonTextColor} onChange={setButtonTextColor} />
      <ColorPicker label="Overlay Color" value={overlayColor} onChange={setOverlayColor} />

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Overlay Opacity ({Math.round(overlayOpacity * 100)}%)</label>
        <input type="range" min="0" max="1" step="0.05" value={overlayOpacity} onChange={e => setOverlayOpacity(parseFloat(e.target.value))} className="w-full accent-amber-500" />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Background Image</p>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
          <div className="flex gap-2">
            <input type="text" value={bgImage} onChange={e => setBgImage(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" placeholder="https://..." />
            <ImagePicker value={bgImage} onChange={setBgImage} />
          </div>
        </div>
        {bgImage && (
          <div className="mt-2 h-16 rounded-lg overflow-hidden border border-gray-200">
            <img src={bgImage} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Layout & Spacing</p>

        <Select label="Text Alignment" options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]} value={textAlignment} onChange={e => setTextAlignment(e.target.value as 'left' | 'center' | 'right')} />

        <div className="mt-3">
          <Select label="Font Size" options={FONT_SIZE_OPTIONS} value={fontSizePreset} onChange={e => setFontSizePreset(e.target.value as 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl')} />
        </div>

        <div className="mt-3">
          <Select label="Layout Style" options={LAYOUT_PRESET_OPTIONS} value={layoutPreset} onChange={e => setLayoutPreset(e.target.value as 'default' | 'wide' | 'narrow' | 'full_width')} />
        </div>

        <div className="mt-3">
          <Select label="Border Radius" options={BORDER_RADIUS_OPTIONS} value={borderRadius} onChange={e => setBorderRadius(e.target.value)} />
        </div>

        <div className="mt-3">
          <Select label="Top Padding" options={PADDING_OPTIONS} value={paddingTop} onChange={e => setPaddingTop(e.target.value)} />
        </div>

        <div className="mt-3">
          <Select label="Bottom Padding" options={PADDING_OPTIONS} value={paddingBottom} onChange={e => setPaddingBottom(e.target.value)} />
        </div>
      </div>

      <button onClick={applySettings} className="w-full mt-4 px-4 py-2 text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition-colors">
        Apply Design
      </button>
    </div>
  )
}

function SeoEditorPanel({ page, metaTitle, metaDesc, onMetaTitleChange, onMetaDescChange, onSave }: {
  page: WebsitePage
  metaTitle: string
  metaDesc: string
  onMetaTitleChange: (v: string) => void
  onMetaDescChange: (v: string) => void
  onSave: () => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">SEO Settings for /{page.slug}</p>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Meta Title</label>
        <input type="text" value={metaTitle} onChange={e => onMetaTitleChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" placeholder="Page title for search engines..." />
        <p className="text-xs text-gray-400 mt-1">{metaTitle.length} characters</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label>
        <textarea value={metaDesc} onChange={e => onMetaDescChange(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none" placeholder="Brief description for search results..." />
        <p className="text-xs text-gray-400 mt-1">{metaDesc.length} characters</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs font-medium text-gray-500 mb-1">Search Preview</p>
        <p className="text-sm text-blue-700 font-medium truncate">{metaTitle || 'Page Title'} · Buddha Academy</p>
        <p className="text-xs text-green-700 truncate">https://buddhaacademy.edu.np/{page.slug}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{metaDesc || 'Page description for search results'}</p>
      </div>

      <button onClick={onSave} className="w-full px-4 py-2 text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition-colors">
        Save SEO
      </button>
    </div>
  )
}

function SectionPreview({ section, isSelected, onSelect }: { section: WebsiteSection; isSelected: boolean; onSelect: () => void }) {
  const s = section.settings || {}
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
    style.position = 'relative'
  }

  const label = SECTION_TYPE_LABELS[section.section_type] || section.section_key

  if (!section.is_visible) {
    return (
      <div
        onClick={onSelect}
        className={`border-2 border-dashed border-gray-200 cursor-pointer transition-colors hover:border-amber-300 ${isSelected ? 'border-amber-400 ring-2 ring-amber-200' : ''}`}
      >
        <div className="h-20 flex items-center justify-center text-gray-300 text-sm">
          <EyeOff className="w-4 h-4 mr-2" /> {label} (hidden)
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer border-2 transition-all ${isSelected ? 'border-amber-400 ring-2 ring-amber-200' : 'border-transparent hover:border-amber-200/50'
        }`}
    >
      {s.overlay_color && s.overlay_opacity && (
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: s.overlay_color, opacity: s.overlay_opacity }} />
      )}
      <div className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-md text-xs font-medium ${isSelected ? 'bg-amber-500 text-white' : 'bg-white/90 text-gray-600 shadow-sm border opacity-0 group-hover:opacity-100'
        }`}>
        {label}
      </div>
      <div style={style} className="relative z-[1] min-h-[60px] p-4">
        {section.title && <h2 className="text-base font-bold mb-1" style={{ color: s.text_color }}>{section.title}</h2>}
        {section.subtitle && <p className="text-sm mb-1 opacity-80" style={{ color: s.text_color }}>{section.subtitle}</p>}
        {section.description && <p className="text-xs opacity-70" style={{ color: s.text_color }}>{section.description}</p>}
        {!section.title && !section.subtitle && !section.description && (
          <p className="text-xs text-gray-300 italic">Empty section — click to edit content</p>
        )}
      </div>
    </div>
  )
}
