import { type ReactNode } from 'react'
import { motion } from 'framer-motion'


interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  trend?: { value: number; positive: boolean }
  gradient?: string
  className?: string
}

const gradients = [
  'from-orange-50 to-orange-100 border-orange-200',
  'from-orange-50 to-amber-50 border-orange-200',
  'from-orange-50 to-orange-100 border-orange-200',
  'from-orange-50 to-amber-50 border-orange-200',
  'from-orange-50 to-orange-100 border-orange-200',
]

export function StatCard({
  icon,
  label,
  value,
  trend,
  gradient,
  className = '',
}: StatCardProps) {
  const gradientClass = gradient ?? gradients[Math.floor(Math.random() * gradients.length)]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-xl border bg-gradient-to-br p-5 ${gradientClass} transition-shadow duration-300 hover:shadow-lg ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-white/60 p-2.5 backdrop-blur-sm">{icon}</div>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
              trend.positive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </motion.div>
  )
}
