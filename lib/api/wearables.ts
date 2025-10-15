import { apiClient } from './client'

export interface WearableStatus {
  accounts: any[]
  latest_job?: any
  providers: string[]
}

export async function getWearableStatus(): Promise<WearableStatus> {
  return apiClient.get<WearableStatus>('/api/v1/wearables/status')
}

export async function triggerWearableSync(provider: string, days = 7): Promise<{ enqueued: boolean; task_id?: string }> {
  return apiClient.post(`/api/v1/wearables/${provider}/sync?days=${days}`)
}

