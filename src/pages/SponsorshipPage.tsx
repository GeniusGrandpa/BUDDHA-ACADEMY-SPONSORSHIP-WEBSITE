import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { getSponsorshipContent, getSiteImage } from '../services/cms-content'
import { useCmsStrings } from '../context/CmsStringsContext'
import type { SponsorshipContent } from '../types/cms-content'

const fallbackContent = {
  hero_title: 'Sponsor a Child',
  hero_subtitle: 'Your monthly sponsorship provides education, meals, and care to a child in need.',
  section_title: 'How Sponsorship Works',
  section_description: 'Sponsoring a child at Buddha Academy is simple and transparent. Your contribution goes directly to education, care, and opportunity.',
  steps: [
    { num: '1', title: 'Choose a Child', desc: 'Browse our students and select someone you\'d like to sponsor.' },
    { num: '2', title: 'Set Your Contribution', desc: 'Choose a monthly amount that works for you. Every contribution makes a difference.' },
    { num: '3', title: 'Receive Updates', desc: 'Get regular updates on your sponsored child\'s progress, achievements, and milestones.' },
    { num: '4', title: 'Make a Lasting Impact', desc: 'Your support gives a child access to education, meals, healthcare, and a brighter future.' },
  ],
  benefits: [
    { text: 'Access to quality education and learning materials' },
    { text: 'Nutritious meals every school day' },
    { text: 'Regular health check-ups and medical care' },
    { text: 'A safe and nurturing environment' },
    { text: 'Opportunities for personal growth and development' },
  ],
  cta_title: 'Ready to Change a Life?',
  cta_description: 'Choose a child to sponsor and start making a difference today.',
  cta_button_text: 'Browse Students',
  cta_button_link: '/students',
} as SponsorshipContent

export function SponsorshipPage() {
  const { t } = useCmsStrings()
  const [content, setContent] = useState<SponsorshipContent>(fallbackContent)
  const [heroImage, setHeroImage] = useState('')

  useEffect(() => {
    Promise.all([loadContent(), loadHeroImage()])
  }, [])

  const loadContent = async () => {
    try {
      const data = await getSponsorshipContent()
      if (data) setContent(data)
    } catch {}
  }

  const loadHeroImage = async () => {
    try {
      const img = await getSiteImage('sponsorship_hero')
      if (img) setHeroImage(img.image_url)
    } catch {}
  }

  const steps = content?.steps || []
  const benefits = content?.benefits || []

  return (
    <div>
      {content?.hero_title && (
        <section className="relative py-24 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{content.hero_title}</h1>
              {content?.hero_subtitle && <p className="text-xl text-gray-600">{content.hero_subtitle}</p>}
            </div>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {(content?.section_title || content?.section_description) && (
              <div className="text-center mb-16">
                {content?.section_title && <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{content.section_title}</h2>}
                {content?.section_description && <p className="text-gray-600 max-w-2xl mx-auto">{content.section_description}</p>}
              </div>
            )}

            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-amber-200 hidden md:block" />
              <div className="space-y-12">
                {steps.map((step, idx) => {
                  const isLeft = idx % 2 === 0
                  return (
                    <div key={idx} className={`relative flex items-start gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      <div className={`flex-1 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                        <div className="bg-warm-50 rounded-2xl border border-amber-200 p-6 hover:shadow-lg hover:border-amber-300 transition-all">
                          <div className={`flex items-center gap-3 mb-3 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white text-sm font-bold flex-shrink-0">{step.num}</span>
                            <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
                          </div>
                          <p className={`text-gray-500 text-sm ${isLeft ? 'md:pl-0' : 'pl-0'}`}>{step.desc}</p>
                        </div>
                      </div>
                      <div className="hidden md:flex flex-col items-center flex-shrink-0 relative">
                        <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-amber-100 shadow" />
                      </div>
                      <div className="flex-1 hidden md:block" />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {benefits.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{t('sponsorship_impact_heading')}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t('sponsorship_impact_desc1')}
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {t('sponsorship_impact_desc2')}
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('sponsorship_provides_heading')}</h3>
                <div className="space-y-3">
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-600">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {heroImage && (
                <div>
                  <img
                    src={heroImage}
                    alt="Buddha Academy students"
                    className="rounded-2xl shadow-xl w-full object-cover h-[500px]"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {content?.cta_title && (
        <section className="py-24 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{content.cta_title}</h2>
            {content?.cta_description && (
              <p className="text-white/80 max-w-2xl mx-auto mb-8">{content.cta_description}</p>
            )}
            <Link to={content?.cta_button_link || '/students'}>
              <Button size="lg">{content?.cta_button_text || t('sponsorship_browse_button')} <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
