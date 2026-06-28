import { useState, useEffect } from 'react'
import { Trash2, Check, RotateCcw, Plus } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { getThemePresets, saveThemePreset, deleteThemePreset, applyThemePreset, resetDesignSettingsToDefaults } from '../../../services/design'
import toast from 'react-hot-toast'
import { FormSkeleton } from '../../../components/ui/LoadingSkeleton'
import type { ThemePreset } from '../../../types/design'

export function AdminThemePresetsPage() {
  const { settings, refreshTheme } = useTheme()
  const [presets, setPresets] = useState<ThemePreset[]>([])
  const [loading, setLoading] = useState(true)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [presetDescription, setPresetDescription] = useState('')

  useEffect(() => { loadPresets() }, [])

  const loadPresets = async () => {
    try {
      const data = await getThemePresets()
      setPresets(data)
    } catch { }
    finally { setLoading(false) }
  }

  const handleSavePreset = async () => {
    if (!presetName.trim() || !settings) return
    try {
      await saveThemePreset({
        name: presetName.trim(),
        description: presetDescription.trim() || null,
        preview_url: null,
        branding: settings.branding,
        colors: settings.colors,
        typography: settings.typography,
        layout: settings.layout,
        component_styles: settings.component_styles,
        tokens: settings.tokens,
        config: settings.config,
        sort_order: presets.length,
      })
      toast.success('Theme preset saved!')
      setShowSaveDialog(false)
      setPresetName('')
      setPresetDescription('')
      loadPresets()
    } catch { toast.error('Failed to save preset') }
  }

  const handleApplyPreset = async (id: string) => {
    try {
      await applyThemePreset(id)
      await refreshTheme()
      toast.success('Theme preset applied! Publish to make live.')
    } catch { toast.error('Failed to apply preset') }
  }

  const handleDeletePreset = async (id: string, name: string) => {
    if (!window.confirm(`Delete preset "${name}"?`)) return
    try {
      await deleteThemePreset(id)
      toast.success('Preset deleted')
      loadPresets()
    } catch { toast.error('Failed to delete') }
  }

  const handleReset = async () => {
    if (!window.confirm('Reset all design settings to factory defaults? This cannot be undone.')) return
    try {
      await resetDesignSettingsToDefaults()
      await refreshTheme()
      toast.success('Defaults restored! Publish to make live.')
    } catch { toast.error('Failed to reset') }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Theme Presets</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Save, apply, and manage complete theme configurations</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
            <RotateCcw className="w-4 h-4" /> Reset to Defaults
          </button>
          <button onClick={() => setShowSaveDialog(true)} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Save Current as Preset
          </button>
        </div>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowSaveDialog(false)}>
          <div className="w-full max-w-md rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Save Theme Preset</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Save the current design configuration as a reusable preset.</p>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Preset Name</span>
                <input type="text" value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="e.g. Summer Campaign 2026"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Description (optional)</span>
                <textarea value={presetDescription} onChange={e => setPresetDescription(e.target.value)} rows={2} placeholder="What does this theme include?"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowSaveDialog(false)} className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">Cancel</button>
              <button onClick={handleSavePreset} disabled={!presetName.trim()} className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium disabled:opacity-50">Save Preset</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-8"><FormSkeleton fields={3} /></div>
      ) : presets.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-[var(--color-border)]">
          <p className="text-[var(--color-text-muted)]">No theme presets saved yet.</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Configure your design settings and save them as reusable presets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map(preset => (
            <div key={preset.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)]">{preset.name}</h3>
                  {preset.description && <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{preset.description}</p>}
                </div>
                <button onClick={() => handleDeletePreset(preset.id, preset.name)} aria-label={`Delete preset ${preset.name}`} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-1.5">
                <div className="w-5 h-5 rounded" style={{ backgroundColor: preset.colors.primary }} />
                <div className="w-5 h-5 rounded" style={{ backgroundColor: preset.colors.secondary }} />
                <div className="w-5 h-5 rounded" style={{ backgroundColor: preset.colors.accent }} />
                <div className="w-5 h-5 rounded" style={{ backgroundColor: preset.colors.background }} />
                <div className="w-5 h-5 rounded" style={{ backgroundColor: preset.colors.button_primary_bg }} />
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <span>{preset.colors.primary} / {preset.typography.heading_font}</span>
              </div>
              <button onClick={() => handleApplyPreset(preset.id)} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]">
                <Check className="w-4 h-4" /> Apply Preset
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
