/**
 * Check-Ins API client
 *
 * Handles daily check-in and streak tracking API calls
 */

import { apiClient } from './client'

export interface CreateCheckInRequest {
  check_in_date: string // YYYY-MM-DD
  energy_level: number // 1-10
  hunger_level: number // 1-10
  stress_level: number // 1-10
  sleep_quality: number // 1-10
  motivation: number // 1-10
  notes?: string
}

export interface CheckInResponse {
  id: string
  user_id: string
  check_in_date: string
  energy_level: number
  hunger_level: number
  stress_level: number
  sleep_quality: number
  motivation: number
  notes: string | null
  adherence_score: number | null
  adaptive_deficit: number | null
  created_at: string
  updated_at: string
}

export interface UserStreakResponse {
  user_id: string
  current_streak: number
  longest_streak: number
  last_check_in_date: string | null
  total_check_ins: number
  created_at: string
  updated_at: string
}

/**
 * Get user's check-in streak data
 */
export async function getUserStreak(): Promise<UserStreakResponse> {
  return apiClient.get<UserStreakResponse>('/api/v1/check-ins/streak')
}

/**
 * Create or update daily check-in
 */
export async function createCheckIn(data: CreateCheckInRequest): Promise<CheckInResponse> {
  return apiClient.post<CheckInResponse>('/api/v1/check-ins', data)
}

/**
 * Get today's check-in (if exists)
 */
export async function getTodayCheckIn(): Promise<CheckInResponse> {
  return apiClient.get<CheckInResponse>('/api/v1/check-ins/today')
}

/**
 * Get recent check-ins
 */
export async function getRecentCheckIns(limit: number = 30): Promise<CheckInResponse[]> {
  return apiClient.get<CheckInResponse[]>(`/api/v1/check-ins?limit=${limit}`)
}
