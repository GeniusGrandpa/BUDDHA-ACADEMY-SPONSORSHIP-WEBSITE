import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getStudents } from '../services/students'
import { PaymentModal } from '../components/payments/PaymentModal'
import { HeroSection } from '../components/donate/HeroSection'
import { ImpactCards } from '../components/donate/ImpactCards'
import { DonationForm } from '../components/donate/DonationForm'
import { ImpactPanel } from '../components/donate/ImpactPanel'
import { AuthPrompt } from '../components/donate/AuthPrompt'
import { StudentStory } from '../components/donate/StudentStory'
import { IMPACT_CARDS } from '../components/donate/types'
import type { Student } from '../types/database'
import type { StudentSummary } from '../components/donate/types'

export function DonatePage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const [amount, setAmount] = useState(5000)
  const [customAmount, setCustomAmount] = useState('')
  const [frequency, setFrequency] = useState<'one-time' | 'monthly' | 'annual'>('one-time')
  const [studentId, setStudentId] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    getStudents()
      .then(data => setStudents(data.filter(s => s.sponsorship_status !== 'fully_sponsored')))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const sid = searchParams.get('student')
    if (sid) setStudentId(sid)
  }, [searchParams])

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

  return (
    <div className="min-h-screen bg-warm-50">
      <HeroSection />

      <ImpactCards
        amounts={IMPACT_CARDS}
        selectedAmount={amount}
        onSelect={(val) => {
          setAmount(val)
          setCustomAmount('')
        }}
      />

      <section className="py-16 sm:py-20 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="lg:col-span-2 space-y-6">
              <p className="text-xs text-gray-400">All amounts in Nepalese Rupees (NPR)</p>
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
            bio: featuredStudent.bio || `${featuredStudent.name} is a dedicated student at Buddha Academy, eager to learn and build a better future through education.`,
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
