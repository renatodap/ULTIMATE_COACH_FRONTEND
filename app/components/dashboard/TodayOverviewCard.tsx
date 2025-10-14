'use client'

/**
 * Today Overview Card Component - HERO STAT
 *
 * Mobile-first: ONE big number users see immediately
 * Intuitive: Net calories with clear visual indicator
 * Easy to use: Tap to expand details
 *
 * 2026/2027 standard: Large, obvious, no explanation needed
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TodayNutritionSummary, TodayActivitySummary } from '@/lib/types/dashboard'

interface TodayOverviewCardProps {
  nutrition: TodayNutritionSummary
  activity: TodayActivitySummary
  netCalories: number
}

export default function TodayOverviewCard({ nutrition, activity, netCalories }: TodayOverviewCardProps) {
  const [expanded, setExpanded] = useState(false)

  const caloriesConsumed = Math.round(Number(nutrition.calories_consumed))
  const caloriesBurned = activity.total_calories_burned

  // Determine status and color
  const isDeficit = netCalories < 0
  const isSurplus = netCalories > 0
  const statusColor = isDeficit ? 'text-green-500' : isSurplus ? 'text-iron-orange' : 'text-iron-white'
  const statusLabel = isDeficit ? 'Calorie Deficit' : isSurplus ? 'Calorie Surplus' : 'Balanced'
  const statusEmoji = isDeficit ? '📉' : isSurplus ? '📈' : '⚖️'

  return (
    <motion.div
      className="card-glass border border-iron-gray/30 overflow-hidden accent-edge"
      layout
    >
      {/* HERO STAT - Tap to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-8 text-center tap-target focus-ring-iron active-press"
      >
        {/* Status Label */}
        <p className="text-iron-gray text-sm uppercase tracking-wider mb-3 flex items-center justify-center gap-2">
          <span>{statusEmoji}</span>
          <span>{statusLabel}</span>
        </p>

        {/* THE BIG NUMBER - Hero stat */}
        <div className="mb-3">
          <motion.p
            className={`text-7xl md:text-8xl font-bold ${netCalories === 0 ? 'text-iron-white' : statusColor}`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {Math.abs(netCalories)}
          </motion.p>
          <p className="text-xl md:text-2xl text-iron-gray uppercase tracking-widest mt-2">
            KCAL
          </p>
        </div>

        {/* Tap to expand hint */}
        <div className="flex items-center justify-center gap-2 text-iron-gray/60 text-xs uppercase tracking-wider">
          <span>{expanded ? 'Hide' : 'View'} Details</span>
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* EXPANDED DETAILS - Progressive disclosure */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-iron-gray/30"
          >
            <div className="p-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Calories In */}
                <div className="text-center p-4 surface-elevated border border-iron-gray/20">
                  <p className="text-xs text-iron-gray mb-2 uppercase tracking-wider">Consumed</p>
                  <p className="text-3xl font-bold text-iron-orange mb-1">{caloriesConsumed}</p>
                  {nutrition.calories_goal && (
                    <p className="text-xs text-iron-gray">
                      of {nutrition.calories_goal}
                    </p>
                  )}
                </div>

                {/* Calories Out */}
                <div className="text-center p-4 surface-elevated border border-iron-gray/20">
                  <p className="text-xs text-iron-gray mb-2 uppercase tracking-wider">Burned</p>
                  <p className="text-3xl font-bold text-green-500 mb-1">{caloriesBurned}</p>
                  <p className="text-xs text-iron-gray">
                    {activity.activity_count} {activity.activity_count === 1 ? 'workout' : 'workouts'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
