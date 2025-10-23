'use client'

/**
 * Nutrition Page - Full CRUD with Optimistic Updates
 *
 * Features:
 * - Daily summary card (collapsible with macros)
 * - Full CRUD on meals and food items
 * - Optimistic UI updates
 * - Undo toast for delete actions
 * - Mobile-first design with generous bottom spacing
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Plus, Loader2 } from 'lucide-react'
import { getMeals, deleteMeal, deleteMealItem, type MealAPI } from '@/lib/api/nutrition'
import { BottomNav } from '@/components/BottomNav'
import { FAB } from '@/components/shared/FAB'
import { DailySummaryCard } from '@/components/DailySummaryCard'
import { MealCard } from '@/components/MealCard'
import { UndoToast } from '@/components/UndoToast'

export default function NutritionPage() {
  const router = useRouter()

  // Data state
  const [meals, setMeals] = useState<MealAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Delete state
  const [deleteLoadingItemId, setDeleteLoadingItemId] = useState<string | null>(null)
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null)

  // Undo state
  const [undoState, setUndoState] = useState<{
    type: 'meal' | 'item'
    data: any
    message: string
  } | null>(null)

  // Fetch meals on mount
  useEffect(() => {
    fetchMeals()
  }, [])

  async function fetchMeals() {
    try {
      setLoading(true)
      setError(null)
      const response = await getMeals({ limit: 50 })
      setMeals(response.meals)
    } catch (err) {
      console.error('Failed to fetch meals:', err)
      setError('Failed to load meals')
    } finally {
      setLoading(false)
    }
  }

  // Calculate daily totals
  const dailyTotals = meals.reduce(
    (totals, meal) => ({
      calories: totals.calories + meal.total_calories,
      protein: totals.protein + meal.total_protein_g,
      carbs: totals.carbs + meal.total_carbs_g,
      fat: totals.fat + meal.total_fat_g
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  // Delete food item from meal (with undo)
  const handleDeleteFood = async (mealId: string, itemId: string) => {
    // Find the meal and item for undo
    const meal = meals.find(m => m.id === mealId)
    const item = meal?.items.find(i => i.id === itemId)

    if (!meal || !item) return

    // Save undo state BEFORE optimistic update
    setUndoState({
      type: 'item',
      data: { meal, item },
      message: `${item.foods?.name || 'Food'} removed`
    })

    // Optimistic update: Remove item from UI immediately
    setMeals(prevMeals =>
      prevMeals.map(m => {
        if (m.id !== mealId) return m

        const updatedItems = m.items.filter(i => i.id !== itemId)

        // Recalculate meal totals
        const newTotals = updatedItems.reduce(
          (acc, item) => ({
            calories: acc.calories + item.calories,
            protein: acc.protein + item.protein_g,
            carbs: acc.carbs + item.carbs_g,
            fat: acc.fat + item.fat_g
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        )

        return {
          ...m,
          items: updatedItems,
          total_calories: newTotals.calories,
          total_protein_g: newTotals.protein,
          total_carbs_g: newTotals.carbs,
          total_fat_g: newTotals.fat
        }
      }).filter(m => m.items.length > 0) // Remove meal if no items left
    )

    // Call API in background
    try {
      setDeleteLoadingItemId(itemId)
      await deleteMealItem(mealId, itemId)
    } catch (err: any) {
      console.error('Failed to delete item:', err)

      // Check if meal was deleted (all items removed)
      if (err.message === 'MEAL_DELETED') {
        // Already removed from UI optimistically, all good
        return
      }

      // Rollback on other errors
      setMeals(prevMeals => [...prevMeals, meal])
      setUndoState(null)
      alert('Failed to delete item. Please try again.')
    } finally {
      setDeleteLoadingItemId(null)
    }
  }

  // Delete entire meal (with undo)
  const handleDeleteMeal = async (mealId: string) => {
    // Find the meal for undo
    const meal = meals.find(m => m.id === mealId)
    if (!meal) return

    // Save undo state BEFORE optimistic update
    setUndoState({
      type: 'meal',
      data: meal,
      message: `${meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)} meal removed`
    })

    // Optimistic update: Remove meal from UI immediately
    setMeals(prevMeals => prevMeals.filter(m => m.id !== mealId))

    // Call API in background
    try {
      setDeletingMealId(mealId)
      await deleteMeal(mealId)
    } catch (err) {
      console.error('Failed to delete meal:', err)

      // Rollback on error
      setMeals(prevMeals => [...prevMeals, meal])
      setUndoState(null)
      alert('Failed to delete meal. Please try again.')
    } finally {
      setDeletingMealId(null)
    }
  }

  // Edit food item (navigate to edit page)
  const handleEditFood = (mealId: string, itemId: string) => {
    router.push(`/nutrition/edit/${itemId}?meal=${mealId}`)
  }

  // Undo delete
  const handleUndo = () => {
    if (!undoState) return

    if (undoState.type === 'meal') {
      // Restore deleted meal
      const meal = undoState.data as MealAPI
      setMeals(prevMeals => {
        // Insert meal in correct chronological position
        const newMeals = [...prevMeals, meal]
        return newMeals.sort((a, b) =>
          new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
        )
      })
    } else if (undoState.type === 'item') {
      // Restore deleted item
      const { meal, item } = undoState.data
      setMeals(prevMeals => {
        // Check if meal still exists
        const mealExists = prevMeals.some(m => m.id === meal.id)

        if (mealExists) {
          // Add item back to existing meal
          return prevMeals.map(m => {
            if (m.id !== meal.id) return m

            const updatedItems = [...m.items, item].sort((a, b) => a.display_order - b.display_order)

            const newTotals = updatedItems.reduce(
              (acc, item) => ({
                calories: acc.calories + item.calories,
                protein: acc.protein + item.protein_g,
                carbs: acc.carbs + item.carbs_g,
                fat: acc.fat + item.fat_g
              }),
              { calories: 0, protein: 0, carbs: 0, fat: 0 }
            )

            return {
              ...m,
              items: updatedItems,
              total_calories: newTotals.calories,
              total_protein_g: newTotals.protein,
              total_carbs_g: newTotals.carbs,
              total_fat_g: newTotals.fat
            }
          })
        } else {
          // Meal was deleted, restore entire meal
          const newMeals = [...prevMeals, meal]
          return newMeals.sort((a, b) =>
            new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
          )
        }
      })
    }

    setUndoState(null)
  }

  // Dismiss undo toast
  const handleDismissUndo = () => {
    setUndoState(null)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-iron-black text-iron-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-iron-orange animate-spin mx-auto mb-4" />
          <p className="text-iron-gray">Loading meals...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-iron-black text-iron-white flex items-center justify-center pb-40">
        <div className="text-center px-4">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchMeals}
            className="px-4 py-2 bg-iron-orange text-iron-black rounded-lg font-medium active-press"
          >
            Retry
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-iron-black text-iron-white pb-40">
      {/* Header */}
      <div className="sticky top-0 z-[100] bg-iron-black border-b border-iron-gray/30 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider">Nutrition</h1>
            <p className="text-sm text-iron-gray">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          <button
            onClick={() => router.push('/nutrition/log')}
            className="flex items-center gap-2 px-4 py-2 bg-iron-orange text-iron-black rounded-lg font-medium active-press focus-ring-iron"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Log Meal</span>
          </button>
        </div>
      </div>

      {/* Daily Summary */}
      <DailySummaryCard
        totalCalories={dailyTotals.calories}
        totalProtein={dailyTotals.protein}
        totalCarbs={dailyTotals.carbs}
        totalFat={dailyTotals.fat}
        calorieGoal={2500}
        proteinGoal={200}
        carbsGoal={250}
        fatGoal={80}
        mealsLogged={meals.length}
      />

      {/* Meals List */}
      <div className="px-4 py-6 space-y-4">
        {meals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-xl font-semibold mb-2 text-iron-white">No meals logged today</h2>
            <p className="text-iron-gray mb-6">
              Start tracking your nutrition!
            </p>
            <button
              onClick={() => router.push('/nutrition/log')}
              className="px-6 py-3 bg-iron-orange text-iron-black rounded-lg font-medium active-press"
            >
              Log Your First Meal
            </button>
          </div>
        ) : (
          meals.map(meal => (
            <MealCard
              key={meal.id}
              meal={meal}
              onEditFood={handleEditFood}
              onDeleteFood={handleDeleteFood}
              onDeleteMeal={handleDeleteMeal}
              deleteLoadingItemId={deleteLoadingItemId}
              deletingMeal={deletingMealId === meal.id}
            />
          ))
        )}
      </div>

      {/* FAB - Log Meal */}
      <FAB
        href="/nutrition/log"
        icon={<Plus className="w-8 h-8" />}
        positioning="high"
      />

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Undo Toast */}
      {undoState && (
        <UndoToast
          message={undoState.message}
          onUndo={handleUndo}
          onDismiss={handleDismissUndo}
        />
      )}
    </div>
  )
}
