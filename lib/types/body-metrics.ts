/**
 * TypeScript interfaces for body metrics tracking
 *
 * Matches backend Pydantic models exactly for type safety
 */

export interface BodyMetric {
  id: string
  user_id: string
  recorded_at: string // ISO 8601
  weight_kg: number
  body_fat_percentage: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateBodyMetricRequest {
  recorded_at: string // ISO 8601
  weight_kg: number
  body_fat_percentage?: number | null
  notes?: string | null
}

export interface UpdateBodyMetricRequest {
  recorded_at?: string
  weight_kg?: number
  body_fat_percentage?: number | null
  notes?: string | null
}

export interface BodyMetricListResponse {
  metrics: BodyMetric[]
  total: number
  limit: number
  offset: number
}

export interface WeightTrend {
  current_weight: number
  previous_weight: number | null
  change_kg: number
  change_percentage: number
  trend_direction: 'up' | 'down' | 'stable'
  days_between: number
  avg_change_per_week: number
}

export interface SuccessResponse {
  success: boolean
  message: string
}

// UI helper types
export interface WeightProgressData {
  date: string
  weight_kg: number
}
