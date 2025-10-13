'use client'

/**
 * Activity Summary Card Component
 *
 * Shows today's workout summary with progress bar
 * Sharp design, NO rounded corners, mobile-first
 */

import { useRouter } from 'next/navigation'
import type { TodayActivitySummary } from '@/lib/types/dashboard'

interface ActivitySummaryCardProps {
  activity: TodayActivitySummary
}

export default function ActivitySummaryCard({ activity }: ActivitySummaryCardProps) {
  const router = useRouter()
  const progressPercentage = Math.min(activity.goal_percentage, 100)
  const hours = Math.floor(activity.total_duration_minutes / 60)
  const minutes = activity.total_duration_minutes % 60

  return (
    <div className="card-glass border border-iron-gray/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-iron-gray text-xs uppercase tracking-wider">
          💪 Today's Activity
        </p>
        <button
          onClick={() => router.push('/activities')}
          className="text-iron-orange text-xs uppercase tracking-wider hover:underline"
        >
          View All →
        </button>
      </div>

      {/* Calories Burned */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-iron-white">
            🔥 {activity.total_calories_burned} kcal
          </span>
          <span className="text-sm text-iron-gray">
            {activity.activity_count} {activity.activity_count === 1 ? 'workout' : 'workouts'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-iron-gray/20 overflow-hidden mb-2">
          <div
            className="h-full bg-iron-orange transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-iron-gray">
            Goal: {activity.daily_goal_calories} kcal
          </span>
          <span className="text-xs font-medium text-iron-orange">
            {activity.goal_percentage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-iron-gray/30">
        <div className="bg-iron-black border border-iron-gray/30 p-3">
          <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">⏱️ Duration</p>
          <p className="text-lg font-bold text-iron-white">
            {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
          </p>
        </div>

        <div className="bg-iron-black border border-iron-gray/30 p-3">
          <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">⚡ Avg Intensity</p>
          <p className="text-lg font-bold text-iron-white">
            {activity.average_intensity.toFixed(1)} METs
          </p>
        </div>
      </div>
    </div>
  )
}
