import { Link } from 'react-router-dom'
import { Palette, Type, Layout, Image, Settings, Eye, Save, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { publishDesignSettings, resetDesignSettingsToDefaults } from '../../../services/design'
import toast from 'react-hot-toast'
import { useConfirm } from '../../../context/ConfirmContext'

const designCards = [
  { label: 'Branding', description: 'Logo, favicon, organization name & tagline', href: '/admin/design/branding', icon: Image, color: 'bg-orange-100 text-orange-700' },
  { label: 'Colors', description: 'Full color palette & theme management', href: '/admin/design/colors', icon: Palette, color: 'bg-purple-100 text-purple-700' },
  { label: 'Typography', description: 'Fonts, sizes, weights & spacing', href: '/admin/design/typography', icon: Type, color: 'bg-blue-100 text-blue-700' },
  { label: 'Layout', description: 'Spacing, containers, shadows & radius', href: '/admin/design/layout', icon: Layout, color: 'bg-green-100 text-green-700' },
  { label: 'Components', description: 'Hero, cards, CTA & block styles', href: '/admin/design/components', icon: Eye, color: 'bg-pink-100 text-pink-700' },
  { label: 'Config', description: 'Homepage layout, sections & features', href: '/admin/design/config', icon: Settings, color: 'bg-indigo-100 text-indigo-700' },
]

export function AdminDesignDashboard() {
  const { branding, refreshTheme } = useTheme()
  const { confirm } = useConfirm()
  const [publishing, setPublishing] = useState(false)

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await publishDesignSettings()
      await refreshTheme()
      toast.success('Design settings published!')
    } catch {
      toast.error('Failed to publish')
    } finally {
      setPublishing(false)
    }
  }

  const handleReset = async () => {
    if (!(await confirm({ title: 'Reset design settings', message: 'Reset all design settings to defaults? This cannot be undone.' }))) return
    try {
      await resetDesignSettingsToDefaults()
      await refreshTheme()
      toast.success('Defaults restored')
    } catch {
      toast.error('Failed to reset')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Design & Theme</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Manage the entire visual appearance of your website</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
            <RotateCcw className="w-4 h-4" />
            Reset Defaults
          </button>
          <button onClick={handlePublish} disabled={publishing} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {publishing ? 'Publishing...' : 'Publish All'}
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-3 text-sm">
          <Eye className="w-4 h-4 text-[var(--color-text-muted)]" />
          <span className="text-[var(--color-text-secondary)]">Current branding:</span>
          <span className="font-medium text-[var(--color-text-primary)]">{branding.organization_name}</span>
          <span className="text-[var(--color-text-muted)]">|</span>
          <span className="text-[var(--color-text-secondary)]">{branding.tagline}</span>
          <span className="text-[var(--color-text-muted)]">|</span>
          <span className="text-[var(--color-text-secondary)]">{branding.slogan}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designCards.map(card => (
          <Link
            key={card.href}
            to={card.href}
            className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 hover:shadow-md transition-all"
          >
            <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
              <card.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">{card.label}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
