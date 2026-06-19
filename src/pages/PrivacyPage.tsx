import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { getPageBySlug } from '../services/content'

interface PrivacyContent {
  title?: string
  lastUpdated?: string
  body?: string
}

export function PrivacyPage() {
  const [content, setContent] = useState<PrivacyContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const page = await getPageBySlug('privacy')
      if (page?.content) {
        setContent(page.content as PrivacyContent)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const title = content?.title || 'Privacy Policy'
  const lastUpdated = content?.lastUpdated || 'January 2025'
  const body = content?.body || ''

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="relative py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {title}
            </h1>
            <p className="text-xl text-gray-600">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="bordered" padding="lg" className="prose prose-amber max-w-none">
            {body ? (
              body.split('\n').map((para, idx) => <p key={idx} className="text-gray-600 mb-4">{para}</p>)
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-600 mb-6">
                  Buddha Academy ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                <p className="text-gray-600 mb-4">We may collect information about you when you:</p>
                <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                  <li>Register for an account</li>
                  <li>Make a donation or pledge</li>
                  <li>Sponsor a child</li>
                  <li>Submit a contact form</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Apply to volunteer</li>
                </ul>
                <p className="text-gray-600 mb-6">
                  The information we collect may include your name, email address, phone number, country of residence, payment information, and any other information you voluntarily provide.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                <p className="text-gray-600 mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                  <li>Process your donations and sponsorships</li>
                  <li>Provide updates on your sponsored child</li>
                  <li>Send you important communications about our programs</li>
                  <li>Respond to your inquiries and requests</li>
                  <li>Improve our website and services</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
                <p className="text-gray-600 mb-6">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business, but they are obligated to keep your information confidential.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-600 mb-6">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                <p className="text-gray-600 mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Object to processing of your information</li>
                  <li>Request data portability</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
                <p className="text-gray-600 mb-6">
                  Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600">
                  If you have questions about this Privacy Policy, please contact us at:
                  <br /><br />
                  Buddha Academy<br />
                  Boudha, Kathmandu, Nepal<br />
                  Email: info@buddhaacademy.edu.np<br />
                  Phone: +977 1 1234567
                </p>
              </>
            )}
          </Card>
        </div>
      </section>
    </div>
  )
}
