/**
 * Memory Timeline Component
 *
 * Visualizes permanent memory with timeline of remembered items
 */

'use client'

import { motion } from 'framer-motion'

interface MemoryItem {
  label: string
  date: string
  icon: string
}

const memories: MemoryItem[] = [
  { label: 'Allergic to peanuts', date: 'Week 1', icon: '🥜' },
  { label: 'Prefers morning workouts', date: 'Week 2', icon: '🌅' },
  { label: 'Dislikes fish', date: 'Week 3', icon: '🐟' },
  { label: 'Knee injury (left)', date: 'Week 4', icon: '🦵' },
]

export default function MemoryTimeline() {
  return (
    <div className="card-glass p-6 sm:p-8 border-2 border-iron-orange">
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-iron-gray text-xs uppercase tracking-wider">
          <span className="text-iron-orange">●</span>
          <span>Memory Timeline</span>
        </div>

        <div className="space-y-4">
          {memories.map((memory, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-2xl">{memory.icon}</div>
              <div className="flex-1">
                <p className="text-iron-white font-medium">{memory.label}</p>
                <p className="text-iron-gray text-xs">{memory.date}</p>
              </div>
              <motion.div
                className="w-2 h-2 rounded-full bg-iron-orange"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
              />
            </motion.div>
          ))}
        </div>

        <div className="pt-4 border-t border-iron-gray">
          <p className="text-iron-gray text-xs text-center">
            AI remembers everything, forever
          </p>
        </div>
      </div>
    </div>
  )
}
