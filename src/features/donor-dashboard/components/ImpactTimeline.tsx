import { motion } from 'framer-motion'
import { fadeInUp, stagger } from '../animations'
import type { SponsorshipTimelineEvent } from '../../../types/features'

interface ImpactTimelineProps {
  events?: SponsorshipTimelineEvent[]
}

export function ImpactTimeline({ events = [] }: ImpactTimelineProps) {
  if (events.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Impact Feed</h2>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-500">Timeline events will appear here as your sponsorship journey progresses.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Impact Feed</h2>
      <motion.div variants={stagger} initial="initial" animate="animate" className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="space-y-0">
          {events.map((event, i) => (
            <motion.div
              key={event.id || i}
              variants={fadeInUp}
              className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">{event.description || event.event_type}</p>
                {event.event_date && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
