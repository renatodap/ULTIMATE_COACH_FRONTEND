/**
 * Nutrition Data Transformer
 *
 * Converts API responses to UI-friendly format
 */

import type { DailyNutrition, Meal, FoodItem, FoodServing } from '../types/nutrition'
import type { MealAPI, MealItemAPI, NutritionStatsAPI, FoodServingAPI } from '../api/nutrition'

/**
 * Transform API meal item to UI format
 */
export function transformMealItem(item: MealItemAPI): FoodItem {
  // Extract food data from nested foods object (if available from JOIN)
  // Backend includes foods(name, brand_name) when querying meals
  const foodName = item.foods?.name || 'Unknown Food'
  const brandName = item.foods?.brand_name || undefined

  return {
    id: item.id,
    mealId: item.meal_id,
    foodId: item.food_id,
    foodName,
    brandName,
    quantity: item.quantity,
    servingId: item.serving_id,
    displayUnit: item.display_unit,
    displayLabel: item.display_label ?? undefined,
    grams: item.grams,
    calories: item.calories,
    protein: item.protein_g,
    carbs: item.carbs_g,
    fat: item.fat_g,
    availableServings: [], // Will be populated when needed
    displayOrder: item.display_order
  }
}

/**
 * Transform API meal to UI format
 */
export function transformMeal(meal: MealAPI): Meal {
  return {
    id: meal.id,
    name: meal.name ?? undefined,
    mealType: meal.meal_type,
    loggedAt: meal.logged_at,
    totalCalories: meal.total_calories,
    totalProtein: meal.total_protein_g,
    totalCarbs: meal.total_carbs_g,
    totalFat: meal.total_fat_g,
    source: meal.source,
    aiConfidence: meal.ai_confidence ?? undefined,
    foodItems: meal.items.map(transformMealItem),
  }
}

/**
 * Transform API nutrition stats + meals to UI DailyNutrition format
 */
export function transformDailyNutrition(
  stats: NutritionStatsAPI,
  meals: MealAPI[]
): DailyNutrition {
  return {
    date: stats.date,
    totalCalories: stats.calories_consumed,
    totalProtein: stats.protein_consumed,
    totalCarbs: stats.carbs_consumed,
    totalFat: stats.fat_consumed,
    calorieGoal: stats.calories_goal || 2000,
    proteinGoal: stats.protein_goal || 150,
    carbsGoal: stats.carbs_goal || 200,
    fatGoal: stats.fat_goal || 65,
    meals: meals.map(transformMeal),
  }
}
