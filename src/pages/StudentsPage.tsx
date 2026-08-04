import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Tabs } from '../components/ui/Tabs'
import { Button } from '../components/ui/Button'
import { getStudents } from '../services/students'
import { getPageHeader } from '../services/cms-content'
import { useCmsStrings } from '../context/CmsStringsContext'
import { sponsorshipVariant, sponsorshipLabel } from '../utils/sponsorship'
import { optimizeImageUrl } from '../utils/image'
import type { Student } from '../types/database'

const STUDENT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Ccircle cx='200' cy='110' r='50' fill='%239ca3af'/%3E%3Cellipse cx='200' cy='230' rx='80' ry='50' fill='%239ca3af'/%3E%3C/svg%3E"
import type { PageHeader } from '../types/cms-content'
import { formatNPR } from '../utils/currency'
import { StudentCardSkeleton } from '../components/ui/LoadingSkeleton'

export function StudentsPage() {
  const { t } = useCmsStrings()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [pageHeader, setPageHeader] = useState<PageHeader | null>(null)
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const [data, header] = await Promise.all([
        getStudents(),
        getPageHeader('students'),
      ])
      setStudents(data)
      if (header) setPageHeader(header)
    } catch {
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
        <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                {pageHeader.title}
              </h1>
              {pageHeader.subtitle && (
                <p className="text-base sm:text-lg md:text-xl text-gray-600">
                  {pageHeader.subtitle}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs tabs={tabs} activeTab={activeFilter} onChange={setActiveFilter} className="mb-6 sm:mb-8" />

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {Array.from({ length: 6 }).map((_, i) => <StudentCardSkeleton key={i} />)}
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {filteredStudents.map((student) => (
                <Card key={student.id} variant="bordered" className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3]">
                    <img
                      src={optimizeImageUrl(student.photo_url, { width: 480, height: 360, resize: 'cover', quality: 70 }) || STUDENT_PLACEHOLDER}
                      alt={student.name}
                      className="w-full h-full object-cover"
                      width={480}
                      height={360}
                      loading="lazy" decoding="async"
                      onError={e => { (e.target as HTMLImageElement).src = STUDENT_PLACEHOLDER }}
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{student.name}</h3>
                      <Badge variant={sponsorshipVariant(student.sponsorship_status)}>{sponsorshipLabel(student.sponsorship_status)}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                      <span>{t('students_age_label', { age: student.age })}</span>
                      <span>{t('students_grade_label', { grade: student.grade })}</span>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-3">
                      {student.bio}
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-gray-500 mb-4 gap-1 sm:gap-0">
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
