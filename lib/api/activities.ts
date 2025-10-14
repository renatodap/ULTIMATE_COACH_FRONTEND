/**
 * Activities API client
 *
 * Handles all activity-related API calls to the backend
 */

import { apiClient } from './client'
import type {
  Activity,
  DailySummary,
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivityListResponse,
  SuccessResponse
} from '@/lib/types/activities'
import { supabase } from '@/lib/supabase'

/**
 * Get activities for authenticated user
 */
export async function getActivities(params?: {
  start_date?: string // YYYY-MM-DD
  end_date?: string   // YYYY-MM-DD
  limit?: number
  offset?: number
}): Promise<ActivityListResponse> {
  const queryParams = new URLSearchParams()

  if (params?.start_date) queryParams.append('start_date', params.start_date)
  if (params?.end_date) queryParams.append('end_date', params.end_date)
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset) queryParams.append('offset', params.offset.toString())

  const query = queryParams.toString()
  const endpoint = query ? `/api/v1/activities?${query}` : '/api/v1/activities'

  return apiClient.get<ActivityListResponse>(endpoint)
}

/**
 * Get daily activity summary
 */
export async function getDailySummary(params?: {
  target_date?: string // YYYY-MM-DD, defaults to today
}): Promise<DailySummary> {
  const queryParams = new URLSearchParams()

  if (params?.target_date) {
    queryParams.append('target_date', params.target_date)
  }

  const query = queryParams.toString()
  const endpoint = query
    ? `/api/v1/activities/summary?${query}`
    : '/api/v1/activities/summary'

  return apiClient.get<DailySummary>(endpoint)
}

/**
 * Get single activity by ID
 */
export async function getActivity(activityId: string): Promise<Activity> {
  return apiClient.get<Activity>(`/api/v1/activities/${activityId}`)
}

/**
 * Create new activity
 */
export async function createActivity(
  data: CreateActivityRequest
): Promise<Activity> {
  // Always get latest session (in case tokens expire/refresh)
  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData?.session?.access_token

  // Defensive: Automatically add supabase JWT to Authorization header if available (for future-proofing direct REST calls or proxy)
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }
  
  return apiClient.post<Activity>('/api/v1/activities', data, { headers })
}

/**
 * Update existing activity
 */
export async function updateActivity(
  activityId: string,
  data: UpdateActivityRequest
): Promise<Activity> {
  return apiClient.patch<Activity>(`/api/v1/activities/${activityId}`, data)
}

/**
 * Delete activity (soft delete)
 */
export async function deleteActivity(
  activityId: string
): Promise<SuccessResponse> {
  return apiClient.delete<SuccessResponse>(`/api/v1/activities/${activityId}`)
}
