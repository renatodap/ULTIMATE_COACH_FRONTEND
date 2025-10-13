/**
 * TypeScript interfaces for activity templates
 *
 * Matches backend Pydantic models exactly for type safety
 */

import { ActivityMetrics, Exercise } from './activities'

// Valid activity types (must match backend VALID_ACTIVITY_TYPES)
export type ActivityType =
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'strength_training'
  | 'yoga'
  | 'walking'
  | 'hiking'
  | 'sports'
  | 'flexibility'
  | 'cardio_steady_state'
  | 'cardio_interval'
  | 'other'

export interface ActivityTemplate {
  id: string
  user_id: string
  template_name: string
  activity_type: ActivityType
  description: string | null
  icon: string

  // Expected ranges for auto-matching
  expected_distance_m: number | null
  distance_tolerance_percent: number
  expected_duration_minutes: number | null
  duration_tolerance_percent: number

  // Pre-filled data for manual logs
  default_exercises: Exercise[]
  default_metrics: ActivityMetrics
  default_notes: string | null

  // Auto-matching configuration
  auto_match_enabled: boolean
  min_match_score: number
  require_gps_match: boolean

  // Time-based matching
  typical_start_time: string | null // HH:MM:SS
  time_window_hours: number
  preferred_days: number[] | null // 1=Monday, 7=Sunday

  // GPS data (feature flagged)
  gps_route_hash: string | null
  gps_track_id: string | null

  // Workout goals
  target_zone: string | null
  goal_notes: string | null

  // Usage tracking
  use_count: number
  last_used_at: string | null // ISO 8601

  // Metadata
  is_active: boolean
  created_from_activity_id: string | null
  created_at: string // ISO 8601
  updated_at: string // ISO 8601
}

export interface CreateTemplateRequest {
  template_name: string
  activity_type: ActivityType
  description?: string | null
  icon?: string

  // Expected ranges
  expected_distance_m?: number | null
  distance_tolerance_percent?: number
  expected_duration_minutes?: number | null
  duration_tolerance_percent?: number

  // Pre-filled data
  default_exercises?: Exercise[]
  default_metrics?: ActivityMetrics
  default_notes?: string | null

  // Auto-matching
  auto_match_enabled?: boolean
  min_match_score?: number
  require_gps_match?: boolean

  // Time-based matching
  typical_start_time?: string | null // HH:MM:SS
  time_window_hours?: number
  preferred_days?: number[] | null

  // Workout goals
  target_zone?: string | null
  goal_notes?: string | null

  // Metadata
  created_from_activity_id?: string | null
}

export interface UpdateTemplateRequest {
  template_name?: string
  activity_type?: ActivityType
  description?: string | null
  icon?: string

  expected_distance_m?: number | null
  distance_tolerance_percent?: number
  expected_duration_minutes?: number | null
  duration_tolerance_percent?: number

  default_exercises?: Exercise[]
  default_metrics?: ActivityMetrics
  default_notes?: string | null

  auto_match_enabled?: boolean
  min_match_score?: number
  require_gps_match?: boolean

  typical_start_time?: string | null
  time_window_hours?: number
  preferred_days?: number[] | null

  target_zone?: string | null
  goal_notes?: string | null

  is_active?: boolean
}

export interface TemplateStats {
  template_id: string
  total_uses: number

  // Performance metrics (null if no activities yet)
  avg_duration_minutes: number | null
  avg_distance_m: number | null
  avg_calories: number | null

  // Trends
  trend_pace_percent: number | null // Negative = getting faster
  trend_consistency_score: number | null // 0-100

  // Best performance
  best_activity_id: string | null
  best_performance_date: string | null // ISO 8601
  best_performance_metric: string | null

  // Usage timing
  first_used: string | null // ISO 8601
  last_used: string | null // ISO 8601
  days_since_last_use: number | null
}

export interface TemplateListResponse {
  templates: ActivityTemplate[]
  total: number
  limit: number
  offset: number
}

export interface CreateTemplateFromActivityRequest {
  template_name: string
  auto_match_enabled?: boolean
  require_gps_match?: boolean
}

export interface SuccessResponse {
  success: boolean
  message: string
}

// Template Matching Types

export interface MatchScoreBreakdown {
  type_score: number
  distance_score: number
  time_score: number
  day_score: number
  duration_score: number
  total: number
}

export interface MatchResult {
  template_id: string
  template_name: string
  match_score: number
  breakdown: MatchScoreBreakdown
  template: ActivityTemplate
}

export interface MatchSuggestions {
  excellent: MatchResult[]
  good: MatchResult[]
  fair: MatchResult[]
}

export interface ActivityDataForMatching {
  activity_type: string
  distance_km?: number
  duration_minutes?: number
  start_time?: string // ISO 8601
}

export interface MatchDecision {
  activity_id: string
  template_id: string
  match_score: number
  match_method: 'manual' | 'auto'
  user_decision: 'accepted' | 'rejected' | 'ignored'
}

// UI helper types
export interface ActivityTypeMeta {
  icon: string
  label: string
  color: string // Tailwind color class
  category: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other'
}

// Activity type metadata for UI
export const ACTIVITY_TYPE_META: Record<ActivityType, ActivityTypeMeta> = {
  running: {
    icon: '🏃',
    label: 'Running',
    color: 'text-iron-orange',
    category: 'cardio'
  },
  cycling: {
    icon: '🚴',
    label: 'Cycling',
    color: 'text-iron-orange',
    category: 'cardio'
  },
  swimming: {
    icon: '🏊',
    label: 'Swimming',
    color: 'text-iron-blue',
    category: 'cardio'
  },
  cardio_steady_state: {
    icon: '🏃',
    label: 'Steady Cardio',
    color: 'text-iron-orange',
    category: 'cardio'
  },
  cardio_interval: {
    icon: '⚡',
    label: 'HIIT',
    color: 'text-iron-orange',
    category: 'cardio'
  },
  strength_training: {
    icon: '💪',
    label: 'Strength',
    color: 'text-iron-orange',
    category: 'strength'
  },
  yoga: {
    icon: '🧘',
    label: 'Yoga',
    color: 'text-iron-green',
    category: 'flexibility'
  },
  walking: {
    icon: '🚶',
    label: 'Walking',
    color: 'text-iron-green',
    category: 'cardio'
  },
  hiking: {
    icon: '🥾',
    label: 'Hiking',
    color: 'text-iron-green',
    category: 'cardio'
  },
  sports: {
    icon: '⚾',
    label: 'Sports',
    color: 'text-iron-blue',
    category: 'sports'
  },
  flexibility: {
    icon: '🤸',
    label: 'Flexibility',
    color: 'text-iron-green',
    category: 'flexibility'
  },
  other: {
    icon: '🎯',
    label: 'Other',
    color: 'text-iron-gray',
    category: 'other'
  }
}

// Day of week helpers
export const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
  { value: 7, label: 'Sunday', short: 'Sun' }
]

// Helper to format time for display
export function formatTime(timeString: string | null): string {
  if (!timeString) return 'Not set'

  // timeString is HH:MM:SS
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours, 10)
  const minute = minutes.padStart(2, '0')
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

  return `${displayHour}:${minute} ${ampm}`
}

// Helper to format preferred days for display
export function formatPreferredDays(days: number[] | null): string {
  if (!days || days.length === 0) return 'Any day'
  if (days.length === 7) return 'Every day'

  return days
    .sort((a, b) => a - b)
    .map(day => DAYS_OF_WEEK.find(d => d.value === day)?.short || '')
    .filter(Boolean)
    .join(', ')
}

// Helper to format distance for display
export function formatDistance(meters: number | null): string {
  if (!meters) return 'Not set'

  const km = meters / 1000
  if (km >= 1) {
    return `${km.toFixed(2)} km`
  }
  return `${meters.toFixed(0)} m`
}

// Helper to format duration for display
export function formatDuration(minutes: number | null): string {
  if (!minutes) return 'Not set'

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${minutes}m`
}

// Helper to get activity type category for grouping
export function getActivityTypeCategory(activityType: ActivityType): string {
  return ACTIVITY_TYPE_META[activityType]?.category || 'other'
}

// Helper to group templates by category
export function groupTemplatesByCategory(templates: ActivityTemplate[]): Record<string, ActivityTemplate[]> {
  return templates.reduce((acc, template) => {
    const category = getActivityTypeCategory(template.activity_type)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(template)
    return acc
  }, {} as Record<string, ActivityTemplate[]>)
}
