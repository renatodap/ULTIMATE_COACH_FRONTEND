/**
 * CalorieEstimator Component
 *
 * Real-time calorie estimation preview for activity logging
 * Shows estimated calories and METs intensity as user types
 */

import { useEffect, useState } from 'react'
import { getActivityEstimate } from '@/lib/utils/mets-database'
import type { ActivityCategory } from '@/lib/types/activities'

interface CalorieEstimatorProps {
  activityName: string
  category: ActivityCategory | ''
  durationMinutes: number | ''
  userWeightKg: number | null
}

export default function CalorieEstimator({
  activityName,
  category,
  durationMinutes,
  userWeightKg
}: CalorieEstimatorProps) {
  const [estimate, setEstimate] = useState<{
    calories: number
    mets: number
    description: string
    method: 'exact' | 'partial' | 'category'
  } | null>(null)

  useEffect(() => {
    if (!category || !activityName.trim() || !durationMinutes || !userWeightKg) {
      setEstimate(null)
      return
    }

    const result = getActivityEstimate(
      activityName,
      category as ActivityCategory,
      typeof durationMinutes === 'number' ? durationMinutes : null,
      userWeightKg
    )

    setEstimate(result)
  }, [activityName, category, durationMinutes, userWeightKg])

  if (!estimate) {
    return null
  }

  return (
    <div className="bg-iron-orange/10 border border-iron-orange/30 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-iron-orange mb-1">
            Estimated Calories
          </p>
          <p className="text-2xl font-bold text-iron-white">
            {estimate.calories} <span className="text-base font-normal text-iron-gray">cal</span>
          </p>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-iron-orange mb-1">
            Intensity (METs)
          </p>
          <p className="text-2xl font-bold text-iron-white">
            {estimate.mets.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-iron-orange/20">
        <p className="text-xs text-iron-gray">
          <span className="font-medium text-iron-white">Match: </span>
          {estimate.description}
          {estimate.method === 'category' && ' (category average)'}
          {estimate.method === 'partial' && ' (similar activity)'}
        </p>
        <p className="text-xs text-iron-gray mt-1">
          Final values will be calculated automatically if you don't enter them manually.
        </p>
      </div>
    </div>
  )
}
