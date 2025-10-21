'use client'

/**
 * MultiLogCarousel - Swipeable carousel for multiple log previews
 *
 * Displays one log at a time with:
 * - Swipe gestures (left/right)
 * - Dot navigation for direct jumping
 * - Current/total indicator
 * - Smooth animations via Framer Motion
 * - Support for skipping individual logs
 *
 * Design System: Uses iron-* colors for consistency
 */

import { useState } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { LogPreview, MealItem, EnrichedMealItem } from '@/lib/api/coach'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { FoodMatchSelector } from '../FoodMatchSelector/FoodMatchSelector'

export interface MultiLogCarouselProps {
  logs: LogPreview[]
  currentIndex: number
  onIndexChange: (index: number) => void
  onSkip?: (logId: string, index: number) => void
}

// Meal type icons and labels (consistent with ConfirmationModal)
const MEAL_ICONS = {
  breakfast: '🌅',
  lunch: '🍽️',
  dinner: '🌙',
  snack: '🍪'
}

const MEAL_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack'
}

export function MultiLogCarousel({
  logs,
  currentIndex,
  onIndexChange,
  onSkip
}: MultiLogCarouselProps) {
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  // State for food match selector
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)

  const currentLog = logs[currentIndex]
  const isNutrition = currentLog?.type === 'nutrition'
  const data = currentLog?.data as any

  // OPTIMIZATION: Use backend nutrition_summary if available, otherwise calculate
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0

  if (isNutrition) {
    if (data?.nutrition_summary) {
      // Backend provided enriched summary - use it
      console.log('[MultiLogCarousel] Using backend nutrition_summary:', data.nutrition_summary)
      totalCalories = data.nutrition_summary.calories || 0
      totalProtein = data.nutrition_summary.protein_g || 0
      totalCarbs = data.nutrition_summary.carbs_g || 0
      totalFat = data.nutrition_summary.fat_g || 0
    } else if (data?.meal_items) {
      // Fallback: Calculate from meal_items
      console.log('[MultiLogCarousel] Calculating nutrition from meal_items')
      data.meal_items.forEach((item: MealItem) => {
        totalCalories += item.calories
        totalProtein += item.protein_g
        totalCarbs += item.carbs_g
        totalFat += item.fat_g
      })
    }
  }

  // Handle swipe navigation
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50
    const swipeVelocityThreshold = 500

    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > swipeVelocityThreshold) {
      if (info.offset.x > 0 && currentIndex > 0) {
        // Swipe right → previous
        setDirection('left')
        onIndexChange(currentIndex - 1)
      } else if (info.offset.x < 0 && currentIndex < logs.length - 1) {
        // Swipe left → next
        setDirection('right')
        onIndexChange(currentIndex + 1)
      }
    }
  }

  // Handle previous/next buttons
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setDirection('left')
      onIndexChange(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < logs.length - 1) {
      setDirection('right')
      onIndexChange(currentIndex + 1)
    }
  }

  // Handle dot navigation
  const goToIndex = (index: number) => {
    if (index === currentIndex) return
    setDirection(index > currentIndex ? 'right' : 'left')
    onIndexChange(index)
  }

  // Handle skip
  const handleSkip = () => {
    const logId = currentLog?.id
    if (!logId) {
      console.error('[MultiLogCarousel] Cannot skip log without ID')
      return
    }

    if (onSkip) {
      onSkip(logId, currentIndex)
    }

    // Auto-advance to next log after skip
    if (currentIndex < logs.length - 1) {
      setDirection('right')
      onIndexChange(currentIndex + 1)
    } else if (currentIndex > 0) {
      // If last log, go back
      setDirection('left')
      onIndexChange(currentIndex - 1)
    }
  }

  // Handle opening food match selector
  const handleOpenSelector = (itemIndex: number) => {
    setSelectedItemIndex(itemIndex)
    setIsSelectorOpen(true)
  }

  // Handle food selection change
  const handleFoodSelect = (newFoodId: string) => {
    console.log('[MultiLogCarousel] Food changed for item', selectedItemIndex, 'to', newFoodId)
    // Note: Actual edits would be passed to parent via onEdit callback
    // For now, just log the change
  }

  // Safety check: Don't render if no current log
  if (!currentLog) {
    console.error('[MultiLogCarousel] No current log at index', currentIndex)
    return <div className="text-iron-white/60 p-4">Error: No log data available</div>
  }

  // Slide animation variants
  const slideVariants = {
    enter: (direction: string) => ({
      x: direction === 'right' ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: string) => ({
      x: direction === 'right' ? '-100%' : '100%',
      opacity: 0
    })
  }

  return (
    <div className="relative w-full">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-iron-white/60 text-sm">
          Log {currentIndex + 1} of {logs.length}
        </div>
        {onSkip && logs.length > 1 && currentLog?.id && (
          <button
            onClick={handleSkip}
            className="text-iron-orange text-sm hover:text-iron-orange/80 transition-colors"
          >
            Skip this log
          </button>
        )}
        {!currentLog?.id && (
          <div className="text-yellow-400 text-xs">
            ⚠️ Cannot skip (missing ID)
          </div>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        {/* Navigation Arrows (desktop) */}
        {currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-iron-black/80 backdrop-blur-sm border border-iron-gray hover:bg-iron-dark-gray transition-colors"
            aria-label="Previous log"
          >
            <ChevronLeft className="w-5 h-5 text-iron-white" />
          </button>
        )}

        {currentIndex < logs.length - 1 && (
          <button
            onClick={goToNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-iron-black/80 backdrop-blur-sm border border-iron-gray hover:bg-iron-dark-gray transition-colors"
            aria-label="Next log"
          >
            <ChevronRight className="w-5 h-5 text-iron-white" />
          </button>
        )}

        {/* Swipeable Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="w-full"
          >
            {/* Log Content */}
            <div className="w-full">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                {isNutrition && (
                  <>
                    <span className="text-3xl">
                      {MEAL_ICONS[data.meal_type as keyof typeof MEAL_ICONS]}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-iron-white">
                        {MEAL_LABELS[data.meal_type as keyof typeof MEAL_LABELS]}
                      </h3>
                      {data.logged_at && (
                        <p className="text-sm text-iron-white/60">
                          {new Date(data.logged_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </>
                )}
                {!isNutrition && (
                  <>
                    <span className="text-3xl">💪</span>
                    <div>
                      <h3 className="text-xl font-semibold text-iron-white">
                        {data.activityType}
                      </h3>
                    </div>
                  </>
                )}
              </div>

              {/* Nutrition Content */}
              {isNutrition && (
                <>
                  {/* Food Items - ENRICHED or STANDARD */}
                  {(data.items && data.items.length > 0) || (data.meal_items && data.meal_items.length > 0) ? (
                    <>
                    <div className="space-y-2 mb-4">
                      {/* ENRICHED ITEMS (with food matching) */}
                      {data.items && data.items.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="p-3 bg-iron-dark-gray border border-iron-gray border-l-2 border-l-iron-orange/50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-iron-white font-medium">
                                  {item.matched_food.name}
                                </p>
                                {item.matched_food.brand_name && (
                                  <span className="text-xs text-iron-white/60">
                                    ({item.matched_food.brand_name})
                                  </span>
                                )}
                                {/* Match confidence badge */}
                                {item.match_confidence < 85 && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                                    {Math.round(item.match_confidence)}% match
                                  </span>
                                )}
                                {item.match_reason === 'user_history' && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-iron-orange/20 text-iron-orange">
                                    ⭐ Your food
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-iron-white/60 mt-1">
                                {item.quantity} {item.unit}
                                {item.unit !== 'g' && ` (~${item.estimated_grams}g)`}
                              </p>
                              {/* Warnings */}
                              {item.warnings && item.warnings.length > 0 && (
                                <div className="mt-1 text-xs text-yellow-400">
                                  ⚠️ {item.warnings[0]}
                                </div>
                              )}
                              {/* Alternatives */}
                              {item.alternatives && item.alternatives.length > 0 && (
                                <button
                                  onClick={() => handleOpenSelector(index)}
                                  className="mt-1 text-xs text-iron-orange hover:text-iron-orange/80 underline"
                                >
                                  {item.alternatives.length} alternatives available → Change
                                </button>
                              )}
                            </div>
                            <div className="text-iron-orange font-semibold ml-2">
                              {item.calculated_nutrition.calories} cal
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* STANDARD ITEMS (backward compatibility) */}
                      {!data.items && data.meal_items && data.meal_items.map((item: MealItem, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-iron-dark-gray border border-iron-gray"
                        >
                          <div>
                            <p className="text-iron-white font-medium">
                              {item.food_name}
                            </p>
                            <p className="text-sm text-iron-white/60">
                              {item.display_label
                                ? `${item.quantity} ${item.display_label}`
                                : `${item.quantity}${item.unit}`}
                              {item.unit !== 'g' && ` (${item.grams}g)`}
                            </p>
                          </div>
                          <div className="text-iron-orange font-semibold">
                            {item.calories > 0 ? `${item.calories} cal` : 'Calculating...'}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Missing Foods Warning */}
                    {data.missing_foods && data.missing_foods.length > 0 && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded mb-4">
                        <p className="text-sm text-yellow-400 font-semibold mb-2">
                          ⚠️ Some foods couldn't be matched:
                        </p>
                        <ul className="text-xs text-yellow-400 space-y-1">
                          {data.missing_foods.map((missing: any, idx: number) => (
                            <li key={idx}>
                              • {missing.name} ({missing.quantity} {missing.unit})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                      {/* Nutrition Summary */}
                    <div className="p-4 bg-iron-orange/10 border border-iron-orange/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-iron-white/80">Total Calories</span>
                        <span className="text-2xl font-bold text-iron-orange">
                          {Math.round(totalCalories)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <div className="text-xs text-iron-white/60">Protein</div>
                          <div className="text-iron-white font-semibold">
                            {Math.round(totalProtein)}g
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-iron-white/60">Carbs</div>
                          <div className="text-iron-white font-semibold">
                            {Math.round(totalCarbs)}g
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-iron-white/60">Fat</div>
                          <div className="text-iron-white font-semibold">
                            {Math.round(totalFat)}g
                          </div>
                        </div>
                      </div>
                    </div>
                    </>
                  ) : (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
                      ⚠️ No food items found in this meal log
                    </div>
                  )}
                </>
              )}

              {/* Activity Content (Workout) */}
              {!isNutrition && currentLog.type === 'workout' && (
                <>
                  {/* Activity Log with Personalized Calories */}
                  {!data.exercises && (
                    <div className="space-y-3">
                      {/* Personalized Calories */}
                      {data.personalized_calories && (
                        <div className="p-4 bg-iron-dark-gray border border-iron-gray rounded">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm text-iron-white/60 mb-1">Estimated Calories</p>
                              <p className="text-2xl font-bold text-iron-orange">
                                {data.personalized_calories.estimated} cal
                              </p>
                            </div>
                            {data.matched_activity && (
                              <div className="text-right">
                                <p className="text-xs text-iron-white/60">Your typical</p>
                                <p className="text-lg font-semibold text-iron-white/80">
                                  {data.matched_activity.avg_calories} cal
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Match Info */}
                          {data.matched_activity && (
                            <div className="pt-3 border-t border-iron-gray/50 mb-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs px-2 py-0.5 rounded bg-iron-orange/20 text-iron-orange">
                                  ⭐ Your activity
                                </span>
                                <span className="text-xs text-iron-white/60">
                                  {data.match_confidence}% match
                                </span>
                              </div>
                              <p className="text-xs text-iron-white/60">
                                You've logged this {data.matched_activity.times_logged} times
                                (avg: {data.matched_activity.avg_duration_minutes} min,
                                {data.matched_activity.avg_calories} cal)
                              </p>
                            </div>
                          )}

                          {/* Calculation Breakdown */}
                          {data.personalized_calories.factors && (
                            <div className="pt-3 border-t border-iron-gray/50">
                              <p className="text-xs text-iron-white/60 mb-2">Calculation:</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-iron-white/60">Your weight:</span>
                                  <span className="text-iron-white ml-1">
                                    {data.personalized_calories.factors.user_weight_kg} kg
                                  </span>
                                </div>
                                <div>
                                  <span className="text-iron-white/60">Fitness level:</span>
                                  <span className="text-iron-white ml-1 capitalize">
                                    {data.personalized_calories.factors.fitness_level}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-iron-white/60">Base METs:</span>
                                  <span className="text-iron-white ml-1">
                                    {data.personalized_calories.base_mets}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-iron-white/60">Adjusted METs:</span>
                                  <span className="text-iron-white ml-1">
                                    {data.personalized_calories.adjusted_mets}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-iron-white/60 mt-2">
                                Method: {data.personalized_calories.calculation_method === 'blended_formula_and_history'
                                  ? '70% formula + 30% your history'
                                  : 'Based on your weight and fitness level'}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Warnings */}
                      {data.warnings && data.warnings.length > 0 && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                          <p className="text-sm text-yellow-400 font-semibold mb-1">⚠️ Heads up:</p>
                          <ul className="text-xs text-yellow-400 space-y-1">
                            {data.warnings.map((warning: string, idx: number) => (
                              <li key={idx}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Duration and Intensity */}
                      {data.duration && (
                        <div className="p-3 bg-iron-dark-gray border border-iron-gray rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-iron-white/60">Duration</span>
                            <span className="text-lg font-semibold text-iron-white">
                              {data.duration} min
                            </span>
                          </div>
                          {data.intensity && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-iron-white/60">Intensity</span>
                              <span className="text-sm text-iron-white capitalize">
                                {data.intensity}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Strength Training with Exercises */}
                  {data.exercises && (
                    <div className="space-y-2">
                      {data.exercises.map((exercise: any, index: number) => (
                        <div
                          key={index}
                          className="p-3 bg-iron-dark-gray border border-iron-gray"
                        >
                          <p className="text-iron-white font-medium">
                            {exercise.name}
                          </p>
                          <p className="text-sm text-iron-white/60">
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.weight && ` @ ${exercise.weight}`}
                          </p>
                        </div>
                      ))}

                      {/* Duration and Calories Summary */}
                      <div className="space-y-2 mt-2">
                        {data.duration && (
                          <div className="p-4 bg-iron-dark-gray border border-iron-gray rounded">
                            <div className="flex items-center justify-between">
                              <span className="text-iron-white/80">Duration</span>
                              <span className="text-xl font-bold text-iron-white">
                                {data.duration} min
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Personalized Calories (even for strength training) */}
                        {data.personalized_calories && (
                          <div className="p-4 bg-iron-orange/10 border border-iron-orange/30 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-iron-white/80">Estimated Calories</span>
                              <span className="text-xl font-bold text-iron-orange">
                                {data.personalized_calories.estimated} cal
                              </span>
                            </div>
                            {data.matched_activity && (
                              <p className="text-xs text-iron-white/60">
                                ⭐ Your typical: {data.matched_activity.avg_calories} cal
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Measurement Content */}
              {!isNutrition && currentLog.type === 'measurement' && (
                <>
                  {/* Measurement Log with Trend Analysis */}
                  <div className="space-y-3">
                    {/* Weight Display */}
                    {(data.weight_kg || data.value) && (
                      <div className="p-4 bg-iron-dark-gray border border-iron-gray rounded">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm text-iron-white/60 mb-1">Weight</p>
                            <p className="text-3xl font-bold text-iron-orange">
                              {data.weight_kg || data.value} kg
                            </p>
                          </div>
                          {data.body_fat_percentage && (
                            <div className="text-right">
                              <p className="text-xs text-iron-white/60">Body Fat</p>
                              <p className="text-xl font-semibold text-iron-white">
                                {data.body_fat_percentage}%
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Trend Analysis */}
                        {data.trend_analysis && (
                          <>
                            {/* Change from Last */}
                            <div className="pt-3 border-t border-iron-gray/50 mb-3">
                              <p className="text-xs text-iron-white/60 mb-1">Recent Change</p>
                              <p className={`text-lg font-semibold ${
                                data.trend_analysis.change_from_last.weight_direction === 'down'
                                  ? 'text-green-400'
                                  : data.trend_analysis.change_from_last.weight_direction === 'up'
                                  ? 'text-yellow-400'
                                  : 'text-iron-white'
                              }`}>
                                {data.trend_analysis.change_from_last.display_text}
                              </p>
                              <p className="text-xs text-iron-white/60 mt-1">
                                Last: {data.trend_analysis.last_measurement.weight_kg} kg
                                ({data.trend_analysis.last_measurement.days_ago} days ago)
                              </p>
                            </div>

                            {/* Total Progress */}
                            {data.trend_analysis.progress_since_start && (
                              <div className="pt-3 border-t border-iron-gray/50 mb-3">
                                <p className="text-xs text-iron-white/60 mb-1">Total Progress</p>
                                <p className={`text-lg font-semibold ${
                                  data.trend_analysis.progress_since_start.direction === 'down'
                                    ? 'text-green-400'
                                    : 'text-yellow-400'
                                }`}>
                                  {data.trend_analysis.progress_since_start.display_text}
                                </p>
                                <p className="text-xs text-iron-white/60 mt-1">
                                  Started at {data.trend_analysis.progress_since_start.first_measurement.weight_kg} kg
                                </p>
                              </div>
                            )}

                            {/* Typical Range */}
                            {data.trend_analysis.typical_range && (
                              <div className="pt-3 border-t border-iron-gray/50">
                                <p className="text-xs text-iron-white/60 mb-1">Your Typical Range</p>
                                <p className="text-sm text-iron-white">
                                  {data.trend_analysis.typical_range.min_kg} - {data.trend_analysis.typical_range.max_kg} kg
                                  <span className="text-iron-white/60 ml-2">
                                    (avg: {data.trend_analysis.typical_range.avg_kg} kg)
                                  </span>
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Validation Warnings */}
                    {data.validation && (
                      <div className="space-y-2">
                        {/* Typo Detection - CRITICAL */}
                        {data.validation.is_likely_typo && (
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                            <p className="text-sm text-red-400 font-semibold mb-1">
                              ⚠️ Possible Typo Detected
                            </p>
                            <p className="text-xs text-red-400/80">
                              Did you mean {data.validation.suggested_value} kg instead of {data.weight_kg || data.value} kg?
                            </p>
                          </div>
                        )}

                        {/* Impossible Change - CRITICAL */}
                        {data.validation.is_physiologically_impossible && (
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                            <p className="text-sm text-red-400 font-semibold mb-1">
                              ❌ This change is physiologically impossible
                            </p>
                            <p className="text-xs text-red-400/80">
                              Weight changes this large cannot occur naturally in this timeframe.
                            </p>
                          </div>
                        )}

                        {/* Unusual Value - Warning */}
                        {data.validation.is_unusual && !data.validation.is_physiologically_impossible && (
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                            <p className="text-sm text-yellow-400 font-semibold mb-1">
                              ⚠️ This value is unusual for you
                            </p>
                            <p className="text-xs text-yellow-400/80">
                              Please double-check this measurement.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Additional Warnings */}
                    {data.warnings && data.warnings.length > 0 && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                        <p className="text-sm text-yellow-400 font-semibold mb-1">⚠️ Heads up:</p>
                        <ul className="text-xs text-yellow-400 space-y-1">
                          {data.warnings.map((warning: string, idx: number) => (
                            <li key={idx}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Notes */}
                    {data.notes && (
                      <div className="p-3 bg-iron-dark-gray border border-iron-gray rounded">
                        <p className="text-xs text-iron-white/60 mb-1">Notes</p>
                        <p className="text-sm text-iron-white">{data.notes}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Confidence Warning */}
              {currentLog.confidence && currentLog.confidence < 0.8 && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <p className="text-sm text-yellow-400">
                    This was auto-detected. Please verify before confirming.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot Navigation */}
      {logs.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {logs.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-200
                ${index === currentIndex
                  ? 'w-6 bg-iron-orange'
                  : 'bg-iron-gray hover:bg-iron-white/50'
                }
              `}
              aria-label={`Go to log ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Food Match Selector Modal */}
      {selectedItemIndex !== null && isNutrition && data.items && data.items[selectedItemIndex] && (
        <FoodMatchSelector
          isOpen={isSelectorOpen}
          onClose={() => setIsSelectorOpen(false)}
          onSelect={handleFoodSelect}
          currentMatch={data.items[selectedItemIndex].matched_food}
          alternatives={data.items[selectedItemIndex].alternatives || []}
          matchConfidence={data.items[selectedItemIndex].match_confidence}
          matchReason={data.items[selectedItemIndex].match_reason}
          originalText={data.items[selectedItemIndex].original_llm_text}
          quantity={data.items[selectedItemIndex].quantity}
          unit={data.items[selectedItemIndex].unit}
          estimatedGrams={data.items[selectedItemIndex].estimated_grams}
        />
      )}
    </div>
  )
}

export default MultiLogCarousel
