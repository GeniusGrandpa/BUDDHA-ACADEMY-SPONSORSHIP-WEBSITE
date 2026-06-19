import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { formatNPR } from '../utils/currency'
import type { DonationGoal } from '../types/database'



export function DonationGoals() {
  const [goals, setGoals] = useState<DonationGoal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      const { data } = await supabase
        .from('donation_goals')
        .select('*')
        .eq('is_active', true)
        .order('raised_amount', { ascending: false })
      if (data) setGoals(data)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  if (loading || goals.length === 0) return null

  return (
    <section className="py-20 bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Funding Goals
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Every contribution brings us closer to our mission
          </p>
          <p className="text-xs text-gray-400 mt-4">All amounts in Nepalese Rupees (NPR)</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, idx) => {
            const percentage = Math.min(Math.round((goal.raised_amount / goal.target_amount) * 100), 100)
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                  <p className="text-xs text-gray-500">{goal.donor_count} donors</p>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-900">
                      {formatNPR(goal.raised_amount)}
                    </span>
                    <span className="text-gray-500">
                      of {formatNPR(goal.target_amount)}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      className={`h-full rounded-full ${
                        percentage >= 100
                          ? 'bg-emerald-500'
                          : percentage >= 50
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">{percentage}% funded</span>
                  <span className="text-xs text-gray-400">
                    {formatNPR(goal.target_amount - goal.raised_amount)} needed
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
