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
    heading: 'terms_intro_heading',
    content: 'terms_intro_content',
  },
  {
    heading: 'terms_eligibility_heading',
    content: 'terms_eligibility_content',
  },
  {
    heading: 'terms_accounts_heading',
    content: 'terms_accounts_content',
  },
  {
    heading: 'terms_donations_heading',
    content: 'terms_donations_content',
  },
  {
    heading: 'terms_accuracy_heading',
    content: 'terms_accuracy_content',
  },
  {
    heading: 'terms_student_content_heading',
    content: 'terms_student_content_content',
  },
  {
    heading: 'terms_acceptable_use_heading',
    content: 'terms_acceptable_use_content',
  },
  {
    heading: 'terms_admin_heading',
    content: 'terms_admin_content',
  },
  {
    heading: 'terms_ip_heading',
    content: 'terms_ip_content',
  },
  {
    heading: 'terms_third_party_heading',
    content: 'terms_third_party_content',
  },
  {
    heading: 'terms_liability_heading',
    content: 'terms_liability_content',
  },
  {
    heading: 'terms_suspension_heading',
    content: 'terms_suspension_content',
  },
  {
    heading: 'terms_changes_heading',
    content: 'terms_changes_content',
  },
  {
    heading: 'terms_contact_heading',
    content: 'terms_contact_content',
  },
]

export function TermsPage() {
  const { language } = useLanguage()
  const { t } = useCmsStrings()
  const [legalPage, setLegalPage] = useState<LegalPageWithSections | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent(language)
  }, [language])

  const loadContent = async (lang: string) => {
    try {
      const page = await getPublishedLegalPageByType('terms_conditions', lang)
      if (page) {
        setLegalPage(page)
      } else {
        const section = await getSectionContent('terms_content', lang)
        if (section?.content) {
          const c = section.content as { sections?: { heading: string; content: string }[]; title?: string }
          setLegalPage({
            id: '',
            title: c.title || section.title || 'Terms & Conditions',
            slug: 'terms',
            type: 'terms_conditions',
            meta_title: '',
            meta_description: '',
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
              <Tr text={legalPage?.title || 'Terms & Conditions'} />
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
