import { useState, useEffect, useRef } from 'react'

const ROTATING_MESSAGES = [
  'Loading sponsored students...',
  'Preparing donor impact reports...',
  'Gathering success stories...',
  'Connecting our community...',
  'Building brighter futures...',
]

export function PremiumGlobalLoader() {
  const [messageIndex, setMessageIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const minDuration = 500
    const elapsed = Date.now() - startRef.current
    if (elapsed < minDuration) {
      const timer = setTimeout(() => setVisible(true), minDuration - elapsed)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % ROTATING_MESSAGES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const duration = 3000
    const step = 100
    const increment = 100 / (duration / step)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return Math.min(prev + increment, 90)
      })
    }, step)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ease-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ backgroundColor: '#FFF8F0' }}
      role="status"
      aria-busy="true"
      aria-label="Application loading"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -left-16 w-48 h-48 rounded-full opacity-[0.02]" style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }} />
      </div>

      <div className="relative flex flex-col items-center gap-8 px-6 max-w-sm w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
            <svg viewBox="0 0 40 40" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 4C12 4 6 10 6 18c0 8 14 18 14 18s14-10 14-18c0-8-6-14-14-14z" />
              <circle cx="20" cy="18" r="4" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#1C1917' }}>Buddha Academy</h1>
            <p className="text-sm mt-1" style={{ color: '#78716C' }}>Nepal</p>
          </div>
        </div>

        <div className="w-full space-y-4">
          <p className="text-base text-center font-medium" style={{ color: '#44403C' }}>
            Preparing opportunities for students...
          </p>

          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#FBE7CC' }}>
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)' }}
            />
          </div>
        </div>

        <div className="h-6 relative w-full text-center">
          {ROTATING_MESSAGES.map((msg, idx) => (
            <p
              key={msg}
              className={`absolute inset-0 text-sm transition-opacity duration-700 ease-out ${
                idx === messageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ color: '#A8A29E' }}
              aria-hidden={idx !== messageIndex}
            >
              {msg}
            </p>
          ))}
        </div>
      </div>

      <p className="sr-only">Loading application content. Please wait.</p>
    </div>
  )
}
