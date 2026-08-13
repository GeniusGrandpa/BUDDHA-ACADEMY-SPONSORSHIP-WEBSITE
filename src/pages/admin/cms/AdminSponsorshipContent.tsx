import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { upsertSponsorshipContent, db } from '../../../services/cms-content'
import type { SponsorshipStep, SponsorshipBenefit } from '../../../types/cms-content'
import { FormSkeleton } from '../../../components/ui/LoadingSkeleton'

export function AdminSponsorshipContent() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contentId, setContentId] = useState<string | undefined>()
  const [heroTitle, setHeroTitle] = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')
  const [steps, setSteps] = useState<SponsorshipStep[]>([])
  const [benefits, setBenefits] = useState<SponsorshipBenefit[]>([])
  const [ctaTitle, setCtaTitle] = useState('')
  const [ctaDescription, setCtaDescription] = useState('')
  const [ctaButtonText, setCtaButtonText] = useState('')
  const [ctaButtonLink, setCtaButtonLink] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await db('sponsorship_content')
        .select('*').order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (data) {
        const d = data as {
          id?: string
          hero_title?: string | null
          hero_subtitle?: string | null
          steps?: SponsorshipStep[] | null
          benefits?: SponsorshipBenefit[] | null
          cta_title?: string | null
          cta_description?: string | null
          cta_button_text?: string | null
          cta_button_link?: string | null
        }
        setContentId(d.id)
        setHeroTitle(d.hero_title || '')
        setHeroSubtitle(d.hero_subtitle || '')
        setSteps(d.steps || [])
        setBenefits(d.benefits || [])
        setCtaTitle(d.cta_title || '')
        setCtaDescription(d.cta_description || '')
        setCtaButtonText(d.cta_button_text || '')
        setCtaButtonLink(d.cta_button_link || '')
      }
    } catch { toast.error('Failed to load sponsorship content') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertSponsorshipContent({
        id: contentId, hero_title: heroTitle, hero_subtitle: heroSubtitle,
        steps, benefits,
        cta_title: ctaTitle, cta_description: ctaDescription,
        cta_button_text: ctaButtonText, cta_button_link: ctaButtonLink,
        is_published: true,
      })
      toast.success('Sponsorship content saved')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  if (loading) return <FormSkeleton />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sponsorship Page Content</h1>
          <p className="text-gray-500 mt-1">Manage sponsorship steps, benefits & call-to-action</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Hero Title</label>
              <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)}
                placeholder="Sponsorship hero title" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Hero Subtitle</label>
              <textarea value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} rows={2}
                placeholder="Sponsorship hero subtitle" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Steps</h2>
            <button onClick={() => setSteps([...steps, { num: String(steps.length + 1), title: '', desc: '' }])}
              className="px-3 py-1.5 rounded-lg text-xs bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">+ Add Step</button>
          </div>
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <input value={step.num} onChange={e => {
                  const s = [...steps]; s[idx] = { ...s[idx], num: e.target.value }; setSteps(s)
                }} placeholder="#" className="w-12 bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-700 focus:border-amber-500/50 text-center" />
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <input value={step.title} onChange={e => {
                    const s = [...steps]; s[idx] = { ...s[idx], title: e.target.value }; setSteps(s)
                  }} placeholder="Step title" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                  <input value={step.desc} onChange={e => {
                    const s = [...steps]; s[idx] = { ...s[idx], desc: e.target.value }; setSteps(s)
                  }} placeholder="Step description" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                </div>
                <button onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                  className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 mt-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            {steps.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No steps yet.</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Benefits</h2>
            <button onClick={() => setBenefits([...benefits, { text: '' }])}
              className="px-3 py-1.5 rounded-lg text-xs bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">+ Add Benefit</button>
          </div>
          <div className="space-y-3">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-6">{idx + 1}.</span>
                <input value={benefit.text} onChange={e => {
                  const b = [...benefits]; b[idx] = { text: e.target.value }; setBenefits(b)
                }} placeholder="Benefit text"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                <button onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))}
                  className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            {benefits.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No benefits yet.</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Call to Action</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">CTA Title</label>
              <input value={ctaTitle} onChange={e => setCtaTitle(e.target.value)}
                placeholder="Call to action title" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">CTA Description</label>
              <textarea value={ctaDescription} onChange={e => setCtaDescription(e.target.value)} rows={2}
                placeholder="Call to action description" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Button Text</label>
                <input value={ctaButtonText} onChange={e => setCtaButtonText(e.target.value)}
                  placeholder="e.g. Sponsor Now" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Button Link</label>
                <input value={ctaButtonLink} onChange={e => setCtaButtonLink(e.target.value)}
                  placeholder="/sponsorship/apply" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
