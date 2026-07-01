import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ContributionWithStudent } from '../../../types/features'
import { fadeInUp, stagger } from '../animations'
import { StudentDetailModal } from './StudentDetailModal'
import { formatNPR } from '../../../utils/currency'

interface SponsoredStudentsProps {
  contributions: ContributionWithStudent[]
}

export function SponsoredStudents({ contributions }: SponsoredStudentsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = contributions.find(c => c.student.id === selectedId)

  if (contributions.length === 0) return null

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Your Sponsored Students</h2>
        <span className="text-sm text-gray-500">{contributions.length} student{contributions.length !== 1 ? 's' : ''}</span>
      </div>

      <motion.div variants={stagger} initial="initial" animate="animate" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contributions.map((c) => {
          const student = c.student
          return (
            <motion.div
              key={c.id}
              variants={fadeInUp}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedId(student.id)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img
                    src={student.photo_url || ''}
                    alt={student.name}
                    className="w-14 h-14 rounded-xl object-cover"
                    loading="lazy" decoding="async"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{student.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">Grade {student.grade}</p>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      c.type === 'sponsorship'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {c.type === 'sponsorship' ? 'Sponsorship' : 'Donation'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <div className="text-xs text-gray-500">{c.type === 'sponsorship' ? 'Monthly' : 'Amount'}</div>
                  <div className="text-sm font-semibold text-gray-900">{formatNPR(c.amount)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="text-sm font-semibold text-emerald-600 capitalize">{c.status}</div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {selected && (
        <StudentDetailModal
          student={selected.student}
          contribution={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  )
}
