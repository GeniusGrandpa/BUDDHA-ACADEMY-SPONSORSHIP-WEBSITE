import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import type { Testimonial } from '../types/database'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    try {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_published', true)
        .order('sort_order')
      if (data) setTestimonials(data)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Voices From Our Community
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real stories from the people who make Buddha Academy a beacon of hope
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.id}
              variants={itemVariants}
              className="bg-warm-50 rounded-2xl border border-amber-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">
                &ldquo;{t.content}&rdquo;
              </p>
              {t.quote && (
                <p className="text-xs text-amber-600 font-medium mb-3">
                  &mdash; {t.quote}
                </p>
              )}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-700 text-xs font-bold">
                    {t.author_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.author_name}</p>
                  <p className="text-xs text-gray-500">{t.author_role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
