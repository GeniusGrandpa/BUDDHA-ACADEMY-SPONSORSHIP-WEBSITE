import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingText?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', loading, loadingText, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm',
      secondary: 'bg-orange-100 hover:bg-orange-200 text-orange-700',
      glass: 'bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white',
      outline: 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-5 py-2.5 text-sm rounded-full',
      lg: 'px-6 py-3 text-base rounded-full',
    }

    return (
      <button
        ref={ref}
        type="button"
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {loading && loadingText ? loadingText : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
