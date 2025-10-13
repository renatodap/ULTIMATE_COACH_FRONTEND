'use client'

/**
 * Weight Progress Card Component
 *
 * Shows current weight, goal, trend, and quick log button
 * Sharp design, NO rounded corners, mobile-first
 */

import { useRouter } from 'next/navigation'
import type { WeightProgressSummary } from '@/lib/types/dashboard'

interface WeightProgressCardProps {
  weight: WeightProgressSummary
  onLogWeight: () => void
}

export default function WeightProgressCard({ weight, onLogWeight }: WeightProgressCardProps) {
  const router = useRouter()

  // Trend indicator
  const trendIcon = weight.trend_direction === 'up' ? '📈' : weight.trend_direction === 'down' ? '📉' : '➡️'
  const trendColor = weight.trend_direction === 'up' ? 'text-red-500' : weight.trend_direction === 'down' ? 'text-green-500' : 'text-iron-gray'

  return (
    <div className="card-glass border border-iron-gray/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-iron-gray text-xs uppercase tracking-wider">
          ⚖️ Weight Progress
        </p>
        <button
          onClick={onLogWeight}
          className="btn-primary text-xs px-3 py-2 min-h-[44px]"
        >
          Log Weight
        </button>
      </div>

      {weight.current_weight ? (
        <>
          {/* Current vs Goal */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-iron-black border border-iron-gray/30 p-4">
              <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">Current</p>
              <p className="text-3xl font-bold text-iron-white">{weight.current_weight.toFixed(1)}</p>
              <p className="text-xs text-iron-gray">kg</p>
            </div>

            {weight.goal_weight && (
              <div className="bg-iron-black border border-iron-gray/30 p-4">
                <p className="text-xs text-iron-gray mb-1 uppercase tracking-wider">Goal</p>
                <p className="text-3xl font-bold text-iron-orange">{weight.goal_weight.toFixed(1)}</p>
                <p className="text-xs text-iron-gray">kg</p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {weight.progress_percentage !== null && weight.remaining_kg !== null && (
            <div className="mb-4">
              <div className="h-2 bg-iron-gray/20 overflow-hidden">
                <div
                  className="h-full bg-iron-orange transition-all duration-300"
                  style={{ width: `${Math.min(weight.progress_percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-iron-gray mt-2">
                {weight.remaining_kg.toFixed(1)} kg to goal • {weight.progress_percentage.toFixed(0)}% progress
              </p>
            </div>
          )}

          {/* 7-Day Trend */}
          {weight.previous_weight !== null && (
            <div className="pt-4 border-t border-iron-gray/30">
              <p className="text-xs text-iron-gray mb-2 uppercase tracking-wider">7-Day Trend</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{trendIcon}</span>
                  <div>
                    <p className={`text-lg font-bold ${trendColor}`}>
                      {weight.change_kg > 0 ? '+' : ''}{weight.change_kg.toFixed(1)} kg
                    </p>
                    <p className="text-xs text-iron-gray">
                      {weight.change_percentage > 0 ? '+' : ''}{weight.change_percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/weight')}
                  className="text-iron-orange text-xs uppercase tracking-wider hover:underline"
                >
                  View History →
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        // No weight data yet
        <div className="text-center py-8">
          <p className="text-4xl mb-3">⚖️</p>
          <p className="text-sm text-iron-gray mb-4">No weight logged yet</p>
          <button
            onClick={onLogWeight}
            className="btn-primary px-6 py-3"
          >
            Log Your First Weight
          </button>
        </div>
      )}
    </div>
  )
}
