/**
 * Speak Your Language Section
 *
 * Demonstrates natural language understanding with rotating examples
 */

'use client'

import { motion } from 'framer-motion'
import RotatingTextExample from './RotatingTextExample'
import { staggerContainer, fadeInUp } from './animations'

export default function SpeakYourLanguageSection() {
  return (
    <motion.section
      className="py-16 sm:py-24 px-4 sm:px-6 border-t-2 border-iron-orange"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={staggerContainer}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-12 sm:mb-16" variants={fadeInUp}>
          <p className="text-iron-gray text-sm uppercase tracking-widest mb-4">
            NATURAL UNDERSTANDING
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gradient-orange uppercase leading-tight">
            SPEAK YOUR<br />
            LANGUAGE
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Interactive example */}
          <motion.div variants={fadeInUp}>
            <RotatingTextExample />
          </motion.div>

          {/* Explanation */}
          <motion.div className="space-y-6" variants={fadeInUp}>
            <p className="text-iron-white text-lg sm:text-xl leading-relaxed">
              Say it however you want. Type, voice, photo. Casual or precise.
              The AI understands.
            </p>
            <ul className="space-y-4 text-iron-gray">
              <li className="flex items-start gap-3">
                <span className="text-iron-orange text-xl">→</span>
                <span>Natural language processing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-iron-orange text-xl">→</span>
                <span>Photo food recognition</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-iron-orange text-xl">→</span>
                <span>Understands any phrasing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-iron-orange text-xl">→</span>
                <span>Same result, every time</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
