/**
 * Activity Templates API client
 *
 * Handles all template-related API calls to the backend
 */

import { apiClient } from './client'
import type {
  ActivityTemplate,
  TemplateStats,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateListResponse,
  CreateTemplateFromActivityRequest,
  SuccessResponse,
  ActivityType,
  MatchSuggestions,
  ActivityDataForMatching,
  MatchDecision
} from '@/lib/types/templates'
import { supabase } from '@/lib/supabase'

/**
 * Get activity templates for authenticated user
 */
export async function getTemplates(params?: {
  activity_type?: ActivityType
  is_active?: boolean
  limit?: number
  offset?: number
}): Promise<TemplateListResponse> {
  const queryParams = new URLSearchParams()

  if (params?.activity_type) queryParams.append('activity_type', params.activity_type)
  if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset) queryParams.append('offset', params.offset.toString())

  const query = queryParams.toString()
  const endpoint = query ? `/api/v1/templates?${query}` : '/api/v1/templates'

  return apiClient.get<TemplateListResponse>(endpoint)
}

/**
 * Get single template by ID
 */
export async function getTemplate(templateId: string): Promise<ActivityTemplate> {
  return apiClient.get<ActivityTemplate>(`/api/v1/templates/${templateId}`)
}

/**
 * Create new activity template
 */
export async function createTemplate(
  data: CreateTemplateRequest
): Promise<ActivityTemplate> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.post<ActivityTemplate>('/api/v1/templates', data, { headers });
}

/**
 * Create template from existing activity
 */
export async function createTemplateFromActivity(
  activityId: string,
  data: CreateTemplateFromActivityRequest
): Promise<ActivityTemplate> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.post<ActivityTemplate>(
    `/api/v1/templates/from-activity/${activityId}`,
    data,
    { headers }
  )
}

/**
 * Update existing template
 */
export async function updateTemplate(
  templateId: string,
  data: UpdateTemplateRequest
): Promise<ActivityTemplate> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.patch<ActivityTemplate>(`/api/v1/templates/${templateId}`, data, { headers });
}

/**
 * Delete template (soft delete)
 */
export async function deleteTemplate(
  templateId: string
): Promise<SuccessResponse> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.delete<SuccessResponse>(`/api/v1/templates/${templateId}`, { headers });
}

/**
 * Get template usage statistics
 */
export async function getTemplateStats(
  templateId: string
): Promise<TemplateStats> {
  return apiClient.get<TemplateStats>(`/api/v1/templates/${templateId}/stats`)
}

/**
 * Get activities using this template
 */
export async function getTemplateActivities(
  templateId: string,
  params?: {
    limit?: number
  }
): Promise<any[]> {
  const queryParams = new URLSearchParams()

  if (params?.limit) queryParams.append('limit', params.limit.toString())

  const query = queryParams.toString()
  const endpoint = query
    ? `/api/v1/templates/${templateId}/activities?${query}`
    : `/api/v1/templates/${templateId}/activities`

  return apiClient.get<any[]>(endpoint)
}

// ===== TEMPLATE MATCHING FUNCTIONS =====

/**
 * Get template match suggestions for activity data
 */
export async function getTemplateMatches(
  activityData: ActivityDataForMatching
): Promise<MatchSuggestions> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.post<MatchSuggestions>('/api/v1/templates/match', activityData, { headers });
}

/**
 * Apply template to activity
 */
export async function applyTemplateToActivity(
  templateId: string,
  activityId: string,
  matchScore?: number,
  matchMethod: 'manual' | 'auto' = 'manual'
): Promise<any> {
  const queryParams = new URLSearchParams()

  if (matchScore !== undefined) {
    queryParams.append('match_score', matchScore.toString())
  }
  queryParams.append('match_method', matchMethod)

  const query = queryParams.toString()
  const endpoint = `/api/v1/templates/${templateId}/apply/${activityId}?${query}`
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.post<any>(endpoint, {}, { headers });
}

/**
 * Record match decision for analytics
 */
export async function recordMatchDecision(
  decision: MatchDecision
): Promise<SuccessResponse> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.post<SuccessResponse>('/api/v1/templates/match/decision', decision, { headers });
}
