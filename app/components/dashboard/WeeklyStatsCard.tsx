'use client'

/**
 * Weekly Stats Card Component
 *
 * Shows weekly consistency and averages
 * Sharp design, NO rounded corners, mobile-first
 */

import type { WeeklyStats } from '@/lib/types/dashboard'

interface WeeklyStatsCardProps {
  weekly: WeeklyStats
}

export default function WeeklyStatsCard({ weekly }: WeeklyStatsCardProps) {
  return (
    <div className="card-glass border border-iron-gray/30 p-6">
      <p className="text-iron-gray text-xs uppercase tracking-wider mb-4">
        📊 This Week
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Days Active */}
        <div className="bg-iron-black border border-iron-gray/30 p-4">
          <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">Days Active</p>
          <p className="text-3xl font-bold text-iron-orange">{weekly.days_active}</p>
          <p className="text-xs text-iron-gray">/ 7 days</p>
        </div>

        {/* Total Workouts */}
        <div className="bg-iron-black border border-iron-gray/30 p-4">
          <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">Workouts</p>
          <p className="text-3xl font-bold text-iron-white">{weekly.total_workouts}</p>
          <p className="text-xs text-iron-gray">completed</p>
        </div>

        {/* Days with Meals */}
        <div className="bg-iron-black border border-iron-gray/30 p-4">
          <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">Days Logged</p>
          <p className="text-3xl font-bold text-iron-orange">{weekly.days_with_meals}</p>
          <p className="text-xs text-iron-gray">meals tracked</p>
        </div>

        {/* Total Meals */}
        <div className="bg-iron-black border border-iron-gray/30 p-4">
          <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">Total Meals</p>
          <p className="text-3xl font-bold text-iron-white">{weekly.total_meals}</p>
          <p className="text-xs text-iron-gray">this week</p>
        </div>
      </div>

      {/* Averages */}
      {(weekly.avg_calories_consumed || weekly.avg_calories_burned) && (
        <div className="mt-4 pt-4 border-t border-iron-gray/30">
          <p className="text-xs text-iron-gray mb-3 uppercase tracking-wider">Daily Averages</p>
          <div className="grid grid-cols-2 gap-4">
            {weekly.avg_calories_consumed && (
              <div>
                <p className="text-xs text-iron-gray mb-1">Consumed</p>
                <p className="text-lg font-bold text-iron-white">
                  {weekly.avg_calories_consumed} kcal
                </p>
              </div>
            )}
            {weekly.avg_calories_burned && (
              <div>
                <p className="text-xs text-iron-gray mb-1">Burned</p>
                <p className="text-lg font-bold text-iron-white">
                  {weekly.avg_calories_burned} kcal
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
