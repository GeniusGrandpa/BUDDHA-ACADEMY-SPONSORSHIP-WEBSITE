import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { Student } from '../../../types/database'
import type { ContributionWithStudent } from '../../../types/features'
import { useSiteCurrency } from '../hooks/useSiteCurrency'
import { formatCurrency } from '../../../utils/currency'
import { Tr } from '../../../components/Translated'
import { getLocalizedField } from '../../../utils/localization'

interface StudentDetailModalProps {
  student: Student
  contribution: ContributionWithStudent
  onClose: () => void
}

export function StudentDetailModal({ student, contribution, onClose }: StudentDetailModalProps) {
  const currency = useSiteCurrency()
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
        >
          <div className="relative h-40 bg-gradient-to-br from-orange-500 to-orange-600">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute -bottom-12 left-6">
              <img
                src={student.photo_url || 'https://images.pexels.com/photos/1171086/pexels-photo-1171086.jpeg?auto=compress&cs=tinysrgb&w=200'}
                alt={getLocalizedField(student, 'name') || student.name}
                className="w-24 h-24 rounded-xl object-cover border-4 border-white shadow-lg"
                loading="lazy" decoding="async"
              />
            </div>
          </div>

          <div className="pt-16 pb-6 px-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl font-bold text-gray-900">{getLocalizedField(student, 'name') || student.name}</h2>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                contribution.type === 'sponsorship'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {contribution.type === 'sponsorship' ? <Tr text="Monthly Sponsorship" /> : <Tr text="One-time Donation" />}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
              <span><Tr text="Grade" /> {getLocalizedField(student, 'grade') || student.grade}</span>
              <span><Tr text="Age" /> {student.age}</span>
            </div>

            <p className="text-gray-600 text-sm mb-4 leading-relaxed">{getLocalizedField(student, 'bio') || student.bio}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <div className="text-xs text-orange-600 font-medium">{contribution.type === 'sponsorship' ? <Tr text="Monthly" /> : <Tr text="Total" />}</div>
                <div className="text-lg font-bold text-orange-700">{formatCurrency(contribution.amount, currency)}</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <div className="text-xs text-orange-600 font-medium"><Tr text="Since" /></div>
                <div className="text-lg font-bold text-orange-700">
                  {new Date(contribution.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            {contribution.type === 'sponsorship' && (
              <div className="bg-orange-100 rounded-xl p-4">
                <div className="text-sm font-semibold text-orange-800 mb-1"><Tr text="Recent Achievement" /></div>
                <p className="text-sm text-orange-700"><Tr text="Won inter-school science quiz competition. Showing great dedication in mathematics and science." /></p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
