import { supabase } from '../lib/supabase'
import { ALL_PUBLIC_PAGES } from '../types/cms-pages'
import type { CmsPage, ToggleState } from '../types/cms-pages'
import type { HeroContent, SponsorshipContent, DonationContent, VolunteerContent, PageHeader, SectionContent, SectionVisibility, FooterContent, SeoContent, SiteImage, CmsStringMap, TransparencyContent } from '../types/cms-content'
import type { Page, Student, GalleryItem, News, Testimonial, StudentStory, Faq, ActivityRow, Video } from '../types/database'
import type { LegalPageWithSections } from './legal-pages'
import { getPublishedLegalPageByType } from './legal-pages'
import { getStudents } from './students'
import { getGalleryItems } from './gallery'
import { getNews } from './news'
import { getPublicActivities } from './activities'

export interface CmsPageData {
  page: CmsPage
  hero: HeroContent | null
  pageHeader: PageHeader | null
  sections: Record<string, SectionContent | null>
  pageContent: Page | null
  sponsorship: SponsorshipContent | null
  donation: DonationContent | null
  volunteer: VolunteerContent | null
  transparency: TransparencyContent | null
  footer: FooterContent | null
  seo: SeoContent | null
  images: SiteImage[]
  visibility: Record<string, boolean>
  cmsStrings: CmsStringMap
  students: Student[]
  galleryItems: GalleryItem[]
  news: News[]
  testimonials: Testimonial[]
  studentStories: StudentStory[]
  faqs: Faq[]
  activities: ActivityRow[]
  videos: Video[]
  legalPages: LegalPageWithSections[]
}

export interface CmsDataset {
  pages: CmsPage[]
  pageData: Record<string, CmsPageData>
  toggles: ToggleState
}

function db(table: string) {
  return supabase.from(table as never)
}

export async function fetchCmsDataset(): Promise<CmsDataset> {
  const [pages, visData] = await Promise.all([
    fetchAllCmsPages(),
    fetchSectionVisibility(),
  ])

  const pageData: Record<string, CmsPageData> = {}
  for (const page of pages) {
    pageData[page.id] = await fetchCmsPageData(page)
  }

  const toggles = buildToggleState(pages, visData)

  return { pages, pageData, toggles }
}

export async function fetchAllCmsPages(): Promise<CmsPage[]> {
  const { data: pagesData } = await db('pages')
    .select('slug, title, published, created_at, updated_at')
    .order('created_at')

  const { data: seoData } = await db('seo_content')
    .select('page_slug, meta_title, meta_description')

  const { data: headersData } = await db('page_headers')
    .select('page_slug, is_visible')

  const seoMap = new Map(((seoData as { page_slug: string; meta_title: string; meta_description: string }[]) || []).map(s => [s.page_slug, s]))
  const visMap = new Map(((headersData as { page_slug: string; is_visible: boolean }[]) || []).map(h => [h.page_slug, h.is_visible]))

  return ALL_PUBLIC_PAGES.map(p => {
    const dbPage = ((pagesData as { slug: string; published: boolean; title: string; created_at: string; updated_at: string }[]) || []).find(dp => dp.slug === p.slug)
    const seo = seoMap.get(p.slug)
    const slugVis = visMap.get(p.slug)
    return {
      ...p,
      isPublished: dbPage?.published ?? p.isPublished,
      isVisible: slugVis !== undefined ? slugVis : p.isVisible,
      metaTitle: seo?.meta_title || p.metaTitle,
      metaDescription: seo?.meta_description || p.metaDescription,
      updatedAt: dbPage?.updated_at || p.updatedAt,
    }
  })
}

export async function fetchCmsPageData(page: CmsPage): Promise<CmsPageData> {
  const sectionKeys = page.sections.map(s => s.key)
  const managedPrefixes = [
    'page_header', 'hero', 'about_', 'sponsor_', 'donate_', 'volunteer_',
    'contact_', 'faq_', 'gallery_', 'privacy_', 'terms_', 'students_',
    'news_', 'activity_', 'stories_', 'transparency_', 'campaigns_',
    'impact_', 'team_', 'testimonials_', 'events_',
  ]
  const uniqueSectionKeys = [...new Set(sectionKeys.filter(k =>
    !managedPrefixes.includes(k) && !managedPrefixes.some(p => k.startsWith(p))
  ))]

  const [hero, pageHeader, sponsorship, donation, volunteer, transparency, footerContent, seo, pageContent, sectionContentList, siteImages, cmsStringsData, students, galleryItems, news, testimonials, studentStories, faqs, activities, videos] = await Promise.all([
    fetchHeroContent(),
    fetchPageHeader(page.slug),
    fetchSponsorshipContent(),
    fetchDonationContent(),
    fetchVolunteerContent(),
    fetchTransparencyContent(),
    fetchFooterContent(),
    fetchSeoContent(page.slug),
    fetchPageBySlug(page.slug),
    uniqueSectionKeys.length > 0 ? Promise.all(uniqueSectionKeys.map(k => fetchSectionContent(k))) : Promise.resolve([]),
    fetchSiteImagesBySection(page.slug),
    fetchAllCmsStrings(),
    getStudents(undefined, { limit: 50 }).catch(() => []),
    getGalleryItems({ publishedOnly: true }).catch(() => []),
    getNews().catch(() => []),
    fetchTestimonials(),
    fetchStudentStories(),
    fetchFaqs(),
    getPublicActivities(20).catch(() => []),
    fetchVideos(),
  ])
  const [privacyPage, termsPage] = await Promise.all([
    getPublishedLegalPageByType('privacy_policy').catch(() => null),
    getPublishedLegalPageByType('terms_conditions').catch(() => null),
  ])

  const sections: Record<string, SectionContent | null> = {}
  ;(sectionContentList as (SectionContent | null)[]).forEach(sc => {
    if (sc) sections[sc.section_key] = sc
  })

  return {
    page,
    hero: hero || null,
    pageHeader: pageHeader || null,
    sections,
    pageContent: pageContent || null,
    sponsorship: sponsorship || null,
    donation: donation || null,
    volunteer: volunteer || null,
    transparency: transparency || null,
    footer: footerContent || null,
    seo: seo || null,
    images: siteImages || [],
    visibility: {},
    cmsStrings: cmsStringsData,
    students,
    galleryItems,
    news,
    testimonials,
    studentStories,
    faqs,
    activities,
    videos,
    legalPages: [privacyPage, termsPage].filter(Boolean) as LegalPageWithSections[],
  }
}

function buildToggleState(_pages: CmsPage[], visibility: SectionVisibility[]): ToggleState {
  const sectionVisible: Record<string, boolean> = {}
  visibility.forEach(v => { sectionVisible[v.section_key] = v.is_visible })

  return {
    pageVisible: true,
    sectionVisible,
    ctaEnabled: {},
    featured: {},
    published: true,
    imageVisible: {},
    donationBlocksVisible: true,
    sponsorshipSectionsVisible: true,
    galleryCategoriesEnabled: { all: true },
    testimonialsEnabled: true,
    homepageSectionsEnabled: {},
  }
}

async function fetchHeroContent(): Promise<HeroContent | null> {
  const { data } = await db('hero_content')
    .select('*')
    .eq('is_visible', true)
    .order('display_order')
    .limit(1)
    .maybeSingle()
  return data as HeroContent | null
}

async function fetchPageHeader(slug: string): Promise<PageHeader | null> {
  const { data } = await db('page_headers')
    .select('*')
    .eq('page_slug', slug)
    .maybeSingle()
  return data as PageHeader | null
}

async function fetchSponsorshipContent(): Promise<SponsorshipContent | null> {
  const { data } = await db('sponsorship_content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as SponsorshipContent | null
}

async function fetchDonationContent(): Promise<DonationContent | null> {
  const { data } = await db('donation_content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as DonationContent | null
}

async function fetchVolunteerContent(): Promise<VolunteerContent | null> {
  const { data } = await db('volunteer_content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as VolunteerContent | null
}

async function fetchFooterContent(): Promise<FooterContent | null> {
  const { data } = await db('footer_content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as FooterContent | null
}

async function fetchSeoContent(slug: string): Promise<SeoContent | null> {
  const { data } = await db('seo_content')
    .select('*')
    .eq('page_slug', slug)
    .maybeSingle()
  return data as SeoContent | null
}

async function fetchPageBySlug(slug: string): Promise<Page | null> {
  const { data } = await db('pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  return data as Page | null
}

async function fetchSectionContent(key: string): Promise<SectionContent | null> {
  const { data } = await db('section_content')
    .select('*')
    .eq('section_key', key)
    .maybeSingle()
  return data as SectionContent | null
}

async function fetchSectionVisibility(): Promise<SectionVisibility[]> {
  const { data } = await db('section_visibility')
    .select('*')
    .order('sort_order')
  return (data || []) as SectionVisibility[]
}

async function fetchSiteImagesBySection(section: string): Promise<SiteImage[]> {
  const { data } = await db('site_images')
    .select('*')
    .eq('section', section)
  return (data || []) as SiteImage[]
}

async function fetchTransparencyContent(): Promise<TransparencyContent | null> {
  const { data } = await db('transparency_content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as TransparencyContent | null
}

async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data } = await supabase.from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true })
  return (data || []) as Testimonial[]
}

async function fetchStudentStories(): Promise<StudentStory[]> {
  const { data } = await supabase.from('student_stories')
    .select('*')
    .order('created_at', { ascending: false })
  return (data || []) as StudentStory[]
}

async function fetchFaqs(): Promise<Faq[]> {
  const { data } = await supabase.from('faqs')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
  return (data || []) as Faq[]
}

async function fetchVideos(): Promise<Video[]> {
  const { data } = await supabase.from('videos')
    .select('*')
    .order('created_at', { ascending: false })
  return (data || []) as Video[]
}

async function fetchAllCmsStrings(): Promise<CmsStringMap> {
  const { data } = await db('cms_strings')
    .select('key, value')
  const map: CmsStringMap = {}
  ;((data as { key: string; value: string }[]) || []).forEach(r => { map[r.key] = r.value })
  return map
}

export async function updatePageVisibility(pageSlug: string, isVisible: boolean): Promise<void> {
  const { data: existing } = await db('page_headers')
    .select('id')
    .eq('page_slug', pageSlug)
    .maybeSingle()
  if (existing) {
    await db('page_headers')
      .update({ is_visible: isVisible, updated_at: new Date().toISOString() } as never)
      .eq('id', (existing as { id: string }).id)
  } else {
    await db('page_headers')
      .insert({ page_slug: pageSlug, title: '', subtitle: '', is_visible: isVisible } as never)
  }
}

export async function updateSectionVisibilityByKey(key: string, isVisible: boolean): Promise<void> {
  const { data: existing } = await db('section_visibility')
    .select('id')
    .eq('section_key', key)
    .maybeSingle()
  if (existing) {
    await db('section_visibility')
      .update({ is_visible: isVisible, updated_at: new Date().toISOString() } as never)
      .eq('id', (existing as { id: string }).id)
  } else {
    await db('section_visibility')
      .insert({ section_key: key, section_name: key, is_visible: isVisible, sort_order: 0 } as never)
  }
}

export async function updatePagePublishStatus(slug: string, published: boolean): Promise<void> {
  const { data: existing } = await db('pages')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (existing) {
    await db('pages')
      .update({ published, updated_at: new Date().toISOString() } as never)
      .eq('id', (existing as { id: string }).id)
  }
}

export async function updatePageSeo(slug: string, metaTitle: string, metaDescription: string): Promise<void> {
  const { data: existing } = await db('seo_content')
    .select('id')
    .eq('page_slug', slug)
    .maybeSingle()
  if (existing) {
    await db('seo_content')
      .update({ meta_title: metaTitle, meta_description: metaDescription, is_published: true, updated_at: new Date().toISOString() } as never)
      .eq('id', (existing as { id: string }).id)
  } else {
    await db('seo_content')
      .insert({ page_slug: slug, meta_title: metaTitle, meta_description: metaDescription, is_published: true } as never)
  }
}
