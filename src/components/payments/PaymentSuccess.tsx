import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

interface PaymentSuccessProps {
  amount: number
  transactionId: string
}

export function PaymentSuccess({ amount, transactionId }: PaymentSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center"
      >
        <CheckCircle className="w-10 h-10 text-green-600" />
      </motion.div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h2>
        <p className="text-gray-600">
          Thank you for your generous contribution. Your payment confirmation has been received and is awaiting verification.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Amount</span>
          <span className="font-semibold text-gray-900">NPR {amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Reference ID</span>
          <span className="font-mono font-medium text-gray-900">{transactionId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status</span>
          <span className="flex items-center gap-1 text-amber-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Awaiting Verification
          </span>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">What happens next?</p>
        <p>Our finance team will verify your payment within 24 hours. A donation record and receipt will only be created after successful payment verification. You can track status in your dashboard.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/dashboard">
          <Button>
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
