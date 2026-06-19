import { motion } from 'framer-motion'
import type { PaymentGateway } from '../../types/payments'

interface PaymentMethodCardProps {
  gateway: PaymentGateway
  name: string
  description: string
  isSelected: boolean
  onSelect: () => void
}

const gatewayIcons: Record<PaymentGateway, string> = {
  khalti: 'K',
  esewa: 'E',
  mobile_banking: 'MB',
}

export function PaymentMethodCard({ gateway, name, description, isSelected, onSelect }: PaymentMethodCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      className={`relative w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? 'border-amber-500 bg-amber-50 shadow-md'
          : 'border-amber-200 bg-warm-50 hover:border-amber-300 hover:shadow-sm'
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}

      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
          isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'
        }`}>
          {gatewayIcons[gateway]}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
    </motion.button>
  )
}
