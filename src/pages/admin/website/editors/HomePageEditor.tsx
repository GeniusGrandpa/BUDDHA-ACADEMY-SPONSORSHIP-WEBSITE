import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { FormSkeleton } from '../../../../components/ui/LoadingSkeleton'
import { getHeroContent, upsertHeroContent, getSectionContent, upsertSectionContent } from '../../../../services/cms-content'
import { PreviewModal } from '../shared/PreviewModal'
import { PublishToggle } from '../shared/PublishToggle'
import { SaveButton } from '../shared/SaveButton'
import toast from 'react-hot-toast'
import type { HeroContent } from '../../../../types/cms-content'

export function HomePageEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [published, setPublished] = useState(true)

  const [hero, setHero] = useState<HeroContent>({
    id: '', title: '', highlight: '', description: '', background_image: '',
    overlay_color: 'bg-gradient-to-r from-stone-950/80 via-stone-950/60 to-transparent',
    overlay_opacity: 1, cta_primary_text: '', cta_primary_link: '',
    cta_secondary_text: '', cta_secondary_link: '', statistics: [],
    badges: [], layout: '', display_order: 0, is_visible: true,
    animation_enabled: true, updated_by: null, created_at: '', updated_at: '',
  })
  const [welcome, setWelcome] = useState({ title: '', content: '' })
  const [statsTitle, setStatsTitle] = useState('')
  const [featuredTitle, setFeaturedTitle] = useState('')
  const [testimonialTitle, setTestimonialTitle] = useState('')
  const [donationCta, setDonationCta] = useState({ title: '', description: '', button_text: '', button_link: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [heroData, welcomeData, statsData, featuredData, testimonialData, ctaData] = await Promise.all([
        getHeroContent(),
        getSectionContent('welcome'),
        getSectionContent('stats'),
        getSectionContent('featured_students'),
        getSectionContent('testimonials'),
        getSectionContent('donation_cta'),
      ])
      if (heroData) setHero(heroData)
      if (welcomeData?.content) {
        const c = welcomeData.content as { title?: string; content?: string }
        setWelcome({ title: c.title || '', content: c.content || '' })
      }
      if (statsData?.content) setStatsTitle((statsData.content as { title?: string })?.title || '')
      if (featuredData?.content) setFeaturedTitle((featuredData.content as { title?: string })?.title || '')
      if (testimonialData?.content) setTestimonialTitle((testimonialData.content as { title?: string })?.title || '')
      if (ctaData?.content) {
        const c = ctaData.content as { title?: string; description?: string; button_text?: string; button_link?: string }
        setDonationCta({ title: c.title || '', description: c.description || '', button_text: c.button_text || '', button_link: c.button_link || '' })
      }
    } catch {
      toast.error('Failed to load homepage content')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        upsertHeroContent({ ...hero } as never),
        upsertSectionContent({ section_key: 'welcome', title: 'Welcome', content: welcome } as never),
        upsertSectionContent({ section_key: 'stats', title: 'Statistics', content: { title: statsTitle } } as never),
        upsertSectionContent({ section_key: 'featured_students', title: 'Featured Students', content: { title: featuredTitle } } as never),
        upsertSectionContent({ section_key: 'testimonials', title: 'Testimonials', content: { title: testimonialTitle } } as never),
        upsertSectionContent({ section_key: 'donation_cta', title: 'Donation CTA', content: donationCta } as never),
      ])
      toast.success('Home page published')
      setPublished(true)
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <FormSkeleton />

  const statPlaceholder = hero.statistics || []
  const handleStatChange = (idx: number, field: string, value: string) => {
    const stats = [...statPlaceholder]
    stats[idx] = { ...stats[idx], [field]: value }
    setHero({ ...hero, statistics: stats })
  }
  const addStat = () => setHero({ ...hero, statistics: [...statPlaceholder, { value: '', label: '' }] })
  const removeStat = (idx: number) => setHero({ ...hero, statistics: statPlaceholder.filter((_, i) => i !== idx) })

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Home Page</h1>
          <p className="text-gray-500 mt-1">Edit your homepage content — hero, welcome text, statistics, and calls to action</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPreviewOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-white border border-gray-200 hover:border-amber-300 text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" /></svg>
            Preview
          </button>
          <PublishToggle published={published} saving={saving} onToggle={() => handleSave()} />
          <SaveButton saving={saving} onClick={handleSave} />
        </div>
      </div>

      <SectionCard title="Hero Banner" description="The main banner visitors see at the top of your homepage">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Main Title" value={hero.title} onChange={v => setHero({ ...hero, title: v })} />
          <Field label="Highlight Text" value={hero.highlight || ''} onChange={v => setHero({ ...hero, highlight: v })} />
          <div className="md:col-span-2">
            <Field label="Description" value={hero.description || ''} onChange={v => setHero({ ...hero, description: v })} textarea />
          </div>
          <Field label="Background Image URL" value={hero.background_image || ''} onChange={v => setHero({ ...hero, background_image: v })} />
          <Field label="Primary CTA Text" value={hero.cta_primary_text || ''} onChange={v => setHero({ ...hero, cta_primary_text: v })} />
          <Field label="Primary CTA Link" value={hero.cta_primary_link || ''} onChange={v => setHero({ ...hero, cta_primary_link: v })} />
          <Field label="Secondary CTA Text" value={hero.cta_secondary_text || ''} onChange={v => setHero({ ...hero, cta_secondary_text: v })} />
          <Field label="Secondary CTA Link" value={hero.cta_secondary_link || ''} onChange={v => setHero({ ...hero, cta_secondary_link: v })} />
        </div>
      </SectionCard>

      <SectionCard title="Statistics" description="Impact numbers displayed on the hero section">
        <Field label="Section Title" value={statsTitle} onChange={setStatsTitle} />
        <div className="space-y-3 mt-4">
          {statPlaceholder.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-sm font-medium text-gray-500 w-8">{idx + 1}.</span>
              <input type="text" value={stat.value} onChange={e => handleStatChange(idx, 'value', e.target.value)} placeholder="Value (e.g. 49+)"
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
              <input type="text" value={stat.label} onChange={e => handleStatChange(idx, 'label', e.target.value)} placeholder="Label (e.g. Years)"
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
              <button onClick={() => removeStat(idx)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500" aria-label="Remove stat">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
          <button onClick={addStat} className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add statistic
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Welcome Section" description="The about/intro section on your homepage">
        <Field label="Title" value={welcome.title} onChange={v => setWelcome({ ...welcome, title: v })} />
        <Field label="Content" value={welcome.content} onChange={v => setWelcome({ ...welcome, content: v })} textarea />
      </SectionCard>

      <SectionCard title="Featured Students Section" description="Title for the featured students section">
        <Field label="Section Title" value={featuredTitle} onChange={setFeaturedTitle} />
      </SectionCard>

      <SectionCard title="Testimonials Section" description="Title for the testimonials section">
        <Field label="Section Title" value={testimonialTitle} onChange={setTestimonialTitle} />
      </SectionCard>

      <SectionCard title="Donation Call to Action" description="The donation prompt section at the bottom of your homepage">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Title" value={donationCta.title} onChange={v => setDonationCta({ ...donationCta, title: v })} />
          </div>
          <div className="md:col-span-2">
            <Field label="Description" value={donationCta.description} onChange={v => setDonationCta({ ...donationCta, description: v })} textarea />
          </div>
          <Field label="Button Text" value={donationCta.button_text} onChange={v => setDonationCta({ ...donationCta, button_text: v })} />
          <Field label="Button Link" value={donationCta.button_link} onChange={v => setDonationCta({ ...donationCta, button_link: v })} />
        </div>
      </SectionCard>

      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} url="/" title="Home Page" />
    </div>
  )
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-vertical" />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20" />
      )}
    </div>
  )
}

function SectionCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  )
}
