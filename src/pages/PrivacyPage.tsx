import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Tr } from '../components/Translated'
import { getPublishedLegalPageByType, type LegalPageWithSections } from '../services/legal-pages'
import { getSectionContent } from '../services/cms-content'
import { DetailPageSkeleton } from '../components/ui/LoadingSkeleton'
import { useLanguage } from '../context/LanguageContext'
import { useCmsStrings } from '../context/CmsStringsContext'

const FALLBACK_SECTIONS = [
  {
    heading: 'privacy_intro_heading',
    content: 'privacy_intro_content',
  },
  {
    heading: 'privacy_info_heading',
    content: 'privacy_info_content',
  },
  {
    heading: 'privacy_usage_heading',
    content: 'privacy_usage_content',
  },
  {
    heading: 'privacy_legal_heading',
    content: 'privacy_legal_content',
  },
  {
    heading: 'privacy_student_heading',
    content: 'privacy_student_content',
  },
  {
    heading: 'privacy_financial_heading',
    content: 'privacy_financial_content',
  },
  {
    heading: 'privacy_sharing_heading',
    content: 'privacy_sharing_content',
  },
  {
    heading: 'privacy_storage_heading',
    content: 'privacy_storage_content',
  },
  {
    heading: 'privacy_retention_heading',
    content: 'privacy_retention_content',
  },
  {
    heading: 'privacy_rights_heading',
    content: 'privacy_rights_content',
  },
  {
    heading: 'privacy_cookies_heading',
    content: 'privacy_cookies_content',
  },
  {
    heading: 'privacy_third_party_heading',
    content: 'privacy_third_party_content',
  },
  {
    heading: 'privacy_updates_heading',
    content: 'privacy_updates_content',
  },
]

export function PrivacyPage() {
  const { language } = useLanguage()
  const { t } = useCmsStrings()
  const [legalPage, setLegalPage] = useState<LegalPageWithSections | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent(language)
  }, [language])

  const loadContent = async (lang: string) => {
    try {
      const page = await getPublishedLegalPageByType('privacy_policy', lang)
      if (page) {
        setLegalPage(page)
      } else {
        const section = await getSectionContent('privacy_content', lang)
        if (section?.content) {
          const c = section.content as { sections?: { heading: string; content: string }[]; title?: string }
          setLegalPage({
            id: '',
            title: c.title || section.title || 'Privacy Policy',
            title_ne: null,
            slug: 'privacy',
            content_ne: null,
            type: 'privacy_policy',
            meta_title: '',
            meta_title_ne: null,
            meta_description: '',
            meta_description_ne: null,
            status: 'published',
            effective_date: null,
            last_reviewed_at: null,
            published_at: null,
            created_by: null,
            updated_by: null,
            created_at: '',
            updated_at: '',
            sections: (c.sections || []) as LegalPageWithSections['sections'],
          })
        }
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DetailPageSkeleton />

  const sections = legalPage?.sections && legalPage.sections.length > 0
    ? legalPage.sections
    : FALLBACK_SECTIONS.map(section => ({
        heading: t(section.heading),
        content: t(section.content),
      }))

  const lastUpdated = legalPage?.updated_at || legalPage?.published_at

  return (
    <div className="bg-[var(--color-background)] min-h-screen">
      <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-[var(--color-primary-light)]/20 to-[var(--color-secondary-light)]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4 sm:mb-6">
              <Tr text={legalPage?.title || 'Privacy Policy'} />
            </h1>
            {lastUpdated && (
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
                <Tr text="Last updated: " /> {new Date(lastUpdated).toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {sections.map((section, idx) => (
            <Card key={idx} variant="bordered" padding="lg" className="max-w-none">
              {section.heading && (
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4"><Tr text={section.heading} /></h2>
              )}
              <div className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                <Tr text={section.content} />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
