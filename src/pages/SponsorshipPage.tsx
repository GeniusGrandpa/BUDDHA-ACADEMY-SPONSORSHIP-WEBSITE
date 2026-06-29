import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { getSponsorshipContent, getSiteImage } from '../services/cms-content'
import { useCmsStrings } from '../context/CmsStringsContext'
import type { SponsorshipContent } from '../types/cms-content'

const TREE_STEPS = [
  { title: 'Browse Profiles', desc: 'Review children waiting for sponsors' },
  { title: 'Choose a Child', desc: 'Select a student to sponsor' },
  { title: 'Make Your Pledge', desc: 'Complete donation form securely' },
  { title: 'We Connect', desc: 'Link you with your sponsored child' },
  { title: 'Receive Updates', desc: 'Get progress reports & photos' },
  { title: 'Build Connection', desc: 'Exchange letters & messages' },
  { title: 'Track Impact', desc: 'See your contribution at work' },
  { title: 'Join Community', desc: 'Connect with other sponsors' },
]

function SponsorshipTree({ steps }: { steps: { title: string; desc: string }[] }) {
  const items = steps.length >= 8 ? steps : TREE_STEPS

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-amber-300 -translate-x-1/2 hidden md:block" />
      {items.map((item, i) => {
        const isLeft = i % 2 === 0
        return (
          <div key={i} className="relative flex items-center w-full max-w-3xl mb-4 sm:mb-5 last:mb-0">
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-amber-100" />
            </div>
            <div className={`w-full md:w-[calc(50%-1.5rem)] ${isLeft ? 'md:pr-6 md:text-right' : 'md:ml-auto md:pl-6'}`}>
              <div className="bg-white rounded-xl border border-amber-200 p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-amber-300 transition-all">
                <div className={`flex items-center gap-2 mb-1.5 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                  <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs sm:text-sm font-bold shrink-0">{i + 1}</span>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">{item.title}</h3>
                </div>
                <p className={`text-xs sm:text-sm text-gray-600 leading-relaxed ${isLeft ? 'md:text-right' : ''}`}>{item.desc}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function SponsorshipPage() {
  const { t } = useCmsStrings()
  const [content, setContent] = useState<SponsorshipContent | null>(null)
  const [heroImage, setHeroImage] = useState('')

  useEffect(() => {
    Promise.all([
      getSponsorshipContent().then(d => { if (d) setContent(d) }).catch(() => {}),
      getSiteImage('sponsorship_hero').then(img => { if (img) setHeroImage(img.image_url) }).catch(() => {}),
    ])
  }, [])

  const steps = content?.steps || []
  const benefits = content?.benefits || []

  return (
    <div>
      {content?.hero_title && (
        <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">{content.hero_title}</h1>
              {content?.hero_subtitle && <p className="text-base sm:text-lg md:text-xl text-gray-600">{content.hero_subtitle}</p>}
            </div>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {(content?.section_title || content?.section_description) && (
              <div className="text-center mb-10 sm:mb-14">
                {content?.section_title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">{content.section_title}</h2>}
                {content?.section_description && <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">{content.section_description}</p>}
              </div>
            )}
            <SponsorshipTree steps={steps} />
          </div>
        </section>
      )}

      {benefits.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">{t('sponsorship_impact_heading')}</h2>
                <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  {t('sponsorship_impact_desc1')}
                </p>
                <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                  {t('sponsorship_impact_desc2')}
                </p>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{t('sponsorship_provides_heading')}</h3>
                <div className="space-y-3">
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-600 text-sm sm:text-base">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {heroImage && (
                <div>
                  <img
                    src={heroImage}
                    alt="Buddha Academy students"
                    className="rounded-2xl shadow-xl w-full object-cover h-64 sm:h-80 lg:h-[500px]"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {content?.cta_title && (
        <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">{content.cta_title}</h2>
            {content?.cta_description && (
              <p className="text-white/80 max-w-2xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base">{content.cta_description}</p>
            )}
            <Link to={content?.cta_button_link || '/students'}>
              <Button size="lg" className="w-full sm:w-auto">{content?.cta_button_text || t('sponsorship_browse_button')} <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
