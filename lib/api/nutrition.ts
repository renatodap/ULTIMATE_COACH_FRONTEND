/**
 * Nutrition API client
 *
 * Handles all nutrition-related API calls:
 * - Food search
 * - Custom food creation
 * - Meal logging
 * - Meal history
 * - Nutrition stats
 */

import { apiClient } from './client'
import { z } from 'zod'

// ============================================================================
// ZOD SCHEMAS (for runtime validation)
// ============================================================================

export const FoodServingSchema = z.object({
  id: z.string().uuid(),
  food_id: z.string().uuid(),
  serving_size: z.number().positive(),
  serving_unit: z.string(),
  serving_label: z.string().nullable(),
  grams_per_serving: z.number().positive(),
  is_default: z.boolean(),
  display_order: z.number(),
  created_at: z.string().datetime(),
})

export const FoodSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  brand_name: z.string().nullable(),

  // Nutrition per 100g
  calories_per_100g: z.number().nonnegative(),
  protein_g_per_100g: z.number().nonnegative(),
  carbs_g_per_100g: z.number().nonnegative(),
  fat_g_per_100g: z.number().nonnegative(),

  // Optional micros
  fiber_g_per_100g: z.number().nonnegative().nullable(),
  sugar_g_per_100g: z.number().nonnegative().nullable(),
  sodium_mg_per_100g: z.number().nonnegative().nullable(),

  // Metadata
  food_type: z.string().nullable(),
  dietary_flags: z.array(z.string()).nullable(),
  is_public: z.boolean(),
  verified: z.boolean(),
  usage_count: z.number(),

  // Servings
  servings: z.array(FoodServingSchema),

  // Ownership
  created_by: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const MealItemSchema = z.object({
  id: z.string().uuid(),
  meal_id: z.string().uuid(),
  food_id: z.string().uuid(),

  // What user logged
  quantity: z.number().positive(),
  serving_id: z.string().uuid(),

  // Calculated values
  grams: z.number().positive(),
  calories: z.number().nonnegative(),
  protein_g: z.number().nonnegative(),
  carbs_g: z.number().nonnegative(),
  fat_g: z.number().nonnegative(),

  // Display info
  display_unit: z.string(),
  display_label: z.string().nullable(),
  display_order: z.number(),
  created_at: z.string().datetime(),
})

export const MealSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),

  // Meal info
  name: z.string().nullable(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'other']),
  logged_at: z.string().datetime(),
  notes: z.string().nullable(),

  // Nutrition totals
  total_calories: z.number().nonnegative(),
  total_protein_g: z.number().nonnegative(),
  total_carbs_g: z.number().nonnegative(),
  total_fat_g: z.number().nonnegative(),

  // AI tracking
  source: z.string(),
  ai_confidence: z.number().min(0).max(1).nullable(),
  ai_cost_usd: z.number().nonnegative(),

  // Items
  items: z.array(MealItemSchema),

  // Metadata
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const NutritionStatsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD

  // Consumed
  calories_consumed: z.number().nonnegative(),
  protein_consumed: z.number().nonnegative(),
  carbs_consumed: z.number().nonnegative(),
  fat_consumed: z.number().nonnegative(),

  // Goals
  calories_goal: z.number().nullable(),
  protein_goal: z.number().nullable(),
  carbs_goal: z.number().nullable(),
  fat_goal: z.number().nullable(),

  // Breakdown
  meals_count: z.number(),
  meals_by_type: z.record(z.number()),
})

// ============================================================================
// TYPESCRIPT TYPES (inferred from schemas)
// ============================================================================

export type FoodServing = z.infer<typeof FoodServingSchema>
export type Food = z.infer<typeof FoodSchema>
export type MealItem = z.infer<typeof MealItemSchema>
export type Meal = z.infer<typeof MealSchema>
export type NutritionStats = z.infer<typeof NutritionStatsSchema>

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface FoodSearchResponse {
  foods: Food[]
  total: number
}

export interface MealListResponse {
  meals: Meal[]
  total: number
}

export interface CreateCustomFoodRequest {
  name: string
  brand_name?: string | null

  // Serving definition
  serving_size: number
  serving_unit: string
  grams_per_serving: number

  // Nutrition for this serving
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g?: number | null
}

export interface MealItemInput {
  food_id: string
  quantity: number
  serving_id: string
}

export interface CreateMealRequest {
  name?: string | null
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
  logged_at?: string | null
  notes?: string | null
  items: MealItemInput[]
  source?: string
  ai_confidence?: number | null
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Search for foods by name
 */
export async function searchFoods(query: string, limit: number = 20): Promise<FoodSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  })

  return apiClient.get<FoodSearchResponse>(`/api/v1/foods/search?${params}`)
}

/**
 * Get a single food by ID
 */
export async function getFood(foodId: string): Promise<Food> {
  return apiClient.get<Food>(`/api/v1/foods/${foodId}`)
}

/**
 * Get all serving sizes for a food
 */
export async function getFoodServings(foodId: string): Promise<FoodServing[]> {
  return apiClient.get<FoodServing[]>(`/api/v1/foods/${foodId}/servings`)
}

/**
 * Create a custom food
 */
export async function createCustomFood(data: CreateCustomFoodRequest): Promise<Food> {
  return apiClient.post<Food>('/api/v1/foods/custom', data)
}

/**
 * Create a meal
 */
export async function createMeal(data: CreateMealRequest): Promise<Meal> {
  return apiClient.post<Meal>('/api/v1/meals', data)
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

  const query = queryParams.toString()
  return apiClient.get<MealListResponse>(`/api/v1/meals${query ? `?${query}` : ''}`)
}

/**
 * Get a single meal by ID
 */
export async function getMeal(mealId: string): Promise<Meal> {
  return apiClient.get<Meal>(`/api/v1/meals/${mealId}`)
}

/**
 * Delete a meal
 */
export async function deleteMeal(mealId: string): Promise<void> {
  return apiClient.delete(`/api/v1/meals/${mealId}`)
}

/**
 * Get daily nutrition stats
 */
export async function getNutritionStats(date: string): Promise<NutritionStats> {
  const params = new URLSearchParams({ date })
  return apiClient.get<NutritionStats>(`/api/v1/nutrition/stats?${params}`)
}
