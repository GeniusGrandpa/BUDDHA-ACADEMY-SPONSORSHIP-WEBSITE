import { useState, useRef, useEffect } from 'react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  presetColors?: string[]
}

const DEFAULT_PRESETS = [
  '#f26b1d', '#ea580c', '#d97706', '#c49a4e', '#e3cc8e',
  '#10b981', '#059669', '#3b82f6', '#6366f1', '#8b5cf6',
  '#ec4899', '#ef4444', '#f59e0b', '#84cc16', '#14b8a6',
  '#111827', '#374151', '#6b7280', '#9ca3af', '#fdfbf7',
  '#ffffff', '#000000',
]

export function ColorPicker({ value, onChange, label, presetColors }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const pickerRef = useRef<HTMLDivElement>(null)
  const presets = presetColors || DEFAULT_PRESETS

  useEffect(() => { setInputValue(value) }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    if (/^#[0-9a-fA-F]{6}$/.test(val) || /^#[0-9a-fA-F]{3}$/.test(val)) {
      onChange(val)
    }
  }

  const handleNativePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setInputValue(color)
    onChange(color)
  }

  return (
    <div className="relative" ref={pickerRef}>
      {label && <span className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">{label}</span>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-9 h-9 rounded-lg border-2 border-[var(--color-border)] shadow-sm shrink-0"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="w-24 px-2 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-mono text-[var(--color-text-primary)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="#hex"
        />
        <input
          type="color"
          value={value}
          onChange={handleNativePicker}
          className="w-9 h-9 rounded-lg border border-[var(--color-border)] cursor-pointer p-0.5"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl z-[var(--z-popover,400)] min-w-[220px]">
          <div className="grid grid-cols-6 gap-1.5">
            {presets.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => { onChange(color); setInputValue(color); setIsOpen(false) }}
                className={`w-7 h-7 rounded-md border border-[var(--color-border)] hover:scale-110 transition-transform ${value === color ? 'ring-2 ring-[var(--color-primary)] ring-offset-1' : ''}`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
