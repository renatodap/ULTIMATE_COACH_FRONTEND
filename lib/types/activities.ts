/**
 * TypeScript interfaces for activity tracking
 *
 * Matches backend Pydantic models exactly for type safety
 */

export interface Activity {
  id: string
  user_id: string
  category: ActivityCategory
  activity_name: string
  start_time: string // ISO 8601
  end_time: string | null
  duration_minutes: number
  calories_burned: number
  intensity_mets: number
  metrics: ActivityMetrics
  notes: string | null
  created_at: string
  updated_at: string
}

export type ActivityCategory =
  | 'cardio_steady_state'
  | 'cardio_interval'
  | 'strength_training'
  | 'sports'
  | 'flexibility'
  | 'other'

export interface ActivityMetrics {
  // Cardio metrics
  distance_km?: number
  avg_heart_rate?: number
  max_heart_rate?: number
  avg_pace?: string // e.g., "5:47/km"
  elevation_gain_m?: number
  avg_speed_kph?: number

  // Strength training metrics
  exercises?: Exercise[]
  total_volume_kg?: number

  // Sports metrics
  sport_type?: string
  opponent?: string
  score?: string
  match_duration?: string

  // Flexibility metrics
  stretch_type?: string

  // Generic extensibility
  [key: string]: any
}

export interface Exercise {
  name: string
  sets: number
  reps: number
  weight_kg?: number
  rpe?: number // Rate of Perceived Exertion (1-10)
  rest_seconds?: number
  notes?: string
}

export interface DailySummary {
  total_calories_burned: number
  total_duration_minutes: number
  average_intensity: number // METs
  activity_count: number
  daily_goal_calories: number
  goal_percentage: number
}

export interface CreateActivityRequest {
  category: ActivityCategory
  activity_name: string
  start_time: string // ISO 8601
  end_time?: string | null
  duration_minutes?: number | null
  calories_burned?: number | null // Auto-calculated if not provided
  intensity_mets?: number | null // Auto-looked-up if not provided
  metrics?: ActivityMetrics
  notes?: string | null
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
