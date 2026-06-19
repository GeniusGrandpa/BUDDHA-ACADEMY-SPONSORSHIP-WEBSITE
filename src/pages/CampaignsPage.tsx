import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { DonationCampaignCard, CampaignGridSkeleton } from '../components/campaigns/DonationCampaignCard'
import type { DonationGoal } from '../types/database'

export function CampaignsPage() {
  const [goals, setGoals] = useState<DonationGoal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGoals()
  }, [])

  async function loadGoals() {
    const { data } = await supabase
      .from('donation_goals')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (data) setGoals(data)
    setLoading(false)
  }

  const totalRaised = goals.reduce((s, g) => s + g.raised_amount, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0)
  const overallPercentage = totalTarget > 0 ? Math.round((totalRaised / totalTarget) * 100) : 0

  return (
    <div>
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-emerald-900 via-emerald-800 to-amber-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Our Campaigns
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Every contribution brings us closer to our goals. See how your support is making a measurable impact.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {goals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-warm-50 rounded-xl p-6 border border-amber-200 mb-8"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total Raised</p>
                  <p className="text-2xl font-bold text-gray-900">NPR {totalRaised.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Goal</p>
                  <p className="text-2xl font-bold text-gray-900">NPR {totalTarget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
                </div>
              </div>
              <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPercentage}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{overallPercentage}% of overall goal achieved</p>
            </motion.div>
          )}

          {loading ? (
            <CampaignGridSkeleton />
          ) : goals.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold text-gray-900">No Campaigns Yet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
                Fundraising campaigns will appear here. Check back soon to see how you can contribute to specific causes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <DonationCampaignCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
