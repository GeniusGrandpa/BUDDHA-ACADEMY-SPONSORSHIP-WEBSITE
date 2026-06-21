import { motion } from 'framer-motion'
import { AuthBackground } from './AuthBackground'

interface AuthLoadingScreenProps {
  message?: string
}

export function AuthLoadingScreen({ message = 'Loading...' }: AuthLoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <AuthBackground />
      <motion.div
        className="flex flex-col items-center gap-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
          <span className="text-white font-bold text-xl">B</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
          {/* animationDelay cannot be done with tailwind arbitrary values */}
        </div>
        <p className="text-gray-500 text-sm">{message}</p>
      </motion.div>
    </div>
  )
}
