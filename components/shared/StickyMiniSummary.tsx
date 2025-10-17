'use client'

/**
 * Sticky Mini Summary Bar
 *
 * Compact summary that stays visible at top of page during scroll.
 * Prevents users from needing to scroll back up to check their daily totals.
 *
 * Used on: Activities, Nutrition pages
 */

interface StickyMiniSummaryProps {
  type: 'activity' | 'nutrition'
  // Activity props
  totalCalories?: number
  calorieGoal?: number
  totalDuration?: number
  activityCount?: number
  // Nutrition props
  protein?: number
  carbs?: number
  fat?: number
}

export function StickyMiniSummary({
  type,
  totalCalories = 0,
  calorieGoal = 0,
  totalDuration = 0,
  activityCount = 0,
  protein = 0,
  carbs = 0,
  fat = 0,
}: StickyMiniSummaryProps) {

  if (type === 'activity') {
    return (
      <div className="sticky top-16 z-[90] bg-iron-black/95 backdrop-blur border-b border-iron-gray/30">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-iron-orange font-bold">{totalCalories}</span>
            <span className="text-iron-gray text-xs"> / {calorieGoal} cal</span>
          </div>
          <div className="text-xs text-iron-gray">
            {totalDuration} min • {activityCount} {activityCount === 1 ? 'activity' : 'activities'}
          </div>
        </div>
      </div>
    )
  }

  // Nutrition type
  return (
    <div className="sticky top-[120px] z-[90] bg-iron-black/95 backdrop-blur border-b border-iron-gray/30">
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="text-sm">
          <span className="text-iron-orange font-bold">{totalCalories}</span>
          <span className="text-iron-gray text-xs"> / {calorieGoal} cal</span>
        </div>
        <div className="text-xs text-iron-gray">
          P: {protein}g • C: {carbs}g • F: {fat}g
        </div>
      </div>
    </div>
  )
}
