/**
 * Coach API Client
 *
 * Handles all AI coach-related API calls to the backend
 */

import { apiClient } from './client'
import { supabase } from '@/lib/supabase'

// ========== Types ==========

export interface TimeAwareProgress {
  actual_progress: number
  expected_progress: number
  deviation: number
  interpretation: string
  message_suggestion: string
}

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
  waiting_for_clarification?: boolean
  nutrition_confidence?: number
  classification_confidence?: number
  tokens_used?: number
  cost_usd?: number
  model?: string
  tools_used?: string[]
  error?: string
  time_aware_progress?: TimeAwareProgress
}

export interface LogPreview {
  id?: string
  type: 'nutrition' | 'workout' | 'measurement'
  data: NutritionLogData | WorkoutLogData | MeasurementLogData
  confidence?: number
}

export interface MealItem {
  food_id: string
  food_name: string
  quantity: number
  unit: string
  display_label?: string
  grams: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface FoodItem {
  name: string
  quantity_g: number
  estimated?: boolean
}

export interface NutritionLogData {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foods?: FoodItem[]
  meal_items?: MealItem[]
  notes?: string
  logged_at?: string
  quick_entry_id?: string
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
  quick_entry_id: string
  edits?: Record<string, any>
}

// ========== Helper Functions ==========

/**
 * Transform backend log_preview format to frontend LogPreview format
 *
 * Backend returns: { log_type: "meal", structured_data: { foods: [...] } }
 * Frontend expects: { type: "nutrition", data: { meal_items: [...] } }
 */
function transformLogPreview(backendPreview: any): LogPreview | null {
  if (!backendPreview) return null;

  // Map backend log_type to frontend type
  const typeMap: Record<string, 'nutrition' | 'workout' | 'measurement'> = {
    'meal': 'nutrition',
    'activity': 'workout',
    'measurement': 'measurement'
  };

  const frontendType = typeMap[backendPreview.log_type];
  if (!frontendType) {
    console.warn(`Unknown log_type: ${backendPreview.log_type}`);
    return null;
  }

  // Transform data structure for nutrition logs
  let transformedData = backendPreview.structured_data;

  if (frontendType === 'nutrition' && backendPreview.structured_data?.foods) {
    // Backend sends "foods", frontend expects "meal_items"
    // Transform foods array to meal_items format
    const meal_items = backendPreview.structured_data.foods.map((food: any) => ({
      food_id: food.food_id || '',
      food_name: food.name,
      quantity: food.quantity || food.estimated_grams || 0,
      unit: food.unit || 'g',
      display_label: food.unit !== 'grams' ? food.unit : undefined,
      grams: food.estimated_grams || food.quantity || 0,
      calories: food.calories || 0,
      protein_g: food.protein_g || 0,
      carbs_g: food.carbs_g || 0,
      fat_g: food.fat_g || 0
    }));

    transformedData = {
      ...backendPreview.structured_data,
      meal_items,
      quick_entry_id: backendPreview.quick_entry_id
    };
  }

  return {
    type: frontendType,
    data: transformedData,
    confidence: backendPreview.confidence,
    id: backendPreview.quick_entry_id
  };
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

  const response = await apiClient.post<SendMessageResponse>('/api/v1/coach/message', request, { headers });

  // Debug: Log raw backend response
  if (response.is_log_preview) {
    console.log('[Coach API] Raw backend log_preview:', response.log_preview);
  }

  // Transform log_preview if present
  if (response.log_preview) {
    const transformed = transformLogPreview(response.log_preview);
    console.log('[Coach API] Transformed log_preview:', transformed);
    response.log_preview = transformed || undefined;
  }

  return response;
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
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
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
