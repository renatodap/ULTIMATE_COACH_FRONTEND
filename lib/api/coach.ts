/**
 * Coach API Client
 *
 * Handles all AI coach-related API calls to the backend
 */

import { apiClient } from './client'
import { supabase } from '@/lib/supabase'

// ========== Types ==========

export interface SendMessageRequest {
  message: string
  conversation_id?: string
  image_base64?: string
}

export interface SendMessageResponse {
  success: boolean
  conversation_id: string
  message_id: string
  message: string
  is_log_preview: boolean
  log_preview?: LogPreview
  tokens_used?: number
  cost_usd?: number
  model?: string
  tools_used?: string[]
  error?: string
}

export interface LogPreview {
  id?: string
  type: 'nutrition' | 'workout' | 'measurement'
  data: NutritionLogData | WorkoutLogData | MeasurementLogData
  confidence?: number
}

export interface NutritionLogData {
  foodName: string
  amount: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  time?: Date
}

export interface WorkoutLogData {
  activityType: string
  exercises?: Array<{
    name: string
    sets: number
    reps: number
    weight?: string
    notes?: string
  }>
  duration?: number // minutes
  intensity?: 'low' | 'moderate' | 'high'
  caloriesBurned?: number
  notes?: string
}

export interface MeasurementLogData {
  type: 'weight' | 'body_fat' | 'measurements'
  value: number
  unit: string
  date: Date
  notes?: string
}

export interface ConversationHistory {
  conversation_id: string
  messages: Message[]
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'text' | 'nutrition_log' | 'workout_log' | 'error'
  metadata?: {
    model?: string
    tokens?: number
    cost?: number
    toolsUsed?: string[]
  }
}

export interface ConfirmLogRequest {
  conversation_id: string
  log_preview_id?: string
  data: any
}

// ========== API Functions ==========

/**
 * Send a message to the AI coach
 */
export async function sendCoachMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.post<SendMessageResponse>('/api/v1/coach/message', request, { headers });
}

/**
 * Get conversation history
 */
export async function getConversationHistory(conversationId: string): Promise<ConversationHistory> {
  return apiClient.get<ConversationHistory>(`/api/v1/coach/conversations/${conversationId}`)
}

/**
 * Get all user conversations (list)
 */
export async function getUserConversations(): Promise<ConversationHistory[]> {
  return apiClient.get<ConversationHistory[]>('/api/v1/coach/conversations')
}

/**
 * Confirm a log preview and save to database
 */
export async function confirmLog(request: ConfirmLogRequest): Promise<{ success: boolean; message: string }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.post<{ success: boolean; message: string }>('/api/v1/coach/confirm-log', request, { headers });
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return apiClient.delete<void>(`/api/v1/coach/conversations/${conversationId}`, { headers });
}
