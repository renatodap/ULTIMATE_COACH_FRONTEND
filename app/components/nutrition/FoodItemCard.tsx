'use client'

/**
 * FoodItemCard Component
 *
 * Displays an individual food item within a meal.
 * Shows food name, quantity, weight, and macro breakdown.
 *
 * Features:
 * - Read-only display mode (edit mode will be added in Phase 2)
 * - Shows quantity with unit (e.g., "1 cup")
 * - Shows calculated weight in grams
 * - Color-coded macros
 * - Tap to edit (future)
 * - Mobile-friendly layout
 */

import { Edit2 } from 'lucide-react'
import type { FoodItem } from '@/lib/types/nutrition'

interface FoodItemCardProps {
  item: FoodItem
  onEdit?: (item: FoodItem) => void
}

export default function FoodItemCard({ item, onEdit }: FoodItemCardProps) {
  const {
    foodName,
    brandName,
    quantity,
    displayUnit,
    displayLabel,
    grams,
    calories,
    protein,
    carbs,
    fat,
  } = item

  return (
    <div className="p-4 border-b border-iron-gray/30 last:border-b-0 hover:bg-iron-gray/5 transition-colors">
      <button
        onClick={() => onEdit?.(item)}
        className="w-full text-left"
        disabled={!onEdit}
      >
        <div className="flex items-start justify-between mb-2">
          {/* Food Name */}
          <div className="flex-1">
            <p className="font-medium text-iron-white">
              {foodName}
              {brandName && (
                <span className="text-iron-gray text-sm ml-2">
                  ({brandName})
                </span>
              )}
            </p>

            {/* Quantity Display */}
            <p className="text-sm text-iron-gray mt-1">
              {quantity} {displayUnit}
              {displayLabel && ` (${displayLabel})`}
              <span className="text-iron-gray/70 ml-1">
                • {grams}g
              </span>
            </p>
          </div>

          {/* Edit Icon */}
          {onEdit && (
            <div className="ml-3 p-2">
              <Edit2 className="w-4 h-4 text-iron-gray hover:text-iron-orange transition-colors" />
            </div>
          )}
        </div>

        {/* Macro Breakdown */}
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="text-iron-orange font-semibold">
            {calories} cal
          </span>
          <span className="text-green-500">
            P: {protein}g
          </span>
          <span className="text-blue-500">
            C: {carbs}g
          </span>
          <span className="text-orange-500">
            F: {fat}g
          </span>
        </div>
      </button>
    </div>
  )
}
