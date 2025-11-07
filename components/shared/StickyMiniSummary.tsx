'use client'

/**
 * Sticky Mini Summary Bar
 *
 * Compact summary that stays visible at top of page during scroll.
 * Auto-hides on scroll down to reclaim screen space (40px).
 * Shows on scroll up for quick access to daily totals.
 *
 * Used on: Activities, Nutrition pages
 */

import { useScrollDirection } from '@/lib/hooks/useScrollDirection'

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
  // Control auto-hide behavior
  hideOnScroll?: boolean
  // Additional className for transitions
  className?: string
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
  hideOnScroll = true,
  className = '',
}: StickyMiniSummaryProps) {
  const scrollDirection = useScrollDirection()

  // Auto-hide on scroll down, show on scroll up
  const shouldHide = hideOnScroll && scrollDirection === 'down'

  if (type === 'activity') {
    return (
      <div className={`
        sticky top-14 z-[90] bg-iron-black border-b border-iron-gray/30
        transition-transform duration-300 ease-in-out
        ${shouldHide ? '-translate-y-full' : 'translate-y-0'}
        ${className}
      `}>
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
    <div className={`
      sticky top-[110px] z-[90] bg-iron-black border-b border-iron-gray/30
      transition-transform duration-300 ease-in-out
      ${shouldHide ? '-translate-y-full' : 'translate-y-0'}
      ${className}
    `}>
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
