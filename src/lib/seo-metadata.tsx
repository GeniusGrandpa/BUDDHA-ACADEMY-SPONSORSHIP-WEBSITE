import { Helmet } from 'react-helmet-async'

interface SeoProps {
  title?: string
  description?: string
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  noIndex?: boolean
}

const SITE_NAME = 'Buddha Academy'
const DEFAULT_DESCRIPTION = 'Providing free education to underprivileged children in Nepal since 1977'

const ROUTE_SEO: Record<string, SeoProps> = {
  home: {
    title: 'Buddha Academy - Free Education for Underprivileged Children in Nepal',
    description: 'Since 1977, Buddha Academy provides free education, meals, and healthcare to underprivileged children in Kathmandu, Nepal. Sponsor a child today.',
    canonicalUrl: '/',
    ogTitle: 'Buddha Academy - Free Education for Underprivileged Children',
    twitterTitle: 'Buddha Academy - Free Education for Underprivileged Children',
  },
  about: {
    title: 'About Us - Buddha Academy',
    description: 'Learn about Buddha Academy\'s mission, history, and impact since 1977. Discover how we provide free education to underprivileged children in Nepal.',
    canonicalUrl: '/about',
  },
  sponsor: {
    title: 'Sponsor a Child - Buddha Academy',
    description: 'Sponsor a child in Nepal and provide them with free education, nutritious meals, and a path out of poverty through Buddha Academy.',
    canonicalUrl: '/sponsor',
  },
  students: {
    title: 'Our Students - Buddha Academy',
    description: 'Meet the children at Buddha Academy who need your sponsorship support to continue their education.',
    canonicalUrl: '/students',
  },
  gallery: {
    title: 'Photo Gallery - Buddha Academy',
    description: 'Browse photos from Buddha Academy showing our students, campus, and educational activities in Kathmandu, Nepal.',
    canonicalUrl: '/gallery',
  },
  news: {
    title: 'News & Updates - Buddha Academy',
    description: 'Read the latest news, events, and impact stories from Buddha Academy in Nepal.',
    canonicalUrl: '/news',
  },
  contact: {
    title: 'Contact Us - Buddha Academy',
    description: 'Get in touch with Buddha Academy. Located in Kathmandu, Nepal, we welcome inquiries about sponsorships, donations, and volunteering.',
    canonicalUrl: '/contact',
  },
  donate: {
    title: 'Donate - Buddha Academy',
    description: 'Make a donation to support Buddha Academy\'s mission of providing free education to underprivileged children in Nepal.',
    canonicalUrl: '/donate',
  },
  transparency: {
    title: 'Transparency - Buddha Academy',
    description: 'Buddha Academy is committed to financial transparency. See how your donations are used to support children in Nepal.',
    canonicalUrl: '/transparency',
  },
  faq: {
    title: 'FAQ - Buddha Academy',
    description: 'Frequently asked questions about Buddha Academy, our sponsorship program, donations, and volunteering opportunities.',
    canonicalUrl: '/faq',
  },
  volunteer: {
    title: 'Volunteer - Buddha Academy',
    description: 'Volunteer with Buddha Academy in Nepal and make a direct impact on children\'s lives through education and community programs.',
    canonicalUrl: '/volunteer',
  },
  campaigns: {
    title: 'Campaigns - Buddha Academy',
    description: 'Support Buddha Academy\'s fundraising campaigns and help us reach our goals for children\'s education in Nepal.',
    canonicalUrl: '/campaigns',
  },
  'success-stories': {
    title: 'Success Stories - Buddha Academy',
    description: 'Read inspiring success stories of students at Buddha Academy whose lives have been transformed through education.',
    canonicalUrl: '/success-stories',
  },
  privacy: {
    title: 'Privacy Policy - Buddha Academy',
    description: 'Buddha Academy\'s privacy policy explains how we collect, use, and protect your personal information.',
    canonicalUrl: '/privacy',
  },
  terms: {
    title: 'Terms of Service - Buddha Academy',
    description: 'Terms and conditions for using Buddha Academy\'s website and services.',
    canonicalUrl: '/terms',
  },
  login: {
    title: `Sign In - ${SITE_NAME}`,
    noIndex: true,
  },
}

export function SeoMetadata({ routeSlug, custom }: { routeSlug: string; custom?: SeoProps }) {
  const routeConfig = ROUTE_SEO[routeSlug]
  const seo = { ...routeConfig, ...custom }

  const title = seo.title || `${SITE_NAME} - Education for Underprivileged Children in Nepal`
  const description = seo.description || DEFAULT_DESCRIPTION
  const canonical = seo.canonicalUrl
    ? `${canonicalBase()}${seo.canonicalUrl}`
    : undefined

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={seo.ogTitle || title} />
      <meta property="og:description" content={seo.ogDescription || description} />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonical && <link rel="canonical" href={canonical} />}
      {canonical && <meta property="og:url" content={canonical} />}
      <meta name="twitter:title" content={seo.twitterTitle || seo.ogTitle || title} />
      <meta name="twitter:description" content={seo.twitterDescription || seo.ogDescription || description} />
      {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}
      {seo.ogImage && <meta name="twitter:image" content={seo.ogImage} />}
      {seo.noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  )
}

function canonicalBase(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  const env = import.meta.env.VITE_PUBLIC_BASE_URL || 'http://localhost:5174'
  return env.replace(/\/$/, '')
}
