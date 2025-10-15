/**
 * Dashboard API client
 *
 * Handles dashboard summary API calls to the backend
 */

import { apiClient } from './client'
import type { DashboardSummary } from '@/lib/types/dashboard'

/**
 * Get complete dashboard summary
 *
 * Aggregates nutrition, activities, body metrics, and weekly stats
 * in a single optimized API call for better mobile performance.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiClient.get<DashboardSummary>('/api/v1/dashboard/summary')
}
