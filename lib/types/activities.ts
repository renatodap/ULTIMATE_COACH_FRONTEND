/**
 * TypeScript interfaces for activity tracking
 *
 * DOCUMENTATION REFERENCES:
 * - System Architecture: /ACTIVITY_TRACKING_SYSTEM.md
 * - Bug Prevention Guide: /ACTIVITY_TRACKING_BUG_PREVENTION.md
 *
 * CRITICAL: These types MUST stay in sync with backend Pydantic models
 * Location: ULTIMATE_COACH_BACKEND/app/models/activities.py
 * Last Synced: 2025-10-16
 *
 * TYPE SYNC REQUIREMENT:
 * Any changes to backend models MUST be reflected here.
 * Breaking changes require API versioning (see ACTIVITY_TRACKING_SYSTEM.md Section 7.1)
 *
 * BUG PREVENTION:
 * - Use optional chaining (?.) for all nullable fields
 * - Check metrics existence before accessing nested properties
 * - Convert UTC timestamps to user timezone for display
 * - Never use UTC date for grouping activities (see Section 9 Timezone Handling)
 *
 * See: ACTIVITY_TRACKING_SYSTEM.md Section 4.1 (Type System & Data Structures)
 */

/**
 * Main Activity entity
 *
 * Represents a completed workout/activity session.
 * Returned by all activity API endpoints.
 *
 * CRITICAL: Must match backend Activity model exactly
 * Location: ULTIMATE_COACH_BACKEND/app/models/activities.py::Activity
 *
 * TIMEZONE HANDLING:
 * - start_time, end_time, created_at, updated_at: ISO 8601 UTC strings
 * - ALWAYS convert to user timezone before displaying
 * - NEVER use UTC date for grouping by day
 * See: ACTIVITY_TRACKING_SYSTEM.md Section 9
 *
 * NULL HANDLING:
 * - end_time: null if activity ongoing or duration manually entered
 * - notes: null if user didn't add notes
 * - metrics: May be empty object {}
 * Always use optional chaining: activity.metrics?.distance_km
 */
export interface Activity {
  id: string                        // UUID v4
  user_id: string                   // UUID v4 (owner)
  category: ActivityCategory        // One of 6 valid categories
  activity_name: string             // Custom name (max 100 chars)
  start_time: string                // ISO 8601 UTC ("2025-10-16T07:00:00Z")
  end_time: string | null           // ISO 8601 UTC or null
  duration_minutes: number          // 1-1440
  calories_burned: number           // 0-10000
  intensity_mets: number            // 1.0-20.0
  metrics: ActivityMetrics          // Category-specific JSONB
  notes: string | null              // User notes (max 500 chars)
  created_at: string                // ISO 8601 UTC
  updated_at: string                // ISO 8601 UTC
}

/**
 * Activity category discriminator
 *
 * CRITICAL: Must match backend exactly
 * - Backend: ActivityCategory enum in activities.py
 * - Database: CHECK constraint in activities table
 * - Backend METs ranges: METS_RANGES dict in activities.py
 *
 * CATEGORIES:
 * - cardio_steady_state: Running, cycling, swimming (steady pace)
 * - cardio_interval: HIIT, sprints, intervals
 * - strength_training: Weight lifting, bodyweight exercises
 * - sports: Tennis, basketball, soccer, etc.
 * - flexibility: Yoga, stretching, mobility
 * - other: Anything else
 *
 * Each category has:
 * - Different typical METs ranges
 * - Different metrics schemas (see ActivityMetrics)
 * - Different UI display (icons, colors)
 */
export type ActivityCategory =
  | 'cardio_steady_state'
  | 'cardio_interval'
  | 'strength_training'
  | 'sports'
  | 'flexibility'
  | 'other'

/**
 * Activity-specific metrics (JSONB in database)
 *
 * ARCHITECTURE: Flexible schema allows category-specific data
 * - Alternative would be: Separate tables per activity type (too complex)
 * - JSONB allows unlimited extensibility
 *
 * VALIDATION:
 * - Backend validates with JSON schemas (validate_activity_metrics function)
 * - Frontend validates with TypeScript types
 * - Database constraint as final safety net
 *
 * BUG PREVENTION:
 * - ALWAYS use optional chaining: metrics?.distance_km
 * - ALWAYS check existence: if (metrics?.exercises?.length > 0)
 * - Empty metrics = {} is valid (no additional data for activity)
 *
 * CATEGORY-SPECIFIC SCHEMAS:
 * See: ACTIVITY_TRACKING_SYSTEM.md Section 2.2 (Activity Metrics JSON Schema)
 */
export interface ActivityMetrics {
  // CARDIO METRICS (cardio_steady_state, cardio_interval)
  distance_km?: number              // ≥ 0
  avg_heart_rate?: number           // 40-220 bpm
  max_heart_rate?: number           // 40-220 bpm
  avg_pace?: string                 // Format: "MM:SS" (e.g., "5:47")
  elevation_gain_m?: number         // ≥ 0
  avg_speed_kph?: number            // ≥ 0

  // STRENGTH TRAINING METRICS
  exercises?: Exercise[]            // Array of exercise objects
  total_volume_kg?: number          // Sum of (sets × reps × weight)

  // SPORTS METRICS
  sport_type?: string               // e.g., "tennis", "basketball"
  opponent?: string                 // Opponent name or "N/A"
  score?: string                    // e.g., "6-4, 6-3" or "21-18"
  match_duration?: string           // e.g., "1:30"

  // FLEXIBILITY METRICS
  stretch_type?: string             // e.g., "dynamic", "static", "PNF"

  // EXTENSIBILITY: Allow any additional fields
  // Useful for future activity types without schema changes
  [key: string]: any
}

/**
 * Strength training exercise definition
 *
 * Used in ActivityMetrics.exercises array for strength_training category.
 *
 * REQUIRED FIELDS:
 * - name: Exercise name (e.g., "Bench Press", "Squats")
 * - sets: Number of sets performed (≥ 1)
 * - reps: Number of reps per set (≥ 1)
 *
 * OPTIONAL FIELDS:
 * - weight_kg: Weight used (0 = bodyweight)
 * - rpe: Rate of Perceived Exertion (1-10 scale)
 * - rest_seconds: Rest time between sets
 * - notes: Exercise-specific notes
 *
 * CALCULATION:
 * - Volume per exercise = sets × reps × weight_kg
 * - Total volume = sum of all exercises' volumes
 * - Stored in ActivityMetrics.total_volume_kg
 *
 * DISPLAY:
 * - Frontend component: ExerciseDetailsList.tsx
 * - Shows all fields in expandable card
 *
 * See: ACTIVITY_TRACKING_SYSTEM.md Section 2.2 (Strength Training Metrics)
 */
export interface Exercise {
  name: string                      // REQUIRED: Exercise name
  sets: number                      // REQUIRED: ≥ 1
  reps: number                      // REQUIRED: ≥ 1
  weight_kg?: number                // Optional: ≥ 0 (0 = bodyweight)
  rpe?: number                      // Optional: Rate of Perceived Exertion (1-10)
  rest_seconds?: number             // Optional: Rest time between sets (≥ 0)
  notes?: string                    // Optional: Exercise-specific notes
}

/**
 * Daily activity summary with aggregated statistics
 *
 * Returned by GET /api/v1/activities/summary endpoint.
 * Displays user's daily progress toward calorie burn goal.
 *
 * CALCULATION FORMULAS:
 * - total_calories_burned = SUM(calories_burned) for target_date
 * - total_duration_minutes = SUM(duration_minutes) for target_date
 * - average_intensity = AVG(intensity_mets) for target_date
 * - activity_count = COUNT(*) for target_date
 * - daily_goal_calories = user.profile.daily_calorie_burn_goal (default 500)
 * - goal_percentage = (total_calories / daily_goal) × 100
 *
 * BUG PREVENTION (Bug 2.3):
 * - Backend MUST use user's timezone for date comparison
 * - SQL: DATE(start_time AT TIME ZONE user_tz) = target_date
 * - NOT: DATE(start_time) = target_date (would use UTC!)
 *
 * EDGE CASES:
 * - No activities: All totals = 0, goal_percentage = 0
 * - Exceeds goal: goal_percentage > 100 (e.g., 150%)
 * - No goal set: daily_goal_calories defaults to 500
 *
 * FRONTEND DISPLAY:
 * - Component: DailySummaryCard.tsx
 * - Progress bar width: `${Math.min(goal_percentage, 100)}%`
 * - Color: green if met goal, orange if close, red if far
 *
 * See: ACTIVITY_TRACKING_SYSTEM.md Section 8.4 (Goal Percentage Calculation)
 */
export interface DailySummary {
  total_calories_burned: number     // Sum of all activities' calories
  total_duration_minutes: number    // Sum of all activities' durations
  average_intensity: number         // Average METs (1.0-20.0)
  activity_count: number            // Number of activities logged
  daily_goal_calories: number       // User's daily goal from profile
  goal_percentage: number           // Progress % (can exceed 100)
}

/**
 * Request payload for creating new activity
 *
 * Sent to POST /api/v1/activities endpoint.
 *
 * REQUIRED FIELDS:
 * - category: ActivityCategory (one of 6 categories)
 * - activity_name: string (1-100 chars)
 * - start_time: ISO 8601 UTC timestamp
 *
 * OPTIONAL FIELDS (auto-calculated if omitted):
 * - end_time: ISO 8601 UTC timestamp
 * - duration_minutes: 1-1440 (calculated from timestamps if omitted)
 * - calories_burned: 0-10000 (calculated using METs formula if omitted)
 * - intensity_mets: 1.0-20.0 (looked up from activity_name if omitted)
 * - metrics: Activity-specific data
 * - notes: User notes (max 500 chars)
 *
 * AUTO-CALCULATION CHAIN:
 * 1. duration_minutes: If end_time provided → (end_time - start_time) / 60
 * 2. intensity_mets: If not provided → lookup_mets(activity_name, category)
 * 3. calories_burned: If not provided → METs × weight × (duration / 60)
 *
 * TIMEZONE HANDLING:
 * - Frontend MUST convert local time → UTC before sending
 * - Use zonedTimeToUtc() from date-fns-tz
 * - Backend validates in UTC only
 *
 * BUG PREVENTION:
 * - ALWAYS send UTC timestamps (not local time!)
 * - Validate end_time > start_time before sending
 * - Check category is valid before sending
 *
 * See: ACTIVITY_TRACKING_SYSTEM.md Section 3.4 (Create Activity API)
 */
export interface CreateActivityRequest {
  category: ActivityCategory        // REQUIRED
  activity_name: string             // REQUIRED (1-100 chars)
  start_time: string                // REQUIRED: ISO 8601 UTC
  end_time?: string | null          // OPTIONAL: ISO 8601 UTC
  duration_minutes?: number | null  // OPTIONAL: Auto-calculated from timestamps
  calories_burned?: number | null   // OPTIONAL: Auto-calculated using METs
  intensity_mets?: number | null    // OPTIONAL: Auto-looked up from activity_name
  metrics?: ActivityMetrics         // OPTIONAL: Category-specific data
  notes?: string | null             // OPTIONAL: User notes
}

export interface UpdateActivityRequest {
  activity_name?: string
  start_time?: string
  end_time?: string | null
  duration_minutes?: number
  calories_burned?: number
  intensity_mets?: number
  metrics?: ActivityMetrics
  notes?: string | null
}

export interface ActivityListResponse {
  activities: Activity[]
  total: number
  limit: number
  offset: number
}

export interface SuccessResponse {
  success: boolean
  message: string
}

// UI helper types
export interface ActivityStat {
  icon: string
  label: string
  value: string | number
  unit?: string
}

export interface ActivityCategoryMeta {
  icon: string
  label: string
  color: string // Tailwind color class
}

// Activity category metadata for UI
export const ACTIVITY_CATEGORIES: Record<ActivityCategory, ActivityCategoryMeta> = {
  cardio_steady_state: {
    icon: '🏃',
    label: 'Cardio',
    color: 'text-iron-orange'
  },
  cardio_interval: {
    icon: '⚡',
    label: 'HIIT',
    color: 'text-iron-orange'
  },
  strength_training: {
    icon: '💪',
    label: 'Strength',
    color: 'text-iron-orange'
  },
  sports: {
    icon: '⚾',
    label: 'Sports',
    color: 'text-iron-orange'
  },
  flexibility: {
    icon: '🧘',
    label: 'Flexibility',
    color: 'text-iron-orange'
  },
  other: {
    icon: '🎯',
    label: 'Other',
    color: 'text-iron-gray'
  }
}
