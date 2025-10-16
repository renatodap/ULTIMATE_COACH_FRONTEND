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
  // Prefer birth_date; age is optional (derived server-side if birth_date provided)
  birth_date?: string
  age?: number
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
  try {
    // Get current session - this will also refresh if needed
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[Onboarding] Session error:', sessionError);
      throw new Error('Session expired. Please log in again.');
    }

    let accessToken = sessionData?.session?.access_token;

    // Fallback: Try to refresh session if no access token
    if (!accessToken) {
      console.log('[Onboarding] No session found, attempting to refresh...');
      const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error('[Onboarding] Session refresh error:', refreshError);
        throw new Error('Session expired. Please log in again.');
      }

      if (!refreshedData?.session?.access_token) {
        console.error('[Onboarding] No access token after refresh');
        throw new Error('Authentication required. Please log in again.');
      }

      accessToken = refreshedData.session.access_token;
      console.log('[Onboarding] Session refreshed successfully');
    }

    console.log('[Onboarding] Submitting with token:', accessToken.substring(0, 20) + '...');

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`
    };

    return await apiClient.post<OnboardingResponse>('/api/v1/onboarding/complete', data, { headers });
  } catch (error: any) {
    console.error('[Onboarding] Complete onboarding error:', error);
    // Re-throw with better error message
    if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      throw new Error('Session expired. Please log in again.');
    }
    throw error;
  }
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
  // Accept either birth_date or age
  birth_date?: string
  age?: number
  biological_sex: 'male' | 'female'
  height_cm: number
  current_weight_kg: number
  goal_weight_kg: number
  activity_level: string
  primary_goal: string
  experience_level?: string
}): Promise<MacroTargets> {
  // Derive age from birth_date if provided
  let ageValue: number | undefined = params.age
  if (!ageValue && params.birth_date) {
    const bd = new Date(params.birth_date)
    const today = new Date()
    const years = Math.floor((today.getTime() - bd.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    ageValue = years
  }

  const queryParams = new URLSearchParams({
    age: (ageValue ?? 30).toString(),
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
