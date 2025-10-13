'use client'

/**
 * Today Overview Card Component
 *
 * Shows calories consumed vs burned with net calculation
 * Sharp design, NO rounded corners, mobile-first
 */

import type { TodayNutritionSummary, TodayActivitySummary } from '@/lib/types/dashboard'

interface TodayOverviewCardProps {
  nutrition: TodayNutritionSummary
  activity: TodayActivitySummary
  netCalories: number
}

export default function TodayOverviewCard({ nutrition, activity, netCalories }: TodayOverviewCardProps) {
  const caloriesConsumed = Math.round(Number(nutrition.calories_consumed))
  const caloriesBurned = activity.total_calories_burned

  return (
    <div className="card-glass border border-iron-gray/30 p-6">
      <p className="text-iron-gray text-xs uppercase tracking-wider mb-4">
        Today&apos;s Energy Balance
      </p>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Calories In */}
        <div className="border-l-2 border-iron-orange pl-4">
          <p className="text-sm text-iron-gray mb-1 uppercase tracking-wider">🍽️ Consumed</p>
          <p className="text-4xl font-bold text-iron-orange">{caloriesConsumed}</p>
          {nutrition.calories_goal && (
            <p className="text-xs text-iron-gray mt-1">
              / {nutrition.calories_goal} kcal
            </p>
          )}
        </div>

        {/* Calories Out */}
        <div className="border-l-2 border-green-500 pl-4">
          <p className="text-sm text-iron-gray mb-1 uppercase tracking-wider">🔥 Burned</p>
          <p className="text-4xl font-bold text-green-500">{caloriesBurned}</p>
          <p className="text-xs text-iron-gray mt-1">
            {activity.activity_count} {activity.activity_count === 1 ? 'workout' : 'workouts'}
          </p>
        </div>
      </div>

      {/* Net Calories */}
      <div className="pt-4 border-t border-iron-gray/30">
        <div className="flex items-center justify-between">
          <p className="text-sm text-iron-gray uppercase tracking-wider">Net Calories</p>
          <div className="text-right">
            <p className="text-2xl font-bold text-iron-white">{netCalories} kcal</p>
            <p className="text-xs text-iron-gray mt-1">
              {netCalories > 0 ? 'Surplus' : netCalories < 0 ? 'Deficit' : 'Balanced'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
