import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { getPageBySlug } from '../services/content'

const STROKE_COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#F43F5E', '#14B8A6']
const BG_COLORS = ['bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-teal-500']

interface TransparencyContent {
  title?: string
  subtitle?: string
  description?: string
  allocationData?: { name: string; value: number }[]
  impactStats?: { label: string; value: string }[]
  trustMessage?: string
  verificationSteps?: string[]
}

export function TransparencyPage() {
  const [content, setContent] = useState<TransparencyContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const page = await getPageBySlug('transparency')
      if (page?.content) {
        setContent(page.content as TransparencyContent)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const title = content?.title || 'Transparency & Accountability'
  const desc = content?.description || 'We are committed to complete transparency in how we use donor funds and the impact we create.'
  const allocationData = content?.allocationData || [
    { name: "Children's Education & Welfare", value: 70 },
    { name: 'Teachers & Staff', value: 20 },
    { name: 'Facilities & Operations', value: 10 },
  ]
  const verificationSteps = content?.verificationSteps || [
    'Each student is personally interviewed and assessed by our team',
    'Family background verification through community leaders',
    'Financial need assessment and documentation',
    'Regular follow-up visits to ensure continued eligibility',
    'Progress monitoring and academic performance tracking',
  ]
  const impactReportItems = [
    'Number of students enrolled and graduated',
    'Academic performance statistics',
    'Financial statements breakdown',
    'Success stories and testimonials',
    'Future plans and goals',
  ]

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>

  const total = allocationData.reduce((sum, a) => sum + a.value, 0)
  const circumference = 251.33
  let offset = 0

  return (
    <div>
      <section className="relative py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {title}
            </h1>
            <p className="text-xl text-gray-600">
              {desc}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Your Donations Are Used
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every dollar you donate goes directly to supporting our students and their education.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <Card variant="bordered" padding="lg">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Fund Allocation</h3>
                </div>

                <div className="relative w-64 h-64 mx-auto mb-6">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="20" />
                    {allocationData.map((item, idx) => {
                      const dash = (item.value / total) * circumference
                      const dashOffset = -offset
                      offset += dash
                      return (
                        <circle key={idx} cx="50" cy="50" r="40" fill="none"
                          stroke={STROKE_COLORS[idx % STROKE_COLORS.length]}
                          strokeWidth="20"
                          strokeDasharray={`${dash} ${circumference}`}
                          strokeDashoffset={dashOffset} />
                      )
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{total}%</div>
                      <div className="text-sm text-gray-600">to Programs</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {allocationData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${BG_COLORS[idx % BG_COLORS.length]}`} />
                      <span className="flex-1 text-gray-700">{item.name}</span>
                      <span className="font-semibold text-gray-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              {allocationData.map((item, idx) => (
                <Card key={idx} variant="bordered" padding="lg" className={idx === 0 ? 'bg-amber-50' : ''}>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.name} ({item.value}%)</h3>
                    <p className="text-gray-700">
                      {idx === 0 && 'Covers tuition, books, uniforms, daily meals, healthcare, and residential care for students.'}
                      {idx === 1 && 'Salaries and training for dedicated teachers and support staff who care for our students.'}
                      {idx === 2 && 'Building maintenance, utilities, and administrative costs to keep our programs running.'}
                      {idx >= 3 && 'Supporting our mission through dedicated funding allocation.'}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Student Verification Process
              </h2>
              <p className="text-gray-600 mb-6">
                Every student at Buddha Academy goes through a rigorous verification process to ensure they genuinely need and deserve our support.
              </p>
              <ul className="space-y-3">
                {verificationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-600 text-sm font-medium">{idx + 1}</span>
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Card variant="bordered" padding="lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Annual Impact Report</h3>
                <p className="text-gray-600 mb-4">
                  We publish detailed annual reports showing:
                </p>
                <ul className="space-y-2 text-gray-700">
                  {impactReportItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {content?.trustMessage && (
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Card variant="bordered" padding="lg" className="bg-amber-50">
              <p className="text-gray-700 text-lg leading-relaxed italic">&ldquo;{content.trustMessage}&rdquo;</p>
            </Card>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card variant="bordered" padding="lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Receipt Policy</h3>
              <p className="text-gray-600">
                All donors receive official receipt confirmation for their contributions. Tax-deductible receipts are provided for eligible donations in countries where applicable.
              </p>
            </Card>

            <Card variant="bordered" padding="lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Donor Privacy</h3>
              <p className="text-gray-600">
                We never share donor information with third parties. Your personal and financial information is kept strictly confidential and secure.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
