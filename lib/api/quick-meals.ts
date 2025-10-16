/**
 * Quick Meals API Client
 */

import { apiClient } from './client'
import type { QuickMeal } from '../types/food'
import { supabase } from '@/lib/supabase'

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
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.post<QuickMeal>('api/v1/quick-meals', request, { headers });
}

/**
 * Update a quick meal
 */
export async function updateQuickMeal(
  quickMealId: string,
  request: UpdateQuickMealRequest
): Promise<QuickMeal> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.patch<QuickMeal>(`api/v1/quick-meals/${quickMealId}`, request, { headers });
}

/**
 * Delete a quick meal
 */
export async function deleteQuickMeal(quickMealId: string): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.delete(`api/v1/quick-meals/${quickMealId}`, { headers });
}

/**
 * Log a quick meal (creates a meal with all foods)
 */
export async function logQuickMeal(quickMealId: string): Promise<{ message: string }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.post(`api/v1/quick-meals/${quickMealId}/log`, {}, { headers });
}
