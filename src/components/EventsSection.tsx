import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Event } from '../types/database'



export function EventsSection() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date')
        .limit(3)
      if (data) setEvents(data)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  if (loading || events.length === 0) return null

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Upcoming Events
            </h2>
            <p className="text-gray-600">
              Join us in celebrating our students and community
            </p>
          </div>
          <Link
            to="/gallery"
            className="text-amber-600 hover:text-amber-700 font-medium text-sm hidden sm:flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {events.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-warm-50 rounded-2xl border border-amber-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {event.event_type}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                {event.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                )}
                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  {event.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
