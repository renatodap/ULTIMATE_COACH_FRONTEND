/**
 * TypeScript interfaces for dashboard API responses
 *
 * Matches backend Pydantic models exactly for type safety
 */

export interface TodayNutritionSummary {
  calories_consumed: number
  calories_goal: number | null
  calories_remaining: number | null
  protein_consumed: number
  protein_goal: number | null
  carbs_consumed: number
  carbs_goal: number | null
  fat_consumed: number
  fat_goal: number | null
  meals_count: number
  meals_by_type: Record<string, number>
}

export interface TodayActivitySummary {
  total_calories_burned: number
  total_duration_minutes: number
  average_intensity: number
  activity_count: number
  daily_goal_calories: number
  goal_percentage: number
}

export interface WeightProgressSummary {
  current_weight: number | null
  goal_weight: number | null
  latest_recorded_at: string | null
  previous_weight: number | null
  change_kg: number
  change_percentage: number
  trend_direction: 'up' | 'down' | 'stable'
  avg_change_per_week: number
  progress_percentage: number | null
  remaining_kg: number | null
}

export interface WeeklyStats {
  days_active: number
  days_with_meals: number
  total_workouts: number
  total_meals: number
  avg_calories_consumed: number | null
  avg_calories_burned: number | null
}

export interface DashboardSummary {
  user_id: string
  display_name: string | null
  nutrition: TodayNutritionSummary
  activity: TodayActivitySummary
  net_calories: number
  weight: WeightProgressSummary
  weekly: WeeklyStats
  date: string // YYYY-MM-DD
}
