'use client'

/**
 * FoodMatchSelector - Modal for changing matched food
 *
 * Shows current matched food with confidence score and lets user
 * select from top 3 alternatives if the match is wrong.
 *
 * Design System: Uses iron-* colors for consistency
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'

export interface FoodMatch {
  id: string
  name: string
  brand_name?: string
  calories_per_100g: number
  protein_g_per_100g: number
  carbs_g_per_100g: number
  fat_g_per_100g: number
}

export interface FoodMatchSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (foodId: string) => void
  currentMatch: FoodMatch
  alternatives: FoodMatch[]
  matchConfidence: number
  matchReason: string
  originalText: string
  quantity: number
  unit: string
  estimatedGrams: number
}

export function FoodMatchSelector({
  isOpen,
  onClose,
  onSelect,
  currentMatch,
  alternatives,
  matchConfidence,
  matchReason,
  originalText,
  quantity,
  unit,
  estimatedGrams
}: FoodMatchSelectorProps) {
  const [selectedFoodId, setSelectedFoodId] = useState(currentMatch.id)

  const handleConfirm = () => {
    if (selectedFoodId !== currentMatch.id) {
      onSelect(selectedFoodId)
    }
    onClose()
  }

  // All options: current + alternatives
  const allOptions = [currentMatch, ...alternatives]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[500]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[500] max-w-lg mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-iron-black border border-iron-gray rounded-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-iron-gray">
                <div>
                  <h3 className="text-lg font-semibold text-iron-white">
                    Change Food Match
                  </h3>
                  <p className="text-sm text-iron-white/60 mt-1">
                    Original: &quot;{originalText}&quot;
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-iron-dark-gray transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-iron-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Current Match Info */}
                <div className="mb-4 p-3 bg-iron-dark-gray border border-iron-gray rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-iron-white/60">Current Match:</span>
                    {matchReason === 'user_history' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-iron-orange/20 text-iron-orange">
                        ⭐ Your food
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      matchConfidence >= 85
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {Math.round(matchConfidence)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-iron-white/80">
                    {quantity} {unit} (~{estimatedGrams}g)
                  </p>
                </div>

                {/* Food Options */}
                <div className="space-y-2">
                  {allOptions.map((food) => {
                    const isSelected = selectedFoodId === food.id
                    const isCurrent = food.id === currentMatch.id

                    return (
                      <button
                        key={food.id}
                        onClick={() => setSelectedFoodId(food.id)}
                        className={`
                          w-full text-left p-3 rounded border transition-all
                          ${isSelected
                            ? 'border-iron-orange bg-iron-orange/10'
                            : 'border-iron-gray bg-iron-dark-gray hover:border-iron-white/30'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-iron-white">
                                {food.name}
                              </p>
                              {isCurrent && (
                                <span className="text-xs px-2 py-0.5 rounded bg-iron-white/10 text-iron-white/60">
                                  Current
                                </span>
                              )}
                            </div>
                            {food.brand_name && (
                              <p className="text-sm text-iron-white/60 mt-1">
                                {food.brand_name}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-iron-white/60">
                              <span>{food.calories_per_100g} cal/100g</span>
                              <span>P: {food.protein_g_per_100g}g</span>
                              <span>C: {food.carbs_g_per_100g}g</span>
                              <span>F: {food.fat_g_per_100g}g</span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-iron-orange flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* No alternatives warning */}
                {alternatives.length === 0 && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                    <p className="text-sm text-yellow-400">
                      ⚠️ No alternative matches found. You may need to add a custom food if this isn&apos;t correct.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-2 p-4 border-t border-iron-gray">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded bg-iron-dark-gray text-iron-white hover:bg-iron-gray transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-3 rounded bg-iron-orange text-iron-black font-semibold hover:bg-iron-orange/90 transition-colors"
                >
                  {selectedFoodId !== currentMatch.id ? 'Change Match' : 'Keep Current'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default FoodMatchSelector
