import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { fetchAllPages, fetchFullPageById, updatePage, updatePageStatus, updateSection, updateSectionSettings, updateSectionVisibility, reorderSections, publishPage, createVersion, createDefaultSections } from '../services/website-builder'
import type { WebsitePage, WebsiteSection, PageStatus, SectionSettings } from '../types/website-builder'

export function useWebsiteBuilder() {
  const [pages, setPages] = useState<WebsitePage[]>([])
  const [loading, setLoading] = useState(true)
  const [activePageId, setActivePageId] = useState<string | null>(null)
  const [activeSections, setActiveSections] = useState<WebsiteSection[]>([])
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const loadPages = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAllPages()
      setPages(data)
    } catch {
      toast.error('Failed to load pages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPages() }, [loadPages])

  const selectPage = useCallback(async (pageId: string) => {
    setActivePageId(pageId)
    setSelectedSectionId(null)
    try {
      const full = await fetchFullPageById(pageId)
      if (full) {
        if (full.sections.length === 0) {
          const slug = full.page.slug
          const sections = await createDefaultSections(pageId, slug)
          setActiveSections(sections)
        } else {
          setActiveSections(full.sections)
        }
      }
    } catch {
      toast.error('Failed to load page data')
    }
  }, [])

  const handleUpdatePage = useCallback(async (id: string, updates: Partial<WebsitePage>) => {
    setIsSaving(true)
    try {
      await updatePage(id, updates)
      setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
      toast.success('Page updated')
    } catch {
      toast.error('Failed to update page')
    } finally {
      setIsSaving(false)
    }
  }, [])

  const handleUpdateSection = useCallback(async (id: string, updates: Partial<WebsiteSection>) => {
    try {
      await updateSection(id, updates)
      setActiveSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
      if (activePageId) {
        const page = pages.find(p => p.id === activePageId)
        if (page?.status === 'published') {
          await updatePageStatus(activePageId, 'draft')
          setPages(prev => prev.map(p => p.id === activePageId ? { ...p, status: 'draft', is_draft: true } : p))
        }
      }
    } catch {
      toast.error('Failed to update section')
    }
  }, [activePageId, pages])

  const handleUpdateSectionSettings = useCallback(async (id: string, settings: SectionSettings) => {
    try {
      await updateSectionSettings(id, settings)
      setActiveSections(prev => prev.map(s => s.id === id ? { ...s, settings } : s))
    } catch {
      toast.error('Failed to update design settings')
    }
  }, [])

  const handleToggleSectionVisibility = useCallback(async (id: string, isVisible: boolean) => {
    try {
      await updateSectionVisibility(id, isVisible)
      setActiveSections(prev => prev.map(s => s.id === id ? { ...s, is_visible: isVisible } : s))
    } catch {
      toast.error('Failed to toggle visibility')
    }
  }, [])

  const handleReorderSections = useCallback(async (pageId: string, orderedIds: string[]) => {
    try {
      await reorderSections(pageId, orderedIds)
      setActiveSections(prev => {
        const map = new Map(prev.map(s => [s.id, s]))
        return orderedIds.map((id, idx) => {
          const section = map.get(id)
          return section ? { ...section, sort_order: idx } : section as unknown as WebsiteSection
        }).filter(Boolean)
      })
    } catch {
      toast.error('Failed to reorder')
    }
  }, [])

  const handlePublish = useCallback(async (pageId: string) => {
    setIsSaving(true)
    try {
      await publishPage(pageId)
      setPages(prev => prev.map(p => p.id === pageId ? { ...p, status: 'published', is_draft: false } : p))
      toast.success('Page published!')
    } catch {
      toast.error('Failed to publish')
    } finally {
      setIsSaving(false)
    }
  }, [])

  const handleSaveDraft = useCallback(async (pageId: string) => {
    setIsSaving(true)
    try {
      await createVersion(pageId)
      await updatePage(pageId, { status: 'draft', is_draft: true })
      setPages(prev => prev.map(p => p.id === pageId ? { ...p, status: 'draft', is_draft: true } : p))
      toast.success('Draft saved — changes are hidden from the public site')
    } catch {
      toast.error('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }, [])

  const handleChangeStatus = useCallback(async (id: string, status: PageStatus) => {
    try {
      await updatePageStatus(id, status)
      setPages(prev => prev.map(p => p.id === id ? { ...p, status } : p))
      toast.success(`Page ${status}`)
    } catch {
      toast.error('Failed to change status')
    }
  }, [])

  const activePage = pages.find(p => p.id === activePageId) || null

  return {
    pages,
    loading,
    activePageId,
    activePage,
    activeSections,
    selectedSectionId,
    isSaving,
    setSelectedSectionId,
    selectPage,
    handleUpdatePage,
    handleUpdateSection,
    handleUpdateSectionSettings,
    handleToggleSectionVisibility,
    handleReorderSections,
    handlePublish,
    handleSaveDraft,
    handleChangeStatus,
    refreshPages: loadPages,
  }
}
