'use client'

/**
 * Quick Actions Grid Component - MOBILE-FIRST 2026/2027
 *
 * Intuitive: Icons anyone can understand instantly
 * Mobile-first: LARGE tap targets (150px+ height)
 * Easy to use: One tap to perform main actions
 *
 * Apple HIG: Minimum 44pt tap targets
 * Best practice: 60pt+ for primary actions
 */

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface QuickActionsGridProps {
  onLogWeight: () => void
}

export default function QuickActionsGrid({ onLogWeight }: QuickActionsGridProps) {
  const router = useRouter()

  const actions = [
    {
      label: 'Log Meal',
      icon: '🍽️',
      color: 'hover:border-iron-orange hover:bg-iron-orange/10',
      onClick: () => router.push('/nutrition/log'),
    },
    {
      label: 'Log Activity',
      icon: '💪',
      color: 'hover:border-green-500 hover:bg-green-500/10',
      onClick: () => router.push('/activities/log'),
    },
    {
      label: 'Log Weight',
      icon: '⚖️',
      color: 'hover:border-blue-500 hover:bg-blue-500/10',
      onClick: onLogWeight,
    },
  ]

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            onClick={action.onClick}
            className={`
              card-glass border-2 border-iron-gray/30 p-4
              min-h-[160px] sm:min-h-[180px]
              flex flex-col items-center justify-center gap-3
              transition-all duration-200
              active:scale-95
              ${action.color}
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* BIG Icon - Easy to recognize */}
            <motion.div
              className="text-5xl sm:text-6xl"
              whileTap={{ scale: 1.1 }}
            >
              {action.icon}
            </motion.div>

            {/* Clear Label */}
            <p className="text-xs sm:text-sm uppercase tracking-wider text-iron-white font-bold text-center leading-tight">
              {action.label}
            </p>
          </motion.button>
        ))}
      </div>
    </>
  )
}
