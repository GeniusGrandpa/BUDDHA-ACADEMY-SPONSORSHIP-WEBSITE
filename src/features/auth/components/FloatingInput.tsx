import { useState } from 'react'

interface FloatingInputProps {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  showToggle?: boolean
  onToggle?: () => void
  autoComplete?: string
}

export function FloatingInput({
  label, type, value, onChange, required,
  showToggle, onToggle, autoComplete,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0

  return (
    <div className="relative group">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        autoComplete={autoComplete || undefined}
        title={label}
        className="w-full px-4 pt-6 pb-2 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm
          transition-all duration-200
          focus:border-blue-400 focus:ring-[3px] focus:ring-blue-100 focus:outline-none
          group-hover:border-gray-300"
      />
      <label
        className={`absolute left-4 transition-all pointer-events-none select-none
          ${focused || hasValue
            ? 'top-2 text-xs text-blue-500 font-medium'
            : 'top-4 text-sm text-gray-400'
          }`}
      >
        {label}
      </label>
      {showToggle && onToggle && (
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          aria-label={type === 'password' ? 'Show password' : 'Hide password'}
        >
          {type === 'password' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      )}
    </div>
  )
}
