import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { upsertDesignSettings } from '../../../services/design'
import type { DesignLayout } from '../../../types/design'
import toast from 'react-hot-toast'

export function AdminLayoutPage() {
  const { layout: themeLayout, refreshTheme } = useTheme()
  const [form, setForm] = useState<DesignLayout>(themeLayout)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setForm(themeLayout) }, [themeLayout])

  const handleChange = (key: keyof DesignLayout, value: string | boolean | number) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertDesignSettings({ layout: form })
      await refreshTheme()
      toast.success('Layout saved! Use Publish to make live.')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Layout & UI</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Spacing, containers, shadows & visual preferences</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Draft'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Container & Spacing</h3>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Container Width (px)</span>
              <input type="number" value={form.container_width} onChange={e => handleChange('container_width', e.target.value)} min="800" max="1920"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Container Padding (px)</span>
              <input type="number" value={form.container_padding_x} onChange={e => handleChange('container_padding_x', e.target.value)} min="0" max="64"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Section Gap Y (px)</span>
              <input type="number" value={form.section_spacing_y} onChange={e => handleChange('section_spacing_y', e.target.value)} min="0" max="128"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Section Gap X (px)</span>
              <input type="number" value={form.section_spacing_x} onChange={e => handleChange('section_spacing_x', e.target.value)} min="0" max="128"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]" />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Border Radius</h3>

          <div className="grid grid-cols-2 gap-4">
            {(['border_radius_sm', 'border_radius_md', 'border_radius_lg', 'border_radius_xl', 'border_radius_2xl', 'border_radius_full'] as const).map(key => (
              <label key={key} className="block">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{key.replace(/_/g, ' ').replace('border ', '')}</span>
                <div className="flex items-center gap-2 mt-1">
                  <input type="range" value={form[key]} onChange={e => handleChange(key, e.target.value)} min="0" max="100" step="0.125"
                    className="flex-1 accent-[var(--color-primary)]" />
                  <span className="text-xs text-[var(--color-text-muted)] w-12 text-right">{form[key]}rem</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Shadows</h3>

          {(['shadow_sm', 'shadow_md', 'shadow_lg', 'shadow_xl'] as const).map(key => (
            <label key={key} className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">{key.replace('_', ' ')}</span>
              <input type="text" value={form[key]} onChange={e => handleChange(key, e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)] font-mono" />
            </label>
          ))}
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Visual Preferences</h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-primary)]">Animations</span>
              <button
                onClick={() => handleChange('animation_enabled', !form.animation_enabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.animation_enabled ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.animation_enabled ? 'translate-x-5' : ''}`} />
              </button>
            </label>
            {form.animation_enabled && (
              <label className="block">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Animation Duration (s)</span>
                <input type="number" value={form.animation_duration} onChange={e => handleChange('animation_duration', e.target.value)} step="0.1" min="0.1" max="2"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]" />
              </label>
            )}

            <label className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-primary)]">Hover Effects</span>
              <button
                onClick={() => handleChange('hover_effects', !form.hover_effects)}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.hover_effects ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.hover_effects ? 'translate-x-5' : ''}`} />
              </button>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Website Max Width (%)</span>
              <input type="number" value={form.website_max_width} onChange={e => handleChange('website_max_width', e.target.value)} min="50" max="100"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]" />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
