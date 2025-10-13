/**
 * Foods API Client
 */

import { apiClient } from './client'
import type { Food, FoodSearchResult } from '../types/food'

/**
 * Search foods (unified search across all types)
 */
export async function searchFoods(query: string, limit: number = 20): Promise<FoodSearchResult> {
  return apiClient.get<FoodSearchResult>(`/api/v1/foods/search?q=${encodeURIComponent(query)}&limit=${limit}`)
}

/**
 * Get a single food by ID
 */
export async function getFood(foodId: string): Promise<Food> {
  return apiClient.get<Food>(`/api/v1/foods/${foodId}`)
}

/**
 * Get recent foods
 */
export async function getRecentFoods(limit: number = 10): Promise<Food[]> {
  return apiClient.get<Food[]>(`/api/v1/foods/recent?limit=${limit}`)
}
