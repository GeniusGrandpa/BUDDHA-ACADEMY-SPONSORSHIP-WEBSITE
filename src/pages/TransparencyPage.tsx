import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Tr } from '../components/Translated'
import { getPageBySlug } from '../services/content'
import type { TransparencyContent } from '../types/cms'

const ALLOCATION_COLORS = ['#f26b1d', '#c49a4e', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
const ALLOCATION_DESCRIPTIONS: Record<string, string> = {
  "Children's Education & Welfare": 'Covers tuition, books, uniforms, daily meals, healthcare, and extracurricular activities.',
  'Teachers & Staff': 'Salaries and training for qualified teachers, administrative staff, and support personnel.',
  'Facilities & Operations': 'Building maintenance, utilities, transportation, and daily operational expenses.',
}

const DEFAULT_CONTENT: TransparencyContent = {
  title: 'Transparency & Accountability',
  subtitle: 'Built on Trust',
  description: 'We are committed to complete transparency in how we use donor funds and the impact we create together.',
  allocationData: [
    { name: "Children's Education & Welfare", value: 70 },
    { name: 'Teachers & Staff', value: 20 },
    { name: 'Facilities & Operations', value: 10 },
  ],
  impactStats: [
    { label: 'Students Supported', value: '250+' },
    { label: 'Active Sponsors', value: '180+' },
    { label: 'Years of Impact', value: '12+' },
    { label: 'Donation Efficiency', value: '95%' },
  ],
  trustMessage: 'Every dollar you donate goes directly to supporting our students and their education.',
}

const VERIFICATION_STEPS = [
  'Each student is personally interviewed by our admissions team',
  'Family background verification and financial need assessment',
  'Academic records and previous school performance review',
  'Regular follow-up visits and progress monitoring by coordinators',
  'Annual re-evaluation of sponsorship eligibility and needs',
]

const IMPACT_REPORT_ITEMS = [
  'Number of students enrolled and graduated',
  'Academic performance statistics',
  'Financial statements breakdown',
  'Success stories and testimonials',
  'Future plans and goals',
]

const RECEIPT_POLICY = 'All donors receive official receipt confirmation via email immediately after donation. Annual consolidated receipts are provided for tax purposes. Physical receipts available on request.'
const DONOR_PRIVACY = 'We never share donor information with third parties. Your personal data is protected and used only for communication regarding your donations and impact updates.'

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
        setContent(page.content as unknown as TransparencyContent)
      }
    } catch {}
    setLoading(false)
  }

  const data = content || DEFAULT_CONTENT
  const totalAllocation = data.allocationData.reduce((s, i) => s + i.value, 0)

  if (loading) return <div className="min-h-screen" />

  return (
    <div>
      <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6"><Tr text={data.title} /></h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600"><Tr text={data.description} /></p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4"><Tr text="How Your Donations Are Used" /></h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              <Tr text="Every dollar you donate goes directly to supporting our students and their education." />
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
            <div className="relative w-64 h-64 mx-auto lg:mx-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {data.allocationData.map((item, idx) => {
                  const offset = data.allocationData.slice(0, idx).reduce((s, i) => s + i.value, 0)
                  const circumference = 2 * Math.PI * 40
                  const dashLength = (item.value / totalAllocation) * circumference
                  return (
                    <circle key={idx}
                      cx="50" cy="50" r="40" fill="none"
                      stroke={ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length]} strokeWidth="15"
                      strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                      strokeDashoffset={-offset / 100 * circumference}
                      className="transition-all duration-1000" />
                  )
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-gray-900">100%</span>
                <span className="text-sm text-gray-500"><Tr text="to Programs" /></span>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {data.allocationData.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length] }} />
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900"><Tr text={item.name} /></h3>
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">{item.value}%</span>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm mt-2">
                    {ALLOCATION_DESCRIPTIONS[item.name]
                      ? <Tr text={ALLOCATION_DESCRIPTIONS[item.name]} />
                      : <Tr text={`Funds allocated to ${item.name}`} />}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4"><Tr text="Student Verification Process" /></h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              <Tr text="Every student at Buddha Academy goes through a rigorous verification process to ensure your sponsorship reaches those who need it most." />
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {VERIFICATION_STEPS.map((step, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-amber-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-sm">
                  <span className="text-white font-bold text-sm">{idx + 1}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed"><Tr text={step} /></p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {data.impactStats.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4"><Tr text="Our Impact" /></h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-center">
              {data.impactStats.map((stat, idx) => (
                <motion.div key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}>
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/80 text-xs sm:text-sm"><Tr text={stat.label} /></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"><Tr text="Annual Impact Report" /></h2>
            <div className="bg-gray-50 rounded-xl p-6 sm:p-8 border border-amber-100">
              <p className="text-gray-600 text-sm sm:text-base mb-4 font-medium"><Tr text="We publish detailed annual reports showing:" /></p>
              <ul className="space-y-3">
                {IMPACT_REPORT_ITEMS.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm sm:text-base"><Tr text={item} /></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-24">
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 sm:p-8 border border-amber-200">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <Tr text="Receipt Policy" />
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed"><Tr text={RECEIPT_POLICY} /></p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 sm:p-8 border border-amber-200">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <Tr text="Donor Privacy" />
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed"><Tr text={DONOR_PRIVACY} /></p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
