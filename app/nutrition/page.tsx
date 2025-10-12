'use client'

/**
 * Nutrition Page - Manual Meal Logging
 *
 * Allows users to:
 * - Search for foods
 * - Select serving sizes
 * - Add multiple food items to a meal
 * - Log meals with automatic nutrition calculation
 * - View today's meals and nutrition totals
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  searchFoods,
  createMeal,
  getMeals,
  getNutritionStats,
  deleteMeal,
  type Food,
  type FoodServing,
  type Meal,
  type MealItemInput,
  type NutritionStats,
} from '@/lib/api/nutrition'

// ============================================================================
// TYPES
// ============================================================================

interface FoodItem {
  food: Food
  serving: FoodServing
  quantity: number
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NutritionPage() {
  const router = useRouter()

  // State
  const [mealType, setMealType] = useState<MealType>('lunch')
  const [mealName, setMealName] = useState('')
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>([])
  const [stats, setStats] = useState<NutritionStats | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Food[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Loading states
  const [isLoggingMeal, setIsLoggingMeal] = useState(false)
  const [isLoadingMeals, setIsLoadingMeals] = useState(true)

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Load today's meals and stats on mount
  useEffect(() => {
    loadTodaysMeals()
    loadTodaysStats()
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      await handleSearch()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // ============================================================================
  // API HANDLERS
  // ============================================================================

  async function handleSearch() {
    if (searchQuery.length < 2) return

    setIsSearching(true)
    setError(null)

    try {
      const response = await searchFoods(searchQuery, 20)
      setSearchResults(response.foods)
    } catch (err: any) {
      setError(err.detail || 'Failed to search foods')
    } finally {
      setIsSearching(false)
    }
  }

  async function loadTodaysMeals() {
    setIsLoadingMeals(true)
    setError(null)

    try {
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

      const response = await getMeals({
        start_date: today,
        end_date: tomorrow,
        limit: 50,
      })

      setTodaysMeals(response.meals)
    } catch (err: any) {
      console.error('Failed to load meals:', err)
      setError(err.detail || 'Failed to load meals')
    } finally {
      setIsLoadingMeals(false)
    }
  }

  async function loadTodaysStats() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const todaysStats = await getNutritionStats(today)
      setStats(todaysStats)
    } catch (err: any) {
      console.error('Failed to load stats:', err)
    }
  }

  async function handleLogMeal() {
    if (foodItems.length === 0) {
      setError('Please add at least one food item')
      return
    }

    setIsLoggingMeal(true)
    setError(null)

    try {
      const items: MealItemInput[] = foodItems.map((item) => ({
        food_id: item.food.id,
        serving_id: item.serving.id,
        quantity: item.quantity,
      }))

      await createMeal({
        meal_type: mealType,
        name: mealName || null,
        items,
        source: 'manual',
      })

      // Reset form
      setFoodItems([])
      setMealName('')
      setSearchQuery('')
      setSearchResults([])

      // Reload data
      await loadTodaysMeals()
      await loadTodaysStats()

      // Show success message
      alert('Meal logged successfully!')
    } catch (err: any) {
      setError(err.detail || 'Failed to log meal')
    } finally {
      setIsLoggingMeal(false)
    }
  }

  async function handleDeleteMeal(mealId: string) {
    if (!confirm('Are you sure you want to delete this meal?')) return

    try {
      await deleteMeal(mealId)
      await loadTodaysMeals()
      await loadTodaysStats()
    } catch (err: any) {
      setError(err.detail || 'Failed to delete meal')
    }
  }

  // ============================================================================
  // FOOD ITEM HANDLERS
  // ============================================================================

  function addFoodItem(food: Food) {
    const defaultServing = food.servings.find((s) => s.is_default) || food.servings[0]

    if (!defaultServing) {
      setError('This food has no serving sizes defined')
      return
    }

    setFoodItems([
      ...foodItems,
      {
        food,
        serving: defaultServing,
        quantity: 1,
      },
    ])

    // Clear search
    setSearchQuery('')
    setSearchResults([])
  }

  function removeFoodItem(index: number) {
    setFoodItems(foodItems.filter((_, i) => i !== index))
  }

  function updateQuantity(index: number, quantity: number) {
    const newItems = [...foodItems]
    newItems[index].quantity = quantity
    setFoodItems(newItems)
  }

  function updateServing(index: number, servingId: string) {
    const newItems = [...foodItems]
    const serving = newItems[index].food.servings.find((s) => s.id === servingId)
    if (serving) {
      newItems[index].serving = serving
      setFoodItems(newItems)
    }
  }

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  function calculateItemNutrition(item: FoodItem) {
    const gramsConsumed = item.quantity * item.serving.grams_per_serving
    const multiplier = gramsConsumed / 100

    return {
      calories: Math.round(item.food.calories_per_100g * multiplier),
      protein: Math.round(item.food.protein_g_per_100g * multiplier),
      carbs: Math.round(item.food.carbs_g_per_100g * multiplier),
      fat: Math.round(item.food.fat_g_per_100g * multiplier),
    }
  }

  function calculateMealTotals() {
    return foodItems.reduce(
      (totals, item) => {
        const nutrition = calculateItemNutrition(item)
        return {
          calories: totals.calories + nutrition.calories,
          protein: totals.protein + nutrition.protein,
          carbs: totals.carbs + nutrition.carbs,
          fat: totals.fat + nutrition.fat,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  const mealTotals = calculateMealTotals()

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Log Meal</h1>
          <p className="mt-2 text-gray-600">
            Search for foods and log your meals to track your nutrition
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Meal Logger */}
          <div className="space-y-6">
            {/* Meal Type Selection */}
            <div className="rounded-lg bg-white p-6 shadow">
              <label className="block text-sm font-medium text-gray-700">
                Meal Type
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
                <option value="other">Other</option>
              </select>

              <label className="mt-4 block text-sm font-medium text-gray-700">
                Meal Name (optional)
              </label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="e.g., Post-workout meal"
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Food Search */}
            <div className="rounded-lg bg-white p-6 shadow">
              <label className="block text-sm font-medium text-gray-700">
                Search Foods
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for chicken, rice, apple..."
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />

              {/* Search Results */}
              {isSearching && (
                <p className="mt-2 text-sm text-gray-500">Searching...</p>
              )}

              {searchResults.length > 0 && (
                <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
                  {searchResults.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => addFoodItem(food)}
                      className="w-full rounded-md border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="font-medium text-gray-900">{food.name}</div>
                      {food.brand_name && (
                        <div className="text-sm text-gray-500">{food.brand_name}</div>
                      )}
                      <div className="mt-1 text-xs text-gray-500">
                        {Math.round(food.calories_per_100g)} cal/100g • P:{' '}
                        {Math.round(food.protein_g_per_100g)}g • C:{' '}
                        {Math.round(food.carbs_g_per_100g)}g • F:{' '}
                        {Math.round(food.fat_g_per_100g)}g
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Added Food Items */}
            {foodItems.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="font-medium text-gray-900">Added Foods</h3>

                <div className="mt-4 space-y-4">
                  {foodItems.map((item, index) => {
                    const nutrition = calculateItemNutrition(item)

                    return (
                      <div
                        key={index}
                        className="rounded-md border border-gray-200 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {item.food.name}
                            </div>

                            {/* Quantity Input */}
                            <div className="mt-2 flex items-center space-x-2">
                              <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(index, parseFloat(e.target.value) || 0)
                                }
                                className="w-20 rounded-md border-gray-300 text-sm"
                              />

                              {/* Serving Selector */}
                              <select
                                value={item.serving.id}
                                onChange={(e) => updateServing(index, e.target.value)}
                                className="flex-1 rounded-md border-gray-300 text-sm"
                              >
                                {item.food.servings.map((serving) => (
                                  <option key={serving.id} value={serving.id}>
                                    {serving.serving_label ||
                                      `${serving.serving_size} ${serving.serving_unit}`}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Nutrition Display */}
                            <div className="mt-2 text-xs text-gray-600">
                              {nutrition.calories} cal • P: {nutrition.protein}g • C:{' '}
                              {nutrition.carbs}g • F: {nutrition.fat}g
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFoodItem(index)}
                            className="ml-4 text-red-600 hover:text-red-700"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Meal Totals */}
                <div className="mt-6 rounded-md bg-blue-50 p-4">
                  <div className="text-sm font-medium text-blue-900">
                    Meal Totals
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <div className="font-medium text-blue-900">
                        {mealTotals.calories}
                      </div>
                      <div className="text-blue-700">Calories</div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">
                        {mealTotals.protein}g
                      </div>
                      <div className="text-blue-700">Protein</div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">
                        {mealTotals.carbs}g
                      </div>
                      <div className="text-blue-700">Carbs</div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">
                        {mealTotals.fat}g
                      </div>
                      <div className="text-blue-700">Fat</div>
                    </div>
                  </div>
                </div>

                {/* Log Button */}
                <button
                  onClick={handleLogMeal}
                  disabled={isLoggingMeal}
                  className="mt-6 w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isLoggingMeal ? 'Logging Meal...' : 'Log Meal'}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Today's Summary */}
          <div className="space-y-6">
            {/* Daily Stats */}
            {stats && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="font-medium text-gray-900">Today's Nutrition</h3>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(stats.calories_consumed)}
                      {stats.calories_goal && (
                        <span className="text-lg font-normal text-gray-500">
                          /{stats.calories_goal}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Calories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(stats.protein_consumed)}g
                      {stats.protein_goal && (
                        <span className="text-lg font-normal text-gray-500">
                          /{stats.protein_goal}g
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Protein</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(stats.carbs_consumed)}g
                      {stats.carbs_goal && (
                        <span className="text-lg font-normal text-gray-500">
                          /{stats.carbs_goal}g
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Carbs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(stats.fat_consumed)}g
                      {stats.fat_goal && (
                        <span className="text-lg font-normal text-gray-500">
                          /{stats.fat_goal}g
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Fat</div>
                  </div>
                </div>
              </div>
            )}

            {/* Today's Meals */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="font-medium text-gray-900">Today's Meals</h3>

              {isLoadingMeals ? (
                <p className="mt-4 text-sm text-gray-500">Loading meals...</p>
              ) : todaysMeals.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">
                  No meals logged today yet
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {todaysMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="rounded-md border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium capitalize text-gray-900">
                            {meal.meal_type}
                            {meal.name && ` - ${meal.name}`}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {new Date(meal.logged_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            {Math.round(meal.total_calories)} cal • P:{' '}
                            {Math.round(meal.total_protein_g)}g • C:{' '}
                            {Math.round(meal.total_carbs_g)}g • F:{' '}
                            {Math.round(meal.total_fat_g)}g
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {meal.items.length} item(s)
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
