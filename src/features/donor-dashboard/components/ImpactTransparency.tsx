import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { fadeInUp, stagger } from '../animations'
import type { DonorImpact } from '../../../types/features'
import { useSiteCurrency } from '../hooks/useSiteCurrency'
import { formatCurrency } from '../../../utils/currency'
import { Tr } from '../../../components/Translated'

interface ImpactTransparencyProps {
  impact: DonorImpact
}

interface CounterProps {
  value: number
  suffix?: string
  duration?: number
}

function AnimatedCounter({ value, suffix = '', duration = 1.5 }: CounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (hasAnimated.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const steps = 30
          const increment = value / steps
          let current = 0
          timerRef.current = setInterval(() => {
            current += increment
            if (current >= value) {
              setCount(value)
              clearInterval(timerRef.current)
              timerRef.current = undefined
            } else {
              setCount(Math.floor(current))
            }
          }, (duration * 1000) / steps)
        }
      },
      { threshold: 0.3 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => {
      observer.disconnect()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = undefined
      }
    }
  }, [value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export function ImpactTransparency({ impact }: ImpactTransparencyProps) {
  const { t } = useTranslation()
  const currency = useSiteCurrency()
  const metrics = [
    {
      label: t('Meals Funded', { defaultValue: 'Meals Funded' }),
      value: impact.meals_funded,
      max: Math.max(impact.meals_funded, 500),
      barColor: 'bg-orange-500',
      description: t('Nutritious meals served to students', { defaultValue: 'Nutritious meals served to students' }),
    },
    {
      label: t('Books Donated', { defaultValue: 'Books Donated' }),
      value: impact.books_donated,
      max: Math.max(impact.books_donated, 200),
      barColor: 'bg-orange-500',
      description: t('Educational books and materials', { defaultValue: 'Educational books and materials' }),
    },
    {
      label: t('Uniforms Provided', { defaultValue: 'Uniforms Provided' }),
      value: impact.uniforms_provided,
      max: Math.max(impact.uniforms_provided, 10),
      barColor: 'bg-orange-500',
      description: t('School uniforms distributed', { defaultValue: 'School uniforms distributed' }),
    },
    {
      label: t('Students Supported', { defaultValue: 'Students Supported' }),
      value: impact.students_supported,
      max: Math.max(impact.students_supported, 10),
      barColor: 'bg-orange-500',
      description: t('Children receiving education support', { defaultValue: 'Children receiving education support' }),
    },
  ]

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border border-orange-200 p-5 sm:p-6 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900"><Tr text="Your Impact at a Glance" /></h2>
        <p className="text-sm text-orange-700 mt-1">
          <Tr text="Together, we've made this possible. Here's what your generosity has achieved." />
        </p>
      </div>

      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((metric) => {
          const percentage = Math.min(Math.round((metric.value / metric.max) * 100), 100)
          return (
            <motion.div
              key={metric.label}
              variants={fadeInUp}
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl border border-orange-200/60 p-4 transition-shadow hover:shadow-md"
            >
              <div className="mb-3">
                <div className="text-sm text-gray-500">{metric.label}</div>
                <div className="text-2xl font-bold text-gray-900">
                  <AnimatedCounter value={metric.value} />
                </div>
              </div>

              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  className={`h-full rounded-full ${metric.barColor}`}
                />
              </div>

              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-gray-500">{metric.description}</span>
                <span className="text-xs font-medium text-gray-600">{percentage}%</span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="mt-5 pt-4 border-t border-orange-200/50 text-center">
        <p className="text-sm text-orange-800 font-medium">
          <Tr text="Total contribution: " />{formatCurrency(impact.total_donated, currency)}
        </p>
        <p className="text-xs text-orange-600 mt-0.5">
          <Tr text="Every contribution goes directly toward transforming young lives through education." />
        </p>
      </div>
    </motion.div>
  )
}
