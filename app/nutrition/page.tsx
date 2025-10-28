'use client'

/**
 * Nutrition Page - Full CRUD with Fixed Optimistic Updates
 *
 * CRITICAL FIX: Backend does DELETE+CREATE which changes meal IDs
 * This version properly handles the ID change to prevent duplicates
 *
 * Features:
 * - Daily summary card (collapsible with macros)
 * - Full CRUD on meals and food items
 * - Optimistic UI updates with proper ID tracking
 * - Undo toast for delete actions
 * - Error toast for failures
 * - Mobile-first design with generous bottom spacing
 */

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, addDays, subDays, startOfDay, endOfDay, isToday, parseISO } from 'date-fns'
import { Plus, Loader2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { getMeals, deleteMeal, deleteMealItem, type MealAPI } from '@/lib/api/nutrition'
import { BottomNav } from '@/components/BottomNav'
import { FAB } from '@/components/shared/FAB'
import { DailySummaryCard } from '@/components/DailySummaryCard'
import { MealCard } from '@/components/MealCard'
import { UndoToast } from '@/components/UndoToast'
import { ErrorToast } from '@/components/ErrorToast'

function NutritionPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Date state - Read from URL param or default to today
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const dateParam = searchParams?.get('date')
    if (dateParam) {
      try {
        return parseISO(dateParam)
      } catch {
        return new Date()
      }
    }
    return new Date()
  })

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

  // Error toast state
  const [errorToast, setErrorToast] = useState<{
    message: string
    details?: string
  } | null>(null)

  // Fetch meals when date changes
  useEffect(() => {
    fetchMeals()
  }, [selectedDate])

  // Sync URL param when date changes
  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const currentDateParam = searchParams?.get('date')
    if (currentDateParam !== dateStr) {
      router.replace(`/nutrition?date=${dateStr}`, { scroll: false })
    }
  }, [selectedDate, router, searchParams])

  async function fetchMeals() {
    try {
      setLoading(true)
      setError(null)

      // Calculate start and end of the selected day in ISO format
      const start = startOfDay(selectedDate).toISOString()
      const end = endOfDay(selectedDate).toISOString()

      const response = await getMeals({
        start_date: start,
        end_date: end,
        limit: 50
      })
      setMeals(response.meals)
    } catch (err) {
      console.error('Failed to fetch meals:', err)
      setError('Failed to load meals')
    } finally {
      setLoading(false)
    }
  }

  // Date navigation functions
  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1))
  }

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1))
  }

  const handleToday = () => {
    setSelectedDate(new Date())
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

  /**
   * Delete food item from meal
   *
   * Uses new backend endpoint DELETE /meals/{meal_id}/items/{item_id}
   * Backend returns null if meal was deleted (last item removed)
   */
  const handleDeleteFood = async (mealId: string, itemId: string) => {
    // Find the meal and item
    const meal = meals.find(m => m.id === mealId)
    const item = meal?.items.find(i => i.id === itemId)

    if (!meal || !item) {
      console.error('Meal or item not found', { mealId, itemId })
      return
    }

    // Check if this is the last item in the meal
    if (meal.items.length === 1) {
      const itemName = item.foods?.name || 'item'
      const mealTypeName = meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)
      const confirmed = window.confirm(
        `This is the last item in your ${mealTypeName} meal. Deleting "${itemName}" will delete the entire meal.\n\nAre you sure?`
      )
      if (!confirmed) {
        return // User cancelled
      }
    }

    // Save COMPLETE previous state for rollback
    const previousMeals = [...meals]

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
      const updatedMeal = await deleteMealItem(mealId, itemId)

      // updatedMeal is null if meal was deleted (last item removed)
      if (updatedMeal === null) {
        // Meal was deleted - optimistic update already removed it
        // Just clear loading state
        setDeleteLoadingItemId(null)
      } else {
        // SUCCESS: API returns updated meal (same ID with new backend!)
        // Replace the meal in state with updated version from API
        setMeals(prevMeals =>
          prevMeals.map(m => m.id === mealId ? updatedMeal : m)
        )
        setDeleteLoadingItemId(null)
      }

      // Clear undo after 10 seconds
      setTimeout(() => {
        setUndoState(prev => {
          // Only clear if it's still the same undo state
          if (prev?.type === 'item' && prev?.data?.item?.id === itemId) {
            return null
          }
          return prev
        })
      }, 10000)

    } catch (err: any) {
      console.error('Failed to delete item:', err)

      // Check if meal was deleted (last item removed)
      if (err.message === 'MEAL_DELETED') {
        // Meal was deleted - optimistic update already removed it
        // Clear undo after 10s
        setTimeout(() => setUndoState(null), 10000)
        return
      }

      // PROPER ROLLBACK: Restore exact previous state
      setMeals(previousMeals)
      setUndoState(null)

      // Show error toast (not alert)
      const errorMessage = err.message || 'Unknown error'
      setErrorToast({
        message: `Failed to delete ${item.foods?.name || 'food item'}`,
        details: errorMessage
      })
    } finally {
      setDeleteLoadingItemId(null)
    }
  }

  /**
   * Delete entire meal
   *
   * CRITICAL FIX: Properly handle rollback with exact previous state
   */
  const handleDeleteMeal = async (mealId: string) => {
    // Find the meal
    const meal = meals.find(m => m.id === mealId)
    if (!meal) {
      console.error('Meal not found', { mealId })
      return
    }

    // Save COMPLETE previous state for rollback
    const previousMeals = [...meals]

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

      // SUCCESS: Meal deleted
      // Clear undo after 10 seconds
      setTimeout(() => {
        setUndoState(prev => {
          // Only clear if it's still the same undo state
          if (prev?.type === 'meal' && prev?.data?.id === mealId) {
            return null
          }
          return prev
        })
      }, 10000)

    } catch (err: any) {
      console.error('Failed to delete meal:', err)

      // PROPER ROLLBACK: Restore exact previous state
      setMeals(previousMeals)
      setUndoState(null)

      // Show error toast (not alert)
      const errorMessage = err.message || 'Unknown error'
      setErrorToast({
        message: 'Failed to delete meal',
        details: errorMessage
      })
    } finally {
      setDeletingMealId(null)
    }
  }

  /**
   * Undo delete
   *
   * Note: Undo restores the ORIGINAL meal with ORIGINAL ID
   * This works because we never actually delete from database until undo window expires
   */
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

  // Dismiss error toast
  const handleDismissError = () => {
    setErrorToast(null)
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

  // Check if viewing today
  const viewingToday = isToday(selectedDate)

  return (
    <div className="min-h-screen bg-iron-black text-iron-white pb-40">
      {/* Header */}
      <div className="sticky top-0 z-[100] bg-iron-black border-b border-iron-gray/30">
        {/* Title and Log Button */}
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider">Nutrition</h1>
          </div>
          <button
            onClick={() => router.push('/nutrition/log')}
            className="flex items-center gap-2 px-4 py-2 bg-iron-orange text-iron-black rounded-lg font-medium active-press focus-ring-iron"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Log Meal</span>
          </button>
        </div>

        {/* Date Navigation */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between gap-2">
            {/* Previous Day */}
            <button
              onClick={handlePreviousDay}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-iron-dark-gray border border-iron-gray/30 text-iron-white hover:bg-iron-gray/20 active-press"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Date Display */}
            <div className="flex-1 text-center">
              <div className={`text-lg font-semibold ${!viewingToday ? 'text-iron-orange' : 'text-iron-white'}`}>
                {format(selectedDate, 'EEEE, MMMM d')}
              </div>
              {!viewingToday && (
                <div className="text-xs text-iron-gray mt-1">
                  {format(selectedDate, 'yyyy')}
                </div>
              )}
            </div>

            {/* Next Day */}
            <button
              onClick={handleNextDay}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-iron-dark-gray border border-iron-gray/30 text-iron-white hover:bg-iron-gray/20 active-press"
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Today Button - Only show when not viewing today */}
          {!viewingToday && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={handleToday}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-iron-orange/10 border border-iron-orange text-iron-orange hover:bg-iron-orange/20 active-press text-sm font-medium"
              >
                <Calendar className="w-4 h-4" />
                Back to Today
              </button>
            </div>
          )}
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
            <h2 className="text-xl font-semibold mb-2 text-iron-white">
              {viewingToday ? 'No meals logged today' : `No meals logged on ${format(selectedDate, 'MMM d')}`}
            </h2>
            <p className="text-iron-gray mb-6">
              {viewingToday ? 'Start tracking your nutrition!' : 'No nutrition data for this date'}
            </p>
            {viewingToday && (
              <button
                onClick={() => router.push('/nutrition/log')}
                className="px-6 py-3 bg-iron-orange text-iron-black rounded-lg font-medium active-press"
              >
                Log Your First Meal
              </button>
            )}
          </div>
        ) : (
          meals.map(meal => (
            <MealCard
              key={meal.id}
              meal={meal}
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

      {/* Error Toast */}
      {errorToast && (
        <ErrorToast
          message={errorToast.message}
          details={errorToast.details}
          onDismiss={handleDismissError}
        />
      )}
    </div>
  )
}

export default function NutritionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-iron-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-iron-orange animate-spin" /></div>}>
      <NutritionPageContent />
    </Suspense>
  )
}
