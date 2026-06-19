import { type HTMLAttributes, forwardRef } from 'react'

type CardVariant = 'default' | 'elevated' | 'bordered' | 'gradient'
type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  hover?: boolean
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-warm-50',
  elevated: 'bg-warm-50 shadow-lg shadow-amber-200/40',
  bordered: 'bg-warm-50 border border-amber-200',
  gradient: 'bg-gradient-to-br from-orange-50 to-amber-50 border border-amber-200',
}

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', hover = false, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-xl ${variantStyles[variant]} ${paddingStyles[padding]} ${
          hover ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:shadow-orange-200/40' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
