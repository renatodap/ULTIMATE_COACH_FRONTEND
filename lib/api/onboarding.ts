/**
 * Onboarding API client
 *
 * Handles all onboarding-related API calls
 */

import { apiClient } from './client'
import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface OnboardingData {
  // Step 1: Goals
  primary_goal: 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_performance'
  experience_level: 'beginner' | 'intermediate' | 'advanced'
  workout_frequency: number

  // Step 2: Physical Stats (in metric - backend canonical)
  age: number
  biological_sex: 'male' | 'female'
  height_cm: number
  current_weight_kg: number
  goal_weight_kg: number

  // Step 3: Activity Level
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'

  // Step 4: Dietary
  dietary_preference?: 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo'
  food_allergies?: string[]
  foods_to_avoid?: string[]
  meals_per_day?: number

  // Step 5: Lifestyle
  sleep_hours: number
  stress_level?: 'low' | 'medium' | 'high'
  cooks_regularly?: boolean

  // Preferences
  unit_system: 'metric' | 'imperial'
  timezone?: string
}

export interface MacroTargets {
  bmr: number
  tdee: number
  daily_calories: number
  daily_protein_g: number
  daily_carbs_g: number
  daily_fat_g: number
  explanation: {
    bmr: string
    tdee: string
    calories: string
    protein: string
    fats: string
    carbs: string
    goal_context?: string
  }
}

export interface OnboardingResponse {
  profile: any
  targets: MacroTargets
  message: string
}

export interface OnboardingStatus {
  onboarding_completed: boolean
  onboarding_completed_at?: string
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Complete onboarding and get personalized targets
 */
export async function completeOnboarding(data: OnboardingData): Promise<OnboardingResponse> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.post<OnboardingResponse>('/api/v1/onboarding/complete', data, { headers });
}

/**
 * Get onboarding status
 */
export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  return apiClient.get<OnboardingStatus>('/api/v1/onboarding/status')
}

/**
 * Preview macro targets (for Step 6 before finalizing)
 */
export async function previewTargets(params: {
  age: number
  biological_sex: 'male' | 'female'
  height_cm: number
  current_weight_kg: number
  goal_weight_kg: number
  activity_level: string
  primary_goal: string
  experience_level?: string
}): Promise<MacroTargets> {
  const queryParams = new URLSearchParams({
    age: params.age.toString(),
    biological_sex: params.biological_sex,
    height_cm: params.height_cm.toString(),
    current_weight_kg: params.current_weight_kg.toString(),
    goal_weight_kg: params.goal_weight_kg.toString(),
    activity_level: params.activity_level,
    primary_goal: params.primary_goal,
    experience_level: params.experience_level || 'beginner',
  })

  return apiClient.get<MacroTargets>(`/api/v1/onboarding/preview-targets?${queryParams}`)
}
