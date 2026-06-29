export interface CmsPage {
  id: string
  name: string
  slug: string
  route: string
  metaTitle: string
  metaDescription: string
  isPublished: boolean
  isVisible: boolean
  isFeatured: boolean
  displayOrder: number
  sections: CmsSection[]
  updatedBy: string | null
  updatedAt: string
}

export interface CmsSection {
  id: string
  key: string
  name: string
  type: SectionType
  isVisible: boolean
  isEnabled: boolean
  displayOrder: number
  parentPageId: string
}

export type SectionType =
  | 'hero'
  | 'page_header'
  | 'welcome'
  | 'about_preview'
  | 'stats'
  | 'featured_students'
  | 'sponsorship_steps'
  | 'testimonials'
  | 'donation_cta'
  | 'about_mission'
  | 'about_values'
  | 'about_timeline'
  | 'sponsor_hero'
  | 'sponsor_steps'
  | 'sponsor_benefits'
  | 'sponsor_cta'
  | 'donate_hero'
  | 'donate_impact'
  | 'donate_process'
  | 'contact_details'
  | 'contact_form'
  | 'faq_list'
  | 'gallery_grid'
  | 'volunteer_hero'
  | 'volunteer_opps'
  | 'volunteer_form'
  | 'privacy_content'
  | 'terms_content'
  | 'news_grid'
  | 'students_grid'
  | 'activity_feed'
  | 'success_stories'
  | 'transparency_content'
  | 'campaigns_list'
  | 'custom_content'

export interface ToggleState {
  pageVisible: boolean
  sectionVisible: Record<string, boolean>
  ctaEnabled: Record<string, boolean>
  featured: Record<string, boolean>
  published: boolean
  imageVisible: Record<string, boolean>
  donationBlocksVisible: boolean
  sponsorshipSectionsVisible: boolean
  galleryCategoriesEnabled: Record<string, boolean>
  testimonialsEnabled: boolean
  homepageSectionsEnabled: Record<string, boolean>
}

export const ALL_PUBLIC_PAGES: CmsPage[] = [
  {
    id: 'home',
    name: 'Home',
    slug: 'home',
    route: '/',
    metaTitle: 'Home',
    metaDescription: 'Welcome to Buddha Academy',
    isPublished: true,
    isVisible: true,
    isFeatured: true,
    displayOrder: 1,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'hero', key: 'hero', name: 'Hero Banner', type: 'hero', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'home' },
      { id: 'welcome', key: 'welcome', name: 'Welcome Section', type: 'welcome', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'home' },
      { id: 'about_preview', key: 'about_preview', name: 'About Preview', type: 'about_preview', isVisible: true, isEnabled: true, displayOrder: 3, parentPageId: 'home' },
      { id: 'stats', key: 'stats', name: 'Statistics Bar', type: 'stats', isVisible: true, isEnabled: true, displayOrder: 4, parentPageId: 'home' },
      { id: 'featured_students', key: 'featured_students', name: 'Featured Students', type: 'featured_students', isVisible: true, isEnabled: true, displayOrder: 5, parentPageId: 'home' },
      { id: 'sponsorship_steps', key: 'sponsorship_steps', name: 'Sponsorship Steps', type: 'sponsorship_steps', isVisible: true, isEnabled: true, displayOrder: 6, parentPageId: 'home' },
      { id: 'testimonials', key: 'testimonials', name: 'Testimonials', type: 'testimonials', isVisible: true, isEnabled: true, displayOrder: 7, parentPageId: 'home' },
      { id: 'donation_cta', key: 'donation_cta', name: 'Donation CTA', type: 'donation_cta', isVisible: true, isEnabled: true, displayOrder: 8, parentPageId: 'home' },
    ],
  },
  {
    id: 'about',
    name: 'About Us',
    slug: 'about',
    route: '/about',
    metaTitle: 'About Us',
    metaDescription: 'Learn about Buddha Academy',
    isPublished: true,
    isVisible: true,
    isFeatured: true,
    displayOrder: 2,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'about_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'about' },
      { id: 'about_mission', key: 'about_mission', name: 'Mission & Vision', type: 'about_mission', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'about' },
      { id: 'about_stats', key: 'about_stats', name: 'Statistics', type: 'stats', isVisible: true, isEnabled: true, displayOrder: 3, parentPageId: 'about' },
      { id: 'about_values', key: 'about_values', name: 'Core Values', type: 'about_values', isVisible: true, isEnabled: true, displayOrder: 4, parentPageId: 'about' },
      { id: 'about_timeline', key: 'about_timeline', name: 'Timeline', type: 'about_timeline', isVisible: true, isEnabled: true, displayOrder: 5, parentPageId: 'about' },
    ],
  },
  {
    id: 'sponsorship',
    name: 'Sponsorship',
    slug: 'sponsor',
    route: '/sponsor',
    metaTitle: 'Sponsorship',
    metaDescription: 'Sponsor a student at Buddha Academy',
    isPublished: true,
    isVisible: true,
    isFeatured: true,
    displayOrder: 3,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'sponsor_hero', key: 'sponsor_hero', name: 'Hero', type: 'sponsor_hero', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'sponsorship' },
      { id: 'sponsor_steps', key: 'sponsor_steps', name: 'How It Works', type: 'sponsor_steps', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'sponsorship' },
      { id: 'sponsor_benefits', key: 'sponsor_benefits', name: 'Benefits', type: 'sponsor_benefits', isVisible: true, isEnabled: true, displayOrder: 3, parentPageId: 'sponsorship' },
      { id: 'sponsor_cta', key: 'sponsor_cta', name: 'Call to Action', type: 'sponsor_cta', isVisible: true, isEnabled: true, displayOrder: 4, parentPageId: 'sponsorship' },
    ],
  },
  {
    id: 'students',
    name: 'Students',
    slug: 'students',
    route: '/students',
    metaTitle: 'Students',
    metaDescription: 'View students at Buddha Academy',
    isPublished: true,
    isVisible: true,
    isFeatured: true,
    displayOrder: 4,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'students_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'students' },
      { id: 'students_grid', key: 'students_grid', name: 'Student Profiles', type: 'students_grid', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'students' },
    ],
  },
  {
    id: 'donations',
    name: 'Donations',
    slug: 'donate',
    route: '/donate',
    metaTitle: 'Donate',
    metaDescription: 'Support Buddha Academy with a donation',
    isPublished: true,
    isVisible: true,
    isFeatured: true,
    displayOrder: 5,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'donate_hero', key: 'donate_hero', name: 'Hero', type: 'donate_hero', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'donations' },
      { id: 'donate_impact', key: 'donate_impact', name: 'Impact Cards', type: 'donate_impact', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'donations' },
      { id: 'donate_process', key: 'donate_process', name: 'How It Works', type: 'donate_process', isVisible: true, isEnabled: true, displayOrder: 3, parentPageId: 'donations' },
    ],
  },
  {
    id: 'gallery',
    name: 'Gallery',
    slug: 'gallery',
    route: '/gallery',
    metaTitle: 'Gallery',
    metaDescription: 'View photos and media from Buddha Academy',
    isPublished: true,
    isVisible: true,
    isFeatured: true,
    displayOrder: 6,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'gallery_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'gallery' },
      { id: 'gallery_grid', key: 'gallery_grid', name: 'Gallery Grid', type: 'gallery_grid', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'gallery' },
    ],
  },
  {
    id: 'events',
    name: 'Events',
    slug: 'events',
    route: '/events',
    metaTitle: 'Events',
    metaDescription: 'Upcoming events at Buddha Academy',
    isPublished: false,
    isVisible: false,
    isFeatured: false,
    displayOrder: 7,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'events_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'events' },
      { id: 'events_grid', key: 'events_grid', name: 'Events List', type: 'custom_content', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'events' },
    ],
  },
  {
    id: 'news',
    name: 'News/Blog',
    slug: 'news',
    route: '/news',
    metaTitle: 'News & Updates',
    metaDescription: 'Latest news and updates from Buddha Academy',
    isPublished: true,
    isVisible: true,
    isFeatured: true,
    displayOrder: 8,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'news_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'news' },
      { id: 'news_grid', key: 'news_grid', name: 'News Articles', type: 'news_grid', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'news' },
    ],
  },
  {
    id: 'contact',
    name: 'Contact',
    slug: 'contact',
    route: '/contact',
    metaTitle: 'Contact Us',
    metaDescription: 'Get in touch with Buddha Academy',
    isPublished: true,
    isVisible: true,
    isFeatured: true,
    displayOrder: 9,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'contact_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'contact' },
      { id: 'contact_details', key: 'contact_details', name: 'Contact Details', type: 'contact_details', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'contact' },
      { id: 'contact_form', key: 'contact_form', name: 'Contact Form', type: 'contact_form', isVisible: true, isEnabled: true, displayOrder: 3, parentPageId: 'contact' },
    ],
  },
  {
    id: 'faq',
    name: 'FAQ',
    slug: 'faq',
    route: '/faq',
    metaTitle: 'Frequently Asked Questions',
    metaDescription: 'Common questions about Buddha Academy',
    isPublished: true,
    isVisible: true,
    isFeatured: true,
    displayOrder: 10,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'faq_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'faq' },
      { id: 'faq_list', key: 'faq_list', name: 'FAQ List', type: 'faq_list', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'faq' },
    ],
  },
  {
    id: 'impact',
    name: 'Impact',
    slug: 'impact',
    route: '/impact',
    metaTitle: 'Our Impact',
    metaDescription: 'See the impact of Buddha Academy',
    isPublished: false,
    isVisible: false,
    isFeatured: false,
    displayOrder: 11,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'impact_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'impact' },
      { id: 'impact_content', key: 'impact_content', name: 'Impact Content', type: 'custom_content', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'impact' },
    ],
  },
  {
    id: 'team',
    name: 'Team',
    slug: 'team',
    route: '/team',
    metaTitle: 'Our Team',
    metaDescription: 'Meet the team at Buddha Academy',
    isPublished: false,
    isVisible: false,
    isFeatured: false,
    displayOrder: 12,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'team_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'team' },
      { id: 'team_grid', key: 'team_grid', name: 'Team Members', type: 'custom_content', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'team' },
    ],
  },
  {
    id: 'testimonials_page',
    name: 'Testimonials',
    slug: 'testimonials',
    route: '/testimonials',
    metaTitle: 'Testimonials',
    metaDescription: 'What people say about Buddha Academy',
    isPublished: false,
    isVisible: false,
    isFeatured: false,
    displayOrder: 13,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'testimonials_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'testimonials_page' },
      { id: 'testimonials_list', key: 'testimonials_list', name: 'Testimonials List', type: 'testimonials', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'testimonials_page' },
    ],
  },
  {
    id: 'volunteer',
    name: 'Volunteer',
    slug: 'volunteer',
    route: '/volunteer',
    metaTitle: 'Volunteer',
    metaDescription: 'Volunteer with Buddha Academy',
    isPublished: true,
    isVisible: true,
    isFeatured: true,
    displayOrder: 14,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'volunteer_hero', key: 'volunteer_hero', name: 'Hero', type: 'volunteer_hero', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'volunteer' },
      { id: 'volunteer_opps', key: 'volunteer_opps', name: 'Opportunities', type: 'volunteer_opps', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'volunteer' },
      { id: 'volunteer_form', key: 'volunteer_form', name: 'Application Form', type: 'volunteer_form', isVisible: true, isEnabled: true, displayOrder: 3, parentPageId: 'volunteer' },
    ],
  },
  {
    id: 'campaigns',
    name: 'Campaigns',
    slug: 'campaigns',
    route: '/campaigns',
    metaTitle: 'Campaigns',
    metaDescription: 'Current campaigns at Buddha Academy',
    isPublished: true,
    isVisible: true,
    isFeatured: false,
    displayOrder: 15,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'campaigns_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'campaigns' },
      { id: 'campaigns_list', key: 'campaigns_list', name: 'Campaigns', type: 'campaigns_list', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'campaigns' },
    ],
  },
  {
    id: 'success-stories',
    name: 'Success Stories',
    slug: 'success-stories',
    route: '/success-stories',
    metaTitle: 'Success Stories',
    metaDescription: 'Success stories from Buddha Academy',
    isPublished: true,
    isVisible: true,
    isFeatured: false,
    displayOrder: 16,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'stories_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'success-stories' },
      { id: 'stories_grid', key: 'stories_grid', name: 'Stories', type: 'success_stories', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'success-stories' },
    ],
  },
  {
    id: 'activity',
    name: 'Activity',
    slug: 'activity',
    route: '/activity',
    metaTitle: 'Recent Activity',
    metaDescription: 'Recent activity at Buddha Academy',
    isPublished: true,
    isVisible: true,
    isFeatured: false,
    displayOrder: 17,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'activity_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'activity' },
      { id: 'activity_feed', key: 'activity_feed', name: 'Activity Feed', type: 'activity_feed', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'activity' },
    ],
  },
  {
    id: 'transparency',
    name: 'Transparency',
    slug: 'transparency',
    route: '/transparency',
    metaTitle: 'Transparency',
    metaDescription: 'Our commitment to transparency',
    isPublished: true,
    isVisible: true,
    isFeatured: false,
    displayOrder: 18,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'transparency_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'transparency' },
      { id: 'transparency_content', key: 'transparency_content', name: 'Content', type: 'transparency_content', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'transparency' },
    ],
  },
  {
    id: 'privacy',
    name: 'Privacy Policy',
    slug: 'privacy',
    route: '/privacy',
    metaTitle: 'Privacy Policy',
    metaDescription: 'Privacy policy of Buddha Academy',
    isPublished: true,
    isVisible: true,
    isFeatured: false,
    displayOrder: 19,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'privacy_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'privacy' },
      { id: 'privacy_content', key: 'privacy_content', name: 'Content', type: 'privacy_content', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'privacy' },
    ],
  },
  {
    id: 'terms',
    name: 'Terms of Service',
    slug: 'terms',
    route: '/terms',
    metaTitle: 'Terms of Service',
    metaDescription: 'Terms of service of Buddha Academy',
    isPublished: true,
    isVisible: true,
    isFeatured: false,
    displayOrder: 20,
    updatedBy: null,
    updatedAt: '',
    sections: [
      { id: 'terms_header', key: 'page_header', name: 'Page Header', type: 'page_header', isVisible: true, isEnabled: true, displayOrder: 1, parentPageId: 'terms' },
      { id: 'terms_content', key: 'terms_content', name: 'Content', type: 'terms_content', isVisible: true, isEnabled: true, displayOrder: 2, parentPageId: 'terms' },
    ],
  },
]
