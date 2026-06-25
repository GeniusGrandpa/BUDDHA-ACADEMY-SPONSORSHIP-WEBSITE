import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { getStudents } from '../services/students'
import { getDonationContent, getPageHeader } from '../services/cms-content'
import { PaymentModal } from '../components/payments/PaymentModal'
import { ImpactCards } from '../components/donate/ImpactCards'
import { DonationForm } from '../components/donate/DonationForm'
import { ImpactPanel } from '../components/donate/ImpactPanel'
import { AuthPrompt } from '../components/donate/AuthPrompt'
import { StudentStory } from '../components/donate/StudentStory'
import type { Student } from '../types/database'
import type { StudentSummary } from '../components/donate/types'
import type { DonationContent, PageHeader } from '../types/cms-content'
import { DetailPageSkeleton } from '../components/ui/LoadingSkeleton'

export function DonatePage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState<DonationContent | null>(null)
  const [pageHeader, setPageHeader] = useState<PageHeader | null>(null)

  const [amount, setAmount] = useState(0)
  const [customAmount, setCustomAmount] = useState('')
  const [frequency, setFrequency] = useState<'one-time' | 'monthly' | 'annual'>('one-time')
  const [studentId, setStudentId] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    Promise.all([
      getDonationContent(),
      getPageHeader('donate'),
      getStudents(),
    ]).then(([donationContent, header, studentsData]) => {
      setContent(donationContent)
      setPageHeader(header)
      setStudents(studentsData.filter(s => s.sponsorship_status !== 'fully_sponsored'))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const sid = searchParams.get('student')
    if (sid) setStudentId(sid)
  }, [searchParams])

  const studentSummaries: StudentSummary[] = useMemo(
    () =>
      students.map((s) => ({
        id: s.id,
        name: s.name,
        age: s.age,
        grade: s.grade,
        photo_url: s.photo_url,
        dream_career: s.dream_career,
        sponsorship_status: s.sponsorship_status,
      })),
    [students],
  )

  const featuredStudent = useMemo(() => {
    if (studentSummaries.length === 0) return null
    const selected = studentSummaries.find((s) => s.id === studentId)
    if (selected) {
      const fullStudent = students.find((s) => s.id === selected.id)
      return fullStudent || null
    }
    return students[0] || null
  }, [studentSummaries, studentId, students])

  if (loading || !content) return <div className="max-w-6xl mx-auto px-4 py-16"><DetailPageSkeleton /></div>

  const handlePresetClick = (value: number) => {
    setAmount(value)
    setCustomAmount('')
  }

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value)
    const parsed = parseInt(value)
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed)
    }
  }

  const handleDonate = () => {
    if (!user) return
    setShowPaymentModal(true)
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#d97706] via-[#f59e0b] to-[#b45309]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')]" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/20 via-transparent to-stone-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/80 text-sm font-light tracking-wide mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#fde68a]" />
                {pageHeader?.title || 'Donation Program'}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight mb-6">
                {content.hero_title}
              </h1>
              <p className="text-lg sm:text-xl text-white/90 font-light leading-relaxed max-w-2xl mb-10">
                {content.hero_subtitle}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <ImpactCards
        amounts={content.impact_cards}
        selectedAmount={amount}
        onSelect={(val) => {
          setAmount(val)
          setCustomAmount('')
        }}
      />

      {content.process_steps.length > 0 && (
        <section className="py-16 sm:py-20 bg-warm-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-light text-[#0f172a]">
                How It Works
              </h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.process_steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative bg-white rounded-xl border border-amber-200 p-6 text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-medium mx-auto mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-base font-medium text-[#0f172a] mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 sm:py-20 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="lg:col-span-2 space-y-6">
              <p className="text-xs text-gray-400">All amounts in {content.currency_label}</p>
              {!user && <AuthPrompt />}

              <DonationForm
                amount={amount}
                customAmount={customAmount}
                frequency={frequency}
                studentId={studentId}
                message={message}
                students={studentSummaries}
                onCustomAmountChange={handleCustomAmount}
                onPresetClick={handlePresetClick}
                onFrequencyChange={setFrequency}
                onStudentChange={setStudentId}
                onMessageChange={setMessage}
                onDonate={handleDonate}
                isAuthenticated={!!user}
                isLoading={false}
              />
            </div>

            <div className="lg:col-span-1">
              <ImpactPanel amount={amount} frequency={frequency} />
            </div>
          </div>
        </div>
      </section>

      {featuredStudent && (
        <StudentStory
          student={{
            name: featuredStudent.name,
            age: featuredStudent.age,
            grade: featuredStudent.grade,
            dream_career: featuredStudent.dream_career,
            bio: featuredStudent.bio,
          }}
        />
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={amount}
        frequency={frequency}
        studentId={studentId || null}
        message={message || null}
      />
    </div>
  )
}
