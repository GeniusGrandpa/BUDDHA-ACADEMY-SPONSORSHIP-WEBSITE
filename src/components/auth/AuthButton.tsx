import { ButtonHTMLAttributes, forwardRef } from 'react'

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'social'
}

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ loading, loadingText, variant = 'primary', children, className = '', disabled, ...props }, ref) => {
    const base =
      'w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 outline-none'

    const variants = {
      primary: `
        bg-blue-600 hover:bg-blue-700 active:bg-blue-800
        text-white shadow-sm shadow-blue-200
        hover:shadow-md hover:shadow-blue-200
        disabled:bg-blue-300 disabled:cursor-not-allowed disabled:shadow-none
      `,
      secondary: `
        bg-orange-500 hover:bg-orange-600 active:bg-orange-700
        text-white shadow-sm
        hover:shadow-md
        disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none
      `,
      outline: `
        bg-warm-50 border border-amber-200
        hover:bg-amber-50 hover:border-amber-300
        text-slate-700
        active:bg-amber-100
        disabled:opacity-50 disabled:cursor-not-allowed
      `,
      social: `
        bg-warm-50 border border-amber-200
        hover:bg-amber-50 hover:border-amber-300
        text-slate-600
        active:bg-amber-100
        disabled:opacity-50 disabled:cursor-not-allowed
      `,
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {loading && loadingText ? loadingText : children}
      </button>
    )
  },
)

AuthButton.displayName = 'AuthButton'
