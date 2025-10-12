/**
 * Authentication API client
 *
 * Handles all auth-related API calls to the backend
 */

import { apiClient } from './client'

export interface SignupData {
  email: string
  password: string
  full_name?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    full_name?: string
    onboarding_completed: boolean
  }
  session: {
    access_token: string | null
    refresh_token: string | null
  }
}

/**
 * Sign up a new user
 */
export async function signup(data: SignupData): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('api/v1/auth/signup', data)
}

/**
 * Log in an existing user
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('api/v1/auth/login', data)
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
  return apiClient.post<{ access_token: string; refresh_token: string }>(
    'api/v1/auth/refresh',
    { refresh_token: refreshToken }
  )
}

/**
 * Log out the current user
 */
export async function logout(): Promise<void> {
  await apiClient.post('api/v1/auth/logout')
}
