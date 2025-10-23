'use client'

/**
 * Edit Food Item Page
 *
 * Allows editing quantity/serving of a single food item within a meal
 * Features:
 * - Live nutrition preview
 * - Switch between grams/serving modes
 * - Serving size dropdown
 * - Validation (max 20 servings, warning at 10)
 * - Mobile-first design
 */

import { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { getMeal, updateMealItem, type MealAPI, type MealItemAPI } from '@/lib/api/nutrition'
import { getFood } from '@/lib/api/foods'
import { calculateFoodNutrition } from '@/lib/utils/nutrition-calculator'
import type { Food, FoodServing } from '@/lib/types/food'

interface EditFoodPageProps {
  params: Promise<{ id: string }>
}

export default function EditFoodPage({ params }: EditFoodPageProps) {
  const resolvedParams = use(params)
  const itemId = resolvedParams.id
  const router = useRouter()
  const searchParams = useSearchParams()
  const mealId = searchParams?.get('meal')

  // Data state
  const [meal, setMeal] = useState<MealAPI | null>(null)
  const [item, setItem] = useState<MealItemAPI | null>(null)
  const [food, setFood] = useState<Food | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [quantity, setQuantity] = useState<number>(100)
  const [unit, setUnit] = useState<'grams' | 'serving'>('grams')
  const [selectedServing, setSelectedServing] = useState<FoodServing | null>(null)

  // Fetch meal and food data
  useEffect(() => {
    if (!mealId || !itemId) {
      setError('Missing meal or item ID')
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        setLoading(true)

        // Fetch meal to get the item
        const mealData = await getMeal(mealId!)
        setMeal(mealData)

        // Find the specific item
        const foundItem = mealData.items.find(i => i.id === itemId)
        if (!foundItem) {
          setError('Food item not found in meal')
          return
        }
        setItem(foundItem)

        // Fetch full food data (with servings)
        const foodData = await getFood(foundItem.food_id)
        setFood(foodData)

        // Initialize form state based on current item
        // Check if item was logged with serving or grams
        if (foundItem.serving_id) {
          setUnit('serving')
          const serving = foodData.servings?.find(s => s.id === foundItem.serving_id)
          setSelectedServing(serving || null)
          setQuantity(foundItem.quantity) // Quantity is serving count
        } else {
          setUnit('grams')
          setQuantity(foundItem.quantity) // Quantity is grams
          setSelectedServing(null)
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError('Failed to load food item')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [mealId, itemId])

  // Calculate live nutrition preview
  const liveNutrition = food && quantity > 0
    ? calculateFoodNutrition(food, quantity, unit, selectedServing || undefined)
    : null

  // Handle save
  const handleSave = async () => {
    if (!meal || !item || !food || !liveNutrition) return

    try {
      setSaving(true)

      // Prepare update data
      const updates = {
        quantity,
        serving_id: unit === 'serving' ? selectedServing?.id || null : null,
        grams: liveNutrition.grams,
        calories: Math.round(liveNutrition.calories),
        protein_g: Math.round(liveNutrition.protein_g * 10) / 10,
        carbs_g: Math.round(liveNutrition.carbs_g * 10) / 10,
        fat_g: Math.round(liveNutrition.fat_g * 10) / 10
      }

      await updateMealItem(meal.id, item.id, updates)

      // Navigate back to nutrition page
      router.push('/nutrition')
    } catch (err) {
      console.error('Failed to save changes:', err)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-iron-black text-iron-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-iron-orange animate-spin mx-auto mb-4" />
          <p className="text-iron-gray">Loading...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !meal || !item || !food) {
    return (
      <div className="min-h-screen bg-iron-black text-iron-white flex items-center justify-center pb-40">
        <div className="text-center px-4">
          <p className="text-red-400 mb-4">{error || 'Failed to load food item'}</p>
          <button
            onClick={() => router.push('/nutrition')}
            className="px-4 py-2 bg-iron-orange text-iron-black rounded-lg font-medium active-press"
          >
            Back to Nutrition
          </button>
        </div>
      </div>
    )
  }

  const foodName = item.foods?.name || food.name || 'Unknown food'
  const brandName = item.foods?.brand_name || food.brand_name

  return (
    <div className="min-h-screen bg-iron-black text-iron-white pb-40">
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-iron-black border-b border-iron-gray/30 px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/nutrition')}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-iron-gray hover:text-iron-white transition-colors active-press"
            aria-label="Back to Nutrition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold uppercase tracking-wider">Edit Food</h1>
            <p className="text-sm text-iron-gray">
              Update quantity or serving
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Food Info (Read-only) */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-iron-gray uppercase tracking-wider mb-2">
            Food Item:
          </h2>
          <div className="bg-iron-dark-gray border border-iron-gray/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-iron-white">
              {foodName}
            </h3>
            {brandName && (
              <p className="text-sm text-iron-gray mt-1">{brandName}</p>
            )}
            <p className="text-xs text-iron-gray mt-2">
              {food.calories_per_100g} cal per 100g
            </p>
          </div>
        </div>

        {/* Live Nutrition Preview */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-iron-gray uppercase tracking-wider mb-2">
            Nutrition Preview:
          </h2>
          <div className="bg-iron-black/60 border border-iron-orange/30 rounded-lg p-4">
            {liveNutrition ? (
              <div>
                <div className="text-4xl font-bold text-iron-orange mb-2">
                  {Math.round(liveNutrition.calories)} cal
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-lg font-bold text-macro-protein">
                      {Math.round(liveNutrition.protein_g)}g
                    </div>
                    <div className="text-xs text-iron-gray">protein</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-macro-carbs">
                      {Math.round(liveNutrition.carbs_g)}g
                    </div>
                    <div className="text-xs text-iron-gray">carbs</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-macro-fat">
                      {Math.round(liveNutrition.fat_g)}g
                    </div>
                    <div className="text-xs text-iron-gray">fat</div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-red-400">Invalid quantity</p>
            )}
          </div>
        </div>

        {/* Unit Selection */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-iron-gray uppercase tracking-wider mb-2">
            How to measure:
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setUnit('grams')
                setQuantity(100)
                setSelectedServing(null)
              }}
              className={`flex-1 py-3 px-4 font-medium transition-colors rounded-lg ${
                unit === 'grams'
                  ? 'bg-iron-orange text-iron-black'
                  : 'bg-iron-gray/10 text-iron-white hover:bg-iron-gray/20'
              }`}
            >
              ⚖️ Grams
            </button>
            {food.servings && food.servings.length > 0 && (
              <button
                onClick={() => {
                  setUnit('serving')
                  setQuantity(1)
                  setSelectedServing(food.servings?.[0] || null)
                }}
                className={`flex-1 py-3 px-4 font-medium transition-colors rounded-lg ${
                  unit === 'serving'
                    ? 'bg-iron-orange text-iron-black'
                    : 'bg-iron-gray/10 text-iron-white hover:bg-iron-gray/20'
                }`}
              >
                🥄 Serving
              </button>
            )}
          </div>
        </div>

        {/* Quantity Input */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-iron-gray uppercase tracking-wider mb-2">
            {unit === 'grams' ? '⚖️ How many grams?' : `🥄 How many ${selectedServing?.serving_unit || 'servings'}?`}
          </h2>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const newQuantity = Number(e.target.value)
              if (unit === 'serving' && newQuantity > 20) {
                console.warn('Warning: Quantity > 20 servings may be incorrect')
              }
              setQuantity(newQuantity)
            }}
            className="w-full bg-iron-dark-gray border border-iron-gray px-4 py-3 text-iron-white text-lg rounded-lg focus:border-iron-orange focus:outline-none"
            min="0"
            max={unit === 'serving' ? 20 : undefined}
            step={unit === 'grams' ? '1' : '0.1'}
          />
          {unit === 'serving' && quantity > 10 && (
            <div className="mt-2 text-xs text-red-400">
              ⚠️ Are you sure? {quantity} servings = {quantity * (selectedServing?.grams_per_serving || 0)}g
            </div>
          )}
          {unit === 'serving' && quantity <= 10 && selectedServing && (
            <div className="mt-2 text-xs text-iron-gray">
              {quantity} × {selectedServing.grams_per_serving}g = {quantity * selectedServing.grams_per_serving}g total
            </div>
          )}
        </div>

        {/* Serving Selection */}
        {unit === 'serving' && food.servings && food.servings.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-iron-gray uppercase tracking-wider mb-2">
              Which serving size?
            </h2>
            <select
              value={selectedServing?.id || ''}
              onChange={(e) => {
                const serving = food.servings?.find(s => s.id === e.target.value)
                setSelectedServing(serving || null)
                setQuantity(1) // Reset to 1 when changing serving
              }}
              className="w-full bg-iron-dark-gray border border-iron-gray px-4 py-3 text-iron-white rounded-lg focus:border-iron-orange focus:outline-none"
            >
              {food.servings.map((serving) => (
                <option key={serving.id} value={serving.id}>
                  {serving.serving_size} {serving.serving_unit}
                  {serving.serving_label && ` (${serving.serving_label})`}
                  {' '}= {serving.grams_per_serving}g
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/nutrition')}
            className="flex-1 bg-iron-gray/10 text-iron-white py-3 px-4 rounded-lg font-medium hover:bg-iron-gray/20 transition-colors active-press"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !liveNutrition}
            className="flex-1 bg-iron-orange text-iron-black py-3 px-4 rounded-lg font-medium hover:bg-iron-orange/90 transition-colors active-press disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}
