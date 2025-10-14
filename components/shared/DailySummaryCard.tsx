/**
 * Unified Daily Summary Card Component
 *
 * Renders a summary card for either daily activities or nutrition.
 * The styling is standardized based on the 'activities' version.
 */

'use client'

import React from 'react'
import MacroProgressCircle from '@/app/components/nutrition/MacroProgressCircle'
import { calculatePercentage, calculateRemaining } from '@/lib/utils/macro-calculator'

// --- TYPE DEFINITIONS ---

interface ActivitySummary {
  activity_count: number
  total_calories_burned: number
  daily_goal_calories: number
  goal_percentage: number
  total_duration_minutes: number
  average_intensity: number
}

interface NutritionSummary {
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  calorieGoal: number
  proteinGoal: number
  carbsGoal: number
  fatGoal: number
}

// Discriminated union for props
type UnifiedSummaryProps =
  | { type: 'activity'; summary: ActivitySummary }
  | { type: 'nutrition'; summary: NutritionSummary }

// --- HELPER COMPONENTS ---

const ActivityCardContent = ({ summary }: { summary: ActivitySummary }) => {
  const progressPercentage = Math.min(summary.goal_percentage, 100)

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-iron-white">Today&apos;s Activity</h2>
        <span className="text-sm text-iron-gray">
          {summary.activity_count} {summary.activity_count === 1 ? 'activity' : 'activities'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-iron-white">
            🔥 {summary.total_calories_burned} kcal
          </span>
          <span className="text-sm text-iron-gray">burned today</span>
        </div>
        <div className="w-full h-2 bg-iron-black rounded-full overflow-hidden">
          <div
            className="h-full bg-iron-orange transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-iron-gray">Goal: {summary.daily_goal_calories} kcal</span>
          <span className="text-xs font-medium text-iron-orange">{summary.goal_percentage.toFixed(0)}%</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-iron-gray mb-1">⏱️ Duration</span>
          <span className="text-lg font-semibold text-iron-white">
            {Math.floor(summary.total_duration_minutes / 60)}h {summary.total_duration_minutes % 60}m
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-iron-gray mb-1">⚡ Avg Intensity</span>
          <span className="text-lg font-semibold text-iron-white">{summary.average_intensity.toFixed(1)} METs</span>
        </div>
        <div className="flex flex-col sm:col-span-1 col-span-2">
          <span className="text-xs text-iron-gray mb-1">🎯 Progress</span>
          <span className="text-lg font-semibold text-iron-white">
            {summary.total_calories_burned}/{summary.daily_goal_calories}
          </span>
        </div>
      </div>
    </>
  )
}

const NutritionCardContent = ({ summary }: { summary: NutritionSummary }) => {
  const caloriePercentage = calculatePercentage(summary.totalCalories, summary.calorieGoal)
  const remaining = calculateRemaining(summary.totalCalories, summary.calorieGoal)
  const isOverGoal = remaining < 0

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-iron-white">Today&apos;s Nutrition</h2>
      </div>

      {/* Calorie Progress Section */}
      <div className="text-center mb-6">
        <div className="mb-4">
          <span className="text-5xl font-bold text-iron-orange">
            {Math.round(summary.totalCalories).toLocaleString()}
          </span>
          <span className="text-2xl text-iron-gray ml-2">
            / {Math.round(summary.calorieGoal).toLocaleString()}
          </span>
        </div>
        <div className="h-3 bg-iron-gray/20 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full transition-all duration-500 ${isOverGoal ? 'bg-red-500' : 'bg-iron-orange'
              }`}
            style={{ width: `${Math.min(caloriePercentage, 100)}%` }}
          />
        </div>
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
          current={summary.totalProtein}
          target={summary.proteinGoal}
          color="success"
        />
        <MacroProgressCircle
          label="Carbs"
          current={summary.totalCarbs}
          target={summary.carbsGoal}
          color="info"
        />
        <MacroProgressCircle
          label="Fats"
          current={summary.totalFat}
          target={summary.fatGoal}
          color="warning"
        />
      </div>
    </>
  )
}

// --- MAIN COMPONENT ---

export default function DailySummaryCard({ type, summary }: UnifiedSummaryProps) {
  return (
    <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray shadow-sm">
      {type === 'activity' && <ActivityCardContent summary={summary} />}
      {type === 'nutrition' && <NutritionCardContent summary={summary} />}
    </div>
  )
}
