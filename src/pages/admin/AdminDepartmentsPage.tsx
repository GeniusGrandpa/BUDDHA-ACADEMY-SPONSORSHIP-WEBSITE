import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import type { DonationGoal, ImpactMetric } from '../../types/database'

export function AdminDepartmentsPage() {
  const [goals, setGoals] = useState<DonationGoal[]>([])
  const [metrics, setMetrics] = useState<ImpactMetric[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [goalsResult, metricsResult] = await Promise.all([
        supabase.from('donation_goals').select('*').eq('is_active', true).order('raised_amount', { ascending: false }),
        supabase.from('impact_metrics').select('*').order('month', { ascending: false }).limit(6),
      ])
      if (goalsResult.data) setGoals(goalsResult.data)
      if (metricsResult.data) setMetrics(metricsResult.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fundraising & Impact</h1>
        <p className="text-gray-500 mt-1">Track donation goals and community impact</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="bordered" className="bg-white border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Donation Goals</h2>
          <div className="space-y-4">
            {goals.map((goal) => {
              const pct = Math.min(Math.round((goal.raised_amount / goal.target_amount) * 100), 100)
              return (
                <div key={goal.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{goal.title}</span>
                    <span className="text-gray-500">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                    {/* dynamic percentage width cannot be represented as Tailwind class */}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>NPR {goal.raised_amount.toLocaleString()}</span>
                    <span>Target: NPR {goal.target_amount.toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
            {goals.length === 0 && (
              <p className="text-gray-500 text-sm">No active goals</p>
            )}
          </div>
        </Card>

        <Card variant="bordered" className="bg-white border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Impact</h2>
          <div className="space-y-4">
            {metrics.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">
                  {new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">{m.students_supported}</span>
                  <span className="text-gray-500">{m.books_distributed}</span>
                  <span className="text-gray-400">{m.attendance_rate}%</span>
                </div>
              </div>
            ))}
            {metrics.length === 0 && (
              <p className="text-gray-500 text-sm">No impact data yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
