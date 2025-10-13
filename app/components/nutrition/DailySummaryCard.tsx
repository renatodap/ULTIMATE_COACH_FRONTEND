'use client'

/**
 * DailySummaryCard Component
 *
 * Displays the daily nutrition summary at the top of the nutrition page.
 * Shows calorie progress bar and macro breakdown with circular progress indicators.
 *
 * Features:
 * - Large calorie display with progress bar
 * - Remaining calories calculation
 * - Macro breakdown grid (protein/carbs/fats)
 * - Color-coded by macro type
 * - Responsive design
 */

import type { DailySummaryProps } from '@/lib/types/nutrition'
import { calculatePercentage, calculateRemaining } from '@/lib/utils/macro-calculator'
import MacroProgressCircle from './MacroProgressCircle'

export default function DailySummaryCard({
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  calorieGoal,
  proteinGoal,
  carbsGoal,
  fatGoal,
}: DailySummaryProps) {
  const caloriePercentage = calculatePercentage(totalCalories, calorieGoal)
  const remaining = calculateRemaining(totalCalories, calorieGoal)
  const isOverGoal = remaining < 0

  return (
    <div className="card-glass border border-iron-gray/30 p-6 mb-6">
      {/* Calorie Progress Section */}
      <div className="text-center mb-6">
        <p className="text-iron-gray text-xs uppercase tracking-wider mb-3">
          📊 Today&apos;s Calories
        </p>

        {/* Main Calorie Display */}
        <div className="mb-4">
          <span className="text-5xl font-bold text-iron-orange">
            {Math.round(totalCalories).toLocaleString()}
          </span>
          <span className="text-2xl text-iron-gray ml-2">
            / {Math.round(calorieGoal).toLocaleString()}
          </span>
        </div>

        {/* Progress Bar - NO ROUNDED CORNERS, WHITE BORDER */}
        <div className="h-3 bg-iron-gray/20 overflow-hidden mb-2 border-2 border-iron-white">
          <div
            className={`h-full transition-all duration-500 ${
              isOverGoal ? 'bg-red-500' : 'bg-iron-orange'
            }`}
            style={{ width: `${Math.min(caloriePercentage, 100)}%` }}
          />
        </div>

        {/* Remaining/Over Text */}
        <p className={`text-sm uppercase tracking-wider ${isOverGoal ? 'text-red-500' : 'text-iron-gray'}`}>
          {isOverGoal
            ? `${Math.abs(remaining)} calories over goal`
            : `${remaining} calories remaining`}
        </p>
      </div>

      {/* Macro Breakdown Grid */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-iron-gray/30">
        <MacroProgressCircle
          label="Protein"
          current={totalProtein}
          target={proteinGoal}
          color="success"
        />
        <MacroProgressCircle
          label="Carbs"
          current={totalCarbs}
          target={carbsGoal}
          color="info"
        />
        <MacroProgressCircle
          label="Fats"
          current={totalFat}
          target={fatGoal}
          color="warning"
        />
      </div>
    </div>
  )
}
