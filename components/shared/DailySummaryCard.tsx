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
  const hours = Math.floor(summary.total_duration_minutes / 60)
  const minutes = summary.total_duration_minutes % 60

  return (
    <>
      {/* Header - Mobile-first */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-iron-gray uppercase tracking-wider">
          📊 Today&apos;s Activity
        </p>
        <span className="text-xs text-iron-gray font-bold uppercase tracking-wider">
          {summary.activity_count} {summary.activity_count === 1 ? 'Workout' : 'Workouts'}
        </span>
      </div>

      {/* BIG NUMBER - Mobile-friendly */}
      <div className="text-center mb-6">
        <div className="mb-3">
          <span className="text-6xl md:text-7xl font-bold text-iron-orange">
            {summary.total_calories_burned}
          </span>
          <p className="text-xl md:text-2xl text-iron-gray uppercase tracking-widest mt-2">
            KCAL BURNED
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-iron-black overflow-hidden mb-2">
          <div
            className="h-full bg-iron-orange transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-iron-gray uppercase tracking-wider">
            Goal: {summary.daily_goal_calories} kcal
          </span>
          <span className="text-xs font-bold text-iron-orange uppercase tracking-wider">
            {summary.goal_percentage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Stats Grid - Simplified */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-iron-black border border-iron-gray/30 p-4 text-center">
          <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">⏱️ Duration</p>
          <p className="text-2xl font-bold text-iron-white">
            {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
          </p>
        </div>
        <div className="bg-iron-black border border-iron-gray/30 p-4 text-center">
          <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">⚡ Intensity</p>
          <p className="text-2xl font-bold text-iron-white">
            {summary.average_intensity.toFixed(1)}
          </p>
          <p className="text-xs text-iron-gray">METs</p>
        </div>
      </div>
    </>
  )
}

const NutritionCardContent = ({ summary }: { summary: NutritionSummary }) => {
  const caloriePercentage = calculatePercentage(summary.totalCalories, summary.calorieGoal)
  const remaining = calculateRemaining(summary.totalCalories, summary.calorieGoal)
  const isOverGoal = remaining < 0

  const proteinPct = Math.min((summary.totalProtein / summary.proteinGoal) * 100, 100)
  const carbsPct = Math.min((summary.totalCarbs / summary.carbsGoal) * 100, 100)
  const fatPct = Math.min((summary.totalFat / summary.fatGoal) * 100, 100)

  return (
    <>
      {/* Header with goal status */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-iron-gray uppercase tracking-wider">📊 Today&apos;s Nutrition</p>
        <span className={`text-xs font-bold uppercase tracking-wider ${isOverGoal ? 'text-red-500' : 'text-iron-orange'}`}>
          {isOverGoal ? `+${Math.abs(remaining)}` : `-${remaining}`} cal
        </span>
      </div>

      {/* BIG NUMBER - Mobile-friendly */}
      <div className="text-center mb-3">
        <div className="mb-2">
          <span className="text-5xl md:text-6xl font-bold text-iron-orange">
            {Math.round(summary.totalCalories)}
          </span>
          <p className="text-sm text-iron-gray uppercase tracking-widest mt-1">
            of {Math.round(summary.calorieGoal)} kcal
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-iron-black overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${isOverGoal ? 'bg-red-500' : 'bg-iron-orange'}`}
            style={{ width: `${Math.min(caloriePercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Compact Macros - 3 column grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Protein */}
        <div className="bg-iron-dark-gray border border-iron-gray p-4 text-center">
          <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">Protein</p>
          <p className="text-2xl font-bold text-iron-white">
            {Math.round(summary.totalProtein)}g
          </p>
          <div className="h-1 bg-iron-black mt-1">
            <div className="h-full bg-green-500" style={{ width: `${proteinPct}%` }} />
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-iron-dark-gray border border-iron-gray p-4 text-center">
          <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">Carbs</p>
          <p className="text-2xl font-bold text-iron-white">
            {Math.round(summary.totalCarbs)}g
          </p>
          <div className="h-1 bg-iron-black mt-1">
            <div className="h-full bg-blue-500" style={{ width: `${carbsPct}%` }} />
          </div>
        </div>

        {/* Fat */}
        <div className="bg-iron-dark-gray border border-iron-gray p-4 text-center">
          <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">Fat</p>
          <p className="text-2xl font-bold text-iron-white">
            {Math.round(summary.totalFat)}g
          </p>
          <div className="h-1 bg-iron-black mt-1">
            <div className="h-full bg-yellow-500" style={{ width: `${fatPct}%` }} />
          </div>
        </div>
      </div>
    </>
  )
}

// --- MAIN COMPONENT ---

export default function DailySummaryCard({ type, summary }: UnifiedSummaryProps) {
  return (
    <div className="card-glass border border-iron-gray/30 p-6 accent-edge">
      {type === 'activity' && <ActivityCardContent summary={summary} />}
      {type === 'nutrition' && <NutritionCardContent summary={summary} />}
    </div>
  )
}
