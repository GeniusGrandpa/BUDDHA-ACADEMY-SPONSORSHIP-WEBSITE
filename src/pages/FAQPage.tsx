import { useEffect, useState } from 'react'
import { AccordionItem } from '../components/ui/Accordion'
import { Card } from '../components/ui/Card'
import { getFaqs } from '../services/content'
import type { Faq } from '../types/database'

export function FAQPage() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFaqs()
  }, [])

  const loadFaqs = async () => {
    try {
      const data = await getFaqs(true)
      setFaqs(data)
    } catch {
      setFaqs([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <section className="relative py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600">
              Find answers to common questions about sponsorship, donations, and our programs.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="bordered" padding="lg">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading FAQs...</div>
            ) : faqs.length > 0 ? (
              faqs.map((faq, idx) => (
                <AccordionItem key={faq.id} title={faq.question} defaultOpen={idx === 0}>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </AccordionItem>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">No FAQs available at the moment.</div>
            )}
          </Card>
        </div>
      </section>
    </div>
  )
}
