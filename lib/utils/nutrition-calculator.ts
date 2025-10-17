/**
 * Nutrition Calculator
 *
 * Frontend nutrition calculation utility (mirrors backend logic).
 * Used for live preview in UI - actual logged values come from backend.
 *
 * CRITICAL: These calculations are for UX PREVIEW ONLY!
 * Backend will RECALCULATE everything at meal creation time.
 * See: NUTRITION_LOGGING_ARCHITECTURE.md - Frontend/Backend Contract
 *
 * QUANTITY SEMANTIC OVERLOAD:
 * - quantity can mean GRAMS or SERVINGS depending on unit parameter
 * - unit='grams' → quantity = grams (e.g., 150 = 150g)
 * - unit='serving' → quantity = serving count (e.g., 2 = 2 servings)
 */

export interface NutritionData {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface Food {
  id: string
  name: string
  brand_name?: string | null
  composition_type?: 'simple' | 'composed' | 'branded'
  calories_per_100g: number
  protein_g_per_100g: number
  carbs_g_per_100g: number
  fat_g_per_100g: number
  recipe_items?: Array<{
    food_id: string
    grams: number
  }> | null
  servings_count?: number
  composed_total_grams?: number | null
  servings?: FoodServing[]
}

export interface FoodServing {
  id: string
  serving_size: number
  serving_unit: string
  serving_label?: string | null
  grams_per_serving: number
  is_default: boolean
}

/**
 * Round to specified decimal places
 */
function round(value: number, decimals: number = 1): number {
  const multiplier = Math.pow(10, decimals)
  return Math.round(value * multiplier) / multiplier
}

/**
 * Calculate nutrition for a simple or branded food based on grams
 */
export function calculateSimpleFoodNutrition(
  food: Food,
  grams: number
): NutritionData {
  const factor = grams / 100

  return {
    calories: round(food.calories_per_100g * factor),
    protein_g: round(food.protein_g_per_100g * factor),
    carbs_g: round(food.carbs_g_per_100g * factor),
    fat_g: round(food.fat_g_per_100g * factor),
  }
}

/**
 * Calculate nutrition for a composed food based on servings
 *
 * NOTE: This requires all ingredient foods to be available.
 * In production, composed food nutrition should be calculated by backend.
 */
export function calculateComposedFoodNutrition(
  food: Food,
  servings: number,
  getFoodById: (id: string) => Food | undefined
): NutritionData {
  if (!food.recipe_items || food.composition_type !== 'composed') {
    throw new Error('Food is not a composed food')
  }

  // Calculate total for 1 serving
  const totalPerServing = food.recipe_items.reduce(
    (total, item) => {
      const ingredient = getFoodById(item.food_id)
      if (!ingredient) {
        throw new Error(`Ingredient ${item.food_id} not found`)
      }

      const itemNutrition = calculateSimpleFoodNutrition(ingredient, item.grams)

      return {
        calories: total.calories + itemNutrition.calories,
        protein_g: total.protein_g + itemNutrition.protein_g,
        carbs_g: total.carbs_g + itemNutrition.carbs_g,
        fat_g: total.fat_g + itemNutrition.fat_g,
      }
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

  // Scale by servings
  return {
    calories: round(totalPerServing.calories * servings),
    protein_g: round(totalPerServing.protein_g * servings),
    carbs_g: round(totalPerServing.carbs_g * servings),
    fat_g: round(totalPerServing.fat_g * servings),
  }
}

/**
 * Main calculation function - handles all food types
 *
 * CRITICAL NOTES:
 * 1. This is PREVIEW calculation only - backend recalculates at submission
 * 2. quantity parameter has TWO meanings:
 *    - unit='grams' → quantity = grams directly
 *    - unit='serving' → quantity = serving count (not grams!)
 * 3. Backend uses identical logic (see nutrition_service.py:create_meal)
 *
 * See: NUTRITION_LOGGING_ARCHITECTURE.md for complete documentation
 */
export function calculateFoodNutrition(
  food: Food,
  quantity: number,
  unit: 'grams' | 'serving',
  serving?: FoodServing,
  getFoodById?: (id: string) => Food | undefined
): NutritionData & { grams: number } {
  let grams: number
  let nutrition: NutritionData

  if (unit === 'grams') {
    // ======================================================
    // GRAM-BASED CALCULATION
    // ======================================================
    // quantity = grams directly (e.g., 150 = 150g)
    // ======================================================
    if (food.composition_type === 'composed') {
      throw new Error('Composed foods cannot be logged by grams, only by servings')
    }

    grams = quantity
    nutrition = calculateSimpleFoodNutrition(food, grams)
  } else if (unit === 'serving') {
    if (food.composition_type === 'composed') {
      // ======================================================
      // COMPOSED FOOD: Calculate from ingredients
      // ======================================================
      // quantity = serving count (e.g., 2 = 2 servings)
      // Recursively sums nutrition from all recipe_items
      // ======================================================
      if (!getFoodById) {
        throw new Error('getFoodById function required for composed foods')
      }

      nutrition = calculateComposedFoodNutrition(food, quantity, getFoodById)
      grams = (food.composed_total_grams || 0) * quantity
    } else {
      // ======================================================
      // SIMPLE/BRANDED FOOD: Calculate from serving
      // ======================================================
      // quantity = serving count (e.g., 2 = 2 scoops)
      // Calculate grams: quantity × grams_per_serving
      // Example: 2 × 118g = 236g
      // ======================================================
      if (!serving) {
        throw new Error('Serving required when unit is serving')
      }

      grams = serving.grams_per_serving * quantity
      nutrition = calculateSimpleFoodNutrition(food, grams)
    }
  } else {
    throw new Error(`Invalid unit: ${unit}`)
  }

  return {
    ...nutrition,
    grams,
  }
}

/**
 * Format nutrition for display
 */
export function formatNutrition(nutrition: NutritionData): string {
  return `${Math.round(nutrition.calories)} cal • ${Math.round(nutrition.protein_g)}g P • ${Math.round(nutrition.carbs_g)}g C • ${Math.round(nutrition.fat_g)}g F`
}

/**
 * Format serving size for display
 */
export function formatServing(serving: FoodServing, quantity: number = 1): string {
  const quantityStr = quantity === 1 ? '' : `${quantity} × `
  const sizeStr = serving.serving_size === 1 ? '' : `${serving.serving_size} `
  const labelStr = serving.serving_label ? ` (${serving.serving_label})` : ''

  return `${quantityStr}${sizeStr}${serving.serving_unit}${labelStr}`
}

/**
 * Validate nutrition using 4-4-9 calorie rule
 * Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
 */
export function validateNutrition(
  nutrition: NutritionData,
  tolerance: number = 0.15
): boolean {
  const caloriesFromMacros =
    nutrition.protein_g * 4 + nutrition.carbs_g * 4 + nutrition.fat_g * 9

  const diff = Math.abs(nutrition.calories - caloriesFromMacros)
  const allowedDiff = nutrition.calories * tolerance

  return diff <= allowedDiff
}
