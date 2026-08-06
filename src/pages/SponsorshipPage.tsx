import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { getSponsorshipContent, getSiteImage, getSectionContent } from '../services/cms-content'
import { useCmsStrings } from '../context/CmsStringsContext'
import { Tr } from '../components/Translated'
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
  const items = steps.length > 0 ? steps : TREE_STEPS

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--color-primary-light)] -translate-x-1/2 hidden md:block" />
      {items.map((item, i) => {
        const isLeft = i % 2 === 0
        return (
          <div key={i} className="relative flex items-center w-full max-w-3xl mb-4 sm:mb-5 last:mb-0">
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-3 h-3 rounded-full bg-[var(--color-primary)] border-2 border-[var(--color-primary-light)]/30" />
            </div>
            <div className={`w-full md:w-[calc(50%-1.5rem)] ${isLeft ? 'md:pr-6 md:text-right' : 'md:ml-auto md:pl-6'}`}>
              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border-accent)]/30 p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-[var(--color-primary-light)]/60 transition-all">
                <div className={`flex items-center gap-2 mb-1.5 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                  <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white text-xs sm:text-sm font-bold shrink-0">{i + 1}</span>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]"><Tr text={item.title} /></h3>
                </div>
                <p className={`text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed ${isLeft ? 'md:text-right' : ''}`}><Tr text={item.desc} /></p>
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
    getSponsorshipContent().then(d => {
      if (d) {
        setContent(d)
      } else {
        Promise.all([
          getSectionContent('sponsor_hero'),
          getSectionContent('sponsor_steps'),
          getSectionContent('sponsor_benefits'),
          getSectionContent('sponsor_cta'),
        ]).then(([hero, steps, benefits, cta]) => {
          if (hero || steps || benefits || cta) {
            setContent({
              hero_title: hero?.title || '',
              hero_subtitle: hero?.description || '',
              section_title: steps?.title || '',
              section_description: steps?.description || '',
              steps: (steps?.content as { steps?: { num: string; title: string; desc: string }[] })?.steps || [],
              benefits: (benefits?.content as { benefits?: { text: string }[] })?.benefits || [],
              cta_title: cta?.title || '',
              cta_description: cta?.description || '',
              cta_button_text: (cta?.content as { button_text?: string })?.button_text || '',
              cta_button_link: (cta?.content as { button_link?: string })?.button_link || '',
            } as SponsorshipContent)
          }
        }).catch(() => {})
      }
    }).catch(() => {})
    getSiteImage('sponsorship_hero').then(img => { if (img) setHeroImage(img.image_url) }).catch(() => {})
  }, [])

  const DEFAULT_STEPS = [
    { num: '1', title: 'Browse Profiles', desc: 'Review children waiting for sponsors and learn about their stories.' },
    { num: '2', title: 'Choose a Child', desc: 'Select a student whose story resonates with you.' },
    { num: '3', title: 'Make Your Pledge', desc: 'Complete the donation form securely online.' },
    { num: '4', title: 'We Connect', desc: 'We link you with your sponsored child and share their profile.' },
    { num: '5', title: 'Receive Updates', desc: 'Get progress reports, photos, and letters from your child.' },
    { num: '6', title: 'Track Impact', desc: 'See how your contribution is making a difference.' },
  ]

  const DEFAULT_BENEFITS = [
    { text: 'Direct, life-changing impact on a child\'s education' },
    { text: 'Regular updates with photos, letters, and progress reports' },
    { text: 'Opportunity to build a meaningful connection across cultures' },
    { text: 'Transparent reporting on how your funds are used' },
    { text: 'Tax-deductible donations with annual receipts' },
  ]

  const DEFAULT_HERO_TITLE = 'Sponsor a Child\'s Education'
  const DEFAULT_HERO_SUBTITLE = 'For just NPR 5,000 per month, you can transform a child\'s life through the power of education at Buddha Academy in Kathmandu.'
  const DEFAULT_SECTION_TITLE = 'How Sponsorship Works'
  const DEFAULT_SECTION_DESC = 'Our sponsorship program connects you directly with a child, creating a personal bond while funding their education.'
  const DEFAULT_CTA_TITLE = 'Ready to Change a Life?'
  const DEFAULT_CTA_DESC = 'Choose a child to sponsor and begin your journey of impact today.'
  const DEFAULT_CTA_BUTTON = 'Sponsor a Child'

  const steps = content?.steps && content.steps.length > 0 ? content.steps : DEFAULT_STEPS
  const benefits = content?.benefits && content.benefits.length > 0 ? content.benefits : DEFAULT_BENEFITS

  return (
    <div>
      <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4 sm:mb-6"><Tr text={content?.hero_title || DEFAULT_HERO_TITLE} /></h1>
            <p className="text-base sm:text-lg md:text-xl text-[var(--color-text-secondary)]"><Tr text={content?.hero_subtitle || DEFAULT_HERO_SUBTITLE} /></p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4"><Tr text={content?.section_title || DEFAULT_SECTION_TITLE} /></h2>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-2xl mx-auto"><Tr text={content?.section_description || DEFAULT_SECTION_DESC} /></p>
          </div>
            <SponsorshipTree steps={steps} />
          </div>
        </section>

      {benefits.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-24 bg-[var(--color-background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4 sm:mb-6">{t('sponsorship_impact_heading')}</h2>
                <p className="text-[var(--color-text-secondary)] mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  {t('sponsorship_impact_desc1')}
                </p>
                <p className="text-[var(--color-text-secondary)] mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                  {t('sponsorship_impact_desc2')}
                </p>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)] mb-4">{t('sponsorship_provides_heading')}</h3>
                <div className="space-y-3">
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                      <span className="text-[var(--color-text-secondary)] text-sm sm:text-base"><Tr text={benefit.text} /></span>
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
                    loading="lazy" decoding="async"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6"><Tr text={content?.cta_title || DEFAULT_CTA_TITLE} /></h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base"><Tr text={content?.cta_description || DEFAULT_CTA_DESC} /></p>
          <Link to={content?.cta_button_link || '/students'}>
            <Button size="lg" className="w-full sm:w-auto"><Tr text={content?.cta_button_text || DEFAULT_CTA_BUTTON} /> <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
