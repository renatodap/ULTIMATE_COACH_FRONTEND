/**
 * Rotating Text Example Component
 *
 * Shows rotating examples of natural language meal logging
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const examples = [
  'Chicken and rice for lunch',
  'had 2 eggs this morning',
  'ate a protein bar',
  '500g chicken breast',
  'just had a big salad',
]

export default function RotatingTextExample() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % examples.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="card-glass p-6 sm:p-8 border-2 border-iron-gray min-h-[200px] flex items-center justify-center">
      <div className="w-full">
        <p className="text-iron-gray text-sm mb-4 uppercase tracking-wider">You say:</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-iron-white text-xl sm:text-2xl font-medium"
          >
            &quot;{examples[currentIndex]}&quot;
          </motion.p>
        </AnimatePresence>
        <motion.div
          className="mt-6 flex items-center gap-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 rounded-full bg-iron-orange" />
          <p className="text-iron-gray text-sm">AI processing...</p>
        </motion.div>
      </div>
    </div>
  )
}
