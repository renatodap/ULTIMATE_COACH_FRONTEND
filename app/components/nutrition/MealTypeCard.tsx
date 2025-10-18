'use client'

/**
 * MealTypeCard Component
 *
 * Collapsible card that groups food items by meal type (breakfast/lunch/dinner/snack).
 * Shows meal summary in header, expands to show food items.
 *
 * Features:
 * - Collapsible/expandable
 * - Meal icon based on type
 * - Shows total calories
 * - Shows time logged (in user's timezone)
 * - Edit/delete meal actions
 * - Contains FoodItemCard components
 */

import { useState } from 'react'
import { ChevronDown, Edit2, Trash2, Star } from 'lucide-react'
import type { Meal, FoodItem } from '@/lib/types/nutrition'
import FoodItemCard from './FoodItemCard'
import { useTimezone } from '@/lib/context/TimezoneContext'
import { formatTimeInTimezone } from '@/lib/utils/timezone'
import { colors } from '@/lib/design-system/tokens'

interface MealTypeCardProps {
  meal: Meal
  isExpanded?: boolean
  onToggle?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onEditFoodItem?: (item: FoodItem) => void
  onSaveAsTemplate?: () => void
}

// Meal type icons and display names (no colors - emoji provides visual distinction)
const mealConfig = {
  breakfast: { icon: '🌅', name: 'Breakfast' },
  lunch: { icon: '🍽️', name: 'Lunch' },
  dinner: { icon: '🌙', name: 'Dinner' },
  snack: { icon: '🍪', name: 'Snack' },
  other: { icon: '🍴', name: 'Other' },
}

export default function MealTypeCard({
  meal,
  isExpanded: controlledIsExpanded,
  onToggle,
  onEdit,
  onDelete,
  onEditFoodItem,
  onSaveAsTemplate,
}: MealTypeCardProps) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(true)
  const { timezone } = useTimezone()

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledIsExpanded ?? internalIsExpanded
  const handleToggle = onToggle ?? (() => setInternalIsExpanded(!internalIsExpanded))

  const config = mealConfig[meal.mealType]

  // Format time in user's timezone (convert from UTC)
  const time = formatTimeInTimezone(meal.loggedAt, timezone)

  return (
    <div className="border border-iron-gray/20 overflow-hidden transition-colors">
      {/* Header (Always Visible) */}
      <button
        onClick={handleToggle}
        className="w-full bg-iron-dark-gray p-5 flex items-center justify-between active-press tap-target"
      >
        <div className="flex items-center gap-3">
          {/* Meal Icon */}
          <span className="text-3xl">{config.icon}</span>

          {/* Meal Info */}
          <div className="text-left">
            <h3 className="font-bold text-lg text-iron-white uppercase tracking-wider">
              {meal.name || config.name}
            </h3>
            <p className="text-sm text-iron-gray">{time}</p>
          </div>
        </div>

        {/* Right Side: Calories & Chevron */}
        <div className="flex items-center gap-3">
          <span className="text-iron-orange font-semibold">
            {Math.round(meal.totalCalories)} cal
          </span>
          <ChevronDown
            className={`w-6 h-6 text-iron-gray transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-iron-black">
          {/* Food Items List */}
          <div>
            {meal.foodItems.length > 0 ? (
              meal.foodItems.map((item) => (
                <FoodItemCard
                  key={item.id}
                  item={item}
                  onEdit={onEditFoodItem}
                />
              ))
            ) : (
              <div className="p-6 text-center text-iron-gray text-sm">
                No food items in this meal
              </div>
            )}
          </div>

          {/* Meal Totals Summary */}
          <div className="p-4 bg-iron-dark-gray border-t border-iron-gray/30">
            <div className="flex justify-between items-center text-sm">
              <span className="text-iron-gray uppercase tracking-wider">Total:</span>
              <div className="flex items-center gap-4">
                <span className="text-iron-orange font-semibold">
                  {Math.round(meal.totalCalories)} cal
                </span>
                <span style={{ color: colors.macro.protein }}>
                  P: {Math.round(meal.totalProtein)}g
                </span>
                <span style={{ color: colors.macro.carbs }}>
                  C: {Math.round(meal.totalCarbs)}g
                </span>
                <span style={{ color: colors.macro.fat }}>
                  F: {Math.round(meal.totalFat)}g
                </span>
              </div>
            </div>
          </div>

          {/* Meal Actions - Stacked vertically for better mobile UX */}
          {(onEdit || onDelete || onSaveAsTemplate) && (
            <div className="flex flex-col gap-2 p-4 border-t border-iron-gray/30">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                  className="w-full flex items-center justify-center gap-2 border border-iron-orange text-iron-orange py-3 font-medium text-sm uppercase tracking-wider active-press tap-target transition-colors rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Meal
                </button>
              )}
              {onSaveAsTemplate && meal.foodItems.length >= 2 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSaveAsTemplate()
                  }}
                  className="w-full flex items-center justify-center gap-2 border border-iron-gray bg-iron-gray/10 text-iron-white py-3 font-medium text-sm uppercase tracking-wider active-press tap-target transition-colors rounded-lg hover:border-iron-orange hover:text-iron-orange"
                >
                  <Star className="w-4 h-4" />
                  Save as Quick Meal
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="w-full flex items-center justify-center gap-2 border border-red-500 text-red-500 py-3 font-medium text-sm uppercase tracking-wider active-press tap-target transition-colors rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Meal
                </button>
              )}
            </div>
          )}

          {/* AI Source Badge (if applicable) */}
          {meal.source !== 'manual' && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 text-xs text-iron-gray uppercase tracking-wider">
                <span className="bg-iron-gray/20 border border-iron-gray/30 px-2 py-1">
                  {meal.source === 'ai_photo' && '📸 AI Photo'}
                  {meal.source === 'ai_text' && '✍️ AI Text'}
                  {meal.source === 'ai_voice' && '🎤 AI Voice'}
                  {meal.source === 'coach_chat' && '💬 Coach Chat'}
                </span>
                {meal.aiConfidence && (
                  <span>{Math.round(meal.aiConfidence * 100)}% confidence</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
