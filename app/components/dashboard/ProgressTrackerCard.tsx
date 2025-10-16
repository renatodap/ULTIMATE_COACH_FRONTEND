'use client'

/**
 * Progress Tracker Card - THIS WEEK
 *
 * Unified progress card combining weight progress and weekly stats
 * Mobile-first: Condensed view with tap-to-expand for trends
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { WeightProgressSummary, WeeklyStats } from '@/lib/types/dashboard'
import { displayWeight } from '@/lib/utils/units'

interface ProgressTrackerCardProps {
  weight: WeightProgressSummary
  weekly: WeeklyStats
  unitSystem: 'metric' | 'imperial'
  onLogWeight: () => void
}

export default function ProgressTrackerCard({
  weight,
  weekly,
  unitSystem,
  onLogWeight
}: ProgressTrackerCardProps) {
  const router = useRouter()
  const [showWeightDetail, setShowWeightDetail] = useState(false)

  // Weight trend
  const trendIcon = weight.trend_direction === 'up' ? '📈' : weight.trend_direction === 'down' ? '📉' : '➡️'
  const trendColor = weight.trend_direction === 'up' ? 'text-red-500' : weight.trend_direction === 'down' ? 'text-green-500' : 'text-iron-gray'

  return (
    <div className="card-glass border border-iron-gray/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-iron-gray text-xs uppercase tracking-wider">
          📊 This Week
        </p>
        <button
          onClick={onLogWeight}
          className="text-iron-orange text-xs uppercase tracking-wider hover:underline font-bold"
        >
          Log Weight
        </button>
      </div>

      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Days Active */}
        <div className="bg-iron-black border border-iron-gray/30 p-3 text-center">
          <p className="text-3xl font-bold text-iron-orange">{weekly.days_active}</p>
          <p className="text-xs text-iron-gray mt-1 uppercase tracking-wider">Days Active</p>
        </div>

        {/* Total Workouts */}
        <div className="bg-iron-black border border-iron-gray/30 p-3 text-center">
          <p className="text-3xl font-bold text-iron-white">{weekly.total_workouts}</p>
          <p className="text-xs text-iron-gray mt-1 uppercase tracking-wider">Workouts</p>
        </div>

        {/* Days Logged */}
        <div className="bg-iron-black border border-iron-gray/30 p-3 text-center">
          <p className="text-3xl font-bold text-iron-orange">{weekly.days_with_meals}</p>
          <p className="text-xs text-iron-gray mt-1 uppercase tracking-wider">Days Logged</p>
        </div>
      </div>

      {/* Weight Progress Section */}
      {weight.current_weight && (
        <div className="pt-4 border-t border-iron-gray/30">
          <button
            onClick={() => setShowWeightDetail(!showWeightDetail)}
            className="w-full text-left tap-target focus-ring-iron"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{trendIcon}</span>
                <div>
                  <p className="text-sm text-iron-gray uppercase tracking-wider mb-1">Weight Trend</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-iron-white">
                      {displayWeight(weight.current_weight, unitSystem).value.toFixed(1)}
                    </p>
                    <p className="text-sm text-iron-gray">
                      {displayWeight(weight.current_weight, unitSystem).unit}
                    </p>
                    {weight.change_kg !== 0 && (
                      <p className={`text-sm font-bold ${trendColor}`}>
                        {weight.change_kg > 0 ? '+' : ''}{displayWeight(Math.abs(weight.change_kg), unitSystem).value.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  router.push('/weight')
                }}
                className="text-iron-orange text-xs uppercase tracking-wider hover:underline"
              >
                View All →
              </button>
            </div>
          </button>

          {/* Progress bar to goal */}
          {weight.progress_percentage !== null && weight.goal_weight && weight.remaining_kg !== null && (
            <div className="mt-3">
              <div className="h-2 bg-iron-gray/20 overflow-hidden">
                <div
                  className="h-full bg-iron-orange transition-all duration-300"
                  style={{ width: `${Math.min(weight.progress_percentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-iron-gray">
                  {weight.remaining_kg.toFixed(1)} {displayWeight(0, unitSystem).unit} to goal
                </p>
                <p className="text-xs font-bold text-iron-orange">
                  {weight.progress_percentage.toFixed(0)}%
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weekly Averages */}
      {(weekly.avg_calories_consumed || weekly.avg_calories_burned) && (
        <div className="mt-4 pt-4 border-t border-iron-gray/30">
          <p className="text-xs text-iron-gray mb-3 uppercase tracking-wider">Daily Averages</p>
          <div className="grid grid-cols-2 gap-3">
            {weekly.avg_calories_consumed && (
              <div className="bg-iron-black/50 border border-iron-gray/30 p-3">
                <p className="text-xs text-iron-gray mb-1">Consumed</p>
                <p className="text-lg font-bold text-iron-white">
                  {weekly.avg_calories_consumed} kcal
                </p>
              </div>
            )}
            {weekly.avg_calories_burned && (
              <div className="bg-iron-black/50 border border-iron-gray/30 p-3">
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
