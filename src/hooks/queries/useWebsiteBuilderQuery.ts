import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as websiteBuilder from '../../services/website-builder'
import { STALE_TIMES } from '../../lib/query-client'
import type { WebsitePage } from '../../types/website-builder'

const KEYS = {
  all: ['website-builder'] as const,
  pages: () => [...KEYS.all, 'pages'] as const,
  page: (id: string) => [...KEYS.all, 'page', id] as const,
  pageBySlug: (slug: string) => [...KEYS.all, 'page-slug', slug] as const,
  sections: (pageId: string) => [...KEYS.all, 'sections', pageId] as const,
  section: (id: string) => [...KEYS.all, 'section', id] as const,
  blocks: (sectionId: string) => [...KEYS.all, 'blocks', sectionId] as const,
  media: () => [...KEYS.all, 'media'] as const,
  versions: (pageId: string) => [...KEYS.all, 'versions', pageId] as const,
}

export function useWebsitePages() {
  return useQuery({
    queryKey: KEYS.pages(),
    queryFn: () => websiteBuilder.fetchAllPages(),
    staleTime: STALE_TIMES.websiteBuilder,
  })
}

export function useWebsitePage(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.page(id!),
    queryFn: () => websiteBuilder.fetchPageById(id!),
    enabled: !!id,
    staleTime: STALE_TIMES.websiteBuilder,
  })
}

export function useWebsitePageBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: KEYS.pageBySlug(slug!),
    queryFn: () => websiteBuilder.fetchPageBySlug(slug!),
    enabled: !!slug,
    staleTime: STALE_TIMES.websiteBuilder,
  })
}

export function useSectionsByPage(pageId: string | undefined) {
  return useQuery({
    queryKey: KEYS.sections(pageId!),
    queryFn: () => websiteBuilder.fetchSectionsByPage(pageId!),
    enabled: !!pageId,
    staleTime: STALE_TIMES.websiteBuilder,
  })
}

export function useBlocksBySection(sectionId: string | undefined) {
  return useQuery({
    queryKey: KEYS.blocks(sectionId!),
    queryFn: () => websiteBuilder.fetchBlocksBySection(sectionId!),
    enabled: !!sectionId,
    staleTime: STALE_TIMES.websiteBuilder,
  })
}

export function useWebsiteMedia() {
  return useQuery({
    queryKey: KEYS.media(),
    queryFn: () => websiteBuilder.fetchMedia(),
    staleTime: STALE_TIMES.mediaLibrary,
  })
}

export function usePageVersions(pageId: string | undefined) {
  return useQuery({
    queryKey: KEYS.versions(pageId!),
    queryFn: () => websiteBuilder.fetchVersionsByPage(pageId!),
    enabled: !!pageId,
    staleTime: STALE_TIMES.websiteBuilder,
  })
}

export function usePageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WebsitePage> }) =>
      websiteBuilder.updatePage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.pages() })
    },
  })
}

export function useCreatePageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (page: Partial<WebsitePage>) => websiteBuilder.createPage(page),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.pages() })
    },
  })
}

export function useDeletePageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => websiteBuilder.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.pages() })
    },
  })
}

export function useUpdateSectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<import('../../types/website-builder').WebsiteSection> }) =>
      websiteBuilder.updateSection(id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.sections(variables.id) })
    },
  })
}

export function useUpdateBlockMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<import('../../types/website-builder').WebsiteContentBlock> }) =>
      websiteBuilder.updateBlock(id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.blocks(variables.id) })
    },
  })
}

export { KEYS as websiteBuilderKeys }
