'use client'

import { LogPreview, NutritionLogData, FoodItem } from '@/lib/api/coach'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { searchFoods } from '@/lib/api/foods'
import type { Food } from '@/lib/types/food'

interface LogPreviewCardProps {
  preview: LogPreview
  onConfirm: (foodsWithNutrition: FoodWithNutrition[]) => void
  onCancel: () => void
}

// Meal type icons and labels
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

export interface FoodWithNutrition extends FoodItem {
  food_id?: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export function LogPreviewCard({ preview, onConfirm, onCancel }: LogPreviewCardProps) {
  const [foodsWithNutrition, setFoodsWithNutrition] = useState<FoodWithNutrition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch nutrition data for all foods - moved to top level before early return
  useEffect(() => {
    // Skip if not nutrition log
    if (preview.type !== 'nutrition') return

    const data = preview.data as NutritionLogData

    async function lookupFoods() {
      setLoading(true)
      setError(null)

      try {
        const enrichedFoods: FoodWithNutrition[] = []

        // Skip if no foods array (new backend returns meal_items instead)
        if (!data.foods || data.foods.length === 0) {
          setLoading(false)
          return
        }

        for (const foodItem of data.foods) {
          try {
            // Search for the food in database
            const searchResults = await searchFoods(foodItem.name, 1)

            if (searchResults.foods && searchResults.foods.length > 0) {
              const matchedFood: Food = searchResults.foods[0]

              // Calculate nutrition based on quantity
              const factor = foodItem.quantity_g / 100
              const calories = Math.round(matchedFood.calories_per_100g * factor)
              const protein_g = Math.round(matchedFood.protein_g_per_100g * factor * 10) / 10
              const carbs_g = Math.round(matchedFood.carbs_g_per_100g * factor * 10) / 10
              const fat_g = Math.round(matchedFood.fat_g_per_100g * factor * 10) / 10

              enrichedFoods.push({
                ...foodItem,
                food_id: matchedFood.id,
                calories,
                protein_g,
                carbs_g,
                fat_g
              })
            } else {
              // Food not found - use estimated values
              // Simple heuristic: 2 cal/g (protein-heavy food estimate)
              const calories = Math.round(foodItem.quantity_g * 2)
              enrichedFoods.push({
                ...foodItem,
                calories,
                protein_g: Math.round(calories * 0.4 / 4), // 40% protein
                carbs_g: Math.round(calories * 0.3 / 4), // 30% carbs
                fat_g: Math.round(calories * 0.3 / 9) // 30% fat
              })
            }
          } catch (err) {
            console.error(`Error looking up food: ${foodItem.name}`, err)
            // Use basic estimate if lookup fails
            const calories = Math.round(foodItem.quantity_g * 2)
            enrichedFoods.push({
              ...foodItem,
              calories,
              protein_g: Math.round(calories * 0.4 / 4),
              carbs_g: Math.round(calories * 0.3 / 4),
              fat_g: Math.round(calories * 0.3 / 9)
            })
          }
        }

        setFoodsWithNutrition(enrichedFoods)
      } catch (err) {
        console.error('Error enriching foods with nutrition:', err)
        setError('Could not calculate nutrition. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    lookupFoods()
  }, [preview.type, preview.data])

  // Only handle nutrition logs
  if (preview.type !== 'nutrition') {
    return (
      <div className="bg-iron-dark-gray border border-iron-gray rounded-lg p-6 max-w-md w-full">
        <p className="text-iron-white text-center">
          This log type is not yet supported
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 bg-iron-gray hover:bg-iron-gray/80 text-iron-white font-medium py-3.5 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const data = preview.data as NutritionLogData
  const mealIcon = MEAL_ICONS[data.meal_type]
  const mealLabel = MEAL_LABELS[data.meal_type]

  // Calculate totals
  const totalCalories = foodsWithNutrition.reduce((sum, f) => sum + f.calories, 0)
  const totalProtein = foodsWithNutrition.reduce((sum, f) => sum + f.protein_g, 0)
  const totalCarbs = foodsWithNutrition.reduce((sum, f) => sum + f.carbs_g, 0)
  const totalFat = foodsWithNutrition.reduce((sum, f) => sum + f.fat_g, 0)

  const handleConfirm = () => {
    onConfirm(foodsWithNutrition)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-iron-dark-gray border border-iron-gray rounded-lg p-6 max-w-md w-full shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{mealIcon}</span>
        <div>
          <h3 className="text-iron-white font-semibold text-lg">{mealLabel}</h3>
          <p className="text-iron-gray text-sm">Detected from your message</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-iron-orange mx-auto mb-2"></div>
          <p className="text-iron-gray text-sm">Calculating nutrition...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="py-4">
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-iron-gray hover:bg-iron-gray/80 text-iron-white font-medium py-3.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Food Items List */}
          <div className="space-y-2 mb-4">
            {foodsWithNutrition.map((food, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-iron-black/30 rounded border border-iron-gray/30"
              >
                <div className="flex-1">
                  <p className="text-iron-white font-medium">
                    {food.name}
                    {food.estimated && (
                      <span className="text-iron-gray text-xs ml-2">(estimated)</span>
                    )}
                  </p>
                  <p className="text-iron-gray text-sm">{food.quantity_g}g</p>
                </div>
                <div className="text-right">
                  <p className="text-iron-white font-semibold">{food.calories} cal</p>
                </div>
              </div>
            ))}
          </div>

          {/* Nutrition Summary */}
          <div className="bg-iron-black/50 border border-iron-gray/50 rounded-lg p-4 mb-6">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-iron-gray text-sm">Total Calories</span>
              <span className="text-iron-white text-2xl font-bold">{totalCalories}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-iron-gray text-xs mb-1">Protein</p>
                <p className="text-iron-white font-semibold">{Math.round(totalProtein)}g</p>
              </div>
              <div>
                <p className="text-iron-gray text-xs mb-1">Carbs</p>
                <p className="text-iron-white font-semibold">{Math.round(totalCarbs)}g</p>
              </div>
              <div>
                <p className="text-iron-gray text-xs mb-1">Fat</p>
                <p className="text-iron-white font-semibold">{Math.round(totalFat)}g</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-iron-gray hover:bg-iron-gray/80 text-iron-white font-medium h-14 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-xl">✕</span>
              <span>Cancel</span>
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-iron-orange hover:bg-iron-orange/90 text-iron-white font-medium h-14 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-xl">✓</span>
              <span>Log Meal</span>
            </button>
          </div>

          {/* Confidence Indicator */}
          {preview.confidence && preview.confidence < 0.8 && (
            <p className="text-iron-gray text-xs text-center mt-3">
              Note: This was auto-detected. Please verify the details before confirming.
            </p>
          )}
        </>
      )}
    </motion.div>
  )
}

export default LogPreviewCard
