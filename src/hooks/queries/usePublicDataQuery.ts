import { useQuery } from '@tanstack/react-query'
import { STALE_TIMES } from '../../lib/query-client'
import * as content from '../../services/content'
import * as newsService from '../../services/news'
import * as studentsService from '../../services/students'
import * as galleryService from '../../services/gallery'
import * as navigationService from '../../services/navigation'
import * as cmsContent from '../../services/cms-content'
import { getSiteSettings } from '../../services/settings'
import { getCmsPrograms, getCmsImpactStats } from '../../services/cms-programs'

const KEYS = {
  pages: ['public', 'pages'] as const,
  page: (slug: string) => ['public', 'page', slug] as const,
  news: ['public', 'news'] as const,
  newsItem: (id: string) => ['public', 'news', id] as const,
  students: ['public', 'students'] as const,
  student: (id: string) => ['public', 'student', id] as const,
  gallery: ['public', 'gallery'] as const,
  navigation: (location?: string) => ['public', 'navigation', location ?? 'all'] as const,
  siteSettings: ['public', 'site-settings'] as const,
  hero: ['public', 'hero'] as const,
  donationContent: ['public', 'donation-content'] as const,
  sponsorshipContent: ['public', 'sponsorship-content'] as const,
  volunteerContent: ['public', 'volunteer-content'] as const,
  transparencyContent: ['public', 'transparency-content'] as const,
  footerContent: ['public', 'footer-content'] as const,
  faqs: ['public', 'faqs'] as const,
  studentStories: ['public', 'student-stories'] as const,
  testimonials: ['public', 'testimonials'] as const,
  videos: ['public', 'videos'] as const,
  programs: ['public', 'programs'] as const,
  impactStats: ['public', 'impact-stats'] as const,
}

export function usePublicPages() {
  return useQuery({
    queryKey: KEYS.pages,
    queryFn: () => content.getPages(),
    staleTime: STALE_TIMES.publicPages,
  })
}

export function usePublicPage(slug: string) {
  return useQuery({
    queryKey: KEYS.page(slug),
    queryFn: () => content.getPageBySlug(slug),
    staleTime: STALE_TIMES.publicPages,
    enabled: !!slug,
  })
}

export function usePublicNews() {
  return useQuery({
    queryKey: KEYS.news,
    queryFn: () => newsService.getNews(),
    staleTime: STALE_TIMES.publicPages,
  })
}

export function usePublicNewsItem(id: string) {
  return useQuery({
    queryKey: KEYS.newsItem(id),
    queryFn: () => newsService.getNewsById(id),
    staleTime: STALE_TIMES.publicPages,
    enabled: !!id,
  })
}

export function usePublicStudents(status?: string) {
  return useQuery({
    queryKey: [...KEYS.students, status],
    queryFn: () => studentsService.getStudents(status, { limit: 50 }),
    staleTime: STALE_TIMES.publicPages,
  })
}

export function usePublicStudent(id: string) {
  return useQuery({
    queryKey: KEYS.student(id),
    queryFn: () => studentsService.getStudentById(id),
    staleTime: STALE_TIMES.publicPages,
    enabled: !!id,
  })
}

export function usePublicGallery() {
  return useQuery({
    queryKey: KEYS.gallery,
    queryFn: () => galleryService.getGalleryItems({ publishedOnly: true }),
    staleTime: STALE_TIMES.publicPages,
  })
}

export function useNavigation(location?: string) {
  return useQuery({
    queryKey: KEYS.navigation(location),
    queryFn: () => navigationService.getNavigationItems(location as never),
    staleTime: STALE_TIMES.navigation,
  })
}

export function useSiteSettings() {
  return useQuery({
    queryKey: KEYS.siteSettings,
    queryFn: () => getSiteSettings(),
    staleTime: STALE_TIMES.cmsContent,
  })
}

export function useHeroContent() {
  return useQuery({
    queryKey: KEYS.hero,
    queryFn: () => cmsContent.getHeroContent(),
    staleTime: STALE_TIMES.publicPages,
  })
}

export function useDonationContent() {
  return useQuery({
    queryKey: KEYS.donationContent,
    queryFn: () => cmsContent.getDonationContent(),
    staleTime: STALE_TIMES.publicPages,
  })
}

export function useSponsorshipContent() {
  return useQuery({
    queryKey: KEYS.sponsorshipContent,
    queryFn: () => cmsContent.getSponsorshipContent(),
    staleTime: STALE_TIMES.publicPages,
  })
}

export function useVolunteerContent() {
  return useQuery({
    queryKey: KEYS.volunteerContent,
    queryFn: () => cmsContent.getVolunteerContent(),
    staleTime: STALE_TIMES.publicPages,
  })
}

export function useTransparencyContent() {
  return useQuery({
    queryKey: KEYS.transparencyContent,
    queryFn: () => cmsContent.getTransparencyContent(),
    staleTime: STALE_TIMES.publicPages,
  })
}

export function useFooterContent() {
  return useQuery({
    queryKey: KEYS.footerContent,
    queryFn: () => cmsContent.getFooterContent(),
    staleTime: STALE_TIMES.publicPages,
  })
}

export function useFaqs() {
  return useQuery({
    queryKey: KEYS.faqs,
    queryFn: () => content.getFaqs(true),
    staleTime: STALE_TIMES.publicPages,
  })
}

export function useStudentStories() {
  return useQuery({
    queryKey: KEYS.studentStories,
    queryFn: () => content.getStudentStories(true),
    staleTime: STALE_TIMES.publicPages,
  })
}

export function useTestimonials() {
  return useQuery({
    queryKey: KEYS.testimonials,
    queryFn: () => content.getTestimonialsWithType(),
    staleTime: STALE_TIMES.publicPages,
  })
}

export function useVideos() {
  return useQuery({
    queryKey: KEYS.videos,
    queryFn: () => content.getVideos(),
    staleTime: STALE_TIMES.publicPages,
  })
}

export function usePrograms(activeOnly = true) {
  return useQuery({
    queryKey: [...KEYS.programs, activeOnly],
    queryFn: () => getCmsPrograms(activeOnly),
    staleTime: STALE_TIMES.publicPages,
  })
}

export function useImpactStats(activeOnly = true) {
  return useQuery({
    queryKey: [...KEYS.impactStats, activeOnly],
    queryFn: () => getCmsImpactStats(activeOnly),
    staleTime: STALE_TIMES.publicPages,
  })
}
