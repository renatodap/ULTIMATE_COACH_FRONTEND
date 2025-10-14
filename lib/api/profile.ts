/**
 * Profile API Client
 *
 * Handles all API calls related to user profile management.
 * Uses ULTIMATE_COACH_FRONTEND's apiClient pattern with httpOnly cookies.
 */

import { createClient } from '@/lib/supabase/client'
import { apiClient } from './client'

// =====================================================
// Types
// =====================================================

export interface UserProfile {
  id: string
  full_name?: string
  goal?: string
  auto_log_enabled: boolean
  timezone?: string
  created_at: string
  updated_at: string
}

export interface AutoLogPreference {
  auto_log_enabled: boolean
}

// Full profile from backend /api/v1/users/me
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
  language?: string

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
  language?: string
}

// =====================================================
// Profile Functions (Deprecated - Supabase Direct Access)
// =====================================================

/**
 * Get user's auto-log preference
 *
 * @deprecated DISABLED - The auto_log_enabled field does not exist in the database schema.
 * This feature is not currently implemented. Use backend API for profile preferences instead.
 *
 * @returns {Promise<AutoLogPreference>} The auto-log preference
 * @throws {Error} Always throws - feature not implemented
 */
export async function getAutoLogPreference(): Promise<AutoLogPreference> {
  throw new Error('Auto-log preference feature is not implemented. The auto_log_enabled column does not exist in the database schema.')
}

/**
 * Update user's auto-log preference
 *
 * @deprecated DISABLED - The auto_log_enabled field does not exist in the database schema.
 * This feature is not currently implemented. Use backend API for profile preferences instead.
 *
 * @param {boolean} enabled - Whether to enable auto-logging
 * @returns {Promise<void>}
 * @throws {Error} Always throws - feature not implemented
 */
export async function updateAutoLogPreference(enabled: boolean): Promise<void> {
  throw new Error('Auto-log preference feature is not implemented. The auto_log_enabled column does not exist in the database schema.')
}

/**
 * Get full user profile
 *
 * @deprecated DISABLED - Use getFullUserProfile() instead. This function used direct Supabase access
 * and returned a limited UserProfile type with fields that don't exist in the database schema.
 * The new backend API provides a complete profile with 40+ fields including onboarding data,
 * macro targets, and consultation status.
 *
 * Migration: Replace getUserProfile() with getFullUserProfile()
 * Returns: FullUserProfile (comprehensive) vs UserProfile (basic fields only)
 *
 * @returns {Promise<UserProfile>} The user's profile
 * @throws {Error} Always throws - feature disabled
 */
export async function getUserProfile(): Promise<UserProfile> {
  throw new Error('getUserProfile is disabled. Use getFullUserProfile() instead, which provides complete profile data from the backend API.')
}

/**
 * Update user's timezone preference
 *
 * @deprecated DISABLED - The timezone field does not exist in the Supabase profiles table.
 * Use updateFullUserProfile({ timezone }) instead, which uses the backend API.
 * The backend stores timezone in the PostgreSQL users table.
 *
 * Migration:
 * OLD: await updateUserTimezone('America/New_York')
 * NEW: await updateFullUserProfile({ timezone: 'America/New_York' })
 *
 * @param {string} timezone - IANA timezone identifier (e.g., "America/New_York")
 * @returns {Promise<void>}
 * @throws {Error} Always throws - feature not implemented in Supabase
 */
export async function updateUserTimezone(timezone: string): Promise<void> {
  throw new Error('updateUserTimezone is disabled. The timezone field does not exist in the Supabase profiles table. Use updateFullUserProfile({ timezone }) instead.')
}

// =====================================================
// Backend API Functions (uses /api/v1/users/me)
// =====================================================

/**
 * Get current user's full profile from backend API
 * Uses /api/v1/users/me endpoint with httpOnly cookie authentication
 *
 * @returns {Promise<FullUserProfile>} Complete user profile with all onboarding data
 * @throws {Error} If not authenticated or fetch fails
 */
export async function getFullUserProfile(): Promise<FullUserProfile> {
  return apiClient.get<FullUserProfile>('api/v1/users/me')
}

/**
 * Update current user's profile via backend API
 * Uses PATCH /api/v1/users/me endpoint with httpOnly cookie authentication
 * Automatically recalculates macros if physical stats change
 *
 * @param {UpdateProfileData} data - Profile fields to update
 * @returns {Promise<FullUserProfile>} Updated profile with recalculated macros if applicable
 * @throws {Error} If not authenticated or update fails
 */
export async function updateFullUserProfile(data: UpdateProfileData): Promise<FullUserProfile> {
  // Build URLSearchParams for form data submission
  const formData = new URLSearchParams()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        // For arrays like food_allergies, send as JSON string
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, String(value))
      }
    }
  })

  // Use a custom fetch to send form data
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to update profile')
  }

  return response.json()
}
