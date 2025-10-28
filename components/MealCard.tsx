'use client'

/**
 * Meal Card - Redesigned for Full CRUD
 *
 * Collapsible meal display with inline edit/delete actions
 * Shows meal header, food items, and totals
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, MoreVertical, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { FoodItemMicroCard } from './FoodItemMicroCard'
import type { MealAPI } from '@/lib/api/nutrition'

interface MealCardProps {
  meal: MealAPI
  onEditFood?: (mealId: string, itemId: string) => void
  onDeleteFood: (mealId: string, itemId: string) => void
  onDeleteMeal: (mealId: string) => void
  deleteLoadingItemId?: string | null
  deletingMeal?: boolean
}

// Meal type icons and colors
const MEAL_TYPES = {
  breakfast: { icon: '🌅', label: 'Breakfast', color: 'text-iron-orange' },
  lunch: { icon: '🍽️', label: 'Lunch', color: 'text-iron-white' },
  dinner: { icon: '🌙', label: 'Dinner', color: 'text-iron-white' },
  snack: { icon: '🍪', label: 'Snack', color: 'text-iron-white' },
  other: { icon: '🍴', label: 'Other', color: 'text-iron-gray' }
}

export function MealCard({
  meal,
  onEditFood,
  onDeleteFood,
  onDeleteMeal,
  deleteLoadingItemId,
  deletingMeal = false
}: MealCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showMealMenu, setShowMealMenu] = useState(false)

  const mealType = MEAL_TYPES[meal.meal_type] || MEAL_TYPES.other
  const loggedTime = format(new Date(meal.logged_at), 'h:mm a')

  return (
    <div className="bg-iron-dark-gray border border-iron-gray/30 rounded-lg overflow-hidden">
      {/* Header (always visible) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 active-press"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{mealType.icon}</span>
              <div>
                <h3 className={`text-lg font-semibold ${mealType.color} uppercase tracking-wide`}>
                  {mealType.label}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-iron-gray">
                    {loggedTime}
                  </span>
                  {meal.source === 'coach_chat' && (
                    <span className="text-xs bg-iron-orange/20 text-iron-orange px-2 py-0.5 rounded">
                      AI Logged
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Total calories */}
            <div className="text-right mr-2">
              <div className="text-2xl font-bold text-iron-orange">
                {Math.round(meal.total_calories)}
              </div>
              <div className="text-xs text-iron-gray">
                cal
              </div>
            </div>

            {/* Expand/collapse icon */}
            <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
              {expanded ? (
                <ChevronUp className="w-6 h-6 text-iron-gray" />
              ) : (
                <ChevronDown className="w-6 h-6 text-iron-gray" />
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* Food items */}
              {meal.items && meal.items.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-iron-gray uppercase tracking-wider mb-2">
                    Food Items:
                  </h4>
                  {meal.items.map((item) => (
                    <FoodItemMicroCard
                      key={item.id}
                      item={item}
                      onEdit={onEditFood ? () => onEditFood(meal.id, item.id) : undefined}
                      onDelete={() => onDeleteFood(meal.id, item.id)}
                      deleteLoading={deleteLoadingItemId === item.id}
                    />
                  ))}
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-iron-gray/30 pt-4">
                <h4 className="text-sm font-medium text-iron-gray uppercase tracking-wider mb-2">
                  Totals:
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-iron-orange">
                      {Math.round(meal.total_calories)}
                    </div>
                    <div className="text-xs text-iron-gray">cal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-macro-protein">
                      {Math.round(meal.total_protein_g)}g
                    </div>
                    <div className="text-xs text-iron-gray">protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-macro-carbs">
                      {Math.round(meal.total_carbs_g)}g
                    </div>
                    <div className="text-xs text-iron-gray">carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-macro-fat">
                      {Math.round(meal.total_fat_g)}g
                    </div>
                    <div className="text-xs text-iron-gray">fat</div>
                  </div>
                </div>
              </div>

              {/* Notes (if exists) */}
              {meal.notes && (
                <div className="mt-4 pt-4 border-t border-iron-gray/30">
                  <h4 className="text-sm font-medium text-iron-gray uppercase tracking-wider mb-2">
                    Notes:
                  </h4>
                  <p className="text-sm text-iron-gray italic">
                    {meal.notes}
                  </p>
                </div>
              )}

              {/* Delete meal button */}
              <div className="mt-4 pt-4 border-t border-iron-gray/30">
                <button
                  onClick={() => {
                    if (confirm('Delete this entire meal? This cannot be undone.')) {
                      onDeleteMeal(meal.id)
                    }
                  }}
                  disabled={deletingMeal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors rounded-lg active-press disabled:opacity-50"
                >
                  {deletingMeal ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      <span>Deleting meal...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Entire Meal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
