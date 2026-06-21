import { useState, useEffect } from 'react'
import { Save, Eye } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { upsertDesignSettings } from '../../../services/design'
import type { DesignTypography } from '../../../types/design'
import toast from 'react-hot-toast'

const fontOptions = [
  'Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Nunito', 'Raleway', 'Playfair Display', 'Merriweather',
  'Source Sans Pro', 'Ubuntu', 'Noto Sans', 'Hind Siliguri',
]

function loadGoogleFont(font: string) {
  const id = 'dynamic-google-font'
  const existing = document.getElementById(id)
  if (existing) existing.remove()
  if (!font || font === 'Inter' || font === 'System') return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`
  document.head.appendChild(link)
}

function TypographyPreview({ typography }: { typography: DesignTypography }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4" style={{ fontFamily: `'${typography.body_font}', sans-serif` }}>
      <h1 style={{ fontFamily: `'${typography.heading_font}', sans-serif`, fontSize: `${typography.h1_size}rem`, fontWeight: Number(typography.heading_weight), letterSpacing: `${typography.heading_letter_spacing}em`, lineHeight: typography.heading_line_height }} className="text-[var(--color-text-primary)]">
        Heading 1 — The Quick Brown Fox
      </h1>
      <h2 style={{ fontFamily: `'${typography.heading_font}', sans-serif`, fontSize: `${typography.h2_size}rem`, fontWeight: Number(typography.heading_weight), letterSpacing: `${typography.heading_letter_spacing}em`, lineHeight: typography.heading_line_height }} className="text-[var(--color-text-primary)]">
        Heading 2 — Jumps Over The Lazy Dog
      </h2>
      <h3 style={{ fontFamily: `'${typography.heading_font}', sans-serif`, fontSize: `${typography.h3_size}rem`, fontWeight: Number(typography.heading_weight) }} className="text-[var(--color-text-primary)]">
        Heading 3 — A Quick Brown Fox
      </h3>
      <p style={{ fontSize: `${typography.body_size}rem`, fontWeight: Number(typography.body_weight), letterSpacing: `${typography.body_letter_spacing}em`, lineHeight: typography.body_line_height }} className="text-[var(--color-text-secondary)]">
        Body text — Buddha Academy is dedicated to providing quality education to children in need. 
        Through sponsorship and donations, we empower young minds to build a brighter future.
      </p>
      <p style={{ fontSize: `${typography.small_size}rem` }} className="text-[var(--color-text-muted)]">
        Small text — Additional details and metadata appear here.
      </p>
    </div>
  )
}

export function AdminTypographyPage() {
  const { typography: themeTypography, refreshTheme } = useTheme()
  const [form, setForm] = useState<DesignTypography>(themeTypography)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => { setForm(themeTypography) }, [themeTypography])

  useEffect(() => {
    loadGoogleFont(form.heading_font)
    if (form.body_font !== form.heading_font) loadGoogleFont(form.body_font)
  }, [form.heading_font, form.body_font])

  const handleChange = (key: keyof DesignTypography, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertDesignSettings({ typography: form })
      await refreshTheme()
      toast.success('Typography saved! Use Publish to make live.')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Typography</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Fonts, sizes, weights & spacing</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
            <Eye className="w-4 h-4" /> {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Typography Preview</h3>
          <TypographyPreview typography={form} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Font Selection</h3>

          <label className="block">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Heading Font</span>
            <select value={form.heading_font} onChange={e => { handleChange('heading_font', e.target.value); handleChange('heading_font_url', `https://fonts.googleapis.com/css2?family=${e.target.value.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`) }}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]">
              {fontOptions.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Body Font</span>
            <select value={form.body_font} onChange={e => { handleChange('body_font', e.target.value); handleChange('body_font_url', `https://fonts.googleapis.com/css2?family=${e.target.value.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`) }}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]">
              {fontOptions.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>

          <hr className="border-[var(--color-border)]" />

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Base Size (px)</span>
              <input type="number" value={form.base_size} onChange={e => handleChange('base_size', e.target.value)} min="12" max="24"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Scale Ratio</span>
              <input type="number" value={form.scale_ratio} onChange={e => handleChange('scale_ratio', e.target.value)} step="0.05" min="1" max="2"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]" />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Font Weights</h3>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Heading Weight</span>
              <select value={form.heading_weight} onChange={e => handleChange('heading_weight', e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]">
                {[300, 400, 500, 600, 700, 800].map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Body Weight</span>
              <select value={form.body_weight} onChange={e => handleChange('body_weight', e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]">
                {[300, 400, 500, 600, 700].map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </label>
          </div>

          <hr className="border-[var(--color-border)]" />

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Heading Letter Spacing (em)</span>
              <input type="number" value={form.heading_letter_spacing} onChange={e => handleChange('heading_letter_spacing', e.target.value)} step="0.005" min="-0.1" max="0.1"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Body Letter Spacing (em)</span>
              <input type="number" value={form.body_letter_spacing} onChange={e => handleChange('body_letter_spacing', e.target.value)} step="0.005" min="-0.05" max="0.1"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Heading Line Height</span>
              <input type="number" value={form.heading_line_height} onChange={e => handleChange('heading_line_height', e.target.value)} step="0.1" min="1" max="2"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Body Line Height</span>
              <input type="number" value={form.body_line_height} onChange={e => handleChange('body_line_height', e.target.value)} step="0.1" min="1" max="2.5"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Heading Transform</span>
              <select value={form.text_transform_heading} onChange={e => handleChange('text_transform_heading', e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]">
                <option value="none">None</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Body Transform</span>
              <select value={form.text_transform_body} onChange={e => handleChange('text_transform_body', e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]">
                <option value="none">None</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
