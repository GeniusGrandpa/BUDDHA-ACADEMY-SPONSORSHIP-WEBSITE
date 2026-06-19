import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import type { ImpactMetric as ImpactMetricType } from '../types/database'

const metricsConfig = [
  { key: 'meals_funded', label: 'Meals Funded' },
  { key: 'books_distributed', label: 'Books Distributed' },
  { key: 'uniforms_provided', label: 'Uniforms Provided' },
  { key: 'students_supported', label: 'Students Supported' },
  { key: 'attendance_rate', label: 'Attendance Rate', suffix: '%' },
]

export function ImpactMetrics() {
  const [latest, setLatest] = useState<ImpactMetricType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const { data } = await supabase
        .from('impact_metrics')
        .select('*')
        .order('month', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (data) setLatest(data)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  if (loading || !latest) return null

  const monthName = new Date(latest.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Impact in {monthName}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real numbers that show how your support changes lives
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {metricsConfig.map((m) => {
            const value = latest[m.key as keyof ImpactMetricType] as number
            const displayValue = m.suffix ? `${value}${m.suffix}` : value.toLocaleString()

            return (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-warm-50 rounded-2xl border border-gray-100 p-5 shadow-sm text-center hover:shadow-md transition-shadow"
              >
                <p className="text-2xl font-bold text-gray-900">{displayValue}</p>
                <p className="text-xs text-gray-500 mt-1">{m.label}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
