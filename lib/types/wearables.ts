/**
 * Wearables Type Definitions
 *
 * Type-safe interfaces for wearable device integration (Garmin, Whoop, etc.)
 * Used for syncing activity data from connected fitness devices.
 *
 * Backend Contract: app/models/wearables.py
 * Last Sync: 2025-11-04
 */

// ============================================================================
// WEARABLE PROVIDER TYPES
// ============================================================================

/**
 * Supported wearable device providers
 */
export type WearableProvider = 'garmin' | 'whoop' | 'fitbit' | 'apple_health' | 'strava'

/**
 * Connection status for a wearable account
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'pending' | 'error'

/**
 * Sync job status tracking
 */
export type SyncJobStatus =
  | 'pending'    // Job queued but not started
  | 'running'    // Job in progress
  | 'completed'  // Successfully completed
  | 'failed'     // Failed with error
  | 'partial'    // Partially completed with some errors

// ============================================================================
// WEARABLE ACCOUNT
// ============================================================================

/**
 * Connected wearable account details
 */
export interface WearableAccount {
  /** Wearable provider ID */
  provider: WearableProvider

  /** Account email/username */
  email: string

  /** Current connection status */
  status: ConnectionStatus

  /** ISO 8601 timestamp of connection */
  connected_at: string

  /** ISO 8601 timestamp of last successful sync (optional) */
  last_sync_at?: string | null

  /** Total activities synced (optional) */
  activities_synced?: number

  /** Last sync error message (if any) */
  last_error?: string | null
}

// ============================================================================
// SYNC JOB
// ============================================================================

/**
 * Background sync job details
 */
export interface SyncJob {
  /** Unique job ID */
  job_id: string

  /** Wearable provider being synced */
  provider: WearableProvider

  /** Current job status */
  status: SyncJobStatus

  /** ISO 8601 timestamp when job started */
  started_at: string

  /** ISO 8601 timestamp when job completed (optional) */
  completed_at?: string | null

  /** Number of days being synced */
  days_to_sync: number

  /** Number of activities synced so far */
  activities_synced: number

  /** Error message (if failed) */
  error_message?: string | null

  /** Progress percentage (0-100) */
  progress_percentage: number
}

// ============================================================================
// WEARABLE STATUS
// ============================================================================

/**
 * Complete wearable integration status
 *
 * Returned by: GET /api/v1/wearables/status
 */
export interface WearableStatus {
  /** List of connected wearable accounts */
  accounts: WearableAccount[]

  /** Latest sync job (if any) */
  latest_job?: SyncJob | null

  /** Total activities synced across all devices (optional - may not be implemented yet) */
  total_activities_synced?: number

  /** ISO 8601 timestamp of last sync across all devices */
  last_sync_at?: string | null
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Connect wearable request body
 */
export interface ConnectWearableRequest {
  /** Account email/username */
  email: string

  /** Account password */
  password: string
}

/**
 * Connect wearable response
 */
export interface ConnectWearableResponse {
  success: boolean
  message: string
  account?: WearableAccount
}

/**
 * Trigger sync request (inline or background)
 */
export interface TriggerSyncRequest {
  /** Number of days to sync (default: 7, max: 90) */
  days?: number
}

/**
 * Trigger sync response
 */
export interface TriggerSyncResponse {
  success: boolean
  message: string
  job?: SyncJob
  activities_synced?: number // For inline sync
}

/**
 * Disconnect wearable response
 */
export interface DisconnectWearableResponse {
  success: boolean
  message: string
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard: Check if provider is valid wearable provider
 */
export function isWearableProvider(provider: string): provider is WearableProvider {
  return ['garmin', 'whoop', 'fitbit', 'apple_health', 'strava'].includes(provider)
}

/**
 * Type guard: Check if account is connected
 */
export function isAccountConnected(account: WearableAccount): boolean {
  return account.status === 'connected'
}

/**
 * Type guard: Check if sync job is active
 */
export function isSyncJobActive(job: SyncJob): boolean {
  return job.status === 'pending' || job.status === 'running'
}

/**
 * Type guard: Check if sync job failed
 */
export function isSyncJobFailed(job: SyncJob): boolean {
  return job.status === 'failed' || job.status === 'partial'
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Wearable account summary (for display in UI)
 */
export interface WearableAccountSummary {
  provider: WearableProvider
  email: string
  status: ConnectionStatus
  lastSyncDate: Date | null
  activitiesSynced: number
}

/**
 * Transform WearableAccount to WearableAccountSummary
 */
export function toWearableAccountSummary(account: WearableAccount): WearableAccountSummary {
  return {
    provider: account.provider,
    email: account.email,
    status: account.status,
    lastSyncDate: account.last_sync_at ? new Date(account.last_sync_at) : null,
    activitiesSynced: account.activities_synced ?? 0,
  }
}

// ============================================================================
// PROVIDER METADATA
// ============================================================================

/**
 * Wearable provider display metadata
 */
export interface WearableProviderMeta {
  name: string
  icon: string // Emoji or icon identifier
  description: string
  authMethod: 'credentials' | 'oauth' | 'api_key'
  color: string // Tailwind color class
}

/**
 * Provider metadata for UI display
 */
export const WEARABLE_PROVIDER_META: Record<WearableProvider, WearableProviderMeta> = {
  garmin: {
    name: 'Garmin',
    icon: '⌚',
    description: 'Connect your Garmin account to sync activities',
    authMethod: 'credentials',
    color: 'text-blue-500',
  },
  whoop: {
    name: 'WHOOP',
    icon: '💪',
    description: 'Connect your WHOOP account for recovery and strain data',
    authMethod: 'oauth',
    color: 'text-red-500',
  },
  fitbit: {
    name: 'Fitbit',
    icon: '🏃',
    description: 'Sync your Fitbit activities and health metrics',
    authMethod: 'oauth',
    color: 'text-teal-500',
  },
  apple_health: {
    name: 'Apple Health',
    icon: '🍎',
    description: 'Import data from Apple Health (iOS only)',
    authMethod: 'api_key',
    color: 'text-iron-white',
  },
  strava: {
    name: 'Strava',
    icon: '🚴',
    description: 'Connect Strava to sync runs, rides, and other activities',
    authMethod: 'oauth',
    color: 'text-orange-500',
  },
}
