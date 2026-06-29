import { useEffect, useState } from 'react'
import { AccordionItem } from '../components/ui/Accordion'
import { Card } from '../components/ui/Card'
import { getFaqs } from '../services/content'
import { getPageHeader } from '../services/cms-content'
import { useCmsStrings } from '../context/CmsStringsContext'
import type { Faq } from '../types/database'
import type { PageHeader } from '../types/cms-content'
import { CardSkeleton } from '../components/ui/LoadingSkeleton'

export function FAQPage() {
  const { t } = useCmsStrings()
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [pageHeader, setPageHeader] = useState<PageHeader | null>(null)

  useEffect(() => {
    loadFaqs()
  }, [])

  const loadFaqs = async () => {
    try {
      const [data, header] = await Promise.all([
        getFaqs(true),
        getPageHeader('faq'),
      ])
      setFaqs(data)
      if (header) setPageHeader(header)
    } catch {
      setFaqs([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {pageHeader && (
        <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                {pageHeader.title}
              </h1>
              {pageHeader.subtitle && (
                <p className="text-base sm:text-lg md:text-xl text-gray-600">
                  {pageHeader.subtitle}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="bordered" padding="lg">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : faqs.length > 0 ? (
              faqs.map((faq, idx) => (
                <AccordionItem key={faq.id} title={faq.question} defaultOpen={idx === 0}>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </AccordionItem>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">{t('faq_empty')}</div>
            )}
          </Card>
        </div>
      </section>
    </div>
  )
}
