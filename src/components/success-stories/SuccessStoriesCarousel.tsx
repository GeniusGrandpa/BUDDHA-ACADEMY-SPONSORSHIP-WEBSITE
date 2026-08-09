import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCmsStrings } from '../../context/CmsStringsContext'
import { Tr } from '../Translated'
import { getStudentStories } from '../../services/content'
import { useLanguage } from '../../context/LanguageContext'
import type { StudentStory } from '../../types/database'

export function SuccessStoriesCarousel() {
  const { t } = useCmsStrings()
  const { language } = useLanguage()
  const [stories, setStories] = useState<StudentStory[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStories(language).catch(() => setLoading(false))
  }, [language])

  useEffect(() => {
    if (stories.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % stories.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [stories.length])

  async function loadStories(language: string) {
    const data = await getStudentStories(true, language)

    if (data) setStories(data)
    setLoading(false)
  }

  function nextStory() {
    setCurrentIndex(prev => (prev + 1) % stories.length)
  }

  function prevStory() {
    setCurrentIndex(prev => (prev - 1 + stories.length) % stories.length)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-warm-50 rounded-xl border border-gray-100 p-6 animate-pulse">
            <div className="w-full h-40 bg-gray-200 rounded-lg mb-4" />
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full mb-1" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900">{t('stories_empty_title')}</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
          {t('stories_empty_description')}
        </p>
      </div>
    )
  }

  if (stories.length === 1) {
    const story = stories[0]
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-warm-50 rounded-2xl overflow-hidden shadow-md border border-amber-200"
      >
        <div className="md:flex">
          {story.image_url && (
            <div className="md:w-1/2 h-64 md:h-auto">
              <img
                src={story.image_url}
                alt={story.student_name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-center">
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full self-start mb-3">
              {t('stories_badge_success')}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mb-1"><Tr text={story.title} /></h3>
            <p className="text-sm text-emerald-600 font-medium mb-3">{story.student_name}</p>
            <p className="text-gray-600 text-sm leading-relaxed"><Tr text={story.content} /></p>
            {story.quote && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-800 italic"><Tr text={story.quote} /></p>
              </div>
            )}
            {story.achievements && story.achievements.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {story.achievements.map((achievement, i) => (
                  <span key={i} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                    <Tr text={achievement} />
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  const story = stories[currentIndex]

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={story.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="bg-warm-50 shadow-md border border-amber-200"
          >
            <div className="md:flex">
              {story.image_url && (
                <div className="md:w-1/2 h-64 md:h-80">
                  <img
                    src={story.image_url}
                    alt={story.student_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-center">
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full self-start mb-3">
                  {t('stories_badge_success')}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-1"><Tr text={story.title} /></h3>
                <p className="text-sm text-emerald-600 font-medium mb-3">{story.student_name}</p>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-4"><Tr text={story.content} /></p>
                {story.quote && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-800 italic"><Tr text={story.quote} /></p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {stories.length > 1 && (
        <>
          <button
            onClick={prevStory}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label={t('story_previous')}
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={nextStory}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label={t('story_next')}
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex justify-center gap-2 mt-4">
            {stories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                    ? 'bg-emerald-500 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                aria-label={t('story_go_to', { index: index + 1 })}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
