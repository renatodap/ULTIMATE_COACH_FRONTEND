/**
 * Profile Type Definitions
 *
 * Type-safe interfaces for user profile management.
 * Used for updating user preferences, goals, physical stats, and training settings.
 *
 * Backend Contract: app/models/profile.py
 * Last Sync: 2025-11-04
 */

// ============================================================================
// PROFILE UPDATE TYPES
// ============================================================================

/**
 * Goals & Objectives update payload
 */
export interface GoalsUpdate {
  primary_goal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'performance' | 'health' | null
  target_weight_kg?: number | null
  target_date?: string | null // ISO 8601 date
  motivation?: string | null
}

/**
 * Dietary preferences update payload
 */
export interface DietaryUpdate {
  dietary_preference?:
    | 'none'
    | 'vegetarian'
    | 'vegan'
    | 'pescatarian'
    | 'paleo'
    | 'keto'
    | 'mediterranean'
    | null
  food_allergies?: string[] | null
  food_dislikes?: string[] | null
  food_preferences?: string[] | null
}

/**
 * Lifestyle & Activity update payload
 */
export interface LifestyleUpdate {
  activity_level?:
    | 'sedentary'
    | 'lightly_active'
    | 'moderately_active'
    | 'very_active'
    | 'extra_active'
    | null
  occupation_type?: 'sedentary' | 'standing' | 'physical' | null
  sleep_hours?: number | null
  stress_level?: 'low' | 'moderate' | 'high' | null
  sleep_quality?: 'poor' | 'fair' | 'good' | 'excellent' | null
}

/**
 * Training schedule update payload
 */
export interface ScheduleUpdate {
  preferred_workout_days?: string[] | null // ['monday', 'wednesday', 'friday']
  preferred_workout_time?: 'morning' | 'afternoon' | 'evening' | 'flexible' | null
  session_duration_minutes?: number | null
  sessions_per_week?: number | null
}

/**
 * Physical stats update payload
 */
export interface PhysicalStatsUpdate {
  height_cm?: number | null
  current_weight_kg?: number | null
  age?: number | null
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
  body_fat_percentage?: number | null
}

/**
 * Equipment access update payload
 */
export interface EquipmentUpdate {
  has_gym_access?: boolean | null
  home_equipment?: string[] | null
  preferred_training_location?: 'gym' | 'home' | 'both' | 'outdoor' | null
}

/**
 * Training constraints update payload
 */
export interface ConstraintsUpdate {
  injuries?: string[] | null
  medical_conditions?: string[] | null
  exercise_limitations?: string[] | null
  mobility_restrictions?: string[] | null
}

/**
 * Challenges & Barriers update payload
 */
export interface ChallengesUpdate {
  time_constraints?: boolean | null
  motivation_issues?: boolean | null
  knowledge_gaps?: boolean | null
  plateaus?: boolean | null
  consistency_problems?: boolean | null
  other_challenges?: string[] | null
}

/**
 * Exercise familiarity update payload
 */
export interface ExerciseFamiliarityUpdate {
  strength_training_experience?: 'beginner' | 'intermediate' | 'advanced' | null
  cardio_experience?: 'beginner' | 'intermediate' | 'advanced' | null
  flexibility_experience?: 'beginner' | 'intermediate' | 'advanced' | null
  familiar_exercises?: string[] | null
}

/**
 * Meal timing preferences update payload
 */
export interface MealTimingUpdate {
  meals_per_day?: number | null
  breakfast_time?: string | null // HH:mm format
  lunch_time?: string | null
  dinner_time?: string | null
  snack_preferences?: string[] | null
  fasting_window?: number | null // Hours (for intermittent fasting)
}

/**
 * General preferences update payload
 */
export interface PreferencesUpdate {
  units_system?: 'metric' | 'imperial' | null
  language?: string | null // ISO 639-1 code
  timezone?: string | null // IANA timezone
  notifications_enabled?: boolean | null
  email_notifications?: boolean | null
  push_notifications?: boolean | null
}

/**
 * Training modalities update payload
 */
export interface TrainingModalitiesUpdate {
  preferred_modalities?: string[] | null // ['strength', 'cardio', 'yoga', 'hiit']
  disliked_modalities?: string[] | null
  willing_to_try?: string[] | null
}

// ============================================================================
// PROFILE UPDATE RESPONSE
// ============================================================================

/**
 * Standard response for profile update operations
 */
export interface ProfileUpdateResponse {
  success: boolean
  message: string
  updated_fields?: string[]
  profile?: Partial<UserProfile> // Updated fields only
}

/**
 * Complete user profile (returned by GET /profile)
 */
export interface UserProfile {
  id: string
  email: string
  username: string
  created_at: string
  updated_at: string

  // Goals & Objectives
  primary_goal: string | null
  target_weight_kg: number | null
  target_date: string | null
  motivation: string | null

  // Physical Stats
  height_cm: number | null
  current_weight_kg: number | null
  age: number | null
  gender: string | null
  body_fat_percentage: number | null

  // Dietary
  dietary_preference: string | null
  food_allergies: string[] | null
  food_dislikes: string[] | null
  food_preferences: string[] | null

  // Lifestyle
  activity_level: string | null
  occupation_type: string | null
  sleep_hours: number | null
  stress_level: string | null
  sleep_quality: string | null

  // Training
  preferred_workout_days: string[] | null
  preferred_workout_time: string | null
  session_duration_minutes: number | null
  sessions_per_week: number | null

  // Equipment & Location
  has_gym_access: boolean | null
  home_equipment: string[] | null
  preferred_training_location: string | null

  // Constraints
  injuries: string[] | null
  medical_conditions: string[] | null
  exercise_limitations: string[] | null
  mobility_restrictions: string[] | null

  // Challenges
  time_constraints: boolean | null
  motivation_issues: boolean | null
  knowledge_gaps: boolean | null
  plateaus: boolean | null
  consistency_problems: boolean | null
  other_challenges: string[] | null

  // Experience
  strength_training_experience: string | null
  cardio_experience: string | null
  flexibility_experience: string | null
  familiar_exercises: string[] | null

  // Meal Timing
  meals_per_day: number | null
  breakfast_time: string | null
  lunch_time: string | null
  dinner_time: string | null
  snack_preferences: string[] | null
  fasting_window: number | null

  // Preferences
  units_system: string | null
  language: string | null
  timezone: string | null
  notifications_enabled: boolean
  email_notifications: boolean
  push_notifications: boolean

  // Training Modalities
  preferred_modalities: string[] | null
  disliked_modalities: string[] | null
  willing_to_try: string[] | null
}

// ============================================================================
// COMBINED UPDATE TYPE
// ============================================================================

/**
 * Generic profile update payload (discriminated union)
 *
 * Use this for the updateProfile() function to accept any update type.
 */
export type ProfileUpdate =
  | GoalsUpdate
  | DietaryUpdate
  | LifestyleUpdate
  | ScheduleUpdate
  | PhysicalStatsUpdate
  | EquipmentUpdate
  | ConstraintsUpdate
  | ChallengesUpdate
  | ExerciseFamiliarityUpdate
  | MealTimingUpdate
  | PreferencesUpdate
  | TrainingModalitiesUpdate

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that updates object is not empty
 */
export function hasUpdates(updates: Record<string, any>): boolean {
  return Object.keys(updates).length > 0
}

/**
 * Filter out null/undefined values from updates
 */
export function filterEmptyUpdates(updates: Record<string, any>): Record<string, any> {
  const filtered: Record<string, any> = {}
  for (const [key, value] of Object.entries(updates)) {
    if (value !== null && value !== undefined) {
      filtered[key] = value
    }
  }
  return filtered
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard: Check if update contains goals fields
 */
export function isGoalsUpdate(update: ProfileUpdate): update is GoalsUpdate {
  return (
    'primary_goal' in update ||
    'target_weight_kg' in update ||
    'target_date' in update ||
    'motivation' in update
  )
}

/**
 * Type guard: Check if update contains dietary fields
 */
export function isDietaryUpdate(update: ProfileUpdate): update is DietaryUpdate {
  return (
    'dietary_preference' in update ||
    'food_allergies' in update ||
    'food_dislikes' in update ||
    'food_preferences' in update
  )
}

/**
 * Type guard: Check if update contains lifestyle fields
 */
export function isLifestyleUpdate(update: ProfileUpdate): update is LifestyleUpdate {
  return (
    'activity_level' in update ||
    'occupation_type' in update ||
    'sleep_hours' in update ||
    'stress_level' in update ||
    'sleep_quality' in update
  )
}
