/**
 * Quick Meals API Client
 */

import { apiClient } from './client'
import type { QuickMeal } from '../types/food'

export interface CreateQuickMealRequest {
  name: string
  description?: string
  foods: Array<{
    food_id: string
    quantity: number
    serving_id?: string
    display_order?: number
  }>
}

export interface UpdateQuickMealRequest {
  name?: string
  description?: string
  is_favorite?: boolean
}

/**
 * List all quick meals for current user
 */
export async function listQuickMeals(): Promise<QuickMeal[]> {
  return apiClient.get<QuickMeal[]>('api/v1/quick-meals')
}

/**
 * Create a new quick meal
 */
export async function createQuickMeal(request: CreateQuickMealRequest): Promise<QuickMeal> {
  return apiClient.post<QuickMeal>('api/v1/quick-meals', request)
}

/**
 * Update a quick meal
 */
export async function updateQuickMeal(
  quickMealId: string,
  request: UpdateQuickMealRequest
): Promise<QuickMeal> {
  return apiClient.patch<QuickMeal>(`api/v1/quick-meals/${quickMealId}`, request)
}

/**
 * Delete a quick meal
 */
export async function deleteQuickMeal(quickMealId: string): Promise<void> {
  return apiClient.delete(`api/v1/quick-meals/${quickMealId}`)
}

/**
 * Log a quick meal (creates a meal with all foods)
 */
export async function logQuickMeal(quickMealId: string): Promise<{ message: string }> {
  return apiClient.post(`api/v1/quick-meals/${quickMealId}/log`, {})
}
