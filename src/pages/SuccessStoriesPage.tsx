import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { SuccessStoriesCarousel } from '../components/success-stories/SuccessStoriesCarousel'
import type { StudentStory } from '../types/database'

export function SuccessStoriesPage() {
  const [stories, setStories] = useState<StudentStory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStories()
  }, [])

  async function loadStories() {
    const { data } = await supabase
      .from('student_stories')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (data) setStories(data)
    setLoading(false)
  }

  return (
    <div>
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-purple-900 via-purple-800 to-emerald-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Success Stories
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Real stories of hope, growth, and transformation. See how sponsorship is changing lives at Buddha Academy.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SuccessStoriesCarousel />
        </div>
      </section>

      <section className="py-16 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All Stories</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Every child has a unique journey. Read their stories of determination, growth, and success.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold text-gray-900">Stories Coming Soon</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
                We are gathering the inspiring journeys of our sponsored children. Check back soon to read their stories.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100"
                >
                  {story.image_url && (
                    <img src={story.image_url} alt={story.student_name} className="w-full h-48 object-cover" loading="lazy" />
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        Success Story
                      </span>
                      {story.featured && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{story.title}</h3>
                    <p className="text-sm text-emerald-600 font-medium mb-2">{story.student_name}</p>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{story.content}</p>
                    {story.quote && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                        <p className="text-sm text-amber-800 italic">{story.quote}</p>
                      </div>
                    )}
                    {story.achievements && story.achievements.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {story.achievements.map((achievement, i) => (
                          <span key={i} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                            {achievement}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
