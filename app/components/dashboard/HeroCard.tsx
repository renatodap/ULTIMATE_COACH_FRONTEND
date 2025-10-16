'use client'

/**
 * Hero Card - TODAY AT A GLANCE
 *
 * Unified card combining net calories, macros, and activity
 * Mobile-first: Glanceable status → expandable details
 * Design: ONE status indicator user sees immediately
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TodayNutritionSummary, TodayActivitySummary } from '@/lib/types/dashboard'

interface HeroCardProps {
  nutrition: TodayNutritionSummary
  activity: TodayActivitySummary
  netCalories: number
}

export default function HeroCard({ nutrition, activity, netCalories }: HeroCardProps) {
  const [expanded, setExpanded] = useState(false)

  const caloriesConsumed = Math.round(Number(nutrition.calories_consumed))
  const caloriesBurned = activity.total_calories_burned
  const calorieGoal = nutrition.calories_goal || 2000

  // Status determination
  const isDeficit = netCalories < 0
  const isSurplus = netCalories > 0
  const isBalanced = Math.abs(netCalories) < 50

  // Status colors and labels
  const getStatus = () => {
    if (isBalanced) return { color: 'text-iron-white', label: 'Balanced', emoji: '⚖️', bgColor: 'bg-iron-gray/20' }
    if (isDeficit) return { color: 'text-green-500', label: 'Deficit (On Track)', emoji: '📉', bgColor: 'bg-green-500/10' }
    return { color: 'text-iron-orange', label: 'Surplus', emoji: '📈', bgColor: 'bg-iron-orange/10' }
  }

  const status = getStatus()

  // Macro percentages
  const proteinPercent = nutrition.protein_goal
    ? Math.min((Number(nutrition.protein_consumed) / Number(nutrition.protein_goal)) * 100, 100)
    : 0
  const carbsPercent = nutrition.carbs_goal
    ? Math.min((Number(nutrition.carbs_consumed) / Number(nutrition.carbs_goal)) * 100, 100)
    : 0
  const fatPercent = nutrition.fat_goal
    ? Math.min((Number(nutrition.fat_consumed) / Number(nutrition.fat_goal)) * 100, 100)
    : 0

  // Macro colors
  const getMacroColor = (percent: number) => {
    if (percent >= 90) return 'text-green-500'
    if (percent >= 70) return 'text-iron-orange'
    return 'text-iron-gray'
  }

  return (
    <motion.div
      className="card-glass border border-iron-gray/30 overflow-hidden accent-edge"
      layout
    >
      {/* HERO SECTION - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 text-center tap-target focus-ring-iron active-press"
      >
        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 mb-4 ${status.bgColor} border border-iron-gray/30`}>
          <span className="text-xl">{status.emoji}</span>
          <span className="text-sm font-bold uppercase tracking-wider text-iron-white">
            {status.label}
          </span>
        </div>

        {/* BIG NUMBER - Net Calories */}
        <div className="mb-4">
          <motion.p
            className={`text-7xl md:text-8xl font-bold ${status.color}`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {Math.abs(netCalories)}
          </motion.p>
          <p className="text-xl md:text-2xl text-iron-gray uppercase tracking-widest mt-2">
            KCAL NET
          </p>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {/* Consumed */}
          <div className="bg-iron-black/50 border border-iron-gray/30 p-3">
            <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">Consumed</p>
            <p className="text-2xl font-bold text-iron-orange">{caloriesConsumed}</p>
            <p className="text-xs text-iron-gray">of {calorieGoal}</p>
          </div>

          {/* Burned */}
          <div className="bg-iron-black/50 border border-iron-gray/30 p-3">
            <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">Burned</p>
            <p className="text-2xl font-bold text-green-500">{caloriesBurned}</p>
            <p className="text-xs text-iron-gray">
              {activity.activity_count} {activity.activity_count === 1 ? 'workout' : 'workouts'}
            </p>
          </div>
        </div>

        {/* Expand hint */}
        <div className="flex items-center justify-center gap-2 text-iron-gray/60 text-xs uppercase tracking-wider mt-4">
          <span>{expanded ? 'Hide' : 'View'} Full Breakdown</span>
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
            <div className="p-6 space-y-6">
              {/* Macros Section */}
              <div>
                <p className="text-xs text-iron-gray mb-4 uppercase tracking-wider">Today's Macros</p>
                <div className="grid grid-cols-3 gap-3">
                  {/* Protein */}
                  <div className="bg-iron-black/50 border border-iron-gray/30 p-3 text-center">
                    <p className="text-xs text-iron-gray mb-2 uppercase tracking-wider">Protein</p>
                    <p className={`text-2xl font-bold ${getMacroColor(proteinPercent)}`}>
                      {Math.round(Number(nutrition.protein_consumed))}g
                    </p>
                    <p className="text-xs text-iron-gray mt-1">
                      / {nutrition.protein_goal ? Math.round(Number(nutrition.protein_goal)) : '?'}g
                    </p>
                    <div className="h-1 bg-iron-gray/20 mt-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          proteinPercent >= 90 ? 'bg-green-500' : proteinPercent >= 70 ? 'bg-iron-orange' : 'bg-iron-gray'
                        }`}
                        style={{ width: `${proteinPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="bg-iron-black/50 border border-iron-gray/30 p-3 text-center">
                    <p className="text-xs text-iron-gray mb-2 uppercase tracking-wider">Carbs</p>
                    <p className={`text-2xl font-bold ${getMacroColor(carbsPercent)}`}>
                      {Math.round(Number(nutrition.carbs_consumed))}g
                    </p>
                    <p className="text-xs text-iron-gray mt-1">
                      / {nutrition.carbs_goal ? Math.round(Number(nutrition.carbs_goal)) : '?'}g
                    </p>
                    <div className="h-1 bg-iron-gray/20 mt-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          carbsPercent >= 90 ? 'bg-green-500' : carbsPercent >= 70 ? 'bg-iron-orange' : 'bg-iron-gray'
                        }`}
                        style={{ width: `${carbsPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Fats */}
                  <div className="bg-iron-black/50 border border-iron-gray/30 p-3 text-center">
                    <p className="text-xs text-iron-gray mb-2 uppercase tracking-wider">Fats</p>
                    <p className={`text-2xl font-bold ${getMacroColor(fatPercent)}`}>
                      {Math.round(Number(nutrition.fat_consumed))}g
                    </p>
                    <p className="text-xs text-iron-gray mt-1">
                      / {nutrition.fat_goal ? Math.round(Number(nutrition.fat_goal)) : '?'}g
                    </p>
                    <div className="h-1 bg-iron-gray/20 mt-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          fatPercent >= 90 ? 'bg-green-500' : fatPercent >= 70 ? 'bg-iron-orange' : 'bg-iron-gray'
                        }`}
                        style={{ width: `${fatPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Section */}
              {activity.activity_count > 0 && (
                <div>
                  <p className="text-xs text-iron-gray mb-3 uppercase tracking-wider">Today's Activity</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-iron-black/50 border border-iron-gray/30 p-3">
                      <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">Duration</p>
                      <p className="text-lg font-bold text-iron-white">
                        {Math.floor(activity.total_duration_minutes / 60) > 0
                          ? `${Math.floor(activity.total_duration_minutes / 60)}h ${activity.total_duration_minutes % 60}m`
                          : `${activity.total_duration_minutes}m`}
                      </p>
                    </div>

                    <div className="bg-iron-black/50 border border-iron-gray/30 p-3">
                      <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">Avg Intensity</p>
                      <p className="text-lg font-bold text-iron-white">
                        {activity.average_intensity.toFixed(1)} METs
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
