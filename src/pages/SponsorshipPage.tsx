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

  function Node({ item, idx }: { item: { title: string; desc: string }; idx: number }) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-sm sm:text-base font-bold shadow-md ring-4 ring-amber-100 mb-2">
          {idx + 1}
        </div>
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 text-center">{item.title}</h3>
        <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-0.5 leading-relaxed max-w-[120px] sm:max-w-[140px]">{item.desc}</p>
      </div>
    )
  }

  function VLine() {
    return <div className="w-0.5 h-6 sm:h-8 bg-gradient-to-b from-amber-300 to-amber-400/60" />
  }

  return (
    <div className="flex flex-col items-center">
      <Node item={items[0]} idx={0} />
      <VLine />
      <Node item={items[1]} idx={1} />
      <VLine />
      <Node item={items[2]} idx={2} />
      <VLine />
      <Node item={items[3]} idx={3} />

      <div className="w-full max-w-[280px] sm:max-w-sm">
        <svg className="w-full h-8 sm:h-10" viewBox="0 0 300 40" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
          <line x1="150" y1="0" x2="150" y2="15" />
          <line x1="75" y1="15" x2="225" y2="15" />
          <line x1="75" y1="15" x2="75" y2="40" />
          <line x1="225" y1="15" x2="225" y2="40" />
        </svg>

        <div className="flex gap-4 sm:gap-8 justify-center">
          <div className="flex-1"><Node item={items[4]} idx={4} /></div>
          <div className="flex-1"><Node item={items[5]} idx={5} /></div>
        </div>

        <svg className="w-full h-8 sm:h-10" viewBox="0 0 300 40" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
          <line x1="75" y1="0" x2="75" y2="25" />
          <line x1="225" y1="0" x2="225" y2="25" />
          <line x1="75" y1="25" x2="225" y2="25" />
          <line x1="150" y1="25" x2="150" y2="40" />
        </svg>
      </div>

      <Node item={items[6]} idx={6} />
      <VLine />
      <Node item={items[7]} idx={7} />
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
