import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { upsertDesignSettings } from '../../../services/design'
import type { DesignComponentStyles } from '../../../types/design'
import toast from 'react-hot-toast'

export function AdminComponentsPage() {
  const { componentStyles: themeStyles, refreshTheme } = useTheme()
  const [form, setForm] = useState<DesignComponentStyles>(themeStyles)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setForm(themeStyles) }, [themeStyles])

  const handleChange = (key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertDesignSettings({ component_styles: form })
      await refreshTheme()
      toast.success('Component styles saved! Use Publish to make live.')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Component Styles</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Style variants for every reusable block</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Draft'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Hero Block</h3>
          <label className="block">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Default Style</span>
            <select value={form.hero_default_style} onChange={e => handleChange('hero_default_style', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]">
              <option value="gradient">Gradient</option>
              <option value="solid">Solid Color</option>
              <option value="image">Image Background</option>
              <option value="minimal">Minimal</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Default Background</span>
            <input type="text" value={form.hero_default_bg} onChange={e => handleChange('hero_default_bg', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)] font-mono" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-primary)]">Overlay</span>
            <button
              onClick={() => handleChange('hero_default_overlay', !form.hero_default_overlay)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.hero_default_overlay ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.hero_default_overlay ? 'translate-x-5' : ''}`} />
            </button>
          </label>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Card & CTA</h3>
          <label className="block">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Card Default Style</span>
            <select value={form.card_default_style} onChange={e => handleChange('card_default_style', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]">
              <option value="elevated">Elevated</option>
              <option value="outlined">Outlined</option>
              <option value="flat">Flat</option>
              <option value="glass">Glass</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Card Border Radius (rem)</span>
            <input type="number" value={form.card_default_border_radius} onChange={e => handleChange('card_default_border_radius', e.target.value)} step="0.125" min="0" max="2"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">CTA Default Style</span>
            <select value={form.cta_default_style} onChange={e => handleChange('cta_default_style', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]">
              <option value="gradient">Gradient</option>
              <option value="solid">Solid</option>
              <option value="outlined">Outlined</option>
              <option value="minimal">Minimal</option>
            </select>
          </label>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Banner & Layout</h3>
          <label className="block">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Banner Default Style</span>
            <select value={form.banner_default_style} onChange={e => handleChange('banner_default_style', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]">
              <option value="default">Default</option>
              <option value="compact">Compact</option>
              <option value="hero">Hero Style</option>
              <option value="minimal">Minimal</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Testimonial Layout</span>
            <select value={form.testimonial_layout} onChange={e => handleChange('testimonial_layout', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]">
              <option value="grid">Grid</option>
              <option value="carousel">Carousel</option>
              <option value="list">List</option>
              <option value="masonry">Masonry</option>
            </select>
          </label>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Spotlight & Donations</h3>
          <label className="block">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Student Spotlight Layout</span>
            <select value={form.student_spotlight_layout} onChange={e => handleChange('student_spotlight_layout', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]">
              <option value="grid">Grid</option>
              <option value="carousel">Carousel</option>
              <option value="list">List</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Donation Section Theme</span>
            <select value={form.donation_section_theme} onChange={e => handleChange('donation_section_theme', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]">
              <option value="warm">Warm (Default)</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="brand">Brand</option>
              <option value="minimal">Minimal</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  )
}
