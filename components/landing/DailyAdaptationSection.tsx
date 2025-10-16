/**
 * Daily Adaptation Section
 *
 * Shows intelligent adjustment capabilities
 */

'use client'

import { motion } from 'framer-motion'
import AdaptationDemo from './AdaptationDemo'
import { staggerContainer, fadeInUp } from './animations'

export default function DailyAdaptationSection() {
  return (
    <motion.section
      className="py-16 sm:py-24 px-4 sm:px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={staggerContainer}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-12 sm:mb-16" variants={fadeInUp}>
          <p className="text-iron-gray text-sm uppercase tracking-widest mb-4">
            INTELLIGENT ADJUSTMENT
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gradient-orange uppercase leading-tight">
            DAILY<br />
            ADAPTATION
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Demo */}
          <motion.div variants={fadeInUp}>
            <AdaptationDemo />
          </motion.div>

          {/* Explanation */}
          <motion.div className="space-y-6" variants={fadeInUp}>
            <p className="text-iron-white text-lg sm:text-xl leading-relaxed">
              Your life changes daily. So does your plan. Automatic adjustments
              based on activity, stress, sleep, and goals.
            </p>
            <ul className="space-y-4 text-iron-gray">
              <li className="flex items-start gap-3">
                <span className="text-iron-orange text-xl">→</span>
                <span>Auto-adjust calories for activity</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-iron-orange text-xl">→</span>
                <span>Factor in sleep & stress</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-iron-orange text-xl">→</span>
                <span>Adapt to your constraints</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-iron-orange text-xl">→</span>
                <span>Always optimized for YOU</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
