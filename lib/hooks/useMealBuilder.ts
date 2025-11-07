/**
 * useMealBuilder Hook
 *
 * Reusable hook for building meals by adding/editing/removing food items.
 * Extracted from nutrition/log page to improve modularity.
 *
 * Features:
 * - Add food items with quantity/serving
 * - Inline editing of quantities
 * - Remove items
 * - Calculate running totals (calories, macros)
 * - Auto-save last entered quantity for UX
 *
 * Benefits:
 * - Reduces nutrition/log page complexity
 * - Makes meal building logic testable
 * - Reusable for edit meal scenarios
 * - Centralizes nutrition calculation
 *
 * Usage:
 * ```typescript
 * const {
 *   mealItems,
 *   addItem,
 *   removeItem,
 *   updateItemQuantity,
 *   totals,
 *   clearMeal,
 * } = useMealBuilder()
 * ```
 */

import { useState, useMemo, useCallback } from 'react'
import { MealItemPreview } from '@/lib/types/food'
import { calculateFoodNutrition } from '@/lib/utils/nutrition-calculator'

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

export interface MealTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  itemCount: number
}

export interface UseMealBuilderReturn {
  /**
   * Current meal items
   */
  mealItems: MealItemPreview[]

  /**
   * Add food item to meal
   */
  addItem: (item: MealItemPreview) => void

  /**
   * Remove food item from meal by index
   */
  removeItem: (index: number) => void

  /**
   * Update quantity of existing item
   */
  updateItemQuantity: (index: number, newQuantity: number) => void

  /**
   * Running totals for current meal
   */
  totals: MealTotals

  /**
   * Clear all items from meal
   */
  clearMeal: () => void

  /**
   * Check if meal has items
   */
  hasItems: boolean

  /**
   * Check if meal is valid for logging (has 1+ items)
   */
  isValid: boolean

  /**
   * Index of item currently being edited (null if none)
   */
  editingIndex: number | null

  /**
   * Start editing an item
   */
  startEditing: (index: number) => void

  /**
   * Stop editing (save changes)
   */
  stopEditing: () => void

  /**
   * Editing quantity (temporary value during inline edit)
   */
  editingQuantity: number

  /**
   * Update editing quantity
   */
  setEditingQuantity: (quantity: number) => void
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Meal builder hook
 *
 * @returns Hook methods and state
 */
export function useMealBuilder(): UseMealBuilderReturn {
  const [mealItems, setMealItems] = useState<MealItemPreview[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingQuantity, setEditingQuantity] = useState<number>(0)

  /**
   * Add item to meal
   */
  const addItem = useCallback((item: MealItemPreview) => {
    setMealItems((prev) => [...prev, item])
  }, [])

  /**
   * Remove item from meal
   */
  const removeItem = useCallback((index: number) => {
    setMealItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  /**
   * Update item quantity
   */
  const updateItemQuantity = useCallback((index: number, newQuantity: number) => {
    setMealItems((prev) => {
      const updated = [...prev]
      const item = updated[index]

      // Recalculate nutrition with new quantity
      const nutrition = calculateFoodNutrition(
        item.food,
        newQuantity,
        item.unit,
        item.serving
      )

      updated[index] = {
        ...item,
        quantity: newQuantity,
        calculated_grams: nutrition.grams,
        calculated_calories: nutrition.calories,
        calculated_protein_g: nutrition.protein_g,
        calculated_carbs_g: nutrition.carbs_g,
        calculated_fat_g: nutrition.fat_g,
      }

      return updated
    })
  }, [])

  /**
   * Start editing an item
   */
  const startEditing = useCallback((index: number) => {
    const item = mealItems[index]
    if (item) {
      setEditingIndex(index)
      setEditingQuantity(item.quantity)
    }
  }, [mealItems])

  /**
   * Stop editing (save changes)
   */
  const stopEditing = useCallback(() => {
    if (editingIndex !== null && editingQuantity > 0) {
      updateItemQuantity(editingIndex, editingQuantity)
    }
    setEditingIndex(null)
    setEditingQuantity(0)
  }, [editingIndex, editingQuantity, updateItemQuantity])

  /**
   * Clear all items
   */
  const clearMeal = useCallback(() => {
    setMealItems([])
    setEditingIndex(null)
    setEditingQuantity(0)
  }, [])

  /**
   * Calculate running totals
   */
  const totals = useMemo<MealTotals>(() => {
    return mealItems.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calculated_calories,
        protein: acc.protein + item.calculated_protein_g,
        carbs: acc.carbs + item.calculated_carbs_g,
        fat: acc.fat + item.calculated_fat_g,
        itemCount: acc.itemCount + 1,
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        itemCount: 0,
      }
    )
  }, [mealItems])

  const hasItems = mealItems.length > 0
  const isValid = mealItems.length >= 1

  return {
    mealItems,
    addItem,
    removeItem,
    updateItemQuantity,
    totals,
    clearMeal,
    hasItems,
    isValid,
    editingIndex,
    startEditing,
    stopEditing,
    editingQuantity,
    setEditingQuantity,
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Transform MealItemPreview to API request format
 *
 * @param items - Meal items from useMealBuilder
 * @returns Array of items ready for createMeal API
 */
export function transformMealItemsForAPI(items: MealItemPreview[]) {
  return items.map((item) => ({
    food_id: item.food_id,
    quantity: item.quantity,
    serving_id: item.serving_id || null,
    grams: item.calculated_grams,
    calories: Math.round(item.calculated_calories),
    protein_g: Math.round(item.calculated_protein_g * 10) / 10,
    carbs_g: Math.round(item.calculated_carbs_g * 10) / 10,
    fat_g: Math.round(item.calculated_fat_g * 10) / 10,
    display_unit: item.unit === 'grams' ? 'g' : item.serving?.serving_unit || 'serving',
    display_label: item.serving?.serving_label || null,
  }))
}

/**
 * Check if meal meets minimum calorie threshold
 *
 * @param totals - Meal totals from useMealBuilder
 * @param minCalories - Minimum calories (default: 50)
 * @returns True if meal meets minimum
 */
export function meetsMinimumCalories(totals: MealTotals, minCalories = 50): boolean {
  return totals.calories >= minCalories
}

/**
 * Check if meal has balanced macros (rough heuristic)
 *
 * @param totals - Meal totals
 * @returns Warning message if unbalanced, null if balanced
 */
export function checkMacroBalance(totals: MealTotals): string | null {
  const totalMacroGrams = totals.protein + totals.carbs + totals.fat

  if (totalMacroGrams === 0) {
    return null
  }

  const proteinPct = (totals.protein / totalMacroGrams) * 100
  const carbsPct = (totals.carbs / totalMacroGrams) * 100
  const fatPct = (totals.fat / totalMacroGrams) * 100

  // Very low protein warning
  if (totals.calories > 300 && proteinPct < 10) {
    return 'This meal is very low in protein. Consider adding a protein source.'
  }

  // Very high fat warning
  if (fatPct > 70) {
    return 'This meal is very high in fat. Make sure this aligns with your goals.'
  }

  // Very high carbs warning
  if (carbsPct > 80) {
    return 'This meal is very high in carbs. Consider adding protein or fat for balance.'
  }

  return null
}
