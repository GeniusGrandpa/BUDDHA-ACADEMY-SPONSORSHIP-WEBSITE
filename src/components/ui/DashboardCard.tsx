import { type HTMLAttributes, forwardRef } from 'react'

interface DashboardCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  padding?: 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const DashboardCard = forwardRef<HTMLDivElement, DashboardCardProps>(
  ({ title, description, padding = 'md', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-xl border bg-card text-card-foreground shadow-sm ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        {(title || description) && (
          <div className="mb-5">
            {title && <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground/70 mt-0.5">{description}</p>}
          </div>
        )}
        {children}
      </div>
    )
  }
)

DashboardCard.displayName = 'DashboardCard'
