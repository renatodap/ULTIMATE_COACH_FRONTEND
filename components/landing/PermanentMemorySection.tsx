/**
 * Permanent Memory Section
 *
 * Highlights infinite context and memory capabilities
 */

'use client'

import { motion } from 'framer-motion'
import MemoryTimeline from './MemoryTimeline'
import { staggerContainer, fadeInUp } from './animations'

export default function PermanentMemorySection() {
  return (
    <motion.section
      className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-r from-iron-dark-gray to-iron-black"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={staggerContainer}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-12 sm:mb-16" variants={fadeInUp}>
          <p className="text-iron-gray text-sm uppercase tracking-widest mb-4">
            INFINITE CONTEXT
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-iron-white uppercase leading-tight">
            PERMANENT<br />
            <span className="text-gradient-orange">MEMORY</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Explanation */}
          <motion.div className="space-y-6 order-2 lg:order-1" variants={fadeInUp}>
            <p className="text-iron-white text-lg sm:text-xl leading-relaxed">
              Tell the AI once. It remembers forever. No repeating yourself.
              No forgetting your constraints.
            </p>
            <ul className="space-y-4 text-iron-gray">
              <li className="flex items-start gap-3">
                <span className="text-iron-orange text-xl">→</span>
                <span>Allergies & dietary restrictions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-iron-orange text-xl">→</span>
                <span>Injuries & physical limitations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-iron-orange text-xl">→</span>
                <span>Goals & preferences</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-iron-orange text-xl">→</span>
                <span>Never repeats questions</span>
              </li>
            </ul>
          </motion.div>

          {/* Timeline visualization */}
          <motion.div className="order-1 lg:order-2" variants={fadeInUp}>
            <MemoryTimeline />
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
