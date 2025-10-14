/**
 * Body Metrics API client
 *
 * Handles all body metrics-related API calls to the backend
 */

import { apiClient } from './client'
import type {
  BodyMetric,
  CreateBodyMetricRequest,
  UpdateBodyMetricRequest,
  BodyMetricListResponse,
  WeightTrend,
  SuccessResponse
} from '@/lib/types/body-metrics'
import { supabase } from '@/lib/supabase'

/**
 * Get body metrics for authenticated user
 */
export async function getBodyMetrics(params?: {
  start_date?: string // YYYY-MM-DD
  end_date?: string   // YYYY-MM-DD
  limit?: number
  offset?: number
}): Promise<BodyMetricListResponse> {
  const queryParams = new URLSearchParams()

  if (params?.start_date) queryParams.append('start_date', params.start_date)
  if (params?.end_date) queryParams.append('end_date', params.end_date)
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset) queryParams.append('offset', params.offset.toString())

  const query = queryParams.toString()
  const endpoint = query ? `/api/v1/body-metrics?${query}` : '/api/v1/body-metrics'

  return apiClient.get<BodyMetricListResponse>(endpoint)
}

/**
 * Get latest body metric
 */
export async function getLatestBodyMetric(): Promise<BodyMetric> {
  return apiClient.get<BodyMetric>('/api/v1/body-metrics/latest')
}

/**
 * Get weight trend analysis
 */
export async function getWeightTrend(params?: {
  days?: number // Number of days to analyze (default: 7, max: 90)
}): Promise<WeightTrend> {
  const queryParams = new URLSearchParams()

  if (params?.days) {
    queryParams.append('days', params.days.toString())
  }

  const query = queryParams.toString()
  const endpoint = query
    ? `/api/v1/body-metrics/trend?${query}`
    : '/api/v1/body-metrics/trend'

  return apiClient.get<WeightTrend>(endpoint)
}

/**
 * Get single body metric by ID
 */
export async function getBodyMetric(metricId: string): Promise<BodyMetric> {
  return apiClient.get<BodyMetric>(`/api/v1/body-metrics/${metricId}`)
}

/**
 * Create new body metric
 */
export async function createBodyMetric(
  data: CreateBodyMetricRequest
): Promise<BodyMetric> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.post<BodyMetric>('/api/v1/body-metrics', data, { headers });
}

/**
 * Update existing body metric
 */
export async function updateBodyMetric(
  metricId: string,
  data: UpdateBodyMetricRequest
): Promise<BodyMetric> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.patch<BodyMetric>(`/api/v1/body-metrics/${metricId}`, data, { headers });
}

/**
 * Delete body metric
 */
export async function deleteBodyMetric(
  metricId: string
): Promise<SuccessResponse> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.delete<SuccessResponse>(`/api/v1/body-metrics/${metricId}`, { headers });
}
