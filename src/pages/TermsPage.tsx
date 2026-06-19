import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { getPageBySlug } from '../services/content'

interface TermsContent {
  title?: string
  lastUpdated?: string
  body?: string
}

export function TermsPage() {
  const [content, setContent] = useState<TermsContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const page = await getPageBySlug('terms')
      if (page?.content) {
        setContent(page.content as TermsContent)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const title = content?.title || 'Terms & Conditions'
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
                <p className="text-gray-600 mb-6">
                  By accessing and using the Buddha Academy website, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our website.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Use License</h2>
                <p className="text-gray-600 mb-6">
                  Permission is granted to temporarily access the materials on Buddha Academy's website for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to decompile or reverse engineer any software on the website</li>
                  <li>Remove any copyright or other proprietary notations</li>
                  <li>Transfer the materials to another person or mirror the materials on any other server</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Donations and Sponsorships</h2>
                <p className="text-gray-600 mb-6">
                  All donations and sponsorships are voluntary contributions. We make every effort to ensure that donations are used as specified, but we reserve the right to allocate funds where most needed if circumstances require it.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">User Accounts</h2>
                <p className="text-gray-600 mb-6">
                  When you create an account, you must provide accurate information. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Prohibited Uses</h2>
                <p className="text-gray-600 mb-4">You may use our website only for lawful purposes. You agree not to:</p>
                <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                  <li>Use the site in any way that violates applicable laws or regulations</li>
                  <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the site</li>
                  <li>Impersonate any person or entity</li>
                  <li>Interfere with or disrupt the site's operation</li>
                  <li>Introduce viruses or other malicious code</li>
                  <li>Collect user information without consent</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimer</h2>
                <p className="text-gray-600 mb-6">
                  The materials on Buddha Academy's website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitations</h2>
                <p className="text-gray-600 mb-6">
                  In no event shall Buddha Academy or its suppliers be liable for any damages arising out of the use or inability to use the materials on our website, even if we have been notified of the possibility of such damage.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Accuracy of Materials</h2>
                <p className="text-gray-600 mb-6">
                  The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials are accurate, complete, or current.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Links to Other Sites</h2>
                <p className="text-gray-600 mb-6">
                  Our website may contain links to third-party websites. We have no control over the content, privacy policies, or practices of any third-party sites and assume no responsibility for them.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Modifications</h2>
                <p className="text-gray-600 mb-6">
                  We may revise these Terms and Conditions at any time without notice. By using this website, you agree to be bound by the current version of these Terms and Conditions.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
                <p className="text-gray-600 mb-6">
                  These Terms and Conditions are governed by and construed in accordance with the laws of Nepal, and you irrevocably submit to the exclusive jurisdiction of the courts in Nepal.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600">
                  If you have questions about these Terms and Conditions, please contact us at:
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
