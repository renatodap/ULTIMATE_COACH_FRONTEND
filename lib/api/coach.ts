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
  log_preview?: LogPreview           // Single log (backward compatible)
  log_previews?: LogPreview[]        // NEW: Multi-logging support
  multi_log?: boolean                // NEW: Flag for multiple logs
  log_count?: number                 // NEW: Total log count
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
  classification_confidence?: number  // NEW: How sure this is a log
  nutrition_confidence?: number       // NEW: How accurate the nutrition data is (meals only)
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

// NEW: Enriched meal item with food matching
export interface EnrichedMealItem {
  original_llm_text: string
  matched_food: {
    id: string
    name: string
    brand_name?: string
    calories_per_100g: number
    protein_g_per_100g: number
    carbs_g_per_100g: number
    fat_g_per_100g: number
    composition_type: string
  }
  match_confidence: number          // 0-100 score
  match_reason: string               // "user_history" | "fuzzy_search"
  alternatives: Array<{
    id: string
    name: string
    brand_name?: string
    calories_per_100g: number
  }>
  quantity: number
  unit: string
  estimated_grams: number
  calculated_nutrition: {
    grams: number
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }
  editable_fields: string[]          // ["quantity", "estimated_grams", "matched_food"]
  warnings: string[]                 // ["Low match confidence (72%) - verify this is correct"]
}

// NEW: Missing food that couldn't be matched
export interface MissingFood {
  name: string
  quantity?: number
  unit?: string
  estimated_grams?: number
  suggested_action: string           // "create_custom_food"
}

export interface NutritionLogData {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foods?: FoodItem[]                 // LLM extraction (before enrichment)
  meal_items?: MealItem[]            // Final confirmed items
  items?: EnrichedMealItem[]         // NEW: Enriched preview items with matching
  notes?: string
  logged_at?: string
  quick_entry_id?: string
  nutrition_summary?: {              // From backend enrichment
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }
  warnings?: string[]                // Top-level warnings
  missing_foods?: MissingFood[]      // Foods not found in database
  enrichment_metadata?: {            // Metadata about enrichment process
    total_items: number
    matched_items: number
    missing_items: number
    low_confidence_items: number
  }
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
  estimated_calories?: number        // OLD: Generic estimate (deprecated)
  personalized_calories?: {          // NEW: Personalized from enrichment service
    estimated: number
    base_mets: number
    adjusted_mets: number
    calculation_method: string       // "user_weight_and_fitness" | "blended_formula_and_history"
    factors: {
      user_weight_kg: number
      fitness_level: string
      fitness_multiplier: number
      intensity: string
      intensity_multiplier: number
    }
  }
  matched_activity?: {              // NEW: User history match
    id: string
    activity_name: string
    avg_duration_minutes: number
    avg_calories: number
    times_logged: number
    last_logged: string
  }
  match_reason?: string              // NEW: "user_history" | "category_default"
  match_confidence?: number          // NEW: 0-100 score
  similar_activities?: Array<{       // NEW: Top 3 similar activities
    id: string
    activity_name: string
    avg_calories: number
  }>
  editable_fields?: string[]         // NEW: ["duration_minutes", "intensity", "activity_name"]
  warnings?: string[]                // NEW: Validation warnings
  notes?: string
}

export interface MeasurementLogData {
  type: 'weight' | 'body_fat' | 'measurements'
  value: number
  unit: string
  date: Date
  notes?: string
  weight_kg?: number                 // NEW: Weight in kg
  body_fat_percentage?: number       // NEW: Body fat %
  recorded_at?: string               // NEW: ISO timestamp
  trend_analysis?: {                 // NEW: Trend from enrichment service
    last_measurement: {
      weight_kg: number
      recorded_at: string
      days_ago: number
    }
    change_from_last: {
      weight_kg: number
      weight_direction: 'up' | 'down' | 'stable'
      display_text: string           // "↓0.7 kg from last week"
    }
    progress_since_start: {
      first_measurement: {
        weight_kg: number
        recorded_at: string
      }
      total_change_kg: number
      direction: 'up' | 'down' | 'stable'
      display_text: string           // "↓7.5 kg total progress"
    }
    typical_range: {
      min_kg: number
      max_kg: number
      avg_kg: number
      measurements_count: number
    }
  }
  validation?: {                     // NEW: Validation results
    is_likely_typo: boolean
    is_physiologically_impossible: boolean
    is_unusual: boolean
    suggested_value: number | null
  }
  editable_fields?: string[]         // NEW: ["weight_kg", "body_fat_percentage", "recorded_at", "notes"]
  warnings?: string[]                // NEW: Validation warnings
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

// NEW: Batch confirmation request
export interface ConfirmLogsRequest {
  quick_entry_ids: string[]
  edits?: Record<string, Record<string, any>>  // Keyed by quick_entry_id
}

// NEW: Result for individual log in batch
export interface LogConfirmationResult {
  quick_entry_id: string
  success: boolean
  log_type?: string
  log_id?: string
  error?: string
}

// NEW: Batch confirmation response
export interface ConfirmLogsResponse {
  success: boolean  // True only if ALL logs confirmed
  results: LogConfirmationResult[]
  total_count: number
  success_count: number
  failed_count: number
  message: string
}

// ========== Helper Functions ==========

/**
 * Transform backend log_preview format to frontend LogPreview format
 *
 * Backend returns: { log_type: "meal", structured_data: { foods: [...], nutrition_summary: {...} } }
 * Frontend expects: { type: "nutrition", data: { meal_items: [...], nutrition_summary: {...} } }
 *
 * NEW: Supports multi-logging (can receive single log object or array)
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
      quick_entry_id: backendPreview.quick_entry_id,
      // Preserve nutrition_summary from backend enrichment
      nutrition_summary: backendPreview.structured_data.nutrition_summary
    };
  }

  // Preserve estimated_calories for activities
  if (frontendType === 'workout' && backendPreview.structured_data?.estimated_calories) {
    transformedData = {
      ...transformedData,
      estimated_calories: backendPreview.structured_data.estimated_calories
    };
  }

  return {
    type: frontendType,
    data: transformedData,
    confidence: backendPreview.confidence,
    classification_confidence: backendPreview.classification_confidence,
    nutrition_confidence: backendPreview.nutrition_confidence,
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
    console.log('[Coach API] Raw backend response:', {
      multi_log: response.multi_log,
      log_count: response.log_count,
      log_preview: response.log_preview,
      log_previews: response.log_previews
    });
  }

  // Transform log_previews array if present (NEW: Multi-logging support)
  if (response.log_previews && Array.isArray(response.log_previews)) {
    const transformed = response.log_previews
      .map(transformLogPreview)
      .filter((log): log is LogPreview => log !== null);

    console.log('[Coach API] Transformed log_previews array:', transformed);
    response.log_previews = transformed.length > 0 ? transformed : undefined;
  }
  // Backward compat: also transform single log_preview
  else if (response.log_preview) {
    const transformed = transformLogPreview(response.log_preview);
    console.log('[Coach API] Transformed single log_preview:', transformed);
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
 * Confirm multiple logs in a single batch operation
 *
 * Used for multi-logging scenarios where user sends one message that
 * generates multiple log previews (e.g., "I ate breakfast and lunch").
 *
 * @returns Detailed results for each log (which succeeded, which failed)
 */
export async function confirmLogs(request: ConfirmLogsRequest): Promise<ConfirmLogsResponse> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  return apiClient.post<ConfirmLogsResponse>('/api/v1/coach/confirm-logs', request, { headers });
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
