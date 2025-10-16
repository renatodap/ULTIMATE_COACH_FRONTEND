/**
 * Users API client
 *
 * Handles all user-related API calls (requires authentication)
 */

import { apiClient } from './client'
import { supabase } from '@/lib/supabase'

export interface FullUserProfile {
  // Basic info
  id: string
  email: string
  full_name?: string
  created_at?: string
  updated_at?: string

  // Onboarding status
  onboarding_completed: boolean
  onboarding_completed_at?: string

  // Physical stats
  age?: number
  biological_sex?: 'male' | 'female'
  height_cm?: number
  current_weight_kg?: number
  goal_weight_kg?: number

  // Goals & Training
  primary_goal?: 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_performance'
  experience_level?: 'beginner' | 'intermediate' | 'advanced'
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
  workout_frequency?: number

  // Dietary
  dietary_preference?: 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo'
  food_allergies?: string[]
  foods_to_avoid?: string[]
  meals_per_day?: number
  cooks_regularly?: boolean

  // Lifestyle
  sleep_hours?: number
  stress_level?: 'low' | 'medium' | 'high'

  // Macro targets
  estimated_tdee?: number
  daily_calorie_goal?: number
  daily_protein_goal?: number
  daily_carbs_goal?: number
  daily_fat_goal?: number
  macros_last_calculated_at?: string

  // Preferences
  unit_system?: 'metric' | 'imperial'
  timezone?: string
  language?: 'en' | 'pt' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'ko' | 'zh'

  // Consultation
  consultation_completed?: boolean
  consultation_completed_at?: string
}

export interface UpdateProfileData {
  full_name?: string
  age?: number
  height_cm?: number
  current_weight_kg?: number
  goal_weight_kg?: number
  primary_goal?: 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_performance'
  experience_level?: 'beginner' | 'intermediate' | 'advanced'
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
  workout_frequency?: number
  dietary_preference?: 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo'
  food_allergies?: string[]
  foods_to_avoid?: string[]
  meals_per_day?: number
  cooks_regularly?: boolean
  sleep_hours?: number
  stress_level?: 'low' | 'medium' | 'high'
  unit_system?: 'metric' | 'imperial'
  timezone?: string
  language?: 'en' | 'pt' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'ko' | 'zh'
}

/**
 * Get current user profile (full profile with all data)
 * Requires authentication (httpOnly cookie)
 */
export async function getCurrentUser(): Promise<FullUserProfile> {
  return apiClient.get<FullUserProfile>('api/v1/users/me')
}

/**
 * Update current user profile
 * Macros are automatically recalculated if physical stats change
 * Requires authentication (httpOnly cookie)
 */
export async function updateCurrentUser(data: UpdateProfileData): Promise<FullUserProfile> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.patch<FullUserProfile>('api/v1/users/me', data, { headers });
}
