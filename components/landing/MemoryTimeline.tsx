'use client'

/**
 * MemoryTimeline - Shows permanent memory across time
 * Demonstrates "tell once, remember forever"
 */

import { motion } from 'framer-motion'

const memories = [
  {
    date: 'Day 1',
    text: 'Allergic to dairy',
    icon: '🧀',
    delay: 0,
  },
  {
    date: 'Day 5',
    text: 'Knee injury - avoid impact',
    icon: '🦵',
    delay: 0.1,
  },
  {
    date: 'Day 12',
    text: 'Vegetarian diet',
    icon: '🥗',
    delay: 0.2,
  },
  {
    date: 'Day 30',
    text: 'All remembered, forever',
    icon: '🧠',
    delay: 0.3,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
}

export default function MemoryTimeline() {
  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {memories.map((memory, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="flex items-start gap-4"
        >
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-iron-orange border-2 border-iron-orange flex items-center justify-center text-2xl">
              {memory.icon}
            </div>
            {index < memories.length - 1 && (
              <div className="w-0.5 h-8 bg-iron-gray" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pt-2">
            <p className="text-xs text-iron-gray uppercase tracking-wider mb-1">
              {memory.date}
            </p>
            <p className="text-iron-white font-medium">{memory.text}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
