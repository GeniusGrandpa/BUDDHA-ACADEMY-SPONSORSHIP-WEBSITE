import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, name, ...props }, ref) => {
    const inputId = id || name
    
    return (
      <div className="space-y-1">
        {label && inputId && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name || inputId}
          className={`w-full px-4 py-2.5 rounded-lg border ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-amber-500 focus:ring-amber-200'
          } focus:outline-none focus:ring-2 transition-colors ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
