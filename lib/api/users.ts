/**
 * Users API client
 *
 * Handles all user-related API calls (requires authentication)
 */

import { apiClient } from './client'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  onboarding_completed: boolean
  created_at?: string
  updated_at?: string
}

export interface UpdateProfileData {
  full_name?: string
}

/**
 * Get current user profile
 * Requires authentication (httpOnly cookie)
 */
export async function getCurrentUser(): Promise<UserProfile> {
  return apiClient.get<UserProfile>('api/v1/users/me')
}

/**
 * Update current user profile
 * Requires authentication (httpOnly cookie)
 */
export async function updateCurrentUser(data: UpdateProfileData): Promise<UserProfile> {
  return apiClient.patch<UserProfile>('api/v1/users/me', data)
}
