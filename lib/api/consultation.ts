/**
 * Consultation API Client
 *
 * Handles all API calls for the AI consultation system.
 * Consultation walks users through 7 sections to build a comprehensive profile
 * that generates personalized coaching prompts.
 */

import { apiClient } from './client'

// =====================================================
// Types
// =====================================================

/**
 * Response from starting a new consultation
 */
export interface StartConsultationResponse {
  success: boolean
  session_id: string
  message: string
  current_section: string
  sections_completed: number
  total_sections: number
  progress_percentage: number
  conversation_history?: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
}

/**
 * Response from sending a message in consultation
 */
export interface MessageResponse {
  success: boolean
  message: string
  extracted_items: number
  current_section: string
  sections_completed: number
  total_sections: number
  progress_percentage: number
  is_complete?: boolean
}

/**
 * Response from completing consultation
 */
export interface CompleteConsultationResponse {
  success: boolean
  message: string
  consultation_completed: boolean
  program_generated: boolean
  program_id?: string
  program_summary?: {
    duration_weeks: number
    sessions_per_week: number
    daily_calories: number
    start_date: string
    next_reassessment: string
  }
  program_error?: string
}

/**
 * Message in conversation
 */
export interface ConsultationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// =====================================================
// API Functions
// =====================================================

/**
 * Start a new consultation session
 *
 * Requires consultation_enabled=true on user profile.
 * Returns initial AI message and session_id.
 *
 * @throws {Error} If consultation not enabled (403) or other errors
 */
export async function startConsultation(): Promise<StartConsultationResponse> {
  return apiClient.post<StartConsultationResponse>('api/v1/consultation/start', {})
}

/**
 * Send a message in an active consultation session
 *
 * @param session_id - Active consultation session UUID
 * @param message - User's message text
 * @returns AI response, extracted data count, progress info
 */
export async function sendConsultationMessage(
  session_id: string,
  message: string
): Promise<MessageResponse> {
  return apiClient.post<MessageResponse>('api/v1/consultation/message', {
    session_id,
    message,
  })
}

/**
 * Complete consultation and generate personalized coaching prompt
 *
 * This takes 5-10 seconds as it:
 * 1. Generates 200-word conversational profile (~3 seconds)
 * 2. Generates 500-800 word system prompt (~5 seconds)
 * 3. Generates 2-week training/nutrition program
 *
 * @param session_id - Consultation session UUID
 * @returns Success status, program info
 */
export async function completeConsultation(
  session_id: string
): Promise<CompleteConsultationResponse> {
  return apiClient.post<CompleteConsultationResponse>(
    `api/v1/consultation/${session_id}/complete`,
    {}
  )
}
