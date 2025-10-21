/**
 * Quick Meal Card Component
 *
 * Displays individual quick meal template with foods list and actions
 * Supports edit/delete/favorite actions and shows nutrition totals
 */

'use client'

import { useState } from 'react'
import { Star, Edit2, Trash2, Plus } from 'lucide-react'
import type { QuickMeal } from '@/lib/types/food'

interface QuickMealCardProps {
  quickMeal: QuickMeal
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string, isFavorite: boolean) => void
  onUse?: (id: string) => void
}

export default function QuickMealCard({
  quickMeal,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUse
}: QuickMealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatLastUsed = (timestamp: string | null) => {
    if (!timestamp) return 'Never used'

    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="bg-iron-dark-gray rounded-xl p-4 border border-iron-gray shadow-sm hover:border-iron-orange/50 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl">
            🍽️
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-iron-white truncate flex items-center gap-2">
              {quickMeal.name}
              {quickMeal.is_favorite && (
                <Star className="w-4 h-4 text-iron-orange fill-iron-orange flex-shrink-0" />
              )}
            </h3>
            <div className="flex items-center gap-2 text-sm text-iron-gray">
              <span>{quickMeal.foods.length} {quickMeal.foods.length === 1 ? 'item' : 'items'}</span>
            </div>
          </div>
        </div>

        {/* Favorite toggle */}
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(quickMeal.id, !quickMeal.is_favorite)}
            className="p-2 hover:bg-iron-gray/20 rounded-lg transition-colors"
            aria-label={quickMeal.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-5 h-5 ${quickMeal.is_favorite ? 'text-iron-orange fill-iron-orange' : 'text-iron-gray'}`} />
          </button>
        )}
      </div>

      {/* Description */}
      {quickMeal.description && (
        <p className="text-sm text-iron-gray mb-3 line-clamp-2">
          {quickMeal.description}
        </p>
      )}

      {/* Foods preview */}
      <div className="mb-3">
        {quickMeal.foods.length > 0 && (
          <div className="bg-iron-black rounded-lg p-3">
            <div className="text-xs text-iron-gray uppercase tracking-wider mb-2">
              Foods in this meal
            </div>
            <div className="space-y-1">
              {quickMeal.foods.slice(0, isExpanded ? undefined : 3).map((food, index) => (
                <div key={index} className="text-sm text-iron-white flex items-center gap-2">
                  <span className="text-iron-orange">•</span>
                  <span className="flex-1 truncate">
                    {food.quantity} {food.serving_id ? 'serving(s)' : 'g'}
                  </span>
                </div>
              ))}
              {!isExpanded && quickMeal.foods.length > 3 && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-xs text-iron-orange hover:underline mt-1"
                >
                  +{quickMeal.foods.length - 3} more
                </button>
              )}
              {isExpanded && quickMeal.foods.length > 3 && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-xs text-iron-orange hover:underline mt-1"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Last Used */}
      <div className="text-xs text-iron-gray mb-3">
        Last used: {formatLastUsed(quickMeal.last_used_at || null)}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-iron-gray">
        <div className="flex items-center gap-3">
          {onUse && (
            <button
              onClick={() => onUse(quickMeal.id)}
              className="px-4 py-2 bg-iron-orange text-iron-black rounded-lg font-medium hover:bg-iron-orange/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Log Now</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onEdit && (
            <button
              onClick={() => onEdit(quickMeal.id)}
              className="text-sm font-medium text-iron-white hover:text-iron-orange transition flex items-center gap-1 min-h-[44px] px-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(quickMeal.id)}
              className="text-sm font-medium text-iron-gray hover:text-red-500 transition flex items-center gap-1 min-h-[44px] px-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
