import { motion } from 'framer-motion'
import { useCmsStrings } from '../../context/CmsStringsContext'
import type { StudentSummary } from './types'

interface DonationFormProps {
  amount: number
  customAmount: string
  frequency: 'one-time' | 'monthly' | 'annual'
  studentId: string
  message: string
  students: StudentSummary[]
  onCustomAmountChange: (value: string) => void
  onPresetClick: (value: number) => void
  onFrequencyChange: (value: 'one-time' | 'monthly' | 'annual') => void
  onStudentChange: (value: string) => void
  onMessageChange: (value: string) => void
  onDonate: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

export function DonationForm({
  amount,
  customAmount,
  frequency,
  studentId,
  message,
  students,
  onCustomAmountChange,
  onPresetClick,
  onFrequencyChange,
  onStudentChange,
  onMessageChange,
  onDonate,
  isAuthenticated,
  isLoading,
}: DonationFormProps) {
  const { t } = useCmsStrings()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="rounded-xl border border-amber-200 bg-warm-50 overflow-hidden">
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-2">
          <h2 className="text-xl font-medium text-[#0f172a]">{t('donate_form_heading')}</h2>
          <p className="text-sm text-gray-600 mt-1">{t('donate_form_description')}</p>
        </div>

        <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-7">
          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-3">
              {t('donate_frequency_label')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'one-time' as const, label: t('donate_frequency_one_time'), description: t('donate_frequency_one_time_desc') },
                { value: 'monthly' as const, label: t('donate_frequency_monthly'), description: t('donate_frequency_monthly_desc') },
                { value: 'annual' as const, label: t('donate_frequency_annual'), description: t('donate_frequency_annual_desc') },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onFrequencyChange(opt.value)}
                  className={`px-4 py-3 rounded-lg border text-left transition-all duration-200 ${frequency === opt.value
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-amber-200 bg-warm-50 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                >
                  <div>
                    <span
                      className={`text-sm font-medium ${frequency === opt.value ? 'text-amber-700' : 'text-[#0f172a]'
                        }`}
                    >
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-3">
              {t('donate_amount_label')}
            </label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {[1000, 2500, 5000, 10000, 25000].map((preset) => {
                const isActive = amount === preset && !customAmount
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onPresetClick(preset)}
                    className={`px-2 py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${isActive
                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <span className="block text-xs text-gray-600 mb-0.5">{t('donate_currency_label')}</span>
                    <span className="block">{preset.toLocaleString('en-US')}</span>
                  </button>
                )
              })}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">{t('donate_currency_label')}</span>
              <input
                type="number"
                min="100"
                value={customAmount}
                onChange={(e) => onCustomAmountChange(e.target.value)}
                placeholder={t('donate_custom_placeholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[#0f172a] placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-3">
              {t('donate_student_label')}
            </label>
            {students.length > 0 ? (
              <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => onStudentChange('')}
                  className={`text-left px-4 py-3 rounded-lg border text-sm transition-all duration-200 ${studentId === ''
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <span className="font-medium">{t('donate_general_option')}</span>
                  <span className="block text-xs text-gray-600 mt-0.5">
                    {t('donate_general_desc')}
                  </span>
                </button>
                {students.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => onStudentChange(student.id)}
                    className={`text-left px-4 py-3 rounded-lg border text-sm transition-all duration-200 ${studentId === student.id
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <span
                          className={`font-medium ${studentId === student.id ? 'text-amber-700' : 'text-[#0f172a]'
                            }`}
                        >
                          {student.name}
                        </span>
                        <span className="block text-xs text-gray-600 mt-0.5">
                          {t('donate_student_format', {
                            grade: student.grade,
                            age: student.age,
                            career: student.dream_career || '',
                          })}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-600">
                {t('donate_loading_students')}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-2">
              {t('donate_message_label')}
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder={t('donate_message_placeholder')}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[#0f172a] placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-colors resize-none"
            />
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-0.5">{t('donate_transparent_heading')}</p>
              <p className="text-amber-600">
                {t('donate_transparent_desc')}
              </p>
            </div>
          </div>

          <button
            onClick={onDonate}
            disabled={!isAuthenticated || amount < 100}
            className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-[#f59e0b] text-white text-sm font-medium hover:bg-[#d97706] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? t('donate_processing_text') : t('donate_button_text')}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
