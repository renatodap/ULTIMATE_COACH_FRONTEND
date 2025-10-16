/**
 * Adaptation Demo Component
 *
 * Shows before/after of daily adaptive adjustments
 */

'use client'

import { motion } from 'framer-motion'

export default function AdaptationDemo() {
  return (
    <div className="card-glass p-6 sm:p-8 border-2 border-iron-gray space-y-6">
      {/* Before */}
      <div>
        <p className="text-iron-gray text-xs uppercase tracking-wider mb-3">Yesterday&apos;s Plan</p>
        <div className="bg-iron-dark-gray border border-iron-gray p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-iron-white">Calorie Target</span>
            <span className="text-iron-orange font-bold">2,200</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-iron-white">Protein</span>
            <span className="text-iron-white">180g</span>
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center">
        <motion.div
          className="text-iron-orange text-3xl"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ↓
        </motion.div>
      </div>

      {/* After */}
      <div>
        <p className="text-iron-gray text-xs uppercase tracking-wider mb-3">Today&apos;s Adaptation</p>
        <div className="bg-iron-orange bg-opacity-10 border border-iron-orange p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-iron-white">Calorie Target</span>
            <motion.span
              className="text-iron-orange font-bold"
              initial={{ scale: 1 }}
              whileInView={{ scale: [1, 1.2, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              2,450
            </motion.span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-iron-white">Protein</span>
            <span className="text-iron-white">190g</span>
          </div>
          <div className="mt-2 pt-2 border-t border-iron-orange/30">
            <p className="text-iron-gray text-xs">
              ↑ Increased for extra training session
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
