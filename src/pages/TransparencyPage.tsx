import { useEffect, useState } from 'react'
import { getTransparencyContent, getPageHeader } from '../services/cms-content'
import { useCmsStrings } from '../context/CmsStringsContext'
import type { TransparencyContent, PageHeader } from '../types/cms-content'

export function TransparencyPage() {
  const { t } = useCmsStrings()
  const [content, setContent] = useState<TransparencyContent | null>(null)
  const [header, setHeader] = useState<Pick<PageHeader, 'title' | 'subtitle'> | null>(null)

  useEffect(() => {
    Promise.all([
      getTransparencyContent(),
      getPageHeader('transparency'),
    ]).then(([tc, hdr]) => {
      if (tc) setContent(tc)
      if (hdr) setHeader(hdr)
    }).catch(() => {})
  }, [])

  const allocationData = content?.allocation_data || []
  const verificationSteps = content?.verification_steps || []
  const impactReportItems = content?.impact_report_items || []

  return (
    <div>
      {(header || content) && (
        <section className="relative py-24 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              {header?.title && <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{header.title}</h1>}
              {header?.subtitle && <p className="text-xl text-gray-600">{header.subtitle}</p>}
            </div>
          </div>
        </section>
      )}

      {allocationData.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              {content?.allocation_title && <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{content.allocation_title}</h2>}
              {content?.allocation_description && <p className="text-gray-600 max-w-2xl mx-auto">{content.allocation_description}</p>}
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div className="relative w-64 h-64 mx-auto lg:mx-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {allocationData.map((item, idx) => {
                    const total = allocationData.reduce((s, i) => s + i.value, 0)
                    const offset = allocationData.slice(0, idx).reduce((s, i) => s + (i.value / total) * 100, 0)
                    const circumference = 2 * Math.PI * 40
                    const dashLength = (item.value / total) * circumference
                    return (
                      <circle key={idx}
                        cx="50" cy="50" r="40" fill="none"
                        stroke={item.color} strokeWidth="15"
                        strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                        strokeDashoffset={-offset / 100 * circumference}
                        className="transition-all duration-1000" />
                    )
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-gray-900">{allocationData.reduce((s, i) => s + i.value, 0)}%</span>
                  <span className="text-sm text-gray-500">{t('transparency_programs_label')}</span>
                </div>
              </div>

              <div className="space-y-6">
                {allocationData.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                        <h3 className="font-semibold text-gray-900">{item.label}</h3>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{item.value}%</span>
                    </div>
                    {item.description && <p className="text-gray-600 text-sm mt-2">{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {verificationSteps.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              {content?.verification_title && <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{content.verification_title}</h2>}
              {content?.verification_description && <p className="text-gray-600 max-w-2xl mx-auto">{content.verification_description}</p>}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {verificationSteps.map((step, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <span className="text-amber-600 font-bold">{idx + 1}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {impactReportItems.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              {content?.impact_report_title && <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{content.impact_report_title}</h2>}
              <div className="bg-gray-50 rounded-xl p-8">
                <p className="text-gray-600 mb-4">{t('transparency_report_heading')}</p>
                <ul className="space-y-3">
                  {impactReportItems.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-2 gap-8">
          {content?.receipt_policy_text && (
            <div className="bg-gray-50 rounded-xl p-8">
              {content.receipt_policy_title && <h3 className="text-xl font-bold text-gray-900 mb-4">{content.receipt_policy_title}</h3>}
              <p className="text-gray-600 text-sm">{content.receipt_policy_text}</p>
            </div>
          )}
          {content?.donor_privacy_text && (
            <div className="bg-gray-50 rounded-xl p-8">
              {content.donor_privacy_title && <h3 className="text-xl font-bold text-gray-900 mb-4">{content.donor_privacy_title}</h3>}
              <p className="text-gray-600 text-sm">{content.donor_privacy_text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
