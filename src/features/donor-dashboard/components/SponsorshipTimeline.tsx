import { motion } from 'framer-motion'

import { fadeInUp, stagger } from '../animations'
import { formatRelativeTime } from '../utils/formatters'
import { Tr } from '../../../components/Translated'
import type { SponsorshipTimelineEvent } from '../../../types/features'

interface SponsorshipTimelineProps {
  events: SponsorshipTimelineEvent[]
}

const eventLineColors: Record<string, string> = {
  started: 'bg-orange-300',
  donation: 'bg-orange-300',
  report: 'bg-orange-200',
  achievement: 'bg-orange-300',
  milestone: 'bg-orange-300',
  update: 'bg-orange-200',
  renewal: 'bg-orange-300',
}

export function SponsorshipTimeline({ events }: SponsorshipTimelineProps) {
  if (events.length === 0) {
    return (
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1"><Tr text="No Timeline Events Yet" /></h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          <Tr text="Your sponsorship journey timeline will appear here as milestones are reached." />
        </p>
      </motion.div>
    )
  }

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
  )

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900"><Tr text="Sponsorship Timeline" /></h2>
        <span className="text-sm text-gray-500">{sortedEvents.length} {sortedEvents.length !== 1 ? <Tr text="events" /> : <Tr text="event" />}</span>
      </div>

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="bg-white rounded-2xl border border-gray-100 p-5 max-h-[480px] overflow-y-auto"
      >
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />

          <div className="space-y-0">
            {sortedEvents.map((event, idx) => {
              const lineColor = eventLineColors[event.event_type] || eventLineColors.milestone
              const isLast = idx === sortedEvents.length - 1

              return (
                <motion.div
                  key={event.id}
                  variants={fadeInUp}
                  className="relative flex items-start gap-4 pb-6 last:pb-0"
                >
                  {!isLast && (
                    <div className={`absolute left-5 top-10 w-0.5 bottom-0 ${lineColor} opacity-30`} />
                  )}
                  <div className="relative z-10 w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 text-sm font-bold text-orange-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">{event.title}</h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">
                        {formatRelativeTime(event.event_date)}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{event.description}</p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
