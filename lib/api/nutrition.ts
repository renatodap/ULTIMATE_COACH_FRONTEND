/**
 * Nutrition API client
 *
 * Handles all nutrition-related API calls to the backend
 */

import { apiClient } from './client'

// =====================================================
// API Response Types (matching backend models)
// =====================================================

export interface FoodServingAPI {
  id: string
  food_id: string
  serving_size: number
  serving_unit: string
  serving_label: string | null
  grams_per_serving: number
  is_default: boolean
  display_order: number
  created_at: string
}

export interface FoodAPI {
  id: string
  name: string
  brand_name: string | null
  calories_per_100g: number
  protein_g_per_100g: number
  carbs_g_per_100g: number
  fat_g_per_100g: number
  fiber_g_per_100g: number | null
  sugar_g_per_100g: number | null
  sodium_mg_per_100g: number | null
  food_type: string | null
  dietary_flags: string[] | null
  is_public: boolean
  verified: boolean
  usage_count: number
  servings: FoodServingAPI[]
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface MealItemAPI {
  id: string
  meal_id: string
  food_id: string
  quantity: number
  serving_id: string
  grams: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  display_unit: string
  display_label: string | null
  display_order: number
  created_at: string
}

export interface MealAPI {
  id: string
  user_id: string
  name: string | null
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
  logged_at: string
  notes: string | null
  total_calories: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
  source: 'manual' | 'ai_text' | 'ai_voice' | 'ai_photo' | 'coach_chat'
  ai_confidence: number | null
  ai_cost_usd: number
  items: MealItemAPI[]
  created_at: string
  updated_at: string
}

export interface NutritionStatsAPI {
  date: string
  calories_consumed: number
  protein_consumed: number
  carbs_consumed: number
  fat_consumed: number
  calories_goal: number | null
  protein_goal: number | null
  carbs_goal: number | null
  fat_goal: number | null
  meals_count: number
  meals_by_type: Record<string, number>
}

export interface MealListResponse {
  meals: MealAPI[]
  total: number
}

// =====================================================
// API Functions
// =====================================================

/**
 * Get nutrition stats for a specific date
 */
export async function getNutritionStats(date: string): Promise<NutritionStatsAPI> {
  return apiClient.get<NutritionStatsAPI>(`api/v1/nutrition/stats?date=${date}`)
}

/**
 * Get user's meals with optional date filtering
 */
export async function getMeals(params?: {
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}): Promise<MealListResponse> {
  const queryParams = new URLSearchParams()

  if (params?.start_date) queryParams.append('start_date', params.start_date)
  if (params?.end_date) queryParams.append('end_date', params.end_date)
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset) queryParams.append('offset', params.offset.toString())

  const queryString = queryParams.toString()
  const endpoint = queryString ? `api/v1/meals?${queryString}` : 'api/v1/meals'

  return apiClient.get<MealListResponse>(endpoint)
}

/**
 * Get a single meal by ID
 */
export async function getMeal(mealId: string): Promise<MealAPI> {
  return apiClient.get<MealAPI>(`api/v1/meals/${mealId}`)
}

/**
 * Delete a meal
 */
export async function deleteMeal(mealId: string): Promise<void> {
  return apiClient.delete<void>(`api/v1/meals/${mealId}`)
}

/**
 * Create a new meal with items
 */
export interface CreateMealItemRequest {
  food_id: string
  quantity: number
  serving_id?: string | null
  grams: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  display_unit: string
  display_label?: string | null
  display_order?: number
}

export interface CreateMealRequest {
  name?: string | null
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
  logged_at?: string
  notes?: string | null
  items: CreateMealItemRequest[]
  source?: 'manual' | 'ai_text' | 'ai_voice' | 'ai_photo' | 'coach_chat'
  ai_confidence?: number | null
}

export async function createMeal(request: CreateMealRequest): Promise<MealAPI> {
  return apiClient.post<MealAPI>('api/v1/meals', request)
}

/**
 * Get daily nutrition data (stats + meals combined)
 * This is a convenience function that calls both endpoints
 */
export async function getDailyNutrition(date: string) {
  const [stats, mealsResponse] = await Promise.all([
    getNutritionStats(date),
    getMeals({ start_date: date, end_date: date })
  ])

  return {
    stats,
    meals: mealsResponse.meals
  }
}
