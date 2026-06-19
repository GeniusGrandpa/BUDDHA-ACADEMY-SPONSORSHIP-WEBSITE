import { motion } from 'framer-motion'

import { ActivityFeed } from '../components/activities/ActivityFeed'

export function ActivityPage() {
  return (
    <div>
      <section className="relative py-20 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Recent Activity
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Stay connected with the latest happenings at Buddha Academy — from donations and sponsorships to student achievements.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ActivityFeed />
        </div>
      </section>
    </div>
  )
}
