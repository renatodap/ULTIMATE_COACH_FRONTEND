/**
 * How It Works Section
 *
 * Explains the AI consultation process
 */

'use client'

import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp } from './animations'

export default function HowItWorksSection() {
  return (
    <motion.section
      className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-r from-iron-dark-gray to-iron-black"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={staggerContainer}
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-black text-iron-white uppercase text-center mb-12 sm:mb-16"
          variants={fadeInUp}
        >
          COACHING THAT<br />
          <span className="text-gradient-orange">UNDERSTANDS YOU</span>
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Phone mockup */}
          <motion.div className="order-2 lg:order-1" variants={fadeInUp}>
            <div className="card-glass border-2 border-iron-orange p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-iron-gray text-xs uppercase">Training Consultation</span>
                <span className="text-iron-orange text-xs font-bold">45%</span>
              </div>
              <div className="h-1 bg-iron-dark-gray">
                <motion.div
                  className="h-full bg-iron-orange"
                  initial={{ width: 0 }}
                  whileInView={{ width: '45%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="space-y-3">
                <motion.div
                  className="bg-iron-dark-gray border border-iron-gray p-4 text-sm text-iron-white"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  What&apos;s your main training focus?
                </motion.div>
                <motion.div
                  className="bg-iron-orange bg-opacity-20 border border-iron-orange p-4 text-sm text-iron-white ml-8"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  Building muscle
                </motion.div>
                <motion.div
                  className="bg-iron-dark-gray border border-iron-gray p-4 text-sm text-iron-white flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ●●●
                  </motion.span>
                  <span className="text-iron-gray">AI is typing...</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Features list */}
          <motion.div className="order-1 lg:order-2 space-y-6" variants={fadeInUp}>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <h3 className="text-lg font-bold text-iron-orange uppercase">AI Consultation</h3>
                  <p className="text-iron-gray text-sm">15-min natural conversation.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-iron-gray text-sm">
              <div className="flex items-center gap-2">
                <span className="text-iron-orange">→</span>
                <span>Understands context</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-iron-orange">→</span>
                <span>Remembers everything</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-iron-orange">→</span>
                <span>Real-time data search</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-iron-orange">→</span>
                <span>Claude 3.5 Sonnet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-iron-orange">→</span>
                <span>Auto-generates your plan</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
