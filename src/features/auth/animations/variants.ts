import type { Transition, Variants } from 'framer-motion'

export const springTransition: Transition = {
  type: 'spring',
  damping: 28,
  stiffness: 250,
  mass: 0.8,
}

export const smoothTransition: Transition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1],
}

export const fadeTransition: Transition = {
  duration: 0.3,
  ease: 'easeInOut',
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: smoothTransition },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: smoothTransition },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

export const formVariants: Variants = {
  enter: (d: number) => ({ x: d * 320, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: -d * 320, opacity: 0 }),
}

export const overlayVariants: Variants = {
  enter: (d: number) => ({ x: -d * 100 + '%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d * 100 + '%', opacity: 0 }),
}

export const buttonTap = { whileHover: { scale: 1.01 }, whileTap: { scale: 0.99 } }
