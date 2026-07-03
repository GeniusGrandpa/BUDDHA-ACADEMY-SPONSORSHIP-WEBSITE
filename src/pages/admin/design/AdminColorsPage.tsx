import { useState, useEffect, useCallback } from 'react'
import { Save, Eye, Sun, RotateCcw, Send } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { upsertDesignSettings } from '../../../services/design'
import { ColorPicker } from '../../../components/ui/ColorPicker'
import { DEFAULT_COLORS, type DesignColors, type ColorKey } from '../../../types/design'
import { hasRole } from '../../../lib/permissions'
import { useAuth } from '../../../context/AuthContext'
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
    label: 'Status Colors',
    keys: [
      { label: 'Success', key: 'success' },
      { label: 'Warning', key: 'warning' },
      { label: 'Error', key: 'error' },
      { label: 'Info', key: 'info' },
    ],
  },
  {
    label: 'Background & Surface',
    keys: [
      { label: 'Background', key: 'background' },
      { label: 'Surface / Card', key: 'surface' },
      { label: 'Surface Hover', key: 'surface_hover' },
      { label: 'Card Hover', key: 'card_hover' },
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
    label: 'CTA Buttons',
    keys: [
      { label: 'CTA Button BG', key: 'button_primary_bg' },
      { label: 'CTA Button Text', key: 'button_primary_text' },
      { label: 'CTA Button Hover', key: 'button_primary_hover' },
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
    label: 'Hero',
    keys: [
      { label: 'Hero Overlay', key: 'hero_overlay' },
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
]

function ColorPreview({ colors }: { colors: DesignColors }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
      <div className="p-6" style={{ backgroundColor: colors.background }}>
        <div className="max-w-md mx-auto space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: colors.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', color: colors.text_primary }} className="text-lg font-bold">Sample Card</h4>
            <p style={{ color: colors.text_secondary }} className="text-sm mt-1">This preview updates in real-time as you select colors.</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: colors.button_primary_bg, color: colors.button_primary_text }}>Primary CTA</span>
              <span className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: colors.button_secondary_bg, color: colors.button_secondary_text }}>Secondary</span>
              <span className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: colors.success_light, color: colors.success }}>Success</span>
              <span className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: colors.warning_light, color: colors.warning }}>Warning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function validateHexColor(color: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(color) || /^#[0-9a-fA-F]{3}$/.test(color)
}

export function AdminColorsPage() {
  const { colors: themeColors, refreshTheme } = useTheme()
  const { profile } = useAuth()
  const [colors, setColors] = useState<DesignColors>(themeColors)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const canManageColors = hasRole(profile?.role, 'super_admin', 'admin')

  useEffect(() => { setColors(themeColors) }, [themeColors])

  const updateColor = useCallback((key: ColorKey, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleSave = async () => {
    if (!canManageColors) {
      toast.error('Unauthorized: Only Super Admin and Admin can modify colors')
      return
    }

    const invalidColors = Object.entries(colors).filter(([_, value]) => !validateHexColor(value as string))
    if (invalidColors.length > 0) {
      toast.error(`Invalid color values: ${invalidColors.map(([key]) => key.replace(/_/g, ' ')).join(', ')}`)
      return
    }

    setSaving(true)
    try {
      await upsertDesignSettings({ colors })
      await refreshTheme()
      toast.success('Colors saved! Click Publish to make changes live.')
    } catch (error) {
      toast.error('Failed to save colors')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!canManageColors) {
      toast.error('Unauthorized: Only Super Admin and Admin can publish colors')
      return
    }

    const invalidColors = Object.entries(colors).filter(([_, value]) => !validateHexColor(value as string))
    if (invalidColors.length > 0) {
      toast.error(`Invalid color values: ${invalidColors.map(([key]) => key.replace(/_/g, ' ')).join(', ')}`)
      return
    }

    setPublishing(true)
    try {
      await upsertDesignSettings({ colors, publish: true })
      await refreshTheme()
      toast.success('Colors published and applied to website!')
    } catch (error) {
      toast.error('Failed to publish colors')
    } finally {
      setPublishing(false)
    }
  }

  const handleReset = () => {
    if (!canManageColors) {
      toast.error('Unauthorized: Only Super Admin and Admin can reset colors')
      return
    }
    setColors(DEFAULT_COLORS)
    toast.success('Reset to default colors. Save or Publish to apply.')
  }

  if (!canManageColors) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Color Management</h1>
            <p className="text-[var(--color-text-secondary)] mt-1">Customize every color on your website</p>
          </div>
        </div>
        <div className="p-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-center">
          <p className="text-[var(--color-text-secondary)]">Access denied. Only Super Admin and Admin roles can manage colors.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Color Management</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Customize every color on your website</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} disabled={saving || publishing} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50">
            <RotateCcw className="w-4 h-4" /> Reset to Default
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
            <Eye className="w-4 h-4" /> {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button onClick={handleSave} disabled={saving || publishing} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={handlePublish} disabled={saving || publishing} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
            <Send className="w-4 h-4" /> {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-4 h-4 text-[var(--color-text-muted)]" />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Live Preview</span>
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
