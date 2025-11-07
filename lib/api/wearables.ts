import { apiClient } from './client'
import type { WearableStatus, SyncJob } from '@/lib/types/wearables'

/**
 * Wearables API Client
 *
 * Provides functions for wearable device integration:
 * - Get connection status and sync history
 * - Trigger background or inline sync jobs
 * - Connect new wearable accounts
 *
 * Types imported from @/lib/types/wearables for consistency
 */

export async function getWearableStatus(): Promise<WearableStatus> {
  return apiClient.get<WearableStatus>('/api/v1/wearables/status')
}

export async function triggerWearableSync(
  provider: string,
  days = 7
): Promise<{ enqueued: boolean; task_id?: string }> {
  return apiClient.post(`/api/v1/wearables/${provider}/sync?days=${days}`)
}

export async function triggerWearableSyncInline(
  provider: string,
  days = 7
): Promise<{ job: SyncJob; mode: string }> {
  return apiClient.post(`/api/v1/wearables/${provider}/sync-inline?days=${days}`)
}

export async function connectWearable(
  provider: string,
  credentials: { email: string; password: string }
) {
  return apiClient.post(`/api/v1/wearables/${provider}/connect`, {
    provider,
    credentials,
  })
}
