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

import { motion, AnimatePresence } from 'framer-motion'
import { LogPreview, MealItem } from '@/lib/api/coach'
import { X, Check } from 'lucide-react'
import './ConfirmationModal.css'

export interface ConfirmationModalProps {
  preview: LogPreview | null
  onConfirm: () => void
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
  onConfirm,
  onCancel,
  isOpen
}: ConfirmationModalProps) {
  console.log('[ConfirmationModal] Render:', { isOpen, preview })
  console.log('[ConfirmationModal] Preview type:', preview?.type)
  console.log('[ConfirmationModal] Preview data:', preview?.data)

  // Early return if modal is closed or preview is null
  if (!isOpen || !preview) {
    console.log('[ConfirmationModal] Early return - not open or no preview', { isOpen, hasPreview: !!preview })
    return null
  }

  // Only handle nutrition and workout types
  if (preview.type !== 'nutrition' && preview.type !== 'workout') {
    console.error('[ConfirmationModal] BLOCKED - Unsupported type:', {
      receivedType: preview.type,
      expectedTypes: ['nutrition', 'workout'],
      fullPreview: preview
    })
    return null
  }

  const isNutrition = preview.type === 'nutrition'
  const data = preview.data as any

  console.log('[ConfirmationModal] ✅ RENDERING MODAL:', { isNutrition, data, preview })

  // Calculate totals for nutrition
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0

  if (isNutrition && data.meal_items) {
    data.meal_items.forEach((item: MealItem) => {
      totalCalories += item.calories
      totalProtein += item.protein_g
      totalCarbs += item.carbs_g
      totalFat += item.fat_g
    })
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
              {/* Nutrition Log */}
              {isNutrition && data.meal_items && (
                <>
                  {/* Food Items List */}
                  <div className="confirmation-modal__items">
                    {data.meal_items.map((item: MealItem, index: number) => (
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
                          {item.calories} cal
                        </div>
                      </div>
                    ))}
                  </div>

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
                </div>
              )}

              {/* Confidence Warning */}
              {preview.confidence && preview.confidence < 0.8 && (
                <div className="confirmation-modal__warning">
                  <span className="confirmation-modal__warning-icon">⚠️</span>
                  <p className="confirmation-modal__warning-text">
                    This was auto-detected. Please verify before confirming.
                  </p>
                </div>
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
                onClick={onConfirm}
                className="confirmation-modal__button confirmation-modal__button--confirm"
              >
                <Check className="w-5 h-5" />
                <span>Log {isNutrition ? 'Meal' : 'Workout'}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ConfirmationModal
