import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Tabs } from '../components/ui/Tabs'
import { Button } from '../components/ui/Button'
import { getStudents } from '../services/students'
import { getPageHeader, getSiteImage } from '../services/cms-content'
import { useCmsStrings } from '../context/CmsStringsContext'
import type { Student } from '../types/database'
import type { PageHeader } from '../types/cms-content'
import { formatNPR } from '../utils/currency'
import { StudentCardSkeleton } from '../components/ui/LoadingSkeleton'

export function StudentsPage() {
  const { t } = useCmsStrings()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [pageHeader, setPageHeader] = useState<PageHeader | null>(null)
  const [studentFallback, setStudentFallback] = useState('')

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const [data, header, fallbackImg] = await Promise.all([
        getStudents(),
        getPageHeader('students'),
        getSiteImage('student_fallback'),
      ])
      setStudents(data)
      if (header) setPageHeader(header)
      if (fallbackImg?.image_url) setStudentFallback(fallbackImg.image_url)
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = activeFilter === 'all'
    ? students
    : students.filter(s => s.sponsorship_status === activeFilter)

  const tabs = [
    { id: 'all', label: t('students_tab_all'), count: students.length },
    { id: 'available', label: t('students_tab_available'), count: students.filter(s => s.sponsorship_status === 'available').length },
    { id: 'partially_sponsored', label: t('students_tab_partial'), count: students.filter(s => s.sponsorship_status === 'partially_sponsored').length },
    { id: 'fully_sponsored', label: t('students_tab_fully'), count: students.filter(s => s.sponsorship_status === 'fully_sponsored').length },
  ]

  return (
    <div>
      {pageHeader && (
        <section className="relative py-24 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {pageHeader.title}
              </h1>
              {pageHeader.subtitle && (
                <p className="text-xl text-gray-600">
                  {pageHeader.subtitle}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs tabs={tabs} activeTab={activeFilter} onChange={setActiveFilter} className="mb-8" />

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <StudentCardSkeleton key={i} />)}
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStudents.map((student) => (
                <Card key={student.id} variant="bordered" className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-w-4 aspect-h-3">
                    <img
                      src={student.photo_url || studentFallback || ''}
                      alt={student.name}
                      className="w-full h-56 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{student.name}</h3>
                      <Badge variant={student.sponsorship_status as 'success' | 'warning' | 'default'}>{student.sponsorship_status}</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      <span>{t('students_age_label', { age: student.age })}</span>
                      <span>{t('students_grade_label', { grade: student.grade })}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {student.bio}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{t('students_sponsorship_label', { amount: formatNPR(student.sponsorship_amount) })}</span>
                      {student.current_sponsorship > 0 && (
                        <span>{t('students_raised_label', { amount: formatNPR(student.current_sponsorship) })}</span>
                      )}
                    </div>
                    <Link to={`/students/${student.id}`}>
                      <Button variant="outline" className="w-full">
                        {t('students_view_profile')}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t('students_empty')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
