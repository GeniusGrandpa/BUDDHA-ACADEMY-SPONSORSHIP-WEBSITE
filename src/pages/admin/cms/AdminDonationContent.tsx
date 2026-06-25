import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { upsertDonationContent, db } from '../../../services/cms-content'
import type { ImpactCard, ProcessStep } from '../../../types/cms-content'
import { FormSkeleton } from '../../../components/ui/LoadingSkeleton'

export function AdminDonationContent() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contentId, setContentId] = useState<string | undefined>()
  const [heroTitle, setHeroTitle] = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')
  const [currencyLabel, setCurrencyLabel] = useState('$')
  const [impactCards, setImpactCards] = useState<ImpactCard[]>([])
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await db('donation_content')
        .select('*').order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (data) {
        setContentId(data.id)
        setHeroTitle(data.hero_title || '')
        setHeroSubtitle(data.hero_subtitle || '')
        setCurrencyLabel(data.currency_label || '$')
        setImpactCards(data.impact_cards || [])
        setProcessSteps(data.process_steps || [])
      }
    } catch { toast.error('Failed to load donation content') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertDonationContent({
        id: contentId, hero_title: heroTitle, hero_subtitle: heroSubtitle,
        currency_label: currencyLabel, impact_cards: impactCards,
        process_steps: processSteps, is_published: true,
      })
      toast.success('Donation content saved')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const updateCard = (idx: number, field: keyof ImpactCard, value: string | number) => {
    const cards = [...impactCards]
    cards[idx] = { ...cards[idx], [field]: field === 'amount' ? Number(value) : value }
    setImpactCards(cards)
  }

  const updateStep = (idx: number, field: keyof ProcessStep, value: string) => {
    const steps = [...processSteps]
    steps[idx] = { ...steps[idx], [field]: value }
    setProcessSteps(steps)
  }

  if (loading) return <FormSkeleton />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donation Page Content</h1>
          <p className="text-gray-500 mt-1">Manage donation page hero, currency & impact content</p>
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
                placeholder="Donation hero title" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Hero Subtitle</label>
              <textarea value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} rows={2}
                placeholder="Donation hero subtitle" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Currency Label</label>
              <input value={currencyLabel} onChange={e => setCurrencyLabel(e.target.value)} placeholder="$"
                className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Impact Cards</h2>
            <button onClick={() => setImpactCards([...impactCards, { amount: 0, label: '', description: '', icon: 'Heart' }])}
              className="px-3 py-1.5 rounded-lg text-xs bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">+ Add Card</button>
          </div>
          <div className="space-y-4">
            {impactCards.map((card, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Card {idx + 1}</span>
                  <button onClick={() => setImpactCards(impactCards.filter((_, i) => i !== idx))}
                    className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
                    <input type="number" value={card.amount} onChange={e => updateCard(idx, 'amount', e.target.value)}
                      placeholder="0" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                    <input value={card.label} onChange={e => updateCard(idx, 'label', e.target.value)}
                      placeholder="e.g. Monthly Donors" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <input value={card.description} onChange={e => updateCard(idx, 'description', e.target.value)}
                      placeholder="Card description" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                    <input value={card.icon} onChange={e => updateCard(idx, 'icon', e.target.value)}
                      placeholder="Heart" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                  </div>
                </div>
              </div>
            ))}
            {impactCards.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No impact cards yet.</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Process Steps</h2>
            <button onClick={() => setProcessSteps([...processSteps, { title: '', desc: '' }])}
              className="px-3 py-1.5 rounded-lg text-xs bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">+ Add Step</button>
          </div>
          <div className="space-y-3">
            {processSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm font-medium text-gray-500 mt-2 w-6">{idx + 1}.</span>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <input value={step.title} onChange={e => updateStep(idx, 'title', e.target.value)}
                    placeholder="Step title" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                  <input value={step.desc} onChange={e => updateStep(idx, 'desc', e.target.value)}
                    placeholder="Step description" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                </div>
                <button onClick={() => setProcessSteps(processSteps.filter((_, i) => i !== idx))}
                  className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 mt-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            {processSteps.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No process steps yet.</p>}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
