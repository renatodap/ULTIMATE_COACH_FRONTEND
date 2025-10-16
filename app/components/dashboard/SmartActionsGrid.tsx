'use client'

/**
 * Smart Actions Grid - TIME-AWARE CONTEXT
 *
 * Intuitive: Shows right action at right time
 * Mobile-first: LARGE tap targets (150px+ height)
 * AI-first: Always surfaces "Ask Coach" button
 *
 * Changes based on time of day:
 * - Morning (6am-11am): Breakfast, Morning Workout, Coach
 * - Midday (11am-3pm): Lunch, Log Weight, Coach
 * - Evening (3pm-9pm): Dinner, Evening Workout, Coach
 * - Night (9pm-6am): Snack, Review Today, Coach
 */

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface SmartActionsGridProps {
  onLogWeight: () => void
}

type TimeOfDay = 'morning' | 'midday' | 'evening' | 'night'

interface Action {
  label: string
  icon: string
  color: string
  onClick: () => void
}

export default function SmartActionsGrid({ onLogWeight }: SmartActionsGridProps) {
  const router = useRouter()
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning')

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours()

      if (hour >= 6 && hour < 11) {
        setTimeOfDay('morning')
      } else if (hour >= 11 && hour < 15) {
        setTimeOfDay('midday')
      } else if (hour >= 15 && hour < 21) {
        setTimeOfDay('evening')
      } else {
        setTimeOfDay('night')
      }
    }

    updateTimeOfDay()
    // Update every minute to keep it current
    const interval = setInterval(updateTimeOfDay, 60000)
    return () => clearInterval(interval)
  }, [])

  // Define actions based on time of day
  const getActions = (): Action[] => {
    const coachAction: Action = {
      label: 'Ask Coach',
      icon: '💬',
      color: 'hover:border-purple-500 hover:bg-purple-500/10',
      onClick: () => router.push('/coach'),
    }

    switch (timeOfDay) {
      case 'morning':
        return [
          {
            label: 'Log Breakfast',
            icon: '🍳',
            color: 'hover:border-iron-orange hover:bg-iron-orange/10',
            onClick: () => router.push('/nutrition/log'),
          },
          {
            label: 'Morning Workout',
            icon: '🌅',
            color: 'hover:border-green-500 hover:bg-green-500/10',
            onClick: () => router.push('/activities/log'),
          },
          coachAction,
        ]

      case 'midday':
        return [
          {
            label: 'Log Lunch',
            icon: '🍽️',
            color: 'hover:border-iron-orange hover:bg-iron-orange/10',
            onClick: () => router.push('/nutrition/log'),
          },
          {
            label: 'Log Weight',
            icon: '⚖️',
            color: 'hover:border-blue-500 hover:bg-blue-500/10',
            onClick: onLogWeight,
          },
          coachAction,
        ]

      case 'evening':
        return [
          {
            label: 'Log Dinner',
            icon: '🌙',
            color: 'hover:border-iron-orange hover:bg-iron-orange/10',
            onClick: () => router.push('/nutrition/log'),
          },
          {
            label: 'Evening Workout',
            icon: '🏃',
            color: 'hover:border-green-500 hover:bg-green-500/10',
            onClick: () => router.push('/activities/log'),
          },
          coachAction,
        ]

      case 'night':
        return [
          {
            label: 'Log Snack',
            icon: '🍪',
            color: 'hover:border-iron-orange hover:bg-iron-orange/10',
            onClick: () => router.push('/nutrition/log'),
          },
          {
            label: 'Review Today',
            icon: '📊',
            color: 'hover:border-blue-500 hover:bg-blue-500/10',
            onClick: () => router.push('/dashboard'),
          },
          coachAction,
        ]
    }
  }

  const actions = getActions()

  return (
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
  )
}
