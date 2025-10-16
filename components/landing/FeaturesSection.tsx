/**
 * Features Section
 *
 * Grid of app features with icons
 */

'use client'

import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp } from './animations'

interface Feature {
  icon: string
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: '📸',
    title: 'Photo Tracking',
    description: 'Snap a pic. AI analyzes instantly.',
  },
  {
    icon: '🤖',
    title: 'AI Consultation',
    description: '15-min conversation. Personalized plan.',
  },
  {
    icon: '📊',
    title: 'Smart Analytics',
    description: 'Real-time insights.',
  },
  {
    icon: '⚡',
    title: 'Macro Calculator',
    description: 'BMR, TDEE, goals.',
  },
  {
    icon: '🎯',
    title: 'Activity Tracking',
    description: 'Log workouts. Track intensity.',
  },
  {
    icon: '💪',
    title: 'Progress Tracking',
    description: 'Track gains. See what works.',
  },
]

export default function FeaturesSection() {
  return (
    <motion.section
      className="py-16 sm:py-24 px-4 sm:px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={staggerContainer}
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-iron-white uppercase text-center mb-12 sm:mb-16"
          variants={fadeInUp}
        >
          FEATURES
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          variants={staggerContainer}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="card border-2 border-iron-gray hover:border-iron-orange transition-colors p-6 sm:p-8 space-y-4"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-5xl">{feature.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold text-iron-white uppercase">
                {feature.title}
              </h3>
              <p className="text-iron-gray text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
