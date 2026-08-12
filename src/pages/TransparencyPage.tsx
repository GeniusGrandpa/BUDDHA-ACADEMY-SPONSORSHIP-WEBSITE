import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Tr } from '../components/Translated'
import { useLanguage } from '../context/LanguageContext'
import { useCmsStrings } from '../context/CmsStringsContext'
import { getPageBySlug } from '../services/content'
import type { TransparencyContent } from '../types/cms'

const ALLOCATION_COLORS = ['#f26b1d', '#c49a4e', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

function getAllocationDescription(name: string, t: (key: string) => string): string {
  const descriptions: Record<string, string> = {
    "Children's Education & Welfare": t('transparency_allocation_children_desc'),
    'Staff & Operations': t('transparency_allocation_facilities_desc'),
  }
  return descriptions[name] || t('transparency_funds_allocated') + ' ' + name
}

const DEFAULT_CONTENT: TransparencyContent = {
  title: 'Transparency & Accountability',
  subtitle: 'Built on Trust',
  description: 'We are committed to complete transparency in how we use donor funds and the impact we create together.',
  allocationData: [
    { name: "Children's Education & Welfare", value: 70 },
    { name: 'Staff & Operations', value: 30 },
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
  'transparency_verification_1',
  'transparency_verification_2',
  'transparency_verification_3',
  'transparency_verification_4',
  'transparency_verification_5',
]

const IMPACT_REPORT_ITEMS = [
  'transparency_impact_students',
  'transparency_impact_academic',
  'transparency_impact_financial',
  'transparency_impact_stories',
  'transparency_impact_plans',
]

const IMPACT_REPORT_HEADING = 'transparency_annual_report_heading'
const IMPACT_REPORT_INTRO = 'transparency_annual_report_intro'
const RECEIPT_HEADING = 'transparency_receipt_heading'
const PRIVACY_HEADING = 'transparency_privacy_heading'
const IMPACT_HEADING = 'transparency_impact_heading'

const RECEIPT_POLICY = 'transparency_receipt_policy'
const DONOR_PRIVACY = 'transparency_donor_privacy'

export function TransparencyPage() {
  const { language } = useLanguage()
  const { t } = useCmsStrings()
  const [content, setContent] = useState<TransparencyContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let cancelled = false
    loadContent(cancelled)
    return () => { cancelled = true }
  }, [language])

  const loadContent = async (cancelled?: boolean) => {
    try {
      const page = await getPageBySlug('transparency')
      if (cancelled) return
      if (page?.content) {
        setContent(page.content as unknown as TransparencyContent)
      }
    } catch {}
    if (!cancelled) setLoading(false)
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4"><Tr text={t('transparency_donations_used')} /></h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              <Tr text={t('transparency_donation_description')} />
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
                <span className="text-sm text-gray-500"><Tr text={t('transparency_to_programs')} /></span>
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
                    <Tr text={getAllocationDescription(item.name, t)} />
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4"><Tr text={t('transparency_verification_heading')} /></h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              <Tr text={t('transparency_verification_description')} />
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
                <p className="text-gray-600 text-sm leading-relaxed"><Tr text={t(step)} /></p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {data.impactStats.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4"><Tr text={t(IMPACT_HEADING)} /></h2>
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"><Tr text={t(IMPACT_REPORT_HEADING)} /></h2>
            <div className="bg-gray-50 rounded-xl p-6 sm:p-8 border border-amber-100">
              <p className="text-gray-600 text-sm sm:text-base mb-4 font-medium"><Tr text={t(IMPACT_REPORT_INTRO)} /></p>
              <ul className="space-y-3">
                {IMPACT_REPORT_ITEMS.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm sm:text-base"><Tr text={t(item)} /></span>
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
              <Tr text={t(RECEIPT_HEADING)} />
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed"><Tr text={t(RECEIPT_POLICY)} /></p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 sm:p-8 border border-amber-200">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <Tr text={t(PRIVACY_HEADING)} />
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed"><Tr text={t(DONOR_PRIVACY)} /></p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
