import { motion } from 'framer-motion'
import { fadeInUp, stagger } from '../animations'

interface ImpactCard {
  label: string
  value: string
  subtext: string
}

interface ImpactCardsProps {
  totalSponsored: number
  monthlyDonation: number
}

const gradients = ['from-blue-500 to-indigo-600', 'from-rose-500 to-pink-600']

export function ImpactCards({ totalSponsored, monthlyDonation }: ImpactCardsProps) {
  const cards: ImpactCard[] = [
    {
      label: 'Students Sponsored',
      value: String(totalSponsored),
      subtext: 'Currently supporting',
    },
    {
      label: 'Monthly Donation',
      value: monthlyDonation.toLocaleString(),
      subtext: 'Recurring support',
    },
  ]

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 gap-4 mb-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          variants={fadeInUp}
          whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
          className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-5 transition-shadow cursor-default"
        >
          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradients[i]} rounded-bl-full opacity-10`} />
          <div className="relative z-10">
            <div className="text-2xl font-bold text-gray-900 mb-0.5">{card.value}</div>
            <div className="text-sm font-medium text-gray-700">{card.label}</div>
            <div className="text-xs text-gray-400 mt-1">{card.subtext}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
