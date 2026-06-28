import { motion } from 'framer-motion'
import { useCmsStrings } from '../../context/CmsStringsContext'

interface StudentStoryProps {
  student: {
    name: string
    age: number
    grade: string
    dream_career: string | null
    bio: string
  }
}

export function StudentStory({ student }: StudentStoryProps) {
  const { t } = useCmsStrings()
  return (
    <section className="py-16 sm:py-20 bg-[#fffaf5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="rounded-xl border border-amber-200 bg-warm-50 overflow-hidden">
            <div className="p-8 sm:p-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-medium text-amber-700">
                    {student.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                    {t('student_story_meet')}
                  </p>
                  <h3 className="text-xl font-medium text-[#0f172a]">
                    {student.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('student_story_grade_age', { grade: student.grade, age: student.age })}
                  </p>
                </div>
              </div>

              <div>
                <blockquote className="pl-4 border-l-2 border-amber-200">
                  <p className="text-gray-600 leading-relaxed italic">
                    {student.bio}
                  </p>
                </blockquote>
              </div>

              {student.dream_career && (
                <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-100">
                  <span className="text-sm text-gray-600">{t('student_story_dreams')}</span>
                  <span className="text-sm font-medium text-[#0f172a]">
                    {student.dream_career}
                  </span>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t('student_story_sponsorship_text', { name: student.name })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
