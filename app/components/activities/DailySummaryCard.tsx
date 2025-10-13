/**
 * Daily Summary Card Component
 *
 * Shows aggregated activity stats for the day
 * Progress bar toward daily calorie burn goal
 */

'use client'

import type { DailySummary } from '@/lib/types/activities'

interface DailySummaryCardProps {
  summary: DailySummary
}

export default function DailySummaryCard({ summary }: DailySummaryCardProps) {
  const progressPercentage = Math.min(summary.goal_percentage, 100)

  return (
    <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray shadow-sm">
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
          <span className="text-sm text-iron-gray">
            burned today
          </span>
        </div>

        <div className="w-full h-2 bg-iron-black rounded-full overflow-hidden">
          <div
            className="h-full bg-iron-orange transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-iron-gray">
            Goal: {summary.daily_goal_calories} kcal
          </span>
          <span className="text-xs font-medium text-iron-orange">
            {summary.goal_percentage.toFixed(0)}%
          </span>
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
          <span className="text-lg font-semibold text-iron-white">
            {summary.average_intensity.toFixed(1)} METs
          </span>
        </div>

        <div className="flex flex-col sm:col-span-1 col-span-2">
          <span className="text-xs text-iron-gray mb-1">🎯 Progress</span>
          <span className="text-lg font-semibold text-iron-white">
            {summary.total_calories_burned}/{summary.daily_goal_calories}
          </span>
        </div>
      </div>
    </div>
  )
}
