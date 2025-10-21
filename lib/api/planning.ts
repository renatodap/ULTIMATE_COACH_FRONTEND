/*
  Planning API Client
  Uses NEXT_PUBLIC_API_BASE_URL
*/

export type CalendarEvent = {
  id: string
  user_id: string
  program_id: string
  date: string
  event_type: 'training' | 'multimodal' | 'meal'
  ref_table: 'session_instances' | 'meal_instances'
  ref_id: string
  title?: string
  details?: any
  status: 'planned' | 'completed' | 'similar' | 'skipped' | 'modified'
}

export type EnrichedCalendarEvent = CalendarEvent & { plan?: any }

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}

/**
 * Get the current active program for the authenticated user
 * User ID is automatically obtained from authentication
 */
export async function getCurrentProgram() {
  return http<{
    program_id: string
    primary_goal: string
    program_start_date: string
    next_reassessment_date: string
    tdee: number
    macros: any
    training_sessions: any[]
    meals: any[]
  }>(`/api/v1/programs/current`)
}

export async function getCalendarFull(userId: string, dateISO: string, range: 'day' | 'week') {
  return http<{ events: EnrichedCalendarEvent[] }>(`/api/v1/calendar/full?user_id=${userId}&date=${dateISO}&range=${range}`)
}

export async function getCalendarSummary(userId: string, startDate: string, endDate: string) {
  return http<{ summary: any[] }>(`/api/v1/calendar/summary?user_id=${userId}&start_date=${startDate}&end_date=${endDate}`)
}

export async function getOverridesToday(userId: string) {
  return http<{ date: string; overrides: any[] }>(`/api/v1/overrides/today?user_id=${userId}`)
}

export async function runOverrides(userId: string, programId: string, dryRun = true) {
  return http(`/api/v1/overrides/run`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, program_id: programId, dry_run: dryRun }),
  })
}

export async function postAdherence(req: {
  user_id: string
  planned_entity_type: 'session' | 'meal'
  planned_entity_id: string
  status: 'completed' | 'similar' | 'skipped'
  actual_ref_type?: 'activity' | 'meal'
  actual_ref_id?: string
  adherence_json?: any
  similarity_score?: number
}) {
  return http(`/api/v1/adherence`, { method: 'POST', body: JSON.stringify(req) })
}

export async function logAndAttachActivity(req: any) {
  return http(`/api/v1/planlogs/log_and_attach_activity`, {
    method: 'POST',
    body: JSON.stringify(req),
  })
}

export async function logAndAttachMeal(req: any) {
  return http(`/api/v1/planlogs/log_and_attach_meal`, {
    method: 'POST',
    body: JSON.stringify(req),
  })
}

export async function getNotifications(userId: string, since?: string) {
  const qs = since ? `&since=${encodeURIComponent(since)}` : ''
  return http<{ notifications: any[] }>(`/api/v1/notifications?user_id=${userId}${qs}`)
}

export async function markNotificationRead(userId: string, notificationId: string) {
  return http(`/api/v1/notifications/read`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, notification_id: notificationId }),
  })
}

/**
 * Generate a new personalized fitness plan
 *
 * Backend authentication provides user_id automatically via httpOnly cookie.
 * No need to send user_id in request body.
 *
 * @param forceRegenerate - If true, creates new plan even if one exists
 * @param programDurationWeeks - Program length in weeks (default: 12)
 * @param mealsPerDay - Meals per day (default: 3)
 *
 * Backend creates plan based on:
 * - Goals, experience level, workout frequency
 * - Training modalities, equipment access, schedule
 * - Dietary preferences, meal timing
 * - Constraints, challenges, improvement goals
 */
export async function generatePlan(options?: {
  forceRegenerate?: boolean
  programDurationWeeks?: number
  mealsPerDay?: number
}) {
  return http<{
    program_id: string
    user_id: string
    primary_goal: string
    program_start_date: string
    next_reassessment_date: string
    training_sessions_per_week: number
    daily_calorie_target: number
    macro_targets: any
    message: string
  }>(`/api/v1/programs/generate`, {
    method: 'POST',
    body: JSON.stringify({
      force_regenerate: options?.forceRegenerate || false,
      program_duration_weeks: options?.programDurationWeeks || 12,
      meals_per_day: options?.mealsPerDay || 3,
    }),
  })
}

