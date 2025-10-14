'use client'

/**
 * Meal Edit Page
 *
 * Allows editing a meal's metadata and food items.
 * Features:
 * - Edit meal name, type, and notes
 * - View and remove food items
 * - Save changes (DELETE + CREATE pattern)
 * - Cancel and return to nutrition page
 */

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Trash2, Save, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { getMeal, updateMeal, CreateMealItemRequest } from '@/lib/api/nutrition'
import type { MealAPI, MealItemAPI } from '@/lib/api/nutrition'
import { getFood } from '@/lib/api/foods'
import type { Food, FoodServing } from '@/lib/types/food'
import { calculateFoodNutrition } from '@/lib/utils/nutrition-calculator'
import MealMetadataEditor from '@/app/components/nutrition/MealMetadataEditor'
import { LoadingScreen } from '@/components/shared/LoadingScreen'

interface PageProps {
  params: { mealId: string }
}

// Extended meal item with food data and edit mode
interface EditableMealItem extends MealItemAPI {
  food: Food | null
  editMode: 'grams' | 'serving'
  selectedServing: FoodServing | null
}

export default function MealEditPage({ params }: PageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { mealId } = params

  const returnDate = searchParams?.get('returnDate') || new Date().toISOString().split('T')[0]

  const [meal, setMeal] = useState<MealAPI | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Meal metadata state
  const [metadata, setMetadata] = useState<{
    name?: string | null
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
    notes?: string | null
  } | null>(null)

  // Food items state with full food data
  const [foodItems, setFoodItems] = useState<EditableMealItem[]>([])

  // Fetch meal data and food details
  useEffect(() => {
    async function fetchMeal() {
      try {
        setLoading(true)
        setError(null)
        const mealData = await getMeal(mealId)
        setMeal(mealData)
        setMetadata({
          name: mealData.name,
          meal_type: mealData.meal_type,
          notes: mealData.notes
        })

        // Fetch full food data for each item
        const itemsWithFood = await Promise.all(
          mealData.items.map(async (item) => {
            try {
              const food = await getFood(item.food_id)

              // Determine edit mode and serving based on logged unit
              const editMode: 'grams' | 'serving' = item.display_unit === 'g' ? 'grams' : 'serving'
              const selectedServing = item.serving_id
                ? food.servings.find(s => s.id === item.serving_id) || null
                : null

              return {
                ...item,
                food,
                editMode,
                selectedServing
              } as EditableMealItem
            } catch (err) {
              console.error(`Failed to load food ${item.food_id}:`, err)
              return {
                ...item,
                food: null,
                editMode: 'grams' as const,
                selectedServing: null
              } as EditableMealItem
            }
          })
        )

        setFoodItems(itemsWithFood)
      } catch (err) {
        console.error('Failed to load meal:', err)
        setError('Failed to load meal')
      } finally {
        setLoading(false)
      }
    }

    fetchMeal()
  }, [mealId])

  const handleRemoveFoodItem = (itemId: string) => {
    setFoodItems(prev => prev.filter(item => item.id !== itemId))
  }

  const handleToggleEditMode = (itemId: string) => {
    setFoodItems(prev =>
      prev.map(item => {
        if (item.id !== itemId || !item.food) return item

        const newMode = item.editMode === 'grams' ? 'serving' : 'grams'

        // If switching to serving mode, select default serving
        if (newMode === 'serving') {
          const defaultServing = item.food.servings.find(s => s.is_default) || item.food.servings[0]
          if (!defaultServing) return item

          // Recalculate based on current grams converted to servings
          const newQuantity = item.grams / defaultServing.grams_per_serving
          const nutrition = calculateFoodNutrition(item.food, newQuantity, 'serving', defaultServing)

          return {
            ...item,
            editMode: newMode,
            selectedServing: defaultServing,
            quantity: Math.round(newQuantity * 10) / 10,
            grams: Math.round(nutrition.grams * 10) / 10,
            calories: Math.round(nutrition.calories),
            protein_g: Math.round(nutrition.protein_g * 10) / 10,
            carbs_g: Math.round(nutrition.carbs_g * 10) / 10,
            fat_g: Math.round(nutrition.fat_g * 10) / 10,
            display_unit: defaultServing.serving_unit,
            display_label: defaultServing.serving_label,
          }
        } else {
          // Switching to grams mode - keep current grams
          const nutrition = calculateFoodNutrition(item.food, item.grams, 'grams')

          return {
            ...item,
            editMode: newMode,
            selectedServing: null,
            quantity: item.grams,
            grams: item.grams,
            calories: Math.round(nutrition.calories),
            protein_g: Math.round(nutrition.protein_g * 10) / 10,
            carbs_g: Math.round(nutrition.carbs_g * 10) / 10,
            fat_g: Math.round(nutrition.fat_g * 10) / 10,
            display_unit: 'g',
            display_label: null,
          }
        }
      })
    )
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return

    setFoodItems(prev =>
      prev.map(item => {
        if (item.id !== itemId || !item.food) return item

        const nutrition = calculateFoodNutrition(
          item.food,
          newQuantity,
          item.editMode,
          item.selectedServing || undefined
        )

        return {
          ...item,
          quantity: newQuantity,
          grams: Math.round(nutrition.grams * 10) / 10,
          calories: Math.round(nutrition.calories),
          protein_g: Math.round(nutrition.protein_g * 10) / 10,
          carbs_g: Math.round(nutrition.carbs_g * 10) / 10,
          fat_g: Math.round(nutrition.fat_g * 10) / 10,
        }
      })
    )
  }

  const handleServingChange = (itemId: string, servingId: string) => {
    setFoodItems(prev =>
      prev.map(item => {
        if (item.id !== itemId || !item.food) return item

        const newServing = item.food.servings.find(s => s.id === servingId)
        if (!newServing) return item

        const nutrition = calculateFoodNutrition(item.food, item.quantity, 'serving', newServing)

        return {
          ...item,
          selectedServing: newServing,
          serving_id: newServing.id,
          grams: Math.round(nutrition.grams * 10) / 10,
          calories: Math.round(nutrition.calories),
          protein_g: Math.round(nutrition.protein_g * 10) / 10,
          carbs_g: Math.round(nutrition.carbs_g * 10) / 10,
          fat_g: Math.round(nutrition.fat_g * 10) / 10,
          display_unit: newServing.serving_unit,
          display_label: newServing.serving_label,
        }
      })
    )
  }

  const handleSave = async () => {
    if (!metadata || foodItems.length === 0) {
      alert('Meal must have at least one food item')
      return
    }

    try {
      setSaving(true)

      // Transform food items to CreateMealItemRequest format
      const items: CreateMealItemRequest[] = foodItems.map(item => ({
        food_id: item.food_id,
        quantity: item.quantity,
        serving_id: item.serving_id,
        grams: item.grams,
        calories: item.calories,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g,
        display_unit: item.display_unit,
        display_label: item.display_label,
        display_order: item.display_order
      }))

      // Update meal using DELETE + CREATE pattern
      await updateMeal(mealId, {
        ...metadata,
        items
      })

      // Navigate back to nutrition page with the return date
      router.push(`/nutrition?date=${returnDate}`)
    } catch (err) {
      console.error('Failed to save meal:', err)
      alert('Failed to save meal changes')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (confirm('Discard changes?')) {
      router.push(`/nutrition?date=${returnDate}`)
    }
  }

  // Calculate meal totals
  const mealTotals = foodItems.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein_g,
      carbs: acc.carbs + item.carbs_g,
      fat: acc.fat + item.fat_g
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  if (loading) {
    return <LoadingScreen message="Loading meal..." />
  }

  if (error || !meal || !metadata) {
    return (
      <div className="min-h-screen bg-iron-black flex items-center justify-center px-4">
        <div className="card-glass border border-red-500/50 p-8 text-center max-w-md">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-xl font-bold text-iron-white uppercase tracking-wider mb-2">
            Unable to Load Meal
          </h2>
          <p className="text-iron-gray mb-6">{error || 'Meal not found'}</p>
          <button
            onClick={() => router.push(`/nutrition?date=${returnDate}`)}
            className="btn-primary px-6 py-3"
          >
            Back to Nutrition
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-iron-black pb-24">
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-iron-black border-b border-iron-gray/30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-iron-gray hover:text-iron-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm uppercase tracking-wider">Cancel</span>
            </button>
            <h1 className="text-xl font-bold text-iron-white uppercase tracking-wider">
              Edit Meal
            </h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Meal Metadata Editor */}
        <div className="bg-iron-dark-gray border border-iron-gray p-3">
          <h2 className="text-xs font-medium text-iron-gray uppercase tracking-wider mb-2">
            Meal Details
          </h2>
          <MealMetadataEditor
            initialName={meal.name}
            initialMealType={meal.meal_type}
            initialNotes={meal.notes}
            onChange={setMetadata}
          />
        </div>

        {/* Food Items List */}
        <div className="bg-iron-dark-gray border border-iron-gray">
          <div className="p-4 border-b border-iron-gray/30">
            <h2 className="text-sm font-medium text-iron-gray uppercase tracking-wider">
              Food Items ({foodItems.length})
            </h2>
          </div>

          {foodItems.length > 0 ? (
            <div>
              {foodItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="p-4 border-b border-iron-gray/30 last:border-b-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <div className="flex items-start gap-4">
                    {/* Food Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="font-medium text-iron-white truncate">
                          {item.food?.name || 'Food Item'}
                          {item.food?.brand_name && (
                            <span className="text-iron-gray text-sm ml-2">
                              ({item.food.brand_name})
                            </span>
                          )}
                        </p>

                        {/* Mode Toggle (only show if servings available) */}
                        {item.food && item.food.servings.length > 0 && (
                          <button
                            onClick={() => handleToggleEditMode(item.id)}
                            className="flex-shrink-0 px-2 py-1 text-xs border border-iron-gray text-iron-gray hover:border-iron-orange hover:text-iron-orange transition-colors uppercase tracking-wider"
                          >
                            {item.editMode === 'grams' ? 'g' : '📏'}
                          </button>
                        )}
                      </div>

                      {/* Quantity Editor */}
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseFloat(e.target.value) || 0)}
                          min="0.1"
                          step={item.editMode === 'grams' ? '1' : '0.1'}
                          className="w-20 bg-iron-black border border-iron-gray text-iron-white px-2 py-1 text-sm focus:border-iron-orange focus:outline-none transition-colors"
                        />

                        {item.editMode === 'serving' && item.selectedServing && item.food ? (
                          <select
                            value={item.selectedServing.id}
                            onChange={(e) => handleServingChange(item.id, e.target.value)}
                            className="flex-1 bg-iron-black border border-iron-gray text-iron-white px-2 py-1 text-sm focus:border-iron-orange focus:outline-none transition-colors"
                          >
                            {item.food.servings.map((serving) => (
                              <option key={serving.id} value={serving.id}>
                                {serving.serving_size > 1 ? `${serving.serving_size} ` : ''}
                                {serving.serving_unit}
                                {serving.serving_label ? ` (${serving.serving_label})` : ''}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm text-iron-gray">grams</span>
                        )}

                        <span className="text-xs text-iron-gray/70">
                          • {item.grams}g
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm mt-2">
                        <span className="text-iron-orange font-semibold">
                          {Math.round(item.calories)} cal
                        </span>
                        <span className="text-green-500">
                          P: {Math.round(item.protein_g * 10) / 10}g
                        </span>
                        <span className="text-blue-500">
                          C: {Math.round(item.carbs_g * 10) / 10}g
                        </span>
                        <span className="text-orange-500">
                          F: {Math.round(item.fat_g * 10) / 10}g
                        </span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleRemoveFoodItem(item.id)}
                      className="flex-shrink-0 p-2 text-red-500 hover:bg-red-500/10 transition-colors border border-red-500/30 hover:border-red-500"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-iron-gray">
              <p className="text-sm">No food items in this meal</p>
              <p className="text-xs mt-1">Meal must have at least one food item to save</p>
            </div>
          )}

          {/* Meal Totals */}
          {foodItems.length > 0 && (
            <div className="p-4 bg-iron-black border-t border-iron-gray/30">
              <div className="flex justify-between items-center">
                <span className="text-sm text-iron-gray uppercase tracking-wider">Total:</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-iron-orange font-semibold">
                    {Math.round(mealTotals.calories)} cal
                  </span>
                  <span className="text-green-500">P: {Math.round(mealTotals.protein * 10) / 10}g</span>
                  <span className="text-blue-500">C: {Math.round(mealTotals.carbs * 10) / 10}g</span>
                  <span className="text-orange-500">F: {Math.round(mealTotals.fat * 10) / 10}g</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-iron-black border-t border-iron-gray/30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-iron-gray text-iron-white py-3 font-bold uppercase tracking-wider hover:bg-iron-gray/10 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || foodItems.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-iron-orange border-2 border-iron-orange text-iron-black py-3 font-bold uppercase tracking-wider hover:bg-iron-black hover:text-iron-orange transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
