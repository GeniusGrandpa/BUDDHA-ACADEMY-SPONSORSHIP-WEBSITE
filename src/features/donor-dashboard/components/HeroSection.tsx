import { motion } from 'framer-motion'
import { fadeInUp } from '../animations'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

interface HeroSectionProps {
  name: string
  totalStudents: number
  activeSponsorships: number
  totalDonated: number
}

export function HeroSection({ name, totalStudents, activeSponsorships, totalDonated }: HeroSectionProps) {
  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-8">
      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-amber-100 font-medium">{getGreeting()}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            {name || 'Donor'}
          </h1>
          <p className="text-amber-100 text-lg mb-6 max-w-xl">
            You've helped support <strong>{totalStudents}</strong> student{totalStudents !== 1 ? 's' : ''} this year. Every contribution creates ripples of change.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-amber-100 text-xs mb-1">Active Sponsorships</div>
              <div className="text-2xl font-bold">{activeSponsorships}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-amber-100 text-xs mb-1">Impact Score</div>
              <div className="text-2xl font-bold">{totalDonated > 0 ? 'Active' : '—'}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 col-span-2 sm:col-span-1">
              <div className="text-amber-100 text-xs mb-1">Total Given</div>
              <div className="text-2xl font-bold">{totalDonated.toLocaleString()}</div>
              <div className="text-amber-100 text-xs">Lifetime contributions</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
