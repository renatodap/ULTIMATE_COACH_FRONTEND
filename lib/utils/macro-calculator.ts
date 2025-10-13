/**
 * Macro Calculator Utilities
 *
 * Calculate nutritional values from weight and per-100g nutrition data.
 * Ensures math accuracy by always using grams as the canonical base.
 */

import type { Food, FoodServing } from '../types/nutrition'

/**
 * Calculate macros from grams and per-100g nutrition data
 *
 * @param grams - Weight in grams
 * @param food - Food with per-100g nutrition data
 * @returns Calculated macros
 */
export function calculateMacrosFromGrams(
  grams: number,
  food: {
    caloriesPer100g: number
    proteinPer100g: number
    carbsPer100g: number
    fatPer100g: number
  }
) {
  const ratio = grams / 100

  return {
    calories: Math.round(food.caloriesPer100g * ratio),
    protein: parseFloat((food.proteinPer100g * ratio).toFixed(1)),
    carbs: parseFloat((food.carbsPer100g * ratio).toFixed(1)),
    fat: parseFloat((food.fatPer100g * ratio).toFixed(1)),
  }
}

/**
 * Convert quantity + serving → grams
 *
 * @param quantity - Number of servings (e.g., 1.5)
 * @param serving - Serving definition with grams per serving
 * @returns Weight in grams
 */
export function quantityToGrams(quantity: number, serving: FoodServing): number {
  return parseFloat((quantity * serving.grams).toFixed(1))
}

/**
 * Convert grams → quantity for a given serving
 *
 * @param grams - Weight in grams
 * @param serving - Serving definition
 * @returns Quantity in that serving unit
 */
export function gramsToQuantity(grams: number, serving: FoodServing): number {
  return parseFloat((grams / serving.grams).toFixed(2))
}

/**
 * Calculate macro percentage of total
 *
 * @param current - Current value
 * @param target - Target value
 * @returns Percentage (0-100)
 */
export function calculatePercentage(current: number, target: number): number {
  if (target === 0) return 0
  return Math.round((current / target) * 100)
}

/**
 * Calculate calories remaining in day
 *
 * @param consumed - Calories consumed
 * @param goal - Daily calorie goal
 * @returns Remaining calories (can be negative if over goal)
 */
export function calculateRemaining(consumed: number, goal: number): number {
  return Math.round(goal - consumed)
}

/**
 * Format macro value for display
 *
 * @param value - Macro value
 * @param unit - Unit ('g' for grams, 'cal' for calories)
 * @returns Formatted string
 */
export function formatMacro(value: number, unit: 'g' | 'cal' = 'g'): string {
  if (unit === 'cal') {
    return `${Math.round(value)} cal`
  }
  return `${value}${unit}`
}

/**
 * Calculate macro distribution percentages
 * (For pie charts / macro split visualization)
 *
 * @param protein - Protein in grams
 * @param carbs - Carbs in grams
 * @param fat - Fat in grams
 * @returns Percentage split
 */
export function calculateMacroDistribution(
  protein: number,
  carbs: number,
  fat: number
): { protein: number; carbs: number; fat: number } {
  // Convert to calories (protein/carbs = 4 cal/g, fat = 9 cal/g)
  const proteinCals = protein * 4
  const carbsCals = carbs * 4
  const fatCals = fat * 9
  const totalCals = proteinCals + carbsCals + fatCals

  if (totalCals === 0) {
    return { protein: 0, carbs: 0, fat: 0 }
  }

  return {
    protein: Math.round((proteinCals / totalCals) * 100),
    carbs: Math.round((carbsCals / totalCals) * 100),
    fat: Math.round((fatCals / totalCals) * 100),
  }
}
