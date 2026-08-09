import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ChevronDown, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { fadeInUp, stagger } from '../animations'
import { Tr } from '../../../components/Translated'
import type { TeacherReport } from '../../../types/database'
import type { SponsorshipWithStudent } from '../../../types/features'

interface StudentProgressUpdatesProps {
  reports: TeacherReport[]
  students: SponsorshipWithStudent[]
}

interface ReportWithStudent extends TeacherReport {
  studentName?: string
  studentPhoto?: string
  studentGrade?: string
}

export function StudentProgressUpdates({ reports, students }: StudentProgressUpdatesProps) {
  const { t } = useTranslation()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const studentMap = new Map(students.map((s) => [s.student.id, s.student]))

  const reportsWithStudents: ReportWithStudent[] = reports.map((r) => {
    const student = studentMap.get(r.student_id)
    return {
      ...r,
      studentName: student?.name || t('Unknown Student', { defaultValue: 'Unknown Student' }),
      studentPhoto: student?.photo_url || undefined,
      studentGrade: student?.grade || undefined,
    }
  })

  const displayedReports = showAll ? reportsWithStudents : reportsWithStudents.slice(0, 4)

  if (reports.length === 0) {
    return (
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 text-center">
        <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-7 h-7 text-orange-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1"><Tr text="No Progress Reports Yet" /></h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          <Tr text="Teacher reports will appear here once they're published. Check back soon for updates on your sponsored students." />
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900"><Tr text="Student Progress Updates" /></h2>
        <span className="text-sm text-gray-500">{reports.length} {reports.length !== 1 ? <Tr text="reports" /> : <Tr text="report" />}</span>
      </div>

      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-3">
        {displayedReports.map((report) => {
          const isExpanded = expandedId === report.id
          const attendanceTrend = report.attendance_rate != null
            ? report.attendance_rate >= 75 ? 'positive' : 'negative'
            : null

          return (
            <motion.div
              key={report.id}
              variants={fadeInUp}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-100 flex items-center justify-center shrink-0">
                    {report.studentPhoto ? (
                      <img src={report.studentPhoto} alt="" className="w-10 h-10 rounded-xl object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <User className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{report.studentName}</h3>
                        <p className="text-xs text-gray-500">{report.title}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {attendanceTrend && (
                          <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                            attendanceTrend === 'positive'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {report.attendance_rate}%
                          </span>
                        )}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : report.id)}
                          className={`p-1 rounded-lg transition-colors ${
                            isExpanded ? 'bg-orange-50 text-orange-500' : 'text-gray-300 hover:text-gray-500'
                          }`}
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {report.subject && (
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                          {report.subject}
                        </span>
                      )}
                      {report.grade_achieved && (
<span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <Tr text="Grade: " />{report.grade_achieved}
                          </span>
                      )}
                    </div>
                  </div>
                </div>

                {report.achievements && report.achievements.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {report.achievements.slice(0, 2).map((achievement, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                        {achievement}
                      </span>
                    ))}
                    {report.achievements.length > 2 && (
                          <span className="text-xs text-gray-500">+{report.achievements.length - 2} <Tr text="more" /></span>
                    )}
                  </div>
                )}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
                      {report.summary && (
                        <p className="text-sm text-gray-600 leading-relaxed">{report.summary}</p>
                      )}
                      {report.teacher_notes && (
                        <div className="bg-orange-50/50 rounded-lg p-3 border border-orange-200/50">
                          <p className="text-xs font-medium text-orange-700 mb-1"><Tr text="Teacher's Note" /></p>
                          <p className="text-sm text-orange-800/80 italic">&ldquo;{report.teacher_notes}&rdquo;</p>
                        </div>
                      )}
                      {report.areas_for_improvement && report.areas_for_improvement.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1"><Tr text="Areas for Improvement" /></p>
                          <div className="flex flex-wrap gap-1.5">
                            {report.areas_for_improvement.map((area, i) => (
                              <span key={i} className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Tr text="Reported: " />{new Date(report.report_date).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </motion.div>

      {reportsWithStudents.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2.5 text-sm font-medium text-orange-600 bg-orange-50/50 rounded-xl hover:bg-orange-100/50 transition-colors border border-orange-100/50"
        >
          {showAll ? <Tr text="Show Less" /> : <Tr text="View All" />} {reportsWithStudents.length} <Tr text="Reports" />
        </button>
      )}
    </motion.div>
  )
}
