import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, CheckCircle, Loader2, Users } from 'lucide-react'
import { getUpcomingEvents, signUpForEvent, cancelSignup, getVolunteerSignups } from '../../services/volunteerEvents'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import type { VolunteerEvent, VolunteerEventSignup } from '../../types/database'

export function VolunteerEventsList() {
  const [events, setEvents] = useState<VolunteerEvent[]>([])
  const [signups, setSignups] = useState<VolunteerEventSignup[]>([])
  const [loading, setLoading] = useState(true)
  const [signingUp, setSigningUp] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    init()
  }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      setUserRole(profile?.role || null)

      const userSignups = await getVolunteerSignups(user.id)
      setSignups(userSignups)
    }

    const eventData = await getUpcomingEvents()
    setEvents(eventData)
    setLoading(false)
  }

  async function handleSignUp(eventId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please sign in to register for events')
      return
    }

    setSigningUp(eventId)
    const result = await signUpForEvent(eventId, user.id)
    if (result.success) {
      toast.success('Successfully registered for event!')
      await init()
    } else {
      toast.error(result.error || 'Failed to register')
    }
    setSigningUp(null)
  }

  async function handleCancel(eventId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (!confirm('Are you sure you want to cancel your registration?')) return

    const result = await cancelSignup(eventId, user.id)
    if (result.success) {
      toast.success('Registration cancelled')
      await init()
    } else {
      toast.error(result.error || 'Failed to cancel')
    }
  }

  function isRegistered(eventId: string): boolean {
    return signups.some(s => s.event_id === eventId)
  }

  function isFull(event: VolunteerEvent): boolean {
    return event.current_volunteers >= event.max_volunteers
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-warm-50 rounded-xl border border-gray-100 p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900">No Upcoming Events</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
          There are no volunteer events scheduled at the moment. New events will appear here once they are announced.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-warm-50 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
        >
          {event.image_url && (
            <div className="h-40 overflow-hidden">
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 capitalize">
                {event.category}
              </span>
            </div>

            {event.description && (
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              {event.event_time && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {event.event_time}
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {event.location}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                {event.current_volunteers}/{event.max_volunteers} volunteers registered
              </div>
            </div>

            {event.responsibilities && event.responsibilities.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Responsibilities:</p>
                <ul className="space-y-1">
                  {event.responsibilities.map((resp, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {userRole === 'volunteer' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {isRegistered(event.id) ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      You are registered
                    </span>
                    <button
                      onClick={() => handleCancel(event.id)}
                      className="text-sm text-red-500 hover:text-red-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSignUp(event.id)}
                    disabled={isFull(event) || signingUp === event.id}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {signingUp === event.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isFull(event) ? (
                      'Event Full'
                    ) : (
                      'Register as Volunteer'
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
