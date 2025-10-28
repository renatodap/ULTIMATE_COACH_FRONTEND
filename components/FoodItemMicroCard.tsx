'use client'

/**
 * Food Item Micro Card
 *
 * Displays individual food within a meal with inline edit/delete actions
 * Mobile-first design with 44×44px touch targets
 */

import { Pencil, Trash2 } from 'lucide-react'
import type { MealItemAPI } from '@/lib/api/nutrition'

interface FoodItemMicroCardProps {
  item: MealItemAPI
  onEdit?: (itemId: string) => void
  onDelete: (itemId: string) => void
  deleteLoading?: boolean
}

export function FoodItemMicroCard({
  item,
  onEdit,
  onDelete,
  deleteLoading = false
}: FoodItemMicroCardProps) {
  // Format quantity display (smart: "2 scoops" vs "300g")
  const quantityDisplay = item.display_label
    ? `${item.quantity} ${item.display_unit}${item.quantity !== 1 ? 's' : ''} (${item.display_label})`
    : `${item.quantity}${item.display_unit}`

  // Food name (from joined data or fallback)
  const foodName = item.foods?.name || 'Unknown food'
  const brandName = item.foods?.brand_name

  return (
    <div className="bg-iron-black/60 border border-iron-gray/30 rounded-lg p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Food name */}
          <h4 className="text-iron-white font-medium text-sm truncate">
            {foodName}
          </h4>

          {/* Brand name (if exists) */}
          {brandName && (
            <p className="text-iron-gray text-xs mt-0.5 truncate">
              {brandName}
            </p>
          )}

          {/* Quantity */}
          <p className="text-iron-gray text-xs mt-1">
            {quantityDisplay}
          </p>

          {/* Nutrition (compact) */}
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-iron-orange font-semibold">
              {Math.round(item.calories)} cal
            </span>
            <span className="text-iron-gray">
              {Math.round(item.protein_g)}g protein
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(item.id)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-iron-orange hover:text-iron-orange/80 transition-colors active-press"
              aria-label="Edit food item"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            disabled={deleteLoading}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-red-400 hover:text-red-400/80 transition-colors active-press disabled:opacity-50"
            aria-label="Delete food item"
          >
            {deleteLoading ? (
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
