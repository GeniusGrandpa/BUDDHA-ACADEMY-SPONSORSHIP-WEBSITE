import { motion } from 'framer-motion'

interface Supporter {
  name: string
  amount: number
  timeAgo: string
  country: string
}

const recentSupporters: Supporter[] = [
  { name: 'Sarah J.', amount: 25000, timeAgo: '2 hours ago', country: 'United States' },
  { name: 'Rajesh K.', amount: 10000, timeAgo: '5 hours ago', country: 'Nepal' },
  { name: 'Emily R.', amount: 5000, timeAgo: '8 hours ago', country: 'United Kingdom' },
  { name: 'Amit S.', amount: 1000, timeAgo: '12 hours ago', country: 'India' },
  { name: 'Maria L.', amount: 25000, timeAgo: '1 day ago', country: 'Australia' },
]

export function RecentSupporters() {
  return (
    <section className="py-16 sm:py-20 bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-xl border border-amber-200 bg-warm-50 overflow-hidden">
            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-[#0f172a]">
                Recent Supporters
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Join a growing community of people making education possible.
              </p>
            </div>

            <div className="px-6 sm:px-8 py-4 space-y-3">
              {recentSupporters.map((supporter, idx) => (
                <motion.div
                  key={supporter.name + idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#0f172a]">{supporter.name}</p>
                      <p className="text-xs text-gray-600">
                        {supporter.country} &middot; {supporter.timeAgo}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-amber-600">
                    NPR {supporter.amount.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2">
              <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-center">
                <p className="text-xs text-amber-700">
                  Recent donations displayed with permission. Join these supporters in making a difference.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
