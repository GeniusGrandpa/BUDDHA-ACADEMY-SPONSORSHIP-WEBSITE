interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function ToggleSwitch({ checked, onChange, label, description, disabled, size = 'md' }: ToggleSwitchProps) {
  const h = size === 'sm' ? 'h-5' : 'h-6'
  const w = size === 'sm' ? 'w-9' : 'w-11'
  const dot = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'
  const translateX = size === 'sm' ? 'translate-x-4' : 'translate-x-5'
  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => { if (!disabled) onChange(!checked) }}
        className={`relative inline-flex shrink-0 ${h} ${w} items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-1 ${
          checked ? 'bg-amber-500' : 'bg-gray-200'
        }`}
      >
        <span className={`inline-block ${dot} transform rounded-full bg-white shadow-sm ring-0 transition-transform ${checked ? translateX : 'translate-x-0.5'}`} />
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {description && <span className="text-xs text-gray-400 mt-0.5">{description}</span>}
        </div>
      )}
    </label>
  )
}
