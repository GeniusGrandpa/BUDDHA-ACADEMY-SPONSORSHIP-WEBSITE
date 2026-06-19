interface DashboardStatCardProps {
  label: string
  value: string | number
  description?: string
  trend?: { value: number; positive: boolean }
  accentBorder?: boolean
  className?: string
}

export function DashboardStatCard({
  label,
  value,
  description,
  trend,
  accentBorder = false,
  className = '',
}: DashboardStatCardProps) {
  return (
    <div className={`rounded-xl border bg-card text-card-foreground shadow-sm p-6 ${accentBorder ? 'border-l-4 border-l-orange-300' : ''} ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
              trend.positive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {description && (
        <p className="mt-3 text-xs text-muted-foreground/70">{description}</p>
      )}
    </div>
  )
}
