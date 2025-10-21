'use client'

/**
 * ConfirmationModal - Full-screen confirmation modal for log previews
 *
 * Shows when user sends a high-confidence log message or coach creates log preview.
 * Page blurs in background, modal slides up with meal/activity summary.
 * Mobile-first with proper touch targets (44px minimum).
 *
 * Design System: Uses iron-* colors for consistency with activities/nutrition pages
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogPreview, MealItem, EnrichedMealItem } from '@/lib/api/coach'
import { X, Check, CheckCheck } from 'lucide-react'
import { MultiLogCarousel } from '../MultiLogCarousel/MultiLogCarousel'
import { FoodMatchSelector } from '../FoodMatchSelector/FoodMatchSelector'
import './ConfirmationModal.css'

export interface ConfirmationModalProps {
  preview: LogPreview | null
  previews?: LogPreview[]  // NEW: Support for multiple logs
  onConfirm: (logIds: string[]) => Promise<void>  // NEW: Batch confirm
  onConfirmSingle?: (logId: string) => Promise<void>  // NEW: Confirm single log
  onSkip?: (logId: string) => void  // NEW: Skip individual log
  onCancel: () => void
  isOpen: boolean
}

// Meal type icons and labels (consistent with nutrition page)
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

export function ConfirmationModal({
  preview,
  previews,
  onConfirm,
  onConfirmSingle,
  onSkip,
  onCancel,
  isOpen
}: ConfirmationModalProps) {
  // State for carousel
  const [currentIndex, setCurrentIndex] = useState(0)
  const [skippedLogs, setSkippedLogs] = useState<Set<string>>(new Set())

  // State for food match selector
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)

  // State for edited items (tracks user changes)
  const [editedItems, setEditedItems] = useState<Record<number, Partial<EnrichedMealItem>>>({})

  // Determine if we're in multi-log mode
  const isMultiLog = previews && previews.length > 1
  const logs = isMultiLog ? previews : preview ? [preview] : []

  // CRITICAL: Filter active logs with proper ID validation
  const activeLogs = logs.filter(log => {
    // If no ID, log can't be skipped (show it anyway)
    if (!log.id) {
      console.warn('[ConfirmationModal] Log missing ID - cannot skip:', log)
      return true
    }
    // Otherwise, only show if not skipped
    return !skippedLogs.has(log.id)
  })

  console.log('[ConfirmationModal] Render:', {
    isOpen,
    isMultiLog,
    totalLogs: logs.length,
    activeLogs: activeLogs.length,
    skippedCount: skippedLogs.size,
    currentIndex,
    preview,
    previews
  })

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0)
      setSkippedLogs(new Set())
      setEditedItems({})
      setSelectedItemIndex(null)
      setIsSelectorOpen(false)
    }
  }, [isOpen])

  // Early return if modal is closed or no logs
  if (!isOpen || logs.length === 0) {
    console.log('[ConfirmationModal] Early return - not open or no logs')
    return null
  }

  // CRITICAL: Auto-close if all logs skipped
  useEffect(() => {
    if (isMultiLog && activeLogs.length === 0 && skippedLogs.size > 0) {
      console.log('[ConfirmationModal] All logs skipped - auto-closing')
      onCancel()
    }
  }, [activeLogs.length, skippedLogs.size, isMultiLog, onCancel])

  // Handle skip
  const handleSkip = (logId: string, index: number) => {
    if (!logId) {
      console.error('[ConfirmationModal] Cannot skip log without ID')
      return
    }

    setSkippedLogs(prev => new Set(prev).add(logId))
    if (onSkip) {
      onSkip(logId)
    }
  }

  // Handle opening food match selector
  const handleOpenSelector = (itemIndex: number) => {
    setSelectedItemIndex(itemIndex)
    setIsSelectorOpen(true)
  }

  // Handle food selection change
  const handleFoodSelect = (newFoodId: string) => {
    if (selectedItemIndex === null) return

    // Store the edit
    setEditedItems(prev => ({
      ...prev,
      [selectedItemIndex]: {
        ...prev[selectedItemIndex],
        matched_food: { id: newFoodId } as any  // Will be merged with existing
      }
    }))

    console.log('[ConfirmationModal] Food changed for item', selectedItemIndex, 'to', newFoodId)
  }

  // Handle confirm - batch or single
  const handleConfirmClick = async () => {
    if (isMultiLog) {
      // Batch confirm all non-skipped logs
      const logIds = activeLogs.map(log => log.id).filter(Boolean) as string[]

      // CRITICAL: Warn if some logs missing IDs
      const logsWithoutIds = activeLogs.filter(log => !log.id)
      if (logsWithoutIds.length > 0) {
        console.error('[ConfirmationModal] Some logs missing IDs:', logsWithoutIds)
      }

      if (logIds.length === 0) {
        console.error('[ConfirmationModal] No valid log IDs to confirm')
        return
      }

      await onConfirm(logIds)
    } else {
      // Single log confirm
      const logId = logs[0]?.id
      if (!logId) {
        console.error('[ConfirmationModal] Cannot confirm log without ID:', logs[0])
        return
      }

      if (onConfirmSingle) {
        await onConfirmSingle(logId)
      } else {
        await onConfirm([logId])
      }
    }
  }

  // Get current preview for single-log mode
  const currentPreview = logs[currentIndex]
  if (!currentPreview) {
    console.error('[ConfirmationModal] No current preview')
    return null
  }

  // Only handle nutrition and workout types
  if (currentPreview.type !== 'nutrition' && currentPreview.type !== 'workout') {
    console.error('[ConfirmationModal] BLOCKED - Unsupported type:', {
      receivedType: currentPreview.type,
      expectedTypes: ['nutrition', 'workout']
    })
    return null
  }

  const isNutrition = currentPreview.type === 'nutrition'
  const data = currentPreview.data as any

  // OPTIMIZATION: Use backend nutrition_summary if available, otherwise calculate
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0

  if (isNutrition) {
    if (data?.nutrition_summary) {
      // Backend provided enriched summary - use it
      console.log('[ConfirmationModal] Using backend nutrition_summary:', data.nutrition_summary)
      totalCalories = data.nutrition_summary.calories || 0
      totalProtein = data.nutrition_summary.protein_g || 0
      totalCarbs = data.nutrition_summary.carbs_g || 0
      totalFat = data.nutrition_summary.fat_g || 0
    } else if (data?.meal_items) {
      // Fallback: Calculate from meal_items
      console.log('[ConfirmationModal] Calculating nutrition from meal_items')
      data.meal_items.forEach((item: MealItem) => {
        totalCalories += item.calories
        totalProtein += item.protein_g
        totalCarbs += item.carbs_g
        totalFat += item.fat_g
      })
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="confirmation-modal-backdrop"
            onClick={onCancel}
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            className="confirmation-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="confirmation-modal__header">
              <div className="confirmation-modal__header-content">
                {isMultiLog ? (
                  <>
                    <span className="confirmation-modal__icon">📋</span>
                    <div className="confirmation-modal__header-text">
                      <h2 className="confirmation-modal__title">
                        Multiple Logs Detected
                      </h2>
                      <p className="confirmation-modal__subtitle">
                        Review {logs.length} logs before confirming
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {isNutrition && (
                      <>
                        <span className="confirmation-modal__icon">
                          {MEAL_ICONS[data.meal_type as keyof typeof MEAL_ICONS]}
                        </span>
                        <div className="confirmation-modal__header-text">
                          <h2 className="confirmation-modal__title">
                            {MEAL_LABELS[data.meal_type as keyof typeof MEAL_LABELS]}
                          </h2>
                          <p className="confirmation-modal__subtitle">
                            Review before logging
                          </p>
                        </div>
                      </>
                    )}
                    {!isNutrition && (
                      <>
                        <span className="confirmation-modal__icon">💪</span>
                        <div className="confirmation-modal__header-text">
                          <h2 className="confirmation-modal__title">{data.activityType}</h2>
                          <p className="confirmation-modal__subtitle">
                            Review before logging
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={onCancel}
                className="confirmation-modal__close"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="confirmation-modal__content">
              {/* Multi-log Carousel */}
              {isMultiLog ? (
                <MultiLogCarousel
                  logs={logs}
                  currentIndex={currentIndex}
                  onIndexChange={setCurrentIndex}
                  onSkip={handleSkip}
                />
              ) : (
                <>
                  {/* Single Log - Nutrition */}
                  {isNutrition && (data.items || data.meal_items) && (
                <>
                  {/* Food Items List - ENRICHED or STANDARD */}
                  <div className="confirmation-modal__items">
                    {/* ENRICHED ITEMS (with food matching) */}
                    {data.items && data.items.map((item: any, index: number) => (
                      <div key={index} className="confirmation-modal__item border-l-2 border-iron-orange/50">
                        <div className="confirmation-modal__item-main">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="confirmation-modal__item-name flex items-center gap-2">
                                {item.matched_food.name}
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
                              </p>
                              <p className="confirmation-modal__item-quantity">
                                {item.quantity} {item.unit}
                                {item.unit !== 'g' && ` (~${item.estimated_grams}g)`}
                              </p>
                              {/* Warnings */}
                              {item.warnings && item.warnings.length > 0 && (
                                <div className="mt-1 text-xs text-yellow-400">
                                  ⚠️ {item.warnings[0]}
                                </div>
                              )}
                              {/* Alternatives count */}
                              {item.alternatives && item.alternatives.length > 0 && (
                                <button
                                  onClick={() => handleOpenSelector(index)}
                                  className="mt-1 text-xs text-iron-orange hover:text-iron-orange/80 underline"
                                >
                                  {item.alternatives.length} alternatives available → Change
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="confirmation-modal__item-calories">
                          {item.calculated_nutrition.calories} cal
                        </div>
                      </div>
                    ))}

                    {/* STANDARD ITEMS (backward compatibility) */}
                    {!data.items && data.meal_items && data.meal_items.map((item: MealItem, index: number) => (
                      <div key={index} className="confirmation-modal__item">
                        <div className="confirmation-modal__item-main">
                          <p className="confirmation-modal__item-name">
                            {item.food_name}
                          </p>
                          <p className="confirmation-modal__item-quantity">
                            {item.display_label
                              ? `${item.quantity} ${item.display_label}`
                              : `${item.quantity}${item.unit}`}
                            {item.unit !== 'g' && ` (${item.grams}g)`}
                          </p>
                        </div>
                        <div className="confirmation-modal__item-calories">
                          {item.calories > 0 ? `${item.calories} cal` : 'Calculating...'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Missing Foods Warning */}
                  {data.missing_foods && data.missing_foods.length > 0 && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                      <p className="text-sm text-yellow-400 font-semibold mb-2">
                        ⚠️ Some foods couldn&apos;t be matched:
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
                  <div className="confirmation-modal__summary">
                    <div className="confirmation-modal__summary-main">
                      <span className="confirmation-modal__summary-label">
                        Total Calories
                      </span>
                      <span className="confirmation-modal__summary-value">
                        {Math.round(totalCalories)}
                      </span>
                    </div>
                    <div className="confirmation-modal__macros">
                      <div className="confirmation-modal__macro">
                        <span className="confirmation-modal__macro-label">
                          Protein
                        </span>
                        <span className="confirmation-modal__macro-value">
                          {Math.round(totalProtein)}g
                        </span>
                      </div>
                      <div className="confirmation-modal__macro">
                        <span className="confirmation-modal__macro-label">
                          Carbs
                        </span>
                        <span className="confirmation-modal__macro-value">
                          {Math.round(totalCarbs)}g
                        </span>
                      </div>
                      <div className="confirmation-modal__macro">
                        <span className="confirmation-modal__macro-label">
                          Fat
                        </span>
                        <span className="confirmation-modal__macro-value">
                          {Math.round(totalFat)}g
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Workout Log */}
              {!isNutrition && data.exercises && (
                <div className="confirmation-modal__items">
                  {data.exercises.map((exercise: any, index: number) => (
                    <div key={index} className="confirmation-modal__item">
                      <div className="confirmation-modal__item-main">
                        <p className="confirmation-modal__item-name">
                          {exercise.name}
                        </p>
                        <p className="confirmation-modal__item-quantity">
                          {exercise.sets} sets × {exercise.reps} reps
                          {exercise.weight && ` @ ${exercise.weight}`}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Duration and Calories Summary */}
                  <div className="space-y-2 mt-3">
                    {data.duration && (
                      <div className="confirmation-modal__summary">
                        <div className="confirmation-modal__summary-main">
                          <span className="confirmation-modal__summary-label">
                            Duration
                          </span>
                          <span className="confirmation-modal__summary-value">
                            {data.duration} min
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Personalized Calories (even for strength training) */}
                    {data.personalized_calories && (
                      <div className="confirmation-modal__summary">
                        <div className="confirmation-modal__summary-main">
                          <span className="confirmation-modal__summary-label">
                            Estimated Calories
                          </span>
                          <span className="confirmation-modal__summary-value text-iron-orange font-bold">
                            {data.personalized_calories.estimated} cal
                          </span>
                        </div>
                        {data.matched_activity && (
                          <p className="text-xs text-iron-white/60 mt-1">
                            ⭐ Your typical: {data.matched_activity.avg_calories} cal
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Activity Log with Personalized Calories */}
              {!isNutrition && !data.exercises && (
                <div className="confirmation-modal__items">
                  {/* Duration */}
                  {data.duration && (
                    <div className="confirmation-modal__item border-l-2 border-iron-orange/50">
                      <div className="confirmation-modal__item-main">
                        <p className="confirmation-modal__item-name">Duration</p>
                        <p className="confirmation-modal__item-quantity">{data.duration} min</p>
                      </div>
                    </div>
                  )}

                  {/* Intensity */}
                  {data.intensity && (
                    <div className="confirmation-modal__item border-l-2 border-iron-orange/50">
                      <div className="confirmation-modal__item-main">
                        <p className="confirmation-modal__item-name">Intensity</p>
                        <p className="confirmation-modal__item-quantity capitalize">{data.intensity}</p>
                      </div>
                    </div>
                  )}

                  {/* Personalized Calories */}
                  {data.personalized_calories && (
                    <div className="p-4 bg-iron-dark-gray border border-iron-gray rounded mt-2">
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
                        <div className="pt-3 border-t border-iron-gray/50">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-iron-orange/20 text-iron-orange">
                              ⭐ Your activity
                            </span>
                            {data.match_confidence && data.match_confidence >= 85 && (
                              <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                                {Math.round(data.match_confidence)}% match
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-iron-white/60 mt-1">
                            You&apos;ve logged &quot;{data.matched_activity.activity_name}&quot; {data.matched_activity.times_logged}× before
                            {data.matched_activity.avg_duration_minutes && ` (avg: ${data.matched_activity.avg_duration_minutes} min)`}
                          </p>
                        </div>
                      )}

                      {/* Calculation Details */}
                      <div className="mt-3 pt-3 border-t border-iron-gray/50">
                        <p className="text-xs text-iron-white/40 mb-2">Personalized for you:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-iron-white/60">Weight:</span>
                            <span className="ml-1 text-iron-white">{data.personalized_calories.factors.user_weight_kg} kg</span>
                          </div>
                          <div>
                            <span className="text-iron-white/60">Fitness:</span>
                            <span className="ml-1 text-iron-white capitalize">{data.personalized_calories.factors.fitness_level}</span>
                          </div>
                          <div>
                            <span className="text-iron-white/60">Base METs:</span>
                            <span className="ml-1 text-iron-white">{data.personalized_calories.base_mets}</span>
                          </div>
                          <div>
                            <span className="text-iron-white/60">Adjusted:</span>
                            <span className="ml-1 text-iron-orange font-semibold">{data.personalized_calories.adjusted_mets}</span>
                          </div>
                        </div>
                        {data.personalized_calories.calculation_method === 'blended_formula_and_history' && (
                          <p className="text-xs text-iron-white/40 mt-2 italic">
                            Blended estimate using your history + activity formula
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {data.warnings && data.warnings.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                      {data.warnings.map((warning: string, idx: number) => (
                        <p key={idx} className="text-sm text-yellow-400">
                          ⚠️ {warning}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Measurement Log with Trend Analysis */}
              {!isNutrition && !data.exercises && (data.weight_kg || data.value) && (
                <div className="confirmation-modal__items">
                  {/* Weight Display */}
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
                          <p className="text-xl font-semibold text-iron-white/80">
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
                          <p className="text-xs text-iron-white/40 mb-2">Recent Change:</p>
                          <p className={`text-lg font-semibold ${
                            data.trend_analysis.change_from_last.weight_direction === 'down'
                              ? 'text-green-400'
                              : data.trend_analysis.change_from_last.weight_direction === 'up'
                              ? 'text-yellow-400'
                              : 'text-iron-white/60'
                          }`}>
                            {data.trend_analysis.change_from_last.display_text}
                          </p>
                          <p className="text-xs text-iron-white/60 mt-1">
                            Last measured: {data.trend_analysis.last_measurement.days_ago === 0
                              ? 'today'
                              : `${data.trend_analysis.last_measurement.days_ago} day${data.trend_analysis.last_measurement.days_ago > 1 ? 's' : ''} ago`
                            } ({data.trend_analysis.last_measurement.weight_kg} kg)
                          </p>
                        </div>

                        {/* Progress Since Start */}
                        <div className="pt-3 border-t border-iron-gray/50 mb-3">
                          <p className="text-xs text-iron-white/40 mb-2">Total Progress:</p>
                          <p className={`text-lg font-semibold ${
                            data.trend_analysis.progress_since_start.direction === 'down'
                              ? 'text-green-400'
                              : data.trend_analysis.progress_since_start.direction === 'up'
                              ? 'text-yellow-400'
                              : 'text-iron-white/60'
                          }`}>
                            {data.trend_analysis.progress_since_start.display_text}
                          </p>
                          <p className="text-xs text-iron-white/60 mt-1">
                            Started at {data.trend_analysis.progress_since_start.first_measurement.weight_kg} kg
                          </p>
                        </div>

                        {/* Typical Range */}
                        <div className="pt-3 border-t border-iron-gray/50">
                          <p className="text-xs text-iron-white/40 mb-2">Your Typical Range:</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-iron-white/80">
                              {data.trend_analysis.typical_range.min_kg} - {data.trend_analysis.typical_range.max_kg} kg
                            </span>
                            <span className="text-xs text-iron-white/60">
                              (avg: {data.trend_analysis.typical_range.avg_kg} kg)
                            </span>
                          </div>
                          <p className="text-xs text-iron-white/40 mt-1">
                            Based on {data.trend_analysis.typical_range.measurements_count} recent measurements
                          </p>
                        </div>
                      </>
                    )}

                    {/* Validation Warnings */}
                    {data.validation && (
                      <div className="mt-3 pt-3 border-t border-iron-gray/50">
                        {data.validation.is_likely_typo && data.validation.suggested_value && (
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded mb-2">
                            <p className="text-sm text-red-400 font-semibold">
                              ⚠️ Possible Typo Detected
                            </p>
                            <p className="text-xs text-red-400/80 mt-1">
                              Did you mean {data.validation.suggested_value} kg instead of {data.weight_kg || data.value} kg?
                            </p>
                          </div>
                        )}

                        {data.validation.is_physiologically_impossible && (
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded mb-2">
                            <p className="text-sm text-red-400 font-semibold">
                              ❌ Impossible Change
                            </p>
                            <p className="text-xs text-red-400/80 mt-1">
                              This weight change is physiologically impossible. Please verify the measurement.
                            </p>
                          </div>
                        )}

                        {data.validation.is_unusual && !data.validation.is_likely_typo && !data.validation.is_physiologically_impossible && (
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                            <p className="text-sm text-yellow-400">
                              ℹ️ This measurement is outside your typical range. Please verify it&apos;s correct.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Additional Warnings */}
                  {data.warnings && data.warnings.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                      {data.warnings.map((warning: string, idx: number) => (
                        <p key={idx} className="text-sm text-yellow-400">
                          {warning}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {data.notes && (
                    <div className="mt-3 p-3 bg-iron-dark-gray/50 border border-iron-gray/50 rounded">
                      <p className="text-xs text-iron-white/60 mb-1">Notes:</p>
                      <p className="text-sm text-iron-white/80">{data.notes}</p>
                    </div>
                  )}
                </div>
              )}

                  {/* Confidence Warning - Single Log Mode */}
                  {currentPreview.confidence && currentPreview.confidence < 0.8 && (
                    <div className="confirmation-modal__warning">
                      <span className="confirmation-modal__warning-icon">⚠️</span>
                      <p className="confirmation-modal__warning-text">
                        This was auto-detected. Please verify before confirming.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            <div className="confirmation-modal__actions">
              <button
                onClick={onCancel}
                className="confirmation-modal__button confirmation-modal__button--cancel"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleConfirmClick}
                className="confirmation-modal__button confirmation-modal__button--confirm"
              >
                {isMultiLog ? (
                  <>
                    <CheckCheck className="w-5 h-5" />
                    <span>
                      Log All ({activeLogs.length})
                    </span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Log {isNutrition ? 'Meal' : 'Workout'}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

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
        </>
      )}
    </AnimatePresence>
  )
}

export default ConfirmationModal
