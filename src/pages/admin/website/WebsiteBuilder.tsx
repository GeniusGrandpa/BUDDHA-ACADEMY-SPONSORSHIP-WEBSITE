import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  getHeroContent, getSectionContent, getSponsorshipContent, getDonationContent,
  getVolunteerContent, getPageHeader, getSiteImagesBySection, upsertHeroContent,
  upsertSectionContent, upsertSponsorshipContent, upsertDonationContent,
  upsertPageHeader, upsertVolunteerContent,
  getSectionVisibility, updateSectionVisibility,
} from '../../../services/cms-content'
import { getPageBySlug, upsertPage } from '../../../services/content'
import { getSiteSettings } from '../../../services/settings'
import { FormSkeleton } from '../../../components/ui/LoadingSkeleton'
import { ImagePicker } from '../../../components/ui/ImagePicker'
import type { HeroContent, SponsorshipContent, DonationContent, VolunteerContent, PageHeader, SiteImage, SectionContent } from '../../../types/cms-content'
import type { Page } from '../../../types/database'

type DeviceType = 'desktop' | 'tablet' | 'mobile'

interface SectionDef {
  id: string; key: string; name: string; visible: boolean
}

interface PageDef {
  id: string; name: string; slug: string; sections: SectionDef[]
}

interface ThemeColors {
  primary: string; secondary: string; accent: string; background: string; text: string
}

interface ThemeConfig {
  colors: ThemeColors; fontHeading: string; fontBody: string; buttonRadius: number; buttonStyle: 'filled' | 'outline' | 'soft'
}

const defaultTheme: ThemeConfig = {
  colors: { primary: '#f59e0b', secondary: '#d97706', accent: '#fef3c7', background: '#FFF8F0', text: '#111827' },
  fontHeading: 'Inter, sans-serif', fontBody: 'Inter, sans-serif', buttonRadius: 8, buttonStyle: 'filled',
}

const pageDefs: PageDef[] = [
  { id: 'home', name: 'Home', slug: '/', sections: [
    { id: 'hero', key: 'hero', name: 'Hero Banner', visible: true },
    { id: 'welcome', key: 'welcome', name: 'Welcome Section', visible: true },
    { id: 'about_preview', key: 'about_preview', name: 'About Preview', visible: true },
    { id: 'stats', key: 'stats', name: 'Statistics Bar', visible: true },
    { id: 'featured_students', key: 'featured_students', name: 'Featured Students', visible: true },
    { id: 'sponsorship_steps', key: 'sponsorship_steps', name: 'Sponsorship Steps', visible: true },
    { id: 'testimonials', key: 'testimonials', name: 'Testimonials', visible: true },
    { id: 'donation_cta', key: 'donation_cta', name: 'Donation CTA', visible: true },
  ]},
  { id: 'about', name: 'About Us', slug: '/about', sections: [
    { id: 'about_header', key: 'page_header', name: 'Page Header', visible: true },
    { id: 'about_mission', key: 'page_content', name: 'Mission & Vision', visible: true },
    { id: 'about_stats', key: 'page_stats', name: 'Statistics', visible: true },
    { id: 'about_values', key: 'page_values', name: 'Core Values', visible: true },
    { id: 'about_timeline', key: 'page_timeline', name: 'Timeline', visible: true },
  ]},
  { id: 'sponsorship', name: 'Sponsorship', slug: '/sponsor', sections: [
    { id: 'sponsor_hero', key: 'sponsor_hero', name: 'Hero', visible: true },
    { id: 'sponsor_steps', key: 'sponsor_steps', name: 'How It Works', visible: true },
    { id: 'sponsor_benefits', key: 'sponsor_benefits', name: 'Benefits', visible: true },
    { id: 'sponsor_cta', key: 'sponsor_cta', name: 'Call to Action', visible: true },
  ]},
  { id: 'donations', name: 'Donations', slug: '/donate', sections: [
    { id: 'donate_hero', key: 'donate_hero', name: 'Hero', visible: true },
    { id: 'donate_impact', key: 'donate_impact', name: 'Impact Cards', visible: true },
    { id: 'donate_process', key: 'donate_process', name: 'How It Works', visible: true },
  ]},
  { id: 'contact', name: 'Contact', slug: '/contact', sections: [
    { id: 'contact_header', key: 'page_header', name: 'Page Header', visible: true },
    { id: 'contact_details', key: 'contact_details', name: 'Contact Details', visible: true },
    { id: 'contact_form', key: 'contact_form', name: 'Contact Form', visible: true },
  ]},
  { id: 'gallery', name: 'Gallery', slug: '/gallery', sections: [
    { id: 'gallery_header', key: 'page_header', name: 'Page Header', visible: true },
    { id: 'gallery_grid', key: 'gallery_grid', name: 'Gallery Grid', visible: true },
  ]},
  { id: 'faq', name: 'FAQ', slug: '/faq', sections: [
    { id: 'faq_header', key: 'page_header', name: 'Page Header', visible: true },
    { id: 'faq_list', key: 'faq_list', name: 'FAQ List', visible: true },
  ]},
  { id: 'volunteer', name: 'Volunteer', slug: '/volunteer', sections: [
    { id: 'volunteer_hero', key: 'volunteer_hero', name: 'Hero', visible: true },
    { id: 'volunteer_opps', key: 'volunteer_opps', name: 'Opportunities', visible: true },
    { id: 'volunteer_form', key: 'volunteer_form', name: 'Application Form', visible: true },
  ]},
  { id: 'privacy', name: 'Privacy', slug: '/privacy', sections: [
    { id: 'privacy_header', key: 'page_header', name: 'Page Header', visible: true },
    { id: 'privacy_content', key: 'page_content', name: 'Content', visible: true },
  ]},
  { id: 'terms', name: 'Terms', slug: '/terms', sections: [
    { id: 'terms_header', key: 'page_header', name: 'Page Header', visible: true },
    { id: 'terms_content', key: 'page_content', name: 'Content', visible: true },
  ]},
]

const deviceWidths: Record<DeviceType, string> = { desktop: '100%', tablet: '768px', mobile: '375px' }

const availableSections = [
  { id: 'hero', name: 'Hero', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'about_preview', name: 'About Preview', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'stats', name: 'Statistics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'testimonials', name: 'Testimonials', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { id: 'donation_cta', name: 'Donation CTA', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'gallery', name: 'Gallery', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'sponsorship_steps', name: 'Sponsorship Steps', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'team', name: 'Team Members', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
]

export function WebsiteBuilder() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activePage, setActivePage] = useState('home')
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [hasChanges, setHasChanges] = useState(false)
  const [showAddSection, setShowAddSection] = useState(false)
  const [pages, setPages] = useState<PageDef[]>(pageDefs)
  const [showThemePanel, setShowThemePanel] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const [hero, setHero] = useState<HeroContent | null>(null)
  const [welcome, setWelcome] = useState<SectionContent | null>(null)
  const [aboutPreview, setAboutPreview] = useState<SectionContent | null>(null)
  const [stats, setStats] = useState<SectionContent | null>(null)
  const [featuredStudents, setFeaturedStudents] = useState<SectionContent | null>(null)
  const [sponsorshipSteps, setSponsorshipSteps] = useState<SectionContent | null>(null)
  const [testimonials, setTestimonials] = useState<SectionContent | null>(null)
  const [donationCta, setDonationCta] = useState<SectionContent | null>(null)

  const [aboutHeader, setAboutHeader] = useState<PageHeader | null>(null)
  const [aboutPage, setAboutPage] = useState<Page | null>(null)
  const [aboutImages, setAboutImages] = useState<SiteImage[]>([])

  const [sponsorship, setSponsorship] = useState<SponsorshipContent | null>(null)

  const [donation, setDonation] = useState<DonationContent | null>(null)

  const [contactHeader, setContactHeader] = useState<PageHeader | null>(null)
  const [contactSettings, setContactSettings] = useState<Record<string, string>>({})

  const [faqHeader, setFaqHeader] = useState<PageHeader | null>(null)

  const [galleryHeader, setGalleryHeader] = useState<PageHeader | null>(null)

  const [volunteer, setVolunteer] = useState<VolunteerContent | null>(null)
  const [volunteerHeader, setVolunteerHeader] = useState<PageHeader | null>(null)

  const [privacyHeader, setPrivacyHeader] = useState<PageHeader | null>(null)
  const [privacyPage, setPrivacyPage] = useState<Page | null>(null)
  const [termsHeader, setTermsHeader] = useState<PageHeader | null>(null)
  const [termsPage, setTermsPage] = useState<Page | null>(null)

  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>({})

  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme)

  const markChanged = () => setHasChanges(true)

  const addSection = (sectionId: string, sectionKey: string, sectionName: string) => {
    const newId = `${sectionId}_${Date.now()}`
    const newSec: SectionDef = { id: newId, key: sectionKey, name: sectionName, visible: true }
    setPages(prev => prev.map(p => p.id === activePage ? { ...p, sections: [...p.sections, newSec] } : p))
    setShowAddSection(false)
    setSelectedSection(newId)
    setHasChanges(true)
  }

  const toggleSectionVisibility = async (sectionKey: string) => {
    const current = visibilityMap[sectionKey] !== false
    const newVal = !current
    setVisibilityMap(prev => ({ ...prev, [sectionKey]: newVal }))
    try {
      await updateSectionVisibility(sectionKey, newVal)
      setHasChanges(true)
    } catch {
      setVisibilityMap(prev => ({ ...prev, [sectionKey]: current }))
      toast.error('Failed to update visibility')
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [
        heroData, welcomeData, aboutPrevData, statsData, featuredData, sponsorStepData,
        testimonialData, ctaData, aboutHdr, aboutPg, aboutImgs, sponsorData,
        donateData, contactHdr, contactSet, faqHdr, galleryHdr, volData, volHdr,
        privacyHdr, privacyPg, termsHdr, termsPg,
      ] = await Promise.all([
        getHeroContent(),
        getSectionContent('welcome'),
        getSectionContent('about_preview'),
        getSectionContent('stats'),
        getSectionContent('featured_students'),
        getSectionContent('sponsorship_steps'),
        getSectionContent('testimonials'),
        getSectionContent('donation_cta'),
        getPageHeader('about'),
        getPageBySlug('about'),
        getSiteImagesBySection('about'),
        getSponsorshipContent(),
        getDonationContent(),
        getPageHeader('contact'),
        getSiteSettings(),
        getPageHeader('faq'),
        getPageHeader('gallery'),
        getVolunteerContent(),
        getPageHeader('volunteer'),
        getPageHeader('privacy'),
        getPageBySlug('privacy'),
        getPageHeader('terms'),
        getPageBySlug('terms'),
      ])
      if (heroData) setHero(heroData)
      if (welcomeData) setWelcome(welcomeData)
      if (aboutPrevData) setAboutPreview(aboutPrevData)
      if (statsData) setStats(statsData)
      if (featuredData) setFeaturedStudents(featuredData)
      if (sponsorStepData) setSponsorshipSteps(sponsorStepData)
      if (testimonialData) setTestimonials(testimonialData)
      if (ctaData) setDonationCta(ctaData)
      if (aboutHdr) setAboutHeader(aboutHdr)
      if (aboutPg) setAboutPage(aboutPg)
      if (aboutImgs) setAboutImages(aboutImgs)
      if (sponsorData) setSponsorship(sponsorData)
      if (donateData) setDonation(donateData)
      if (contactHdr) setContactHeader(contactHdr)
      if (contactSet) setContactSettings(contactSet as unknown as Record<string, string>)
      if (faqHdr) setFaqHeader(faqHdr)
      if (galleryHdr) setGalleryHeader(galleryHdr)
      if (volData) setVolunteer(volData)
      if (volHdr) setVolunteerHeader(volHdr)
      if (privacyHdr) setPrivacyHeader(privacyHdr)
      if (privacyPg) setPrivacyPage(privacyPg)
      if (termsHdr) setTermsHeader(termsHdr)
      if (termsPg) setTermsPage(termsPg)

      const visData = await getSectionVisibility()
      const visMap: Record<string, boolean> = {}
      visData.forEach(v => { visMap[v.section_key] = v.is_visible })
      setVisibilityMap(visMap)
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

  const currentPage = pages.find(p => p.id === activePage)

  const handleSave = async () => {
    setSaving(true)
    try {
      const ops: Promise<void>[] = []
      if (hero) ops.push(upsertHeroContent(hero as never))
      if (welcome) ops.push(upsertSectionContent(welcome as never))
      if (aboutPreview) ops.push(upsertSectionContent(aboutPreview as never))
      if (stats) ops.push(upsertSectionContent(stats as never))
      if (featuredStudents) ops.push(upsertSectionContent(featuredStudents as never))
      if (sponsorshipSteps) ops.push(upsertSectionContent(sponsorshipSteps as never))
      if (testimonials) ops.push(upsertSectionContent(testimonials as never))
      if (donationCta) ops.push(upsertSectionContent(donationCta as never))
      if (aboutHeader) ops.push(upsertPageHeader(aboutHeader as never))
      if (aboutPage) ops.push(upsertPage({ slug: aboutPage.slug, title: aboutPage.title, content: aboutPage.content as Record<string, unknown>, published: aboutPage.published }) as never)
      if (sponsorship) ops.push(upsertSponsorshipContent(sponsorship as never))
      if (donation) ops.push(upsertDonationContent(donation as never))
      if (volunteer) ops.push(upsertVolunteerContent(volunteer as never))
      if (privacyHeader) ops.push(upsertPageHeader(privacyHeader as never))
      if (privacyPage) ops.push(upsertPage({ slug: 'privacy', title: 'Privacy Policy', content: privacyPage.content as Record<string, unknown>, published: true }) as never)
      if (termsHeader) ops.push(upsertPageHeader(termsHeader as never))
      if (termsPage) ops.push(upsertPage({ slug: 'terms', title: 'Terms of Service', content: termsPage.content as Record<string, unknown>, published: true }) as never)
      await Promise.all(ops)
      toast.success('All changes published')
      setHasChanges(false)
    } catch { toast.error('Failed to publish changes') }
    finally { setSaving(false) }
  }

  if (loading) return <FormSkeleton fields={8} />

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col" style={{ backgroundColor: 'var(--theme-bg, #FFF8F0)', ...themeVars }}>
      {}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b shrink-0" style={{ borderColor: theme.colors.accent }}>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold" style={{ color: theme.colors.text }}>Website Builder</h1>
          {hasChanges && (
            <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border"
              style={{ color: theme.colors.primary, backgroundColor: theme.colors.accent, borderColor: `${theme.colors.primary}40` }}>
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
        {}
        <div className="w-64 bg-white border-r overflow-y-auto shrink-0" style={{ borderColor: theme.colors.accent }}>
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
                  <span className="text-[10px] text-gray-400">{currentPage.sections.filter(s => visibilityMap[s.key] !== false).length}/{currentPage.sections.length} visible</span>
                </div>
                <div className="space-y-0.5">
                  {currentPage.sections.map((sec) => {
                    const isVisible = visibilityMap[sec.key] !== false
                    const isSelected = selectedSection === sec.id
                    return (
                      <div key={sec.id} className="flex items-center gap-1 group">
                        <button onClick={() => { setSelectedSection(sec.id); setShowAddSection(false) }}
                          className={`flex-1 text-left px-2 py-1.5 rounded text-xs transition-colors truncate ${
                            isSelected ? 'text-white' : isVisible ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 italic'
                          }`}
                          style={isSelected ? { backgroundColor: theme.colors.primary } : {}}>
                          <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5`}
                            style={{ backgroundColor: isSelected ? 'white' : (isVisible ? theme.colors.primary : '#d1d5db') }} />
                          {sec.name}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(sec.key) }}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={isVisible ? 'Hide section' : 'Show section'}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {isVisible ? (
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            )}
                          </svg>
                        </button>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.accent }}>
                  {showAddSection ? (
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-gray-400 mb-2">Add section to page</p>
                      <div className="grid grid-cols-2 gap-1">
                        {availableSections.map(as => (
                          <button key={as.id}
                            onClick={() => addSection(as.id, as.id, as.name)}
                            className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={as.icon} />
                            </svg>
                            {as.name}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setShowAddSection(false)}
                        className="w-full text-center text-[10px] text-gray-400 hover:text-gray-600 mt-1">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddSection(true)}
                      className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Section
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {}
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
              {currentPage?.sections.map((sec) => {
                const isVisible = visibilityMap[sec.key] !== false
                return (
                  <div key={sec.id} className="relative">
                    <SectionPreview
                      id={sec.id}
                      selected={selectedSection === sec.id}
                      onClick={() => { setSelectedSection(sec.id); setShowAddSection(false) }}
                      label={sec.name}
                      sectionRef={el => sectionRefs.current[sec.id] = el}>
                      {renderSectionPreview(sec.id, {
                        hero, welcome, aboutPreview, stats, featuredStudents, sponsorshipSteps,
                        testimonials, donationCta, aboutHeader, aboutPage, aboutImages,
                        sponsorship, donation, contactHeader, contactSettings,
                        faqHeader, galleryHeader, volunteer, volunteerHeader,
                        privacyHeader, privacyPage, termsHeader, termsPage,
                        theme, selectedSection,
                        onEdit: {
                          setHero, setWelcome, setAboutPreview, setStats, setFeaturedStudents,
                          setSponsorshipSteps, setTestimonials, setDonationCta, setAboutHeader,
                          setAboutPage, setSponsorship, setDonation, setVolunteer, markChanged,
                        }
                      })}
                    </SectionPreview>
                    {!isVisible && (
                      <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center z-20 rounded-lg cursor-pointer"
                        onClick={() => toggleSectionVisibility(sec.key)}>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg border border-gray-200">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                          <span className="text-sm text-gray-500 font-medium">{sec.name} — Hidden</span>
                          <span className="text-xs text-amber-600 font-medium">Click to show</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {currentPage?.sections.filter(s => visibilityMap[s.key] !== false).length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <p>All sections are hidden</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {}
        <div className="w-80 bg-white border-l overflow-y-auto shrink-0" style={{ borderColor: theme.colors.accent }}>
          {showThemePanel ? (
            <ThemePanel theme={theme} setTheme={setTheme} onClose={() => setShowThemePanel(false)} />
          ) : selectedSection ? (
            <PropertiesPanel
              selectedSection={selectedSection}
              currentPage={currentPage}
              hero={hero} setHero={setHero}
              welcome={welcome} setWelcome={setWelcome}
              aboutPreview={aboutPreview} setAboutPreview={setAboutPreview}
              stats={stats} setStats={setStats}
              featuredStudents={featuredStudents} setFeaturedStudents={setFeaturedStudents}
              sponsorshipSteps={sponsorshipSteps} setSponsorshipSteps={setSponsorshipSteps}
              testimonials={testimonials} setTestimonials={setTestimonials}
              donationCta={donationCta} setDonationCta={setDonationCta}
              aboutHeader={aboutHeader} setAboutHeader={setAboutHeader}
              aboutPage={aboutPage} setAboutPage={setAboutPage}
              sponsorship={sponsorship} setSponsorship={setSponsorship}
              donation={donation} setDonation={setDonation}
              contactHeader={contactHeader}
              contactSettings={contactSettings}
              volunteer={volunteer} setVolunteer={setVolunteer}
              privacyHeader={privacyHeader} setPrivacyHeader={setPrivacyHeader}
              privacyPage={privacyPage} setPrivacyPage={setPrivacyPage}
              termsHeader={termsHeader} setTermsHeader={setTermsHeader}
              termsPage={termsPage} setTermsPage={setTermsPage}
              theme={theme} markChanged={markChanged}
            />
          ) : (
            <NoSelectionState theme={theme} onOpenTheme={() => setShowThemePanel(true)} />
          )}
        </div>
      </div>
    </div>
  )
}

function renderSectionPreview(id: string, data: {
  hero: HeroContent | null; welcome: SectionContent | null; aboutPreview: SectionContent | null
  stats: SectionContent | null; featuredStudents: SectionContent | null
  sponsorshipSteps: SectionContent | null; testimonials: SectionContent | null
  donationCta: SectionContent | null
  aboutHeader: PageHeader | null; aboutPage: Page | null; aboutImages: SiteImage[]
  sponsorship: SponsorshipContent | null; donation: DonationContent | null
  contactHeader: PageHeader | null; contactSettings: Record<string, string>
  faqHeader: PageHeader | null; galleryHeader: PageHeader | null
  volunteer: VolunteerContent | null; volunteerHeader: PageHeader | null
  privacyHeader: PageHeader | null; privacyPage: Page | null; termsHeader: PageHeader | null; termsPage: Page | null
  theme: ThemeConfig; selectedSection: string | null

  onEdit: Record<string, (...args: any[]) => void> // eslint-disable-line @typescript-eslint/no-explicit-any
}) {
  const t = data.theme
  const sel = (s: string) => data.selectedSection === s

  const update = (field: string) => (v: string) => { data.onEdit[field]?.(v) }

  const PageHeaderPreview = (h: PageHeader | null, key: string) => (
    <div className="px-8 py-16 text-center" style={{ background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})` }}>
      <InlineEdit value={h?.title || ''} live={sel(key)}
        onSave={update('headerTitle')}
        className="text-3xl md:text-4xl font-bold text-white"
        style={{ fontFamily: t.fontHeading }} />
      <InlineEdit value={h?.subtitle || ''} live={sel(key)}
        onSave={update('headerSubtitle')}
        className="mt-3 text-white/80 max-w-xl mx-auto block" />
    </div>
  )

  switch (id) {

    case 'hero':
      return (
        <div className="relative px-8 py-16 md:py-24 text-white overflow-hidden" style={{ backgroundColor: t.colors.secondary }}>
          {data.hero?.background_image && (
            <img
              src={data.hero.background_image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="relative max-w-7xl mx-auto">
            <div className={`max-w-3xl ${data.hero?.layout === 'center' ? 'mx-auto text-center' : ''}`}>
              <InlineEdit value={data.hero?.title || ''} live={sel('hero')}
                onSave={v => data.onEdit.setHero?.(data.hero ? { ...data.hero, title: v } : { id: '', title: v, highlight: '', description: '', background_image: '', overlay_color: '', overlay_opacity: 0, cta_primary_text: '', cta_primary_link: '', cta_secondary_text: '', cta_secondary_link: '', statistics: [], badges: [], layout: '', display_order: 0, is_visible: true, animation_enabled: false, updated_by: null, created_at: '', updated_at: '' })}
                className="text-4xl md:text-5xl font-bold leading-tight"
                style={{ fontFamily: t.fontHeading }} />
              <InlineEdit value={data.hero?.highlight || ''} live={sel('hero')}
                onSave={v => data.onEdit.setHero?.(data.hero ? { ...data.hero, highlight: v } : null)}
                className="inline-block mt-2 text-lg font-semibold"
                style={{ color: t.colors.accent }} />
              <InlineEdit value={data.hero?.description || ''} live={sel('hero')}
                onSave={v => data.onEdit.setHero?.(data.hero ? { ...data.hero, description: v } : null)}
                className="mt-4 text-lg text-white/80 max-w-2xl block" />
              <div className="flex flex-wrap gap-3 mt-6">
                {(data.hero?.cta_primary_text || sel('hero')) && (
                  <InlineEdit value={data.hero?.cta_primary_text || ''} live={sel('hero')}
                    onSave={v => data.onEdit.setHero?.(data.hero ? { ...data.hero, cta_primary_text: v } : null)}
                    className="px-6 py-3 font-semibold text-sm inline-block"
                    style={{ backgroundColor: 'white', color: t.colors.primary, borderRadius: `${t.buttonRadius}px` }} />
                )}
                {(data.hero?.cta_secondary_text || sel('hero')) && (
                  <InlineEdit value={data.hero?.cta_secondary_text || ''} live={sel('hero')}
                    onSave={v => data.onEdit.setHero?.(data.hero ? { ...data.hero, cta_secondary_text: v } : null)}
                    className="px-6 py-3 font-semibold text-sm border-2 border-white/50 text-white inline-block"
                    style={{ borderRadius: `${t.buttonRadius}px` }} />
                )}
              </div>
              {data.hero?.statistics && data.hero.statistics.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/20">
                  {data.hero.statistics.map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl font-bold">{s.value}</div>
                      <div className="text-sm text-white/70">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )

    case 'welcome': {
      const c = data.welcome?.content as { title?: string; content?: string } | undefined
      return (
        <div className="px-8 py-12 text-center max-w-3xl mx-auto">
          <InlineEdit value={c?.title || ''} live={sel('welcome')}
            onSave={v => data.onEdit.setWelcome?.(data.welcome ? { ...data.welcome, content: { ...data.welcome.content, title: v } } : null)}
            className="text-3xl font-bold"
            style={{ color: t.colors.text, fontFamily: t.fontHeading }} />
          <InlineEdit value={c?.content || ''} live={sel('welcome')}
            onSave={v => data.onEdit.setWelcome?.(data.welcome ? { ...data.welcome, content: { ...data.welcome.content, content: v } } : null)}
            className="mt-4 leading-relaxed text-gray-600 block" />
        </div>
      )
    }

    case 'about_preview': {
      const c = data.aboutPreview?.content as { title?: string; description?: string; milestones?: Array<{ year: string; text: string }> } | undefined
      return (
        <div className="px-8 py-12">
          <InlineEdit value={c?.title || ''} live={sel('about_preview')}
            onSave={v => data.onEdit.setAboutPreview?.(data.aboutPreview ? { ...data.aboutPreview, content: { ...data.aboutPreview.content, title: v } } : null)}
            className="text-2xl font-bold text-center mb-4"
            style={{ color: t.colors.text, fontFamily: t.fontHeading }} />
          <InlineEdit value={c?.description || ''} live={sel('about_preview')}
            onSave={v => data.onEdit.setAboutPreview?.(data.aboutPreview ? { ...data.aboutPreview, content: { ...data.aboutPreview.content, description: v } } : null)}
            className="text-gray-600 text-center max-w-2xl mx-auto block" />
          {c?.milestones && c.milestones.length > 0 && (
            <div className="mt-8 space-y-4 max-w-xl mx-auto">
              {c.milestones.map((m, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="font-bold text-sm whitespace-nowrap" style={{ color: t.colors.primary }}>{m.year}</span>
                  <span className="text-gray-600 text-sm">{m.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    case 'stats': {
      const c = data.stats?.content as { title?: string } | undefined
      return (
        <div className="px-8 py-12" style={{ backgroundColor: t.colors.accent }}>
          <InlineEdit value={c?.title || ''} live={sel('stats')}
            onSave={v => data.onEdit.setStats?.(data.stats ? { ...data.stats, content: { ...data.stats.content, title: v } } : null)}
            className="text-2xl font-bold text-center mb-6 block"
            style={{ color: t.colors.text, fontFamily: t.fontHeading }} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {data.hero?.statistics && data.hero.statistics.length > 0 ? data.hero.statistics.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold" style={{ color: t.colors.primary }}>{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            )) : (
              <>
                {[{ value: '49+', label: 'Years' }, { value: '2000+', label: 'Students' }, { value: '100%', label: 'Free' }, { value: '12+', label: 'Countries' }].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-bold text-gray-300">{s.value}</div>
                    <div className="text-sm text-gray-300 mt-1">{s.label}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )
    }

    case 'featured_students': {
      const c = data.featuredStudents?.content as { title?: string } | undefined
      return (
        <div className="px-8 py-12">
          <InlineEdit value={c?.title || ''} live={sel('featured_students')}
            onSave={v => data.onEdit.setFeaturedStudents?.(data.featuredStudents ? { ...data.featuredStudents, content: { ...data.featuredStudents.content, title: v } } : null)}
            className="text-2xl font-bold text-center mb-8 block"
            style={{ color: t.colors.text, fontFamily: t.fontHeading }} />
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl p-6 text-center border border-gray-100"
                style={{ backgroundColor: t.colors.background }}>
                <div className="w-20 h-20 mx-auto rounded-full mb-4" style={{ backgroundColor: t.colors.accent }}>
                  <div className="flex items-center justify-center h-full text-2xl" style={{ color: t.colors.primary }}>👤</div>
                </div>
                <div className="text-sm font-medium text-gray-700">Student Name</div>
                <div className="text-xs text-gray-400 mt-1">Grade • Age</div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'sponsorship_steps': {
      const c = data.sponsorshipSteps?.content as { title?: string; description?: string; steps?: Array<{ title: string; desc: string }> } | undefined
      return (
        <div className="px-8 py-12" style={{ backgroundColor: t.colors.background }}>
          <InlineEdit value={c?.title || ''} live={sel('sponsorship_steps')}
            onSave={v => data.onEdit.setSponsorshipSteps?.(data.sponsorshipSteps ? { ...data.sponsorshipSteps, content: { ...data.sponsorshipSteps.content, title: v } } : null)}
            className="text-2xl font-bold text-center mb-2 block"
            style={{ color: t.colors.text, fontFamily: t.fontHeading }} />
          <InlineEdit value={c?.description || ''} live={sel('sponsorship_steps')}
            onSave={v => data.onEdit.setSponsorshipSteps?.(data.sponsorshipSteps ? { ...data.sponsorshipSteps, content: { ...data.sponsorshipSteps.content, description: v } } : null)}
            className="text-gray-500 text-center max-w-xl mx-auto block" />
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {(c?.steps?.length ? c.steps : [
              { title: 'Choose', desc: 'Select a student to sponsor' },
              { title: 'Contribute', desc: 'Set up your monthly donation' },
              { title: 'Connect', desc: 'Exchange letters and updates' },
            ]).map((step, i) => (
              <div key={i} className="text-center p-4 rounded-xl border" style={{ borderColor: t.colors.accent }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-sm"
                  style={{ backgroundColor: t.colors.primary, color: 'white' }}>{i + 1}</div>
                <div className="font-semibold text-sm text-gray-800">{step.title}</div>
                <div className="text-xs text-gray-500 mt-1">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'testimonials': {
      const c = data.testimonials?.content as { title?: string } | undefined
      return (
        <div className="px-8 py-12 bg-gray-50">
          <InlineEdit value={c?.title || ''} live={sel('testimonials')}
            onSave={v => data.onEdit.setTestimonials?.(data.testimonials ? { ...data.testimonials, content: { ...data.testimonials.content, title: v } } : null)}
            className="text-2xl font-bold text-center mb-8 block"
            style={{ color: t.colors.text, fontFamily: t.fontHeading }} />
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full" style={{ backgroundColor: t.colors.accent }} />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Supporter</div>
                    <div className="text-xs text-gray-400">Donor</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">"Your support makes a real difference in these children's lives."</p>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'donation_cta': {
      const c = data.donationCta?.content as { title?: string; description?: string; button_text?: string; button_link?: string } | undefined
      return (
        <div className="px-8 py-16 text-center" style={{ background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})` }}>
          <InlineEdit value={c?.title || ''} live={sel('donation_cta')}
            onSave={v => data.onEdit.setDonationCta?.(data.donationCta ? { ...data.donationCta, content: { ...data.donationCta.content, title: v } } : null)}
            className="text-3xl font-bold text-white block"
            style={{ fontFamily: t.fontHeading }} />
          <InlineEdit value={c?.description || ''} live={sel('donation_cta')}
            onSave={v => data.onEdit.setDonationCta?.(data.donationCta ? { ...data.donationCta, content: { ...data.donationCta.content, description: v } } : null)}
            className="mt-3 text-white/80 max-w-xl mx-auto block" />
          <InlineEdit value={c?.button_text || ''} live={sel('donation_cta')}
            onSave={v => data.onEdit.setDonationCta?.(data.donationCta ? { ...data.donationCta, content: { ...data.donationCta.content, button_text: v } } : null)}
            className="inline-block mt-6 px-8 py-3 font-semibold"
            style={{ backgroundColor: 'white', color: t.colors.primary, borderRadius: `${t.buttonRadius}px` }} />
        </div>
      )
    }

    case 'about_header':
      return PageHeaderPreview(data.aboutHeader, 'about_header')
    case 'about_mission': {
      const c = data.aboutPage?.content as Record<string, unknown> | undefined
      return (
        <div className="px-8 py-12 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold" style={{ color: t.colors.text, fontFamily: t.fontHeading }}>Mission</h3>
              <p className="mt-2 text-gray-600 text-sm">{(c?.mission as string) || 'Our mission is to provide education and sponsorship opportunities for underprivileged children.'}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: t.colors.text, fontFamily: t.fontHeading }}>Vision</h3>
              <p className="mt-2 text-gray-600 text-sm">{(c?.vision as string) || 'A world where every child has access to quality education.'}</p>
            </div>
          </div>
          {data.aboutImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {data.aboutImages.slice(0, 4).map((img, i) => (
                <img key={img.id || i} src={img.image_url} alt={img.alt_text || ''} className="w-full h-32 object-cover rounded-lg" />
              ))}
            </div>
          )}
        </div>
      )
    }
    case 'about_stats': {
      const c = data.aboutPage?.content as Record<string, unknown> | undefined
      const stats = c?.stats as Array<{ value: string; label: string }> | undefined
      return (
        <div className="px-8 py-12" style={{ backgroundColor: t.colors.accent }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {(stats || [{ value: '49+', label: 'Years' }, { value: '2000+', label: 'Students' }, { value: '100%', label: 'Free' }, { value: '12+', label: 'Countries' }]).map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold" style={{ color: t.colors.primary }}>{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    case 'about_values': {
      const c = data.aboutPage?.content as Record<string, unknown> | undefined
      const values = c?.values as Array<{ title: string; description: string }> | undefined
      return (
        <div className="px-8 py-12 max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8" style={{ color: t.colors.text, fontFamily: t.fontHeading }}>Core Values</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(values || [
              { title: 'Compassion', description: 'Showing kindness and understanding' },
              { title: 'Integrity', description: 'Transparent and honest operations' },
              { title: 'Excellence', description: 'Striving for the highest quality' },
              { title: 'Community', description: 'Building strong relationships' },
            ]).map((v, i) => (
              <div key={i} className="p-5 rounded-xl border text-center" style={{ borderColor: t.colors.accent }}>
                <div className="text-lg font-bold" style={{ color: t.colors.primary }}>{v.title}</div>
                <p className="text-xs text-gray-500 mt-2">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }
    case 'about_timeline': {
      const c = data.aboutPage?.content as Record<string, unknown> | undefined
      const timeline = c?.timeline as Array<{ year: string; title: string; description?: string }> | undefined
      return (
        <div className="px-8 py-12 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8" style={{ color: t.colors.text, fontFamily: t.fontHeading }}>Our Journey</h3>
          {(timeline || [
            { year: '1975', title: 'Founded', description: 'Buddha Academy was established' },
            { year: '1990', title: 'Expanded', description: 'Reached 500+ students' },
            { year: '2000', title: 'Global', description: 'International sponsorships began' },
            { year: '2024', title: 'Today', description: 'Serving 2000+ students' },
          ]).map((item, i) => (
            <div key={i} className="flex gap-4 mb-6">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.primary }} />
                {i < ((timeline?.length || 4) - 1) && <div className="w-0.5 flex-1 mt-1" style={{ backgroundColor: t.colors.accent }} />}
              </div>
              <div className="pb-6">
                <span className="text-xs font-bold" style={{ color: t.colors.primary }}>{item.year}</span>
                <div className="font-semibold text-sm text-gray-800">{item.title}</div>
                {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )
    }

    case 'sponsor_hero': {
      const s = data.sponsorship
      return (
        <div className="px-8 py-16 text-white" style={{ backgroundColor: t.colors.secondary }}>
          <InlineEdit value={s?.hero_title || ''} live={sel('sponsor_hero')}
            onSave={v => data.onEdit.setSponsorship?.(s ? { ...s, hero_title: v } : null)}
            className="text-3xl md:text-4xl font-bold block"
            style={{ fontFamily: t.fontHeading }} />
          <InlineEdit value={s?.hero_subtitle || ''} live={sel('sponsor_hero')}
            onSave={v => data.onEdit.setSponsorship?.(s ? { ...s, hero_subtitle: v } : null)}
            className="mt-3 text-white/80 max-w-xl block" />
        </div>
      )
    }
    case 'sponsor_steps': {
      const s = data.sponsorship
      const steps = s?.steps || []
      return (
        <div className="px-8 py-12 max-w-4xl mx-auto">
          <InlineEdit value={s?.section_title || ''} live={sel('sponsor_steps')}
            onSave={v => data.onEdit.setSponsorship?.(s ? { ...s, section_title: v } : null)}
            className="text-2xl font-bold text-center mb-2 block"
            style={{ color: t.colors.text, fontFamily: t.fontHeading }} />
          <InlineEdit value={s?.section_description || ''} live={sel('sponsor_steps')}
            onSave={v => data.onEdit.setSponsorship?.(s ? { ...s, section_description: v } : null)}
            className="text-gray-500 text-center max-w-xl mx-auto block" />
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {(steps.length > 0 ? steps : [{ num: '1', title: 'Choose', desc: 'Select a student' }, { num: '2', title: 'Sponsor', desc: 'Set up support' }, { num: '3', title: 'Connect', desc: 'Exchange letters' }]).map((step, i) => (
              <div key={i} className="text-center p-5 rounded-xl border" style={{ borderColor: t.colors.accent }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-sm"
                  style={{ backgroundColor: t.colors.primary, color: 'white' }}>{step.num || i + 1}</div>
                <div className="font-semibold text-sm">{step.title}</div>
                <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }
    case 'sponsor_benefits': {
      const s = data.sponsorship
      const benefits = s?.benefits || []
      return (
        <div className="px-8 py-12" style={{ backgroundColor: t.colors.background }}>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            {(benefits.length > 0 ? benefits : [{ text: 'Quarterly progress reports' }, { text: 'Photo and letter updates' }, { text: 'Direct impact on a child\'s life' }, { text: 'Tax-deductible contributions' }]).map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" style={{ color: t.colors.primary }} viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                <span className="text-sm text-gray-700">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    case 'sponsor_cta': {
      const s = data.sponsorship
      return (
        <div className="px-8 py-16 text-center" style={{ background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})` }}>
          <InlineEdit value={s?.cta_title || ''} live={sel('sponsor_cta')}
            onSave={v => data.onEdit.setSponsorship?.(s ? { ...s, cta_title: v } : null)}
            className="text-2xl font-bold text-white block"
            style={{ fontFamily: t.fontHeading }} />
          <InlineEdit value={s?.cta_description || ''} live={sel('sponsor_cta')}
            onSave={v => data.onEdit.setSponsorship?.(s ? { ...s, cta_description: v } : null)}
            className="mt-3 text-white/80 max-w-xl mx-auto block" />
          <InlineEdit value={s?.cta_button_text || ''} live={sel('sponsor_cta')}
            onSave={v => data.onEdit.setSponsorship?.(s ? { ...s, cta_button_text: v } : null)}
            className="inline-block mt-6 px-8 py-3 font-semibold"
            style={{ backgroundColor: 'white', color: t.colors.primary, borderRadius: `${t.buttonRadius}px` }} />
        </div>
      )
    }

    case 'donate_hero': {
      const d = data.donation
      return (
        <div className="px-8 py-16 text-white" style={{ backgroundColor: t.colors.secondary }}>
          <InlineEdit value={d?.hero_title || ''} live={sel('donate_hero')}
            onSave={v => data.onEdit.setDonation?.(d ? { ...d, hero_title: v } : null)}
            className="text-3xl md:text-4xl font-bold block"
            style={{ fontFamily: t.fontHeading }} />
          <InlineEdit value={d?.hero_subtitle || ''} live={sel('donate_hero')}
            onSave={v => data.onEdit.setDonation?.(d ? { ...d, hero_subtitle: v } : null)}
            className="mt-3 text-white/80 max-w-xl block" />
        </div>
      )
    }
    case 'donate_impact': {
      const d = data.donation
      const cards = d?.impact_cards || []
      return (
        <div className="px-8 py-12">
          <h3 className="text-2xl font-bold text-center mb-8" style={{ color: t.colors.text, fontFamily: t.fontHeading }}>
            Select an Amount
          </h3>
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {(cards.length > 0 ? cards : [
              { amount: 25, label: 'Starter', description: 'Provides supplies for a month', icon: '' },
              { amount: 50, label: 'Supporter', description: 'Covers tuition for a month', icon: '' },
              { amount: 100, label: 'Champion', description: 'Full sponsorship for a month', icon: '' },
            ]).map((card, i) => (
              <div key={i} className="p-6 rounded-xl border text-center" style={{ borderColor: t.colors.accent }}>
                <div className="text-2xl font-bold" style={{ color: t.colors.primary }}>${card.amount}</div>
                <div className="text-sm font-semibold text-gray-700 mt-1">{card.label}</div>
                <div className="text-xs text-gray-500 mt-1">{card.description}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    case 'donate_process': {
      const d = data.donation
      const steps = d?.process_steps || []
      return (
        <div className="px-8 py-12" style={{ backgroundColor: t.colors.background }}>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {(steps.length > 0 ? steps : [
              { title: 'Choose Amount', desc: 'Select your donation level' },
              { title: 'Select Student', desc: 'Pick a student to support' },
              { title: 'Make Payment', desc: 'Secure online transaction' },
              { title: 'Receive Updates', desc: 'Get progress reports' },
            ]).map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold"
                  style={{ backgroundColor: t.colors.primary, color: 'white' }}>{i + 1}</div>
                <div className="text-sm font-semibold">{step.title}</div>
                <div className="text-xs text-gray-500 mt-1">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'contact_header':
      return PageHeaderPreview(data.contactHeader, 'contact_header')
    case 'contact_details': {
      const s = data.contactSettings
      return (
        <div className="px-8 py-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-5 rounded-xl border" style={{ borderColor: t.colors.accent }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: t.colors.accent }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: t.colors.primary }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <p className="text-xs text-gray-500">Address</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{s?.contact_address || '123 Education St, Kathmandu'}</p>
          </div>
          <div className="text-center p-5 rounded-xl border" style={{ borderColor: t.colors.accent }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: t.colors.accent }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: t.colors.primary }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{s?.contact_phone || '+977 1 234 5678'}</p>
          </div>
          <div className="text-center p-5 rounded-xl border" style={{ borderColor: t.colors.accent }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: t.colors.accent }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: t.colors.primary }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{s?.contact_email || 'info@buddhaacademy.org'}</p>
          </div>
        </div>
      )
    }
    case 'contact_form':
      return (
        <div className="px-8 py-12 max-w-xl mx-auto">
          <h3 className="text-xl font-bold text-center mb-6" style={{ color: t.colors.text, fontFamily: t.fontHeading }}>Send Us a Message</h3>
          <div className="space-y-3">
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-24 bg-gray-100 rounded-lg" />
            <div className="h-10 rounded-lg text-white text-sm font-medium flex items-center justify-center"
              style={{ backgroundColor: t.colors.primary }}>Send Message</div>
          </div>
        </div>
      )

    case 'faq_header':
      return PageHeaderPreview(data.faqHeader, 'faq_header')
    case 'faq_list':
      return (
        <div className="px-8 py-12 max-w-3xl mx-auto space-y-3">
          <p className="text-center text-gray-400 text-sm">FAQ content is managed in the FAQ editor</p>
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-xl p-4" style={{ borderColor: t.colors.accent }}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Sample Question {i}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          ))}
        </div>
      )

    case 'gallery_header':
      return PageHeaderPreview(data.galleryHeader, 'gallery_header')
    case 'gallery_grid':
      return (
        <div className="px-8 py-12 max-w-5xl mx-auto">
          <div className="flex gap-2 mb-8">
            {['All', 'Photos', 'Videos', 'Testimonials'].map(tab => (
              <span key={tab} className={`px-4 py-1.5 rounded-lg text-xs font-medium ${tab === 'All' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {tab}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                <div className="h-40 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div className="p-4">
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-2 bg-gray-50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">Manage gallery items in the Gallery manager</p>
        </div>
      )

    case 'privacy_header':
      return PageHeaderPreview(data.privacyHeader, 'privacy_header')
    case 'privacy_content': {
      const c = data.privacyPage?.content as { body?: string; lastUpdated?: string } | undefined
      return (
        <div className="px-8 py-12 max-w-4xl mx-auto">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            {c?.lastUpdated && <p className="text-xs text-gray-400 mb-6">Last updated: {c.lastUpdated}</p>}
            <div className="text-gray-600 leading-relaxed">
              {(c?.body || 'Privacy policy content goes here...').split('\n').map((para, idx) => (
                <p key={idx} className="mb-4 last:mb-0">{para}</p>
              ))}
            </div>
          </div>
        </div>
      )
    }

    case 'terms_header':
      return PageHeaderPreview(data.termsHeader, 'terms_header')
    case 'terms_content': {
      const c = data.termsPage?.content as { body?: string; lastUpdated?: string } | undefined
      return (
        <div className="px-8 py-12 max-w-4xl mx-auto">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            {c?.lastUpdated && <p className="text-xs text-gray-400 mb-6">Last updated: {c.lastUpdated}</p>}
            <div className="text-gray-600 leading-relaxed">
              {(c?.body || 'Terms of service content goes here...').split('\n').map((para, idx) => (
                <p key={idx} className="mb-4 last:mb-0">{para}</p>
              ))}
            </div>
          </div>
        </div>
      )
    }

    case 'volunteer_hero': {
      const v = data.volunteer
      return (
        <div className="px-8 py-16 text-white" style={{ backgroundColor: t.colors.secondary }}>
          <InlineEdit value={v?.hero_title || ''} live={sel('volunteer_hero')}
            onSave={val => data.onEdit.setVolunteer?.(v ? { ...v, hero_title: val } : null)}
            className="text-3xl md:text-4xl font-bold block"
            style={{ fontFamily: t.fontHeading }} />
          <InlineEdit value={v?.hero_subtitle || ''} live={sel('volunteer_hero')}
            onSave={val => data.onEdit.setVolunteer?.(v ? { ...v, hero_subtitle: val } : null)}
            className="mt-3 text-white/80 max-w-xl block" />
        </div>
      )
    }
    case 'volunteer_opps': {
      const v = data.volunteer
      const opps = v?.opportunities || []
      return (
        <div className="px-8 py-12 max-w-5xl mx-auto">
          <InlineEdit value={v?.section_title || ''} live={sel('volunteer_opps')}
            onSave={val => data.onEdit.setVolunteer?.(v ? { ...v, section_title: val } : null)}
            className="text-2xl font-bold text-center mb-2 block"
            style={{ color: t.colors.text, fontFamily: t.fontHeading }} />
          <p className="text-gray-500 text-center text-sm">{v?.section_description || ''}</p>
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {(opps.length > 0 ? opps : [
              { title: 'Teaching', description: 'Help teach English, math, and science', icon: '' },
              { title: 'Mentoring', description: 'Guide and inspire our students', icon: '' },
            ]).map((opp, i) => (
              <div key={i} className="p-5 rounded-xl border flex items-center gap-4" style={{ borderColor: t.colors.accent }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: t.colors.accent }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: t.colors.primary }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div>
                  <div className="font-semibold text-sm">{opp.title}</div>
                  <p className="text-xs text-gray-500 mt-1">{opp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    case 'volunteer_form':
      return (
        <div className="px-8 py-12 max-w-lg mx-auto" style={{ backgroundColor: t.colors.background }}>
          <h3 className="text-xl font-bold text-center mb-6" style={{ color: t.colors.text, fontFamily: t.fontHeading }}>Apply to Volunteer</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-white rounded-lg border border-gray-200" />)}
            <div className="h-24 bg-white rounded-lg border border-gray-200" />
            <div className="h-10 rounded-lg text-white text-sm font-medium flex items-center justify-center"
              style={{ backgroundColor: t.colors.primary }}>Submit Application</div>
          </div>
        </div>
      )

    default:
      return (
        <div className="px-8 py-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: t.colors.accent }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: t.colors.primary }}>
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

function SectionPreview({ id: _id, selected, onClick, label, children, sectionRef }: {
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
          {label}
        </div>
      )}
      {children}
    </div>
  )
}

function ThemePanel({ theme, setTheme, onClose }: {
  theme: ThemeConfig; setTheme: (t: ThemeConfig) => void; onClose: () => void
}) {
  const [colorTexts, setColorTexts] = useState<Record<string, string>>({})
  const getCT = (k: string) => k in colorTexts ? colorTexts[k] : theme.colors[k as keyof typeof theme.colors]
  const setCT = (k: string, v: string) => setColorTexts(p => ({ ...p, [k]: v }))
  const commitColor = (k: string) => {
    const v = colorTexts[k]
    if (!v || /^#[0-9a-fA-F]{6}$/.test(v) || /^#[0-9a-fA-F]{3}$/.test(v)) {
      setTheme({ ...theme, colors: { ...theme.colors, [k]: v || theme.colors[k as keyof typeof theme.colors] } })
    }
    const n = { ...colorTexts }; delete n[k]; setColorTexts(n)
  }
  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: theme.colors.accent }}>
        <h2 className="text-sm font-bold" style={{ color: theme.colors.text }}>Theme & Branding</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
                  onChange={v => setTheme({ ...theme, colors: { ...theme.colors, [key]: v.target.value } })}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer shrink-0" />
                <input value={getCT(key)}
                  onChange={e => setCT(key, e.target.value)}
                  onBlur={() => commitColor(key)}
                  onKeyDown={e => { if (e.key === 'Enter') commitColor(key) }}
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
            <select value={theme.fontHeading} onChange={e => setTheme({ ...theme, fontHeading: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
              {['Inter, sans-serif', 'Georgia, serif', 'Arial, sans-serif', 'Trebuchet MS, sans-serif'].map(f => (
                <option key={f} value={f}>{f.split(',')[0]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Body Font</label>
            <select value={theme.fontBody} onChange={e => setTheme({ ...theme, fontBody: e.target.value })}
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
              onChange={e => setTheme({ ...theme, buttonRadius: Number(e.target.value) })}
              className="w-full accent-amber-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Button Style</label>
            <div className="flex gap-2">
              {(['filled', 'outline', 'soft'] as const).map(s => (
                <button key={s} onClick={() => setTheme({ ...theme, buttonStyle: s })}
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
  )
}

function NoSelectionState({ theme, onOpenTheme }: { theme: ThemeConfig; onOpenTheme: () => void }) {
  return (
    <div className="p-8 text-center">
      <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: theme.colors.accent }}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.colors.primary }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      </div>
      <p className="text-sm" style={{ color: theme.colors.text }}>Select a section to edit</p>
      <p className="text-xs text-gray-400 mt-1">Click any section in the preview or sidebar</p>
      <button onClick={onOpenTheme}
        className="mt-4 px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors"
        style={{ backgroundColor: theme.colors.primary }}>
        Open Theme Settings
      </button>
    </div>
  )
}

function PropertiesPanel(props: {
  selectedSection: string
  currentPage: PageDef | undefined
  hero: HeroContent | null; setHero: (v: HeroContent | null) => void
  welcome: SectionContent | null; setWelcome: (v: SectionContent | null) => void
  aboutPreview: SectionContent | null; setAboutPreview: (v: SectionContent | null) => void
  stats: SectionContent | null; setStats: (v: SectionContent | null) => void
  featuredStudents: SectionContent | null; setFeaturedStudents: (v: SectionContent | null) => void
  sponsorshipSteps: SectionContent | null; setSponsorshipSteps: (v: SectionContent | null) => void
  testimonials: SectionContent | null; setTestimonials: (v: SectionContent | null) => void
  donationCta: SectionContent | null; setDonationCta: (v: SectionContent | null) => void
  aboutHeader: PageHeader | null; setAboutHeader: (v: PageHeader | null) => void
  aboutPage: Page | null; setAboutPage: (v: Page | null) => void
  sponsorship: SponsorshipContent | null; setSponsorship: (v: SponsorshipContent | null) => void
  donation: DonationContent | null; setDonation: (v: DonationContent | null) => void
  contactHeader: PageHeader | null
  contactSettings: Record<string, string>
  volunteer: VolunteerContent | null; setVolunteer: (v: VolunteerContent | null) => void
  privacyHeader: PageHeader | null; setPrivacyHeader: (v: PageHeader | null) => void
  privacyPage: Page | null; setPrivacyPage: (v: Page | null) => void
  termsHeader: PageHeader | null; setTermsHeader: (v: PageHeader | null) => void
  termsPage: Page | null; setTermsPage: (v: Page | null) => void
  theme: ThemeConfig; markChanged: () => void
}) {
  const s = props.selectedSection
  const sectionName = props.currentPage?.sections.find(x => x.id === s)?.name || s

  const mc = props.markChanged

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: props.theme.colors.accent }}>
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: props.theme.colors.primary }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: props.theme.colors.primary }}>Editing</span>
        <span className="text-xs text-gray-400 ml-1">{sectionName}</span>
      </div>

      {}
      {s === 'hero' && props.hero && (
        <PropertyGroup title="Hero Banner">
          <PropertyField label="Title" value={props.hero.title} onChange={v => { props.setHero({ ...props.hero!, title: v }); mc() }} />
          <PropertyField label="Highlight" value={props.hero.highlight} onChange={v => { props.setHero({ ...props.hero!, highlight: v }); mc() }} />
          <PropertyTextarea label="Description" value={props.hero.description} onChange={v => { props.setHero({ ...props.hero!, description: v }); mc() }} />
          <PropertyField label="Primary Button" value={props.hero.cta_primary_text} onChange={v => { props.setHero({ ...props.hero!, cta_primary_text: v }); mc() }} />
          <PropertyField label="Button Link" value={props.hero.cta_primary_link} onChange={v => { props.setHero({ ...props.hero!, cta_primary_link: v }); mc() }} />
          <PropertyField label="Secondary Button" value={props.hero.cta_secondary_text} onChange={v => { props.setHero({ ...props.hero!, cta_secondary_text: v }); mc() }} />
          <ImagePicker label="Background Image" value={props.hero.background_image} onChange={v => { props.setHero({ ...props.hero!, background_image: v }); mc() }} />
        </PropertyGroup>
      )}

      {s === 'welcome' && props.welcome && (
        <PropertyGroup title="Welcome Section">
          <PropertyField label="Title" value={(props.welcome.content as Record<string, string> | undefined)?.title || ''}
            onChange={v => { props.setWelcome({ ...props.welcome!, content: { ...props.welcome!.content, title: v } }); mc() }} />
          <PropertyTextarea label="Content" value={(props.welcome.content as Record<string, string> | undefined)?.content || ''}
            onChange={v => { props.setWelcome({ ...props.welcome!, content: { ...props.welcome!.content, content: v } }); mc() }} />
        </PropertyGroup>
      )}

      {s === 'about_preview' && props.aboutPreview && (
        <PropertyGroup title="About Preview">
          <PropertyField label="Title" value={(props.aboutPreview.content as Record<string, string> | undefined)?.title || ''}
            onChange={v => { props.setAboutPreview({ ...props.aboutPreview!, content: { ...props.aboutPreview!.content, title: v } }); mc() }} />
          <PropertyTextarea label="Description" value={(props.aboutPreview.content as Record<string, string> | undefined)?.description || ''}
            onChange={v => { props.setAboutPreview({ ...props.aboutPreview!, content: { ...props.aboutPreview!.content, description: v } }); mc() }} />
        </PropertyGroup>
      )}

      {s === 'stats' && props.stats && (
        <PropertyGroup title="Statistics Section">
          <PropertyField label="Section Title" value={(props.stats.content as Record<string, string> | undefined)?.title || ''}
            onChange={v => { props.setStats({ ...props.stats!, content: { ...props.stats!.content, title: v } }); mc() }} />
          <p className="text-xs text-gray-400">Statistics values come from the Hero banner settings</p>
        </PropertyGroup>
      )}

      {s === 'featured_students' && props.featuredStudents && (
        <PropertyGroup title="Featured Students">
          <PropertyField label="Section Title" value={(props.featuredStudents.content as Record<string, string> | undefined)?.title || ''}
            onChange={v => { props.setFeaturedStudents({ ...props.featuredStudents!, content: { ...props.featuredStudents!.content, title: v } }); mc() }} />
          <p className="text-xs text-gray-400">Student profiles are managed in the Students section</p>
        </PropertyGroup>
      )}

      {s === 'sponsorship_steps' && props.sponsorshipSteps && (
        <PropertyGroup title="Sponsorship Steps">
          <PropertyField label="Title" value={(props.sponsorshipSteps.content as Record<string, string> | undefined)?.title || ''}
            onChange={v => { props.setSponsorshipSteps({ ...props.sponsorshipSteps!, content: { ...props.sponsorshipSteps!.content, title: v } }); mc() }} />
          <PropertyTextarea label="Description" value={(props.sponsorshipSteps.content as Record<string, string> | undefined)?.description || ''}
            onChange={v => { props.setSponsorshipSteps({ ...props.sponsorshipSteps!, content: { ...props.sponsorshipSteps!.content, description: v } }); mc() }} />
        </PropertyGroup>
      )}

      {s === 'testimonials' && props.testimonials && (
        <PropertyGroup title="Testimonials">
          <PropertyField label="Section Title" value={(props.testimonials.content as Record<string, string> | undefined)?.title || ''}
            onChange={v => { props.setTestimonials({ ...props.testimonials!, content: { ...props.testimonials!.content, title: v } }); mc() }} />
        </PropertyGroup>
      )}

      {s === 'donation_cta' && props.donationCta && (
        <PropertyGroup title="Donation CTA">
          <PropertyField label="Title" value={(props.donationCta.content as Record<string, string> | undefined)?.title || ''}
            onChange={v => { props.setDonationCta({ ...props.donationCta!, content: { ...props.donationCta!.content, title: v } }); mc() }} />
          <PropertyTextarea label="Description" value={(props.donationCta.content as Record<string, string> | undefined)?.description || ''}
            onChange={v => { props.setDonationCta({ ...props.donationCta!, content: { ...props.donationCta!.content, description: v } }); mc() }} />
          <PropertyField label="Button Text" value={(props.donationCta.content as Record<string, string> | undefined)?.button_text || ''}
            onChange={v => { props.setDonationCta({ ...props.donationCta!, content: { ...props.donationCta!.content, button_text: v } }); mc() }} />
          <PropertyField label="Button Link" value={(props.donationCta.content as Record<string, string> | undefined)?.button_link || ''}
            onChange={v => { props.setDonationCta({ ...props.donationCta!, content: { ...props.donationCta!.content, button_link: v } }); mc() }} />
        </PropertyGroup>
      )}

      {s === 'about_header' && props.aboutHeader && (
        <PropertyGroup title="Page Header">
          <PropertyField label="Title" value={props.aboutHeader.title} onChange={v => { props.setAboutHeader({ ...props.aboutHeader!, title: v }); mc() }} />
          <PropertyTextarea label="Subtitle" value={props.aboutHeader.subtitle} onChange={v => { props.setAboutHeader({ ...props.aboutHeader!, subtitle: v }); mc() }} />
        </PropertyGroup>
      )}

      {s === 'about_mission' && props.aboutPage && (() => {
        const page = props.aboutPage!
        const c = (page.content as Record<string, unknown>) || {}
        const set = (field: string, val: string) => props.setAboutPage({ ...page, content: { ...c, [field]: val } } as never)
        return (
          <PropertyGroup title="Mission & Vision">
            <PropertyTextarea label="Mission" value={(c.mission as string) || ''} onChange={v => { set('mission', v); mc() }} />
            <PropertyTextarea label="Vision" value={(c.vision as string) || ''} onChange={v => { set('vision', v); mc() }} />
            <PropertyTextarea label="Description" value={(c.description as string) || ''} onChange={v => { set('description', v); mc() }} />
          </PropertyGroup>
        )
      })()}

      {s === 'about_stats' && props.aboutPage && (() => {
        const page = props.aboutPage!
        const c = (page.content as Record<string, unknown>) || {}
        const stats = (c.stats as Array<{ value: string; label: string }>) || []
        const setStats = (newStats: Array<{ value: string; label: string }>) =>
          props.setAboutPage({ ...page, content: { ...c, stats: newStats } } as never)
        return (
          <PropertyGroup title="Statistics">
            <p className="text-xs text-gray-400 mb-2">Add or edit statistics shown on the About page</p>
            {stats.map((stat, i) => (
              <div key={i} className="flex gap-2 items-center">
                <PropertyField label="Value" value={stat.value}
                  onChange={v => { const s = [...stats]; s[i] = { ...s[i], value: v }; setStats(s); mc() }} />
                <PropertyField label="Label" value={stat.label}
                  onChange={v => { const s = [...stats]; s[i] = { ...s[i], label: v }; setStats(s); mc() }} />
              </div>
            ))}
            <button onClick={() => { setStats([...stats, { value: '', label: '' }]); mc() }}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium">+ Add Stat</button>
          </PropertyGroup>
        )
      })()}

      {s === 'about_values' && props.aboutPage && (() => {
        const page = props.aboutPage!
        const c = (page.content as Record<string, unknown>) || {}
        const values = (c.values as Array<{ title: string; desc: string }>) || []
        const setValues = (v: Array<{ title: string; desc: string }>) =>
          props.setAboutPage({ ...page, content: { ...c, values: v } } as never)
        return (
          <PropertyGroup title="Core Values">
            <p className="text-xs text-gray-400 mb-2">Each value has a title and description</p>
            {values.map((val, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
                <PropertyField label="Title" value={val.title}
                  onChange={v => { const arr = [...values]; arr[i] = { ...arr[i], title: v }; setValues(arr); mc() }} />
                <PropertyTextarea label="Description" value={val.desc}
                  onChange={v => { const arr = [...values]; arr[i] = { ...arr[i], desc: v }; setValues(arr); mc() }} />
                <button onClick={() => { setValues(values.filter((_, idx) => idx !== i)); mc() }}
                  className="text-xs text-red-500 hover:text-red-600">Remove</button>
              </div>
            ))}
            <button onClick={() => { setValues([...values, { title: '', desc: '' }]); mc() }}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium">+ Add Value</button>
          </PropertyGroup>
        )
      })()}

      {s === 'about_timeline' && props.aboutPage && (() => {
        const page = props.aboutPage!
        const c = (page.content as Record<string, unknown>) || {}
        const timeline = (c.timeline as Array<{ year: string; title: string; desc: string }>) || []
        const setTimeline = (t: Array<{ year: string; title: string; desc: string }>) =>
          props.setAboutPage({ ...page, content: { ...c, timeline: t } } as never)
        return (
          <PropertyGroup title="Timeline">
            <p className="text-xs text-gray-400 mb-2">Key milestones in the organization's history</p>
            {timeline.map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
                <div className="flex gap-2">
                  <PropertyField label="Year" value={item.year}
                    onChange={v => { const t = [...timeline]; t[i] = { ...t[i], year: v }; setTimeline(t); mc() }} />
                  <PropertyField label="Title" value={item.title}
                    onChange={v => { const t = [...timeline]; t[i] = { ...t[i], title: v }; setTimeline(t); mc() }} />
                </div>
                <PropertyTextarea label="Description" value={item.desc}
                  onChange={v => { const t = [...timeline]; t[i] = { ...t[i], desc: v }; setTimeline(t); mc() }} />
                <button onClick={() => { setTimeline(timeline.filter((_, idx) => idx !== i)); mc() }}
                  className="text-xs text-red-500 hover:text-red-600">Remove</button>
              </div>
            ))}
            <button onClick={() => { setTimeline([...timeline, { year: '', title: '', desc: '' }]); mc() }}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium">+ Add Milestone</button>
          </PropertyGroup>
        )
      })()}

      {(s === 'sponsor_hero' || s === 'sponsor_steps' || s === 'sponsor_cta') && props.sponsorship && (
        <>
          {s === 'sponsor_hero' && (
            <PropertyGroup title="Sponsorship Hero">
              <PropertyField label="Title" value={props.sponsorship.hero_title} onChange={v => { props.setSponsorship({ ...props.sponsorship!, hero_title: v }); mc() }} />
              <PropertyTextarea label="Subtitle" value={props.sponsorship.hero_subtitle} onChange={v => { props.setSponsorship({ ...props.sponsorship!, hero_subtitle: v }); mc() }} />
            </PropertyGroup>
          )}
          {s === 'sponsor_steps' && (
            <PropertyGroup title="How It Works">
              <PropertyField label="Section Title" value={props.sponsorship.section_title} onChange={v => { props.setSponsorship({ ...props.sponsorship!, section_title: v }); mc() }} />
              <PropertyTextarea label="Description" value={props.sponsorship.section_description} onChange={v => { props.setSponsorship({ ...props.sponsorship!, section_description: v }); mc() }} />
            </PropertyGroup>
          )}
          {s === 'sponsor_cta' && (
            <PropertyGroup title="Call to Action">
              <PropertyField label="Title" value={props.sponsorship.cta_title} onChange={v => { props.setSponsorship({ ...props.sponsorship!, cta_title: v }); mc() }} />
              <PropertyTextarea label="Description" value={props.sponsorship.cta_description} onChange={v => { props.setSponsorship({ ...props.sponsorship!, cta_description: v }); mc() }} />
              <PropertyField label="Button Text" value={props.sponsorship.cta_button_text} onChange={v => { props.setSponsorship({ ...props.sponsorship!, cta_button_text: v }); mc() }} />
              <PropertyField label="Button Link" value={props.sponsorship.cta_button_link} onChange={v => { props.setSponsorship({ ...props.sponsorship!, cta_button_link: v }); mc() }} />
            </PropertyGroup>
          )}
        </>
      )}

      {}
      {(s === 'donate_hero') && props.donation && (
        <PropertyGroup title="Donation Hero">
          <PropertyField label="Title" value={props.donation.hero_title} onChange={v => { props.setDonation({ ...props.donation!, hero_title: v }); mc() }} />
          <PropertyTextarea label="Subtitle" value={props.donation.hero_subtitle} onChange={v => { props.setDonation({ ...props.donation!, hero_subtitle: v }); mc() }} />
        </PropertyGroup>
      )}

      {}
      {s === 'contact_header' && (
        <PropertyGroup title="Contact Page Header">
          <p className="text-xs text-gray-400">Edit in the Contact Page editor</p>
        </PropertyGroup>
      )}

      {}
      {s === 'faq_header' && (
        <PropertyGroup title="FAQ Page Header">
          <p className="text-xs text-gray-400">Edit in the FAQ editor</p>
        </PropertyGroup>
      )}

      {}
      {s === 'gallery_header' && (
        <PropertyGroup title="Gallery Page Header">
          <p className="text-xs text-gray-400">Edit in the Gallery editor</p>
        </PropertyGroup>
      )}

      {}
      {s === 'volunteer_hero' && props.volunteer && (
        <PropertyGroup title="Volunteer Hero">
          <PropertyField label="Title" value={props.volunteer.hero_title} onChange={v => { props.setVolunteer({ ...props.volunteer!, hero_title: v }); mc() }} />
          <PropertyTextarea label="Subtitle" value={props.volunteer.hero_subtitle} onChange={v => { props.setVolunteer({ ...props.volunteer!, hero_subtitle: v }); mc() }} />
        </PropertyGroup>
      )}

      {s === 'volunteer_opps' && props.volunteer && (
        <PropertyGroup title="Volunteer Opportunities">
          <PropertyField label="Section Title" value={props.volunteer.section_title} onChange={v => { props.setVolunteer({ ...props.volunteer!, section_title: v }); mc() }} />
          <PropertyTextarea label="Description" value={props.volunteer.section_description} onChange={v => { props.setVolunteer({ ...props.volunteer!, section_description: v }); mc() }} />
        </PropertyGroup>
      )}

      {}
      {s === 'privacy_header' && props.privacyHeader && (
        <PropertyGroup title="Page Header">
          <PropertyField label="Title" value={props.privacyHeader.title} onChange={v => { props.setPrivacyHeader({ ...props.privacyHeader, title: v } as never); mc() }} />
          <PropertyTextarea label="Subtitle" value={props.privacyHeader.subtitle} onChange={v => { props.setPrivacyHeader({ ...props.privacyHeader, subtitle: v } as never); mc() }} />
        </PropertyGroup>
      )}
      {s === 'privacy_content' && props.privacyPage && (() => {
        const c = (props.privacyPage.content as Record<string, unknown>) || {}
        const set = (field: string, val: string) => {
          props.setPrivacyPage({ ...props.privacyPage, content: { ...c, [field]: val } } as never)
          mc()
        }
        return (
          <PropertyGroup title="Privacy Content">
            <PropertyField label="Last Updated" value={(c.lastUpdated as string) || ''} onChange={v => set('lastUpdated', v)} />
            <PropertyTextarea label="Body Content" value={(c.body as string) || ''} onChange={v => set('body', v)} />
          </PropertyGroup>
        )
      })()}

      {}
      {s === 'terms_header' && props.termsHeader && (
        <PropertyGroup title="Page Header">
          <PropertyField label="Title" value={props.termsHeader.title} onChange={v => { props.setTermsHeader({ ...props.termsHeader, title: v } as never); mc() }} />
          <PropertyTextarea label="Subtitle" value={props.termsHeader.subtitle} onChange={v => { props.setTermsHeader({ ...props.termsHeader, subtitle: v } as never); mc() }} />
        </PropertyGroup>
      )}
      {s === 'terms_content' && props.termsPage && (() => {
        const c = (props.termsPage.content as Record<string, unknown>) || {}
        const set = (field: string, val: string) => {
          props.setTermsPage({ ...props.termsPage, content: { ...c, [field]: val } } as never)
          mc()
        }
        return (
          <PropertyGroup title="Terms Content">
            <PropertyField label="Last Updated" value={(c.lastUpdated as string) || ''} onChange={v => set('lastUpdated', v)} />
            <PropertyTextarea label="Body Content" value={(c.body as string) || ''} onChange={v => set('body', v)} />
          </PropertyGroup>
        )
      })()}

      {}
      {!['hero', 'welcome', 'about_preview', 'stats', 'featured_students', 'sponsorship_steps', 'testimonials', 'donation_cta',
        'about_header', 'about_mission', 'about_stats', 'about_values', 'about_timeline',
        'sponsor_hero', 'sponsor_steps', 'sponsor_benefits', 'sponsor_cta',
        'donate_hero', 'donate_impact', 'donate_process',
        'contact_header', 'contact_details', 'contact_form',
        'faq_header', 'faq_list',
        'gallery_header', 'gallery_grid',
        'volunteer_hero', 'volunteer_opps', 'volunteer_form',
        'privacy_header', 'privacy_content',
        'terms_header', 'terms_content',
      ].includes(s) && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">Content for this section can be edited in the dedicated page editor</p>
        </div>
      )}
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
