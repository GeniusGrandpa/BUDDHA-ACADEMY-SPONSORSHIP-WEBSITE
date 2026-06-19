import { motion } from 'framer-motion'

interface AuthCardProps {
  children: React.ReactNode
  className?: string
}

export function AuthCard({ children, className = '' }: AuthCardProps) {
  return (
    <motion.div
      className={`bg-warm-50 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06)] border border-amber-100/60 ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="p-6 sm:p-8">
        {children}
      </div>
    </motion.div>
  )
}
