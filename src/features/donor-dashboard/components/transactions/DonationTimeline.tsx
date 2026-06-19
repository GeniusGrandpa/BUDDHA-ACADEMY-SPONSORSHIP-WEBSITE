import { motion } from 'framer-motion'
import type { TransactionWithDetails } from '../../../../types/features'

interface DonationTimelineProps {
  transaction: TransactionWithDetails
}

interface TimelineStep {
  label: string
  date: string | null
  completed: boolean
  active: boolean
  description: string
}

export function DonationTimeline({ transaction }: DonationTimelineProps) {
  const getSteps = (): TimelineStep[] => {
    const statusOrder = ['pending', 'processing', 'verified', 'completed']
    const currentIndex = statusOrder.indexOf(transaction.status)

    return [
      {
        label: 'Donation Created',
        date: transaction.created_at,
        completed: true,
        active: false,
        description: 'Your donation has been recorded',
      },
      {
        label: 'Payment Submitted',
        date: transaction.payment_session?.created_at || null,
        completed: currentIndex >= 1,
        active: currentIndex === 1,
        description: 'Payment confirmation submitted for review',
      },
      {
        label: 'Payment Verified',
        date: transaction.verified_at || null,
        completed: currentIndex >= 2,
        active: currentIndex === 2,
        description: 'Finance team has verified your payment',
      },
      {
        label: 'Donation Allocated',
        date: transaction.verified_at || null,
        completed: currentIndex >= 3 && (transaction.allocations?.length ?? 0) > 0,
        active: currentIndex === 3 && (transaction.allocations?.length ?? 0) === 0,
        description: 'Funds allocated to support categories',
      },
      {
        label: 'Receipt Generated',
        date: transaction.receipt?.generated_at || null,
        completed: !!transaction.receipt,
        active: false,
        description: 'Official receipt available for download',
      },
    ]
  }

  const steps = getSteps()

  return (
    <div className="relative pl-8 space-y-0">
      {steps.map((step, idx) => (
        <motion.div
          key={step.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.08 }}
          className="relative pb-6 last:pb-0"
        >
          {idx < steps.length - 1 && (
            <div
              className={`absolute left-[11px] top-5 w-0.5 h-full -translate-x-1/2 ${
                step.completed ? 'bg-orange-300' : 'bg-gray-200'
              }`}
            />
          )}

          <div className="flex items-start gap-3">
            <div
              className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-[10px] font-bold ${
                step.completed
                  ? 'bg-orange-100 text-orange-600'
                  : step.active
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {idx + 1}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    step.completed
                      ? 'text-gray-900'
                      : step.active
                        ? 'text-orange-700'
                        : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
              {step.date && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(step.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
