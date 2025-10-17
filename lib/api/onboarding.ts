/**
 * Onboarding API client
 *
 * Handles all onboarding-related API calls
 */

import { apiClient } from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface TrainingModalitySelection {
  modality_id: string
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  is_primary?: boolean
}

export interface TrainingModality {
  id: string
  name: string
  description?: string
  typical_frequency_per_week?: number
  equipment_required?: string[]
  icon?: string
  display_order: number
}

export interface OnboardingData {
  // Step 1: Goals
  primary_goal: 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_performance'
  secondary_goal?: 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_performance'
  experience_level: 'beginner' | 'intermediate' | 'advanced'
  workout_frequency: number

  // Training Modalities (Step 3.5)
  training_modalities?: TrainingModalitySelection[]

  // Fitness Notes (Step 4)
  fitness_notes?: string

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
 *
 * AUTHENTICATION: Uses httpOnly cookies set during login (no manual token management)
 * Backend validates via cookies automatically (credentials: 'include' in apiClient)
 *
 * FIX: Removed session refresh to prevent orphaned token errors
 * Previous implementation called supabase.auth.refreshSession() which created tokens
 * that Supabase couldn't validate, causing "Session from session_id claim in JWT does not exist"
 */
export async function completeOnboarding(data: OnboardingData): Promise<OnboardingResponse> {
  try {
    console.log('[Onboarding] Starting submission using cookie-based authentication');

    // Simply use apiClient - it automatically includes httpOnly cookies
    // No need to manually refresh session or attach Authorization headers
    return await apiClient.post<OnboardingResponse>('/api/v1/onboarding/complete', data);
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

/**
 * Get list of available training modalities
 */
export async function getTrainingModalities(): Promise<TrainingModality[]> {
  // Fetch from Supabase directly (public table, no auth required)
  // This endpoint will be created in the backend if it doesn't exist
  try {
    return await apiClient.get<TrainingModality[]>('/api/v1/training-modalities')
  } catch (error) {
    console.error('[Onboarding] Failed to fetch training modalities:', error)
    // Return empty array as fallback
    return []
  }
}
