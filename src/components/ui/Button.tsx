import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
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
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
