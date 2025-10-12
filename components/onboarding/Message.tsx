'use client'

/**
 * Cinematic Message Component - Framer Motion
 * Smooth spring animations, SHARPENED branding
 */

import { motion } from 'framer-motion'

interface MessageProps {
  text: string
  isWelcome?: boolean
}

export function Message({ text, isWelcome = false }: MessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.8,
        ease: [0.83, 0, 0.17, 1]
      }}
      className={isWelcome ? 'text-center mb-12' : 'mb-8'}
    >
      {isWelcome ? (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent animate-gradient tracking-tight">
            {text.replace(' 🎯', '')}
          </h1>
          <motion.div
            className="text-7xl drop-shadow-[0_0_25px_rgba(255,107,53,0.5)]"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            🎯
          </motion.div>
        </motion.div>
      ) : (
        <p className="text-2xl md:text-3xl text-neutral-white leading-relaxed font-normal">
          {text}
        </p>
      )}
    </motion.div>
  )
}
