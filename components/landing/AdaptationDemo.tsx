'use client'

/**
 * AdaptationDemo - Shows daily auto-adjustment
 * Numbers morph based on different activity levels
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const scenarios = [
  {
    day: 'Monday',
    activity: 'Rest Day',
    calories: 2200,
    icon: '😴',
    color: 'text-iron-gray',
  },
  {
    day: 'Tuesday',
    activity: 'Leg Day',
    calories: 2700,
    icon: '🏋️',
    color: 'text-iron-orange',
  },
  {
    day: 'Wednesday',
    activity: 'Cardio',
    calories: 2500,
    icon: '🏃',
    color: 'text-iron-white',
  },
]

export default function AdaptationDemo() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % scenarios.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const current = scenarios[currentIndex]

  return (
    <div className="bg-iron-dark-gray border border-iron-gray p-6 space-y-6">
      {/* Day & Activity */}
      <div className="flex items-center justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <span className="text-3xl">{current.icon}</span>
            <div>
              <p className="text-xs text-iron-gray uppercase tracking-wider">
                {current.day}
              </p>
              <p className={`text-lg font-bold ${current.color}`}>
                {current.activity}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Calorie Display - Morphing Number */}
      <div className="bg-iron-black border-l-4 border-iron-orange p-6">
        <p className="text-xs text-iron-gray uppercase tracking-wider mb-2">
          Your Daily Target
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={current.calories}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="text-5xl font-black text-iron-orange"
          >
            {current.calories.toLocaleString()}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs text-iron-gray uppercase tracking-wider mt-2">
          calories
        </p>
      </div>

      {/* Note */}
      <p className="text-xs text-iron-gray text-center uppercase tracking-wider">
        Auto-adjusted based on today&apos;s activity
      </p>
    </div>
  )
}
