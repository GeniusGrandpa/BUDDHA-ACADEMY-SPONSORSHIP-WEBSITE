import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  showPasswordToggle?: boolean
  icon?: React.ReactNode
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, showPasswordToggle, icon, type, id, name, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [focused, setFocused] = useState(false)
    const isPassword = showPasswordToggle
    const inputType = isPassword && showPassword ? 'text' : type
    const inputId = id || name

    return (
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            name={name || inputId}
            type={inputType}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
            className={`
              w-full rounded-xl text-sm text-slate-900 placeholder-slate-400
              bg-warm-50 border transition-all duration-200 outline-none
              ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3
              ${error
                ? 'border-red-300 focus:border-red-400 focus:ring-[3px] focus:ring-red-100'
                : focused
                  ? 'border-blue-400 focus:border-blue-400 focus:ring-[3px] focus:ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300'
              }
              ${isPassword ? 'pr-12' : ''}
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500 mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)

AuthInput.displayName = 'AuthInput'
