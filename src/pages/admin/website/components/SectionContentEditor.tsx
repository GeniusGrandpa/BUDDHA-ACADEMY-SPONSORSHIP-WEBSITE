import { useState, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { WebsiteSection } from '../../../../types/website-builder'

interface SectionContentEditorProps {
    section: WebsiteSection
    onUpdate: (id: string, updates: Partial<WebsiteSection>) => void
}

function Field({
    label,
    value,
    onChange,
    textarea = false,
    placeholder = '',
    hint,
}: {
    label: string
    value: string
    onChange: (v: string) => void
    textarea?: boolean
    placeholder?: string
    hint?: string
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
            {textarea ? (
                <textarea
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    rows={3}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-vertical"
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
            )}
        </div>
    )
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={saving}
            className="w-full px-4 py-2 text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
            {saving ? 'Saving...' : 'Apply Changes'}
        </button>
    )
}

function HeroEditor({ section, onUpdate }: SectionContentEditorProps) {
    const c = section.content || {}
    const [title, setTitle] = useState(section.title || '')
    const [highlight, setHighlight] = useState((c.highlight as string) || '')
    const [description, setDescription] = useState(section.description || '')
    const [bgImage, setBgImage] = useState(
        (section.settings?.background_image as string) || (c.background_image as string) || ''
    )
    const [ctaPrimaryText, setCtaPrimaryText] = useState(
        (c.cta_primary as { text?: string } | null)?.text || ''
    )
    const [ctaPrimaryLink, setCtaPrimaryLink] = useState(
        (c.cta_primary as { link?: string } | null)?.link || '/students'
    )
    const [ctaSecondaryText, setCtaSecondaryText] = useState(
        (c.cta_secondary as { text?: string } | null)?.text || ''
    )
    const [ctaSecondaryLink, setCtaSecondaryLink] = useState(
        (c.cta_secondary as { link?: string } | null)?.link || '/donate'
    )
    const [stats, setStats] = useState<{ value: string; label: string }[]>(
        (c.statistics as { value: string; label: string }[]) || []
    )
    const [saving, setSaving] = useState(false)

    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await onUpdate(section.id, {
                title,
                description,
                content: {
                    highlight,
                    background_image: bgImage,
                    layout: (section.content?.layout as string) || 'left',
                    cta_primary: { text: ctaPrimaryText, link: ctaPrimaryLink },
                    cta_secondary: { text: ctaSecondaryText, link: ctaSecondaryLink },
                    statistics: stats,
                    badges: (section.content?.badges as unknown[]) || [],
                },
                settings: {
                    ...section.settings,
                    background_image: bgImage,
                },
            })
            toast.success('Hero section updated')
        } finally {
            setSaving(false)
        }
    }, [section, title, highlight, description, bgImage, ctaPrimaryText, ctaPrimaryLink, ctaSecondaryText, ctaSecondaryLink, stats, onUpdate])

    const handleStatChange = (idx: number, field: 'value' | 'label', val: string) => {
        setStats(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s))
    }

    return (
        <div className="space-y-4">
            <Field label="Main Headline" value={title} onChange={setTitle} placeholder="Empowering Nepal's Future" />
            <Field label="Highlight Text" value={highlight} onChange={setHighlight} placeholder="One Child at a Time" hint="Appears in accent colour below the headline" />
            <Field label="Description" value={description} onChange={setDescription} textarea placeholder="Brief description shown below the headline" />
            <Field label="Background Image URL" value={bgImage} onChange={setBgImage} placeholder="https://..." hint="Paste a direct image URL for the hero background" />

            <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Primary Button</p>
                <div className="grid grid-cols-2 gap-2">
                    <Field label="Button Text" value={ctaPrimaryText} onChange={setCtaPrimaryText} placeholder="Sponsor a Child" />
                    <Field label="Button Link" value={ctaPrimaryLink} onChange={setCtaPrimaryLink} placeholder="/students" />
                </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Secondary Button</p>
                <div className="grid grid-cols-2 gap-2">
                    <Field label="Button Text" value={ctaSecondaryText} onChange={setCtaSecondaryText} placeholder="Donate Now" />
                    <Field label="Button Link" value={ctaSecondaryLink} onChange={setCtaSecondaryLink} placeholder="/donate" />
                </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Statistics Bar</p>
                    <button
                        onClick={() => setStats(prev => [...prev, { value: '', label: '' }])}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
                    >
                        <Plus className="w-3 h-3" /> Add Stat
                    </button>
                </div>
                <div className="space-y-2">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <input
                                type="text"
                                value={stat.value}
                                onChange={e => handleStatChange(idx, 'value', e.target.value)}
                                placeholder="49+"
                                className="flex-1 bg-white border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                            />
                            <input
                                type="text"
                                value={stat.label}
                                onChange={e => handleStatChange(idx, 'label', e.target.value)}
                                placeholder="Years of Service"
                                className="flex-1 bg-white border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                            />
                            <button
                                onClick={() => setStats(prev => prev.filter((_, i) => i !== idx))}
                                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                                aria-label="Remove stat"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {stats.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No statistics added yet.</p>
                    )}
                </div>
            </div>

            <SaveButton onClick={handleSave} saving={saving} />
        </div>
    )
}

function StatsEditor({ section, onUpdate }: SectionContentEditorProps) {
    const c = section.content || {}
    const [title, setTitle] = useState(section.title || '')
    const [stats, setStats] = useState<{ value: string; label: string }[]>(
        (c.statistics as { value: string; label: string }[]) || []
    )
    const [saving, setSaving] = useState(false)

    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await onUpdate(section.id, {
                title,
                content: { statistics: stats },
            })
            toast.success('Statistics section updated')
        } finally {
            setSaving(false)
        }
    }, [section.id, title, stats, onUpdate])

    return (
        <div className="space-y-4">
            <Field label="Section Title" value={title} onChange={setTitle} placeholder="Our Impact in Numbers" />
            <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Statistics</p>
                    <button
                        onClick={() => setStats(prev => [...prev, { value: '', label: '' }])}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
                    >
                        <Plus className="w-3 h-3" /> Add
                    </button>
                </div>
                <div className="space-y-2">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <input
                                type="text"
                                value={stat.value}
                                onChange={e => setStats(prev => prev.map((s, i) => i === idx ? { ...s, value: e.target.value } : s))}
                                placeholder="49+"
                                className="flex-1 bg-white border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                            />
                            <input
                                type="text"
                                value={stat.label}
                                onChange={e => setStats(prev => prev.map((s, i) => i === idx ? { ...s, label: e.target.value } : s))}
                                placeholder="Years of Service"
                                className="flex-1 bg-white border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                            />
                            <button
                                onClick={() => setStats(prev => prev.filter((_, i) => i !== idx))}
                                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                                aria-label="Remove"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <SaveButton onClick={handleSave} saving={saving} />
        </div>
    )
}

function WelcomeEditor({ section, onUpdate }: SectionContentEditorProps) {
    const [title, setTitle] = useState(section.title || '')
    const [content, setContent] = useState(section.description || '')
    const [saving, setSaving] = useState(false)

    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await onUpdate(section.id, {
                title,
                description: content,
                content: { content },
            })
            toast.success('Welcome section updated')
        } finally {
            setSaving(false)
        }
    }, [section.id, title, content, onUpdate])

    return (
        <div className="space-y-4">
            <Field label="Heading" value={title} onChange={setTitle} placeholder="Welcome to Buddha Academy" />
            <Field label="Body Text" value={content} onChange={setContent} textarea placeholder="Brief introductory paragraph..." />
            <SaveButton onClick={handleSave} saving={saving} />
        </div>
    )
}

function AboutPreviewEditor({ section, onUpdate }: SectionContentEditorProps) {
    const c = section.content || {}
    const [title, setTitle] = useState(section.title || '')
    const [description, setDescription] = useState(section.description || '')
    const [milestones, setMilestones] = useState<{ year: string; event: string }[]>(
        (c.milestones as { year: string; event: string }[]) || []
    )
    const [saving, setSaving] = useState(false)

    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await onUpdate(section.id, {
                title,
                description,
                content: { milestones },
            })
            toast.success('About section updated')
        } finally {
            setSaving(false)
        }
    }, [section.id, title, description, milestones, onUpdate])

    return (
        <div className="space-y-4">
            <Field label="Section Title" value={title} onChange={setTitle} />
            <Field label="Description" value={description} onChange={setDescription} textarea />
            <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Timeline Milestones</p>
                    <button
                        onClick={() => setMilestones(prev => [...prev, { year: '', event: '' }])}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
                    >
                        <Plus className="w-3 h-3" /> Add
                    </button>
                </div>
                <div className="space-y-2">
                    {milestones.map((m, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <input
                                type="text"
                                value={m.year}
                                onChange={e => setMilestones(prev => prev.map((ms, i) => i === idx ? { ...ms, year: e.target.value } : ms))}
                                placeholder="1977"
                                className="w-20 bg-white border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                            />
                            <input
                                type="text"
                                value={m.event}
                                onChange={e => setMilestones(prev => prev.map((ms, i) => i === idx ? { ...ms, event: e.target.value } : ms))}
                                placeholder="Founded with 12 students"
                                className="flex-1 bg-white border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                            />
                            <button
                                onClick={() => setMilestones(prev => prev.filter((_, i) => i !== idx))}
                                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                                aria-label="Remove milestone"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <SaveButton onClick={handleSave} saving={saving} />
        </div>
    )
}

function FeaturedStudentsEditor({ section, onUpdate }: SectionContentEditorProps) {
    const [title, setTitle] = useState(section.title || '')
    const [description, setDescription] = useState(section.description || '')
    const [saving, setSaving] = useState(false)

    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await onUpdate(section.id, { title, description })
            toast.success('Section updated')
        } finally {
            setSaving(false)
        }
    }, [section.id, title, description, onUpdate])

    return (
        <div className="space-y-4">
            <Field label="Section Title" value={title} onChange={setTitle} placeholder="Children Waiting for Sponsors" />
            <Field label="Description" value={description} onChange={setDescription} textarea placeholder="Brief description below the heading" />
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700">
                    Student profiles are pulled automatically from the database. Use the Students section in the admin panel to manage individual profiles.
                </p>
            </div>
            <SaveButton onClick={handleSave} saving={saving} />
        </div>
    )
}

function SponsorshipStepsEditor({ section, onUpdate }: SectionContentEditorProps) {
    const c = section.content || {}
    const [title, setTitle] = useState(section.title || '')
    const [description, setDescription] = useState(section.description || '')
    const [steps, setSteps] = useState<{ title: string; desc: string }[]>(
        (c.steps as { title: string; desc: string }[]) || []
    )
    const [saving, setSaving] = useState(false)

    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await onUpdate(section.id, {
                title,
                description,
                content: { steps },
            })
            toast.success('Sponsorship steps updated')
        } finally {
            setSaving(false)
        }
    }, [section.id, title, description, steps, onUpdate])

    return (
        <div className="space-y-4">
            <Field label="Section Title" value={title} onChange={setTitle} placeholder="How Sponsorship Works" />
            <Field label="Section Description" value={description} onChange={setDescription} textarea placeholder="Your journey to changing a child's life starts here." />
            <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Steps</p>
                    <button
                        onClick={() => setSteps(prev => [...prev, { title: '', desc: '' }])}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
                    >
                        <Plus className="w-3 h-3" /> Add Step
                    </button>
                </div>
                <div className="space-y-3">
                    {steps.map((step, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-500">Step {idx + 1}</span>
                                <button
                                    onClick={() => setSteps(prev => prev.filter((_, i) => i !== idx))}
                                    className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                                    aria-label="Remove step"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={step.title}
                                onChange={e => setSteps(prev => prev.map((s, i) => i === idx ? { ...s, title: e.target.value } : s))}
                                placeholder="Step title"
                                className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs mb-2 focus:outline-none focus:border-amber-500"
                            />
                            <input
                                type="text"
                                value={step.desc}
                                onChange={e => setSteps(prev => prev.map((s, i) => i === idx ? { ...s, desc: e.target.value } : s))}
                                placeholder="Brief description"
                                className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
            <SaveButton onClick={handleSave} saving={saving} />
        </div>
    )
}

function TestimonialsEditor({ section, onUpdate }: SectionContentEditorProps) {
    const [title, setTitle] = useState(section.title || '')
    const [saving, setSaving] = useState(false)

    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await onUpdate(section.id, { title })
            toast.success('Section updated')
        } finally {
            setSaving(false)
        }
    }, [section.id, title, onUpdate])

    return (
        <div className="space-y-4">
            <Field label="Section Title" value={title} onChange={setTitle} placeholder="What Our Supporters Say" />
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700">
                    Testimonial content is managed under Website &rsaquo; Testimonials. This section header controls the title shown above the testimonials grid.
                </p>
            </div>
            <SaveButton onClick={handleSave} saving={saving} />
        </div>
    )
}

function DonationCtaEditor({ section, onUpdate }: SectionContentEditorProps) {
    const c = section.content || {}
    const [title, setTitle] = useState(section.title || '')
    const [description, setDescription] = useState(section.description || '')
    const [buttonText, setButtonText] = useState((c.button_text as string) || 'Donate Now')
    const [buttonLink, setButtonLink] = useState((c.button_link as string) || '/donate')
    const [saving, setSaving] = useState(false)

    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await onUpdate(section.id, {
                title,
                description,
                content: { button_text: buttonText, button_link: buttonLink },
            })
            toast.success('Donation CTA updated')
        } finally {
            setSaving(false)
        }
    }, [section.id, title, description, buttonText, buttonLink, onUpdate])

    return (
        <div className="space-y-4">
            <Field label="Heading" value={title} onChange={setTitle} placeholder="Make a Difference Today" />
            <Field label="Description" value={description} onChange={setDescription} textarea placeholder="Every contribution brings hope and opportunity..." />
            <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Call to Action Button</p>
                <div className="grid grid-cols-2 gap-2">
                    <Field label="Button Text" value={buttonText} onChange={setButtonText} placeholder="Donate Now" />
                    <Field label="Button Link" value={buttonLink} onChange={setButtonLink} placeholder="/donate" />
                </div>
            </div>
            <SaveButton onClick={handleSave} saving={saving} />
        </div>
    )
}

function GenericEditor({ section, onUpdate }: SectionContentEditorProps) {
    const [title, setTitle] = useState(section.title || '')
    const [subtitle, setSubtitle] = useState(section.subtitle || '')
    const [description, setDescription] = useState(section.description || '')
    const [saving, setSaving] = useState(false)

    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await onUpdate(section.id, { title, subtitle, description })
            toast.success('Section updated')
        } finally {
            setSaving(false)
        }
    }, [section.id, title, subtitle, description, onUpdate])

    return (
        <div className="space-y-4">
            <Field label="Title" value={title} onChange={setTitle} />
            <Field label="Subtitle" value={subtitle} onChange={setSubtitle} />
            <Field label="Description" value={description} onChange={setDescription} textarea />
            <SaveButton onClick={handleSave} saving={saving} />
        </div>
    )
}

const SECTION_EDITORS: Record<string, React.ComponentType<SectionContentEditorProps>> = {
    hero: HeroEditor,
    stats: StatsEditor,
    welcome: WelcomeEditor,
    about_preview: AboutPreviewEditor,
    about_mission: AboutPreviewEditor,
    featured_students: FeaturedStudentsEditor,
    sponsorship_steps: SponsorshipStepsEditor,
    sponsor_steps: SponsorshipStepsEditor,
    testimonials: TestimonialsEditor,
    testimonials_list: TestimonialsEditor,
    donation_cta: DonationCtaEditor,
    cta_banner: DonationCtaEditor,
    about_cta: DonationCtaEditor,
    sponsor_cta: DonationCtaEditor,
}

export function SectionContentEditor({ section, onUpdate }: SectionContentEditorProps) {
    const Editor = SECTION_EDITORS[section.section_type] || GenericEditor
    return <Editor section={section} onUpdate={onUpdate} />
}
