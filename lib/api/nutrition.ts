/**
 * Nutrition API client
 *
 * Handles all nutrition-related API calls to the backend
 */

import { apiClient } from './client'
import { supabase } from '@/lib/supabase'

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
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.delete<void>(`api/v1/meals/${mealId}`, { headers });
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
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.post<MealAPI>('api/v1/meals', request, { headers });
}

/**
 * Get daily nutrition data (stats + meals combined)
 * This is a convenience function that calls both endpoints
 *
 * IMPORTANT: Backend uses exclusive end_date filtering (.lt() not .lte()),
 * so we must pass the NEXT day as end_date to get meals for the target date.
 */
export async function getDailyNutrition(date: string) {
  // Calculate next day for exclusive end date filtering
  // Backend query: logged_at >= start_date AND logged_at < end_date
  const startDate = new Date(date + 'T00:00:00')
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 1)
  const endDateStr = endDate.toISOString().split('T')[0]

  const [stats, mealsResponse] = await Promise.all([
    getNutritionStats(date),
    getMeals({
      start_date: date,
      end_date: endDateStr  // Next day to make range inclusive via exclusive upper bound
    })
  ])

  return {
    stats,
    meals: mealsResponse.meals
  }
}

/**
 * Update a meal (DELETE + CREATE pattern since backend has no UPDATE endpoint)
 *
 * This function:
 * 1. Fetches the current meal data
 * 2. Deletes the old meal
 * 3. Creates a new meal with updated data
 *
 * @param mealId - ID of meal to update
 * @param updates - Partial meal data to update
 * @returns The newly created meal
 */
export async function updateMeal(
  mealId: string,
  updates: Partial<CreateMealRequest>
): Promise<MealAPI> {
  // 1. Fetch current meal data
  const currentMeal = await getMeal(mealId)
  // 2. Merge current data with updates (unchanged)
  const updatedMealData: CreateMealRequest = {
    name: updates.name !== undefined ? updates.name : currentMeal.name,
    meal_type: updates.meal_type || currentMeal.meal_type,
    logged_at: updates.logged_at || currentMeal.logged_at,
    notes: updates.notes !== undefined ? updates.notes : currentMeal.notes,
    source: updates.source || currentMeal.source,
    ai_confidence: updates.ai_confidence !== undefined ? updates.ai_confidence : currentMeal.ai_confidence,
    items: updates.items || currentMeal.items.map(item => ({
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
  }
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  await deleteMeal(mealId);
  return await apiClient.post<MealAPI>('api/v1/meals', updatedMealData, { headers });
}
