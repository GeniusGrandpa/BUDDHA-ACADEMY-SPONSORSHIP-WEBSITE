import { useState } from 'react'
import { motion } from 'framer-motion'
import type { SponsorshipWithStudent } from '../../../types/features'
import { fadeInUp, stagger } from '../animations'
import { StudentDetailModal } from './StudentDetailModal'
import { formatNPR } from '../../../utils/currency'

interface SponsoredStudentsProps {
  sponsorships: SponsorshipWithStudent[]
}

export function SponsoredStudents({ sponsorships }: SponsoredStudentsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = sponsorships.find(s => s.student.id === selectedId)

  if (sponsorships.length === 0) return null

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Your Sponsored Students</h2>
        <span className="text-sm text-gray-500">{sponsorships.length} student{sponsorships.length !== 1 ? 's' : ''}</span>
      </div>

      <motion.div variants={stagger} initial="initial" animate="animate" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sponsorships.map((s) => {
          const student = s.student
          return (
            <motion.div
              key={s.id}
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
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{student.name}</h3>
                  <p className="text-sm text-gray-500">Grade {student.grade}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <div className="text-xs text-gray-500">Monthly Contribution</div>
                  <div className="text-sm font-semibold text-gray-900">{formatNPR(s.amount)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="text-sm font-semibold text-emerald-600 capitalize">{s.status}</div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {selected && (
        <StudentDetailModal
          student={selected.student}
          sponsorship={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  )
}
