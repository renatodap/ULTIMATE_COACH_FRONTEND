'use client'

/**
 * Daily Summary Card - Enhanced
 *
 * Shows daily nutrition progress with collapsible macro breakdown
 * Mobile-first, glanceable design
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DailySummaryCardProps {
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  calorieGoal?: number
  proteinGoal?: number
  carbsGoal?: number
  fatGoal?: number
  mealsLogged?: number
}

export function DailySummaryCard({
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  calorieGoal = 2500,
  proteinGoal = 200,
  carbsGoal = 250,
  fatGoal = 80,
  mealsLogged = 0
}: DailySummaryCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Calculate percentages
  const caloriePercentage = Math.min((totalCalories / calorieGoal) * 100, 100)
  const proteinPercentage = Math.min((totalProtein / proteinGoal) * 100, 100)
  const carbsPercentage = Math.min((totalCarbs / carbsGoal) * 100, 100)
  const fatPercentage = Math.min((totalFat / fatGoal) * 100, 100)

  // Calculate remaining (can be negative if over goal)
  const caloriesRemaining = calorieGoal - totalCalories
  const isOverGoal = caloriesRemaining < 0

  // Progress bar color (green → yellow → orange → red)
  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500'
    if (percentage < 90) return 'bg-yellow-500'
    if (percentage <= 100) return 'bg-iron-orange'
    return 'bg-red-500'
  }

  return (
    <div className="sticky top-16 z-[90] bg-iron-dark-gray/95 backdrop-blur border-b border-iron-gray/30">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Header (always visible) */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left active-press"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-medium text-iron-gray uppercase tracking-wider">
                Today's Nutrition
              </h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-bold text-iron-orange">
                  {Math.round(totalCalories)}
                </span>
                <span className="text-lg text-iron-gray">
                  / {calorieGoal} cal
                </span>
              </div>
            </div>

            {/* Expand/Collapse icon */}
            <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
              {expanded ? (
                <ChevronUp className="w-6 h-6 text-iron-gray" />
              ) : (
                <ChevronDown className="w-6 h-6 text-iron-gray" />
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="h-2 bg-iron-gray/20 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getProgressColor(caloriePercentage)} transition-colors duration-300`}
                initial={{ width: 0 }}
                animate={{ width: `${caloriePercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Status text */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-iron-gray">
              {mealsLogged} meal{mealsLogged !== 1 ? 's' : ''} logged
            </span>
            <span className={isOverGoal ? 'text-red-400 font-medium' : 'text-green-500 font-medium'}>
              {isOverGoal ? '+' : ''}{Math.abs(caloriesRemaining)} cal {isOverGoal ? 'over' : 'remaining'}
            </span>
          </div>
        </button>

        {/* Expanded macros breakdown */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t border-iron-gray/30">
                {/* Protein */}
                <div>
                  <div className="text-center mb-2">
                    <div className="text-2xl font-bold text-macro-protein">
                      {Math.round(totalProtein)}g
                    </div>
                    <div className="text-xs text-iron-gray">
                      / {proteinGoal}g
                    </div>
                    <div className="text-xs text-iron-gray mt-0.5">
                      Protein
                    </div>
                  </div>
                  {/* Circular progress */}
                  <div className="relative w-16 h-16 mx-auto">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="stroke-iron-gray/20"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="stroke-macro-protein"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${(proteinPercentage / 100) * 176} 176`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-iron-white">
                      {Math.round(proteinPercentage)}%
                    </div>
                  </div>
                </div>

                {/* Carbs */}
                <div>
                  <div className="text-center mb-2">
                    <div className="text-2xl font-bold text-macro-carbs">
                      {Math.round(totalCarbs)}g
                    </div>
                    <div className="text-xs text-iron-gray">
                      / {carbsGoal}g
                    </div>
                    <div className="text-xs text-iron-gray mt-0.5">
                      Carbs
                    </div>
                  </div>
                  {/* Circular progress */}
                  <div className="relative w-16 h-16 mx-auto">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="stroke-iron-gray/20"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="stroke-macro-carbs"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${(carbsPercentage / 100) * 176} 176`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-iron-white">
                      {Math.round(carbsPercentage)}%
                    </div>
                  </div>
                </div>

                {/* Fat */}
                <div>
                  <div className="text-center mb-2">
                    <div className="text-2xl font-bold text-macro-fat">
                      {Math.round(totalFat)}g
                    </div>
                    <div className="text-xs text-iron-gray">
                      / {fatGoal}g
                    </div>
                    <div className="text-xs text-iron-gray mt-0.5">
                      Fat
                    </div>
                  </div>
                  {/* Circular progress */}
                  <div className="relative w-16 h-16 mx-auto">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="stroke-iron-gray/20"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="stroke-macro-fat"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${(fatPercentage / 100) * 176} 176`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-iron-white">
                      {Math.round(fatPercentage)}%
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
