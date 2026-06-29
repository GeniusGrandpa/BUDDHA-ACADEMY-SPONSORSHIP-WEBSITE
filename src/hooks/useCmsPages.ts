import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { fetchCmsDataset, fetchCmsPageData, updatePageVisibility, updateSectionVisibilityByKey, updatePagePublishStatus, updatePageSeo } from '../services/cms-pages'
import type { CmsDataset, CmsPageData } from '../services/cms-pages'

interface CmsPagesState {
  loading: boolean
  dataset: CmsDataset | null
  activePageId: string | null
  activePageData: CmsPageData | null
}

export function useCmsPages() {
  const [state, setState] = useState<CmsPagesState>({
    loading: true,
    dataset: null,
    activePageId: null,
    activePageData: null,
  })
  const loadedRef = useRef(false)

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const dataset = await fetchCmsDataset()
      const firstPage = dataset.pages[0]
      const firstPageData = dataset.pageData[firstPage.id]
      setState({
        loading: false,
        dataset,
        activePageId: firstPage.id,
        activePageData: firstPageData,
      })
    } catch {
      toast.error('Failed to load CMS data')
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true
      load()
    }
  }, [load])

  const setActivePage = useCallback(async (pageId: string) => {
    const page = state.dataset?.pages.find(p => p.id === pageId)
    if (!page) return
    setState(prev => ({ ...prev, activePageId: pageId }))
    try {
      const pageData = await fetchCmsPageData(page)
      setState(prev => ({ ...prev, activePageData: pageData }))
    } catch {
      if (state.dataset?.pageData[pageId]) {
        setState(prev => ({ ...prev, activePageData: prev.dataset?.pageData[pageId] || null }))
      }
    }
  }, [state.dataset])

  const togglePageVisibility = useCallback(async (pageId: string, isVisible: boolean) => {
    const page = state.dataset?.pages.find(p => p.id === pageId)
    if (!page) return
    setState(prev => {
      if (!prev.dataset) return prev
      return {
        ...prev,
        dataset: {
          ...prev.dataset,
          pages: prev.dataset.pages.map(p => p.id === pageId ? { ...p, isVisible } : p),
        },
      }
    })
    try {
      await updatePageVisibility(page.slug, isVisible)
    } catch {
      setState(prev => {
        if (!prev.dataset) return prev
        return {
          ...prev,
          dataset: {
            ...prev.dataset,
            pages: prev.dataset.pages.map(p => p.id === pageId ? { ...p, isVisible: !isVisible } : p),
          },
        }
      })
    }
  }, [state.dataset])

  const toggleSectionVisibility = useCallback(async (sectionKey: string, isVisible: boolean) => {
    setState(prev => {
      if (!prev.dataset || !prev.activePageData) return prev
      return {
        ...prev,
        activePageData: {
          ...prev.activePageData,
          visibility: { ...prev.activePageData.visibility, [sectionKey]: isVisible },
        },
      }
    })
    try {
      await updateSectionVisibilityByKey(sectionKey, isVisible)
    } catch {
      setState(prev => {
        if (!prev.dataset || !prev.activePageData) return prev
        return {
          ...prev,
          activePageData: {
            ...prev.activePageData,
            visibility: { ...prev.activePageData.visibility, [sectionKey]: !isVisible },
          },
        }
      })
    }
  }, [])

  const togglePublishStatus = useCallback(async (pageId: string, published: boolean) => {
    const page = state.dataset?.pages.find(p => p.id === pageId)
    if (!page) return
    setState(prev => {
      if (!prev.dataset) return prev
      return {
        ...prev,
        dataset: {
          ...prev.dataset,
          pages: prev.dataset.pages.map(p => p.id === pageId ? { ...p, isPublished: published } : p),
        },
      }
    })
    try {
      await updatePagePublishStatus(page.slug, published)
      toast.success(published ? 'Page published' : 'Page unpublished')
    } catch {
      setState(prev => {
        if (!prev.dataset) return prev
        return {
          ...prev,
          dataset: {
            ...prev.dataset,
            pages: prev.dataset.pages.map(p => p.id === pageId ? { ...p, isPublished: !published } : p),
          },
        }
      })
      toast.error('Failed to update publish status')
    }
  }, [state.dataset])

  const updateSeo = useCallback(async (pageId: string, metaTitle: string, metaDescription: string) => {
    const page = state.dataset?.pages.find(p => p.id === pageId)
    if (!page) return
    setState(prev => {
      if (!prev.dataset) return prev
      return {
        ...prev,
        dataset: {
          ...prev.dataset,
          pages: prev.dataset.pages.map(p => p.id === pageId ? { ...p, metaTitle, metaDescription } : p),
        },
      }
    })
    try {
      await updatePageSeo(page.slug, metaTitle, metaDescription)
    } catch {
      toast.error('Failed to update SEO')
    }
  }, [state.dataset])

  const reloadPageData = useCallback(async (pageId: string) => {
    const page = state.dataset?.pages.find(p => p.id === pageId)
    if (!page) return
    try {
      const pageData = await fetchCmsPageData(page)
      setState(prev => ({ ...prev, activePageData: pageData }))
      toast.success('Content refreshed')
    } catch {
      toast.error('Failed to refresh content')
    }
  }, [state.dataset])

  return {
    ...state,
    setActivePage,
    togglePageVisibility,
    toggleSectionVisibility,
    togglePublishStatus,
    updateSeo,
    reloadPageData,
    activePage: state.dataset?.pages.find(p => p.id === state.activePageId) || null,
  }
}
