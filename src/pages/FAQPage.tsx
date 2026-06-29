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
      <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              {pageHeader?.title || 'Frequently Asked Questions'}
            </h1>
            {pageHeader?.subtitle && (
              <p className="text-base sm:text-lg md:text-xl text-gray-600">
                {pageHeader.subtitle}
              </p>
            )}
          </div>
        </div>
      </section>

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
              <>
                <AccordionItem title="What is the minimum sponsorship amount?" defaultOpen={true}>
                  <p className="text-gray-600 leading-relaxed">The minimum sponsorship amount is $30 per month, which covers tuition, books, uniforms, daily meals, and basic healthcare for a child.</p>
                </AccordionItem>
                <AccordionItem title="How are my donations used?">
                  <p className="text-gray-600 leading-relaxed">100% of your donation goes directly to programs. 70% covers children's education and welfare, 20% supports teachers and staff, and 10% goes to facilities and operations.</p>
                </AccordionItem>
                <AccordionItem title="Can I choose which child to sponsor?">
                  <p className="text-gray-600 leading-relaxed">Yes! You can browse profiles of children waiting for sponsors and choose a child whose story resonates with you. We'll connect you with your sponsored child.</p>
                </AccordionItem>
                <AccordionItem title="How will I receive updates about my sponsored child?">
                  <p className="text-gray-600 leading-relaxed">You'll receive regular updates including progress reports, photos, and letters from your sponsored child. You can also exchange messages and build a meaningful connection.</p>
                </AccordionItem>
                <AccordionItem title="Is my donation tax-deductible?">
                  <p className="text-gray-600 leading-relaxed">Yes. All donations are tax-deductible. You will receive an official receipt via email immediately after donation, and annual consolidated receipts are provided for tax purposes.</p>
                </AccordionItem>
              </>
            )}
          </Card>
        </div>
      </section>
    </div>
  )
}
