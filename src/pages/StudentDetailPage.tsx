import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getStudentById } from '../services/students'
import { getSiteImage } from '../services/cms-content'
import { useCmsStrings } from '../context/CmsStringsContext'
import { sponsorshipVariant, sponsorshipLabel } from '../utils/sponsorship'
import type { Student } from '../types/database'
import { formatNPR } from '../utils/currency'

function DetailSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="w-full h-80 bg-gray-200 animate-pulse" />
              <div className="p-6 space-y-4">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="pt-6 border-t border-gray-200 space-y-2">
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                  <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-gray-200 rounded-xl p-6 space-y-3">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="border border-gray-200 rounded-xl p-6 space-y-3">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function StudentDetailPage() {
  const { t } = useCmsStrings()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [photoFallback, setPhotoFallback] = useState('')

  useEffect(() => {
    if (id) loadStudent(id)
  }, [id])

  const loadStudent = async (studentId: string) => {
    try {
      const [data, fb] = await Promise.all([
        getStudentById(studentId),
        getSiteImage('student_fallback'),
      ])
      setStudent(data)
      if (fb?.image_url) setPhotoFallback(fb.image_url)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DetailSkeleton />

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('student_not_found')}</h2>
          <Button onClick={() => navigate('/students')}>
            {t('student_back_to_list')}
          </Button>
        </div>
      </div>
    )
  }

  const sponsorshipProgress = student.sponsorship_amount > 0
    ? Math.min((student.current_sponsorship / student.sponsorship_amount) * 100, 100)
    : 0

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('student_back')}</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-1">
            <Card variant="bordered" className="overflow-hidden">
                  <img
                    src={student.photo_url ?? (photoFallback || undefined)}
                    alt={student.name}
                    className="w-full h-80 object-cover"
                    loading="eager" decoding="async"
                  />
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{student.name}</h1>
                  <Badge variant={sponsorshipVariant(student.sponsorship_status)}>{sponsorshipLabel(student.sponsorship_status)}</Badge>
                </div>

                <div className="space-y-2 text-sm sm:text-base text-gray-600">
                  <div>{t('student_age_label', { age: student.age })}</div>
                  <div>{t('student_grade_label', { grade: student.grade })}</div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm sm:text-base text-gray-600">{t('student_sponsorship_goal')}</span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{formatNPR(student.sponsorship_amount)}/month</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-amber-500 rounded-full h-2 transition-all"
                      style={{ width: `${sponsorshipProgress}%` }}
                    />

                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 text-right">
                    {t('student_raised_of', {
                      current: formatNPR(student.current_sponsorship),
                      goal: formatNPR(student.sponsorship_amount),
                    })}
                  </div>
                </div>

                {student.sponsorship_status !== 'fully_sponsored' && (
                  <Link to={`/donate?student=${student.id}`} className="block mt-6">
                    <Button className="w-full" size="lg">
                      {t('student_sponsor_button')}
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card variant="bordered" padding="lg">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{t('student_about_heading', { name: student.name })}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {student.bio}
              </p>
            </Card>

            {student.family_background && (
              <Card variant="bordered" padding="lg">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{t('student_family_heading')}</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {student.family_background}
                </p>
              </Card>
            )}

            <Card variant="bordered" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t('student_education_heading')}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="mb-2">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{t('student_monthly_sponsorship')}</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-amber-600">{formatNPR(student.sponsorship_amount)}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{t('student_current_support')}</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600">{formatNPR(student.current_sponsorship)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
