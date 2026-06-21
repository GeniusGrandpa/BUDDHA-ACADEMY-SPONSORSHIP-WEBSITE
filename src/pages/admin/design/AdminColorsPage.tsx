import { useState, useEffect } from 'react'
import { Save, Eye, Sun, RotateCcw } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { upsertDesignSettings } from '../../../services/design'
import { ColorPicker } from '../../../components/ui/ColorPicker'
import { DEFAULT_COLORS, type DesignColors, type ColorKey } from '../../../types/design'
import toast from 'react-hot-toast'

const colorCategories: { label: string; keys: { label: string; key: ColorKey }[] }[] = [
  {
    label: 'Primary Colors',
    keys: [
      { label: 'Primary', key: 'primary' },
      { label: 'Primary Light', key: 'primary_light' },
      { label: 'Primary Dark', key: 'primary_dark' },
      { label: 'Secondary', key: 'secondary' },
      { label: 'Secondary Light', key: 'secondary_light' },
      { label: 'Secondary Dark', key: 'secondary_dark' },
      { label: 'Accent', key: 'accent' },
    ],
  },
  {
    label: 'Background & Surface',
    keys: [
      { label: 'Background', key: 'background' },
      { label: 'Surface', key: 'surface' },
      { label: 'Surface Hover', key: 'surface_hover' },
      { label: 'Card', key: 'card' },
      { label: 'Card Hover', key: 'card_hover' },
    ],
  },
  {
    label: 'Navigation',
    keys: [
      { label: 'Navbar Background', key: 'navbar_bg' },
      { label: 'Navbar Text', key: 'navbar_text' },
      { label: 'Navbar Active', key: 'navbar_active' },
      { label: 'Navbar Hover', key: 'navbar_hover' },
    ],
  },
  {
    label: 'Footer',
    keys: [
      { label: 'Footer Background', key: 'footer_bg' },
      { label: 'Footer Text', key: 'footer_text' },
      { label: 'Footer Heading', key: 'footer_heading' },
    ],
  },
  {
    label: 'Sidebar',
    keys: [
      { label: 'Sidebar Background', key: 'sidebar_bg' },
      { label: 'Sidebar Text', key: 'sidebar_text' },
      { label: 'Sidebar Active BG', key: 'sidebar_active_bg' },
      { label: 'Sidebar Active Text', key: 'sidebar_active_text' },
    ],
  },
  {
    label: 'Buttons',
    keys: [
      { label: 'Primary Button BG', key: 'button_primary_bg' },
      { label: 'Primary Button Text', key: 'button_primary_text' },
      { label: 'Primary Button Hover', key: 'button_primary_hover' },
      { label: 'Secondary Button BG', key: 'button_secondary_bg' },
      { label: 'Secondary Button Text', key: 'button_secondary_text' },
      { label: 'Secondary Button Hover', key: 'button_secondary_hover' },
      { label: 'Outline Button Border', key: 'button_outline_border' },
      { label: 'Outline Button Text', key: 'button_outline_text' },
      { label: 'Outline Button Hover', key: 'button_outline_hover' },
    ],
  },
  {
    label: 'Text',
    keys: [
      { label: 'Text Primary', key: 'text_primary' },
      { label: 'Text Secondary', key: 'text_secondary' },
      { label: 'Text Muted', key: 'text_muted' },
    ],
  },
  {
    label: 'Borders & Dividers',
    keys: [
      { label: 'Border', key: 'border' },
      { label: 'Border Light', key: 'border_light' },
      { label: 'Border Accent', key: 'border_accent' },
      { label: 'Divider', key: 'divider' },
    ],
  },
  {
    label: 'Status / Alerts',
    keys: [
      { label: 'Success', key: 'success' },
      { label: 'Success Light', key: 'success_light' },
      { label: 'Warning', key: 'warning' },
      { label: 'Warning Light', key: 'warning_light' },
      { label: 'Error', key: 'error' },
      { label: 'Error Light', key: 'error_light' },
      { label: 'Info', key: 'info' },
      { label: 'Info Light', key: 'info_light' },
    ],
  },
  {
    label: 'Hero',
    keys: [
      { label: 'Hero Overlay', key: 'hero_overlay' },
      { label: 'Hero Overlay Opacity', key: 'hero_overlay_opacity' },
    ],
  },
]

function ColorPreview({ colors }: { colors: DesignColors }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
      <div className="p-6" style={{ backgroundColor: colors.background }}>
        {/* dynamic preview colors from user selection cannot be expressed as Tailwind classes */}
        <div className="max-w-md mx-auto space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: colors.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', color: colors.text_primary }} className="text-lg font-bold">Sample Card</h4>
            <p style={{ color: colors.text_secondary }} className="text-sm mt-1">This preview updates in real-time as you select colors.</p>
            <div className="flex gap-2 mt-3">
              <span className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: colors.button_primary_bg, color: colors.button_primary_text }}>Primary</span>
              <span className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: colors.button_secondary_bg, color: colors.button_secondary_text }}>Secondary</span>
              <span className="px-3 py-1.5 rounded-lg text-sm font-medium border" style={{ borderColor: colors.button_outline_border, color: colors.button_outline_text }}>Outline</span>
            </div>
            <div className="flex gap-1.5 mt-3">
              <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: colors.success_light, color: colors.success }}>Success</span>
              <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: colors.warning_light, color: colors.warning }}>Warning</span>
              <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: colors.error_light, color: colors.error }}>Error</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminColorsPage() {
  const { colors: themeColors, refreshTheme } = useTheme()
  const [colors, setColors] = useState<DesignColors>(themeColors)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => { setColors(themeColors) }, [themeColors])

  const updateColor = (key: ColorKey, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertDesignSettings({ colors })
      await refreshTheme()
      toast.success('Colors saved! Use Publish to make live.')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleReset = () => {
    setColors(DEFAULT_COLORS)
    toast.success('Reset to default colors (save to apply)')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Color Management</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Customize every color on your website</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
            <RotateCcw className="w-4 h-4" /> Reset Section
          </button>
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
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-4 h-4 text-[var(--color-text-muted)]" />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Color Preview</span>
          </div>
          <ColorPreview colors={colors} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {colorCategories.map(category => (
          <div key={category.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">{category.label}</h3>
            <div className="space-y-3">
              {category.keys.map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
                  <ColorPicker
                    value={colors[key]}
                    onChange={color => updateColor(key, color)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
