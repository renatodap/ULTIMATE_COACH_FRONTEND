'use client'

/**
 * Onboarding Input - Framer Motion
 * Smooth spring animations
 */

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface InputProps {
  type?: 'text' | 'number' | 'date'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  min?: number
  max?: number
  step?: number
  unit?: string
}

export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  onSubmit,
  min,
  max,
  step,
  unit
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value) {
      onSubmit()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{
        type: 'spring',
        stiffness: 220,
        damping: 12
      }}
      className="mb-12"
    >
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className="
            w-full px-6 py-6 rounded-xl text-xl
            bg-neutral-900/50 text-neutral-white placeholder-neutral-500
            border-2 border-neutral-700
            focus:border-primary focus:outline-none focus:bg-neutral-800/80 focus:shadow-xl focus:shadow-primary/20
            transition-all duration-300
          "
        />
        {unit && (
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 text-base font-medium">
            {unit}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {value && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.12 } }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            onClick={onSubmit}
            className="
              mt-6 w-full px-6 py-6 rounded-xl text-xl font-bold
              bg-primary text-neutral-white
              shadow-xl shadow-primary/50
              hover:shadow-2xl hover:shadow-primary/60
              transition-all duration-300
            "
          >
            Continue →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
