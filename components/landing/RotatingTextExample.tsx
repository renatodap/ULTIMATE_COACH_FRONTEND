'use client'

/**
 * RotatingTextExample - Cycles through different ways of logging the same food
 * Shows how AI understands any phrasing
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const examples = [
  { input: 'I had 3 eggs for breakfast', color: 'text-iron-white' },
  { input: 'Ate eggs this morning', color: 'text-iron-white' },
  { input: 'Had some protein', color: 'text-iron-white' },
  { input: 'Three eggs 🍳', color: 'text-iron-white' },
  { input: '3x eggs', color: 'text-iron-white' },
]

const result = {
  text: '→ 3 eggs (18g protein)',
  color: 'text-iron-orange',
}

export default function RotatingTextExample() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % examples.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-3">
      {/* Input - rotating */}
      <div className="bg-iron-dark-gray border border-iron-gray p-4 min-h-[60px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`text-sm ${examples[currentIndex].color}`}
          >
            {examples[currentIndex].input}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Arrow */}
      <div className="text-center text-iron-orange text-2xl">↓</div>

      {/* Result - constant */}
      <div className="bg-iron-orange/10 border border-iron-orange p-4">
        <span className={`text-sm font-bold ${result.color}`}>
          {result.text}
        </span>
      </div>
    </div>
  )
}
