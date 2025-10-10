/**
 * TypeScript types for onboarding and business profile
 * Matches backend models from app/models/requests.py and app/models/responses.py
 */

// ================================
// Core Data Types
// ================================

export interface AudienceDemographics {
  age_range?: string
  location?: string
  income_level?: string
}

export interface BusinessProfileData {
  // Step 1: Business Basics
  business_name: string
  industry: string
  website_url?: string
  target_audience: string
  audience_pain_points: string[]
  audience_demographics?: AudienceDemographics

  // Step 2: Brand Voice & Identity
  brand_voice: string
  brand_personality: string
  brand_values: string[]

  // Step 3: Content Strategy
  content_goals: string[]
  key_topics: string[]
  content_style_preferences?: string
  posting_frequency?: string
  best_performing_topics?: string[]

  // Step 4: Visual Identity
  preferred_colors?: string[]
  visual_style?: string

  // Step 5: Competitive Edge
  competitors?: string[]
  unique_selling_points: string[]

  // Tone Examples (Critical for quality)
  example_copy_they_like?: string
  example_hooks?: string[]

  // Instagram specifics
  current_follower_count?: number
}

// ================================
// API Request Types
// ================================

export interface UpdateOnboardingStepRequest {
  step: number // 1-5
  data: Record<string, any>
}

export interface CompleteOnboardingRequest {
  profile_data: BusinessProfileData
}

export interface UpdateBusinessProfileRequest {
  profile_data: BusinessProfileData
}

// ================================
// API Response Types
// ================================

export interface OnboardingProgressResponse {
  id: string
  user_id: string
  current_step: number
  total_steps: number
  completed: boolean
  partial_data: Record<string, any>
  started_at: string
  last_updated_at: string
  completed_at?: string
}

export interface BusinessProfileResponse {
  id: string
  user_id: string
  profile_data: Record<string, any>
  business_name?: string
  industry?: string
  target_audience?: string
  brand_voice?: string
  completion_percentage: number
  completed_sections: string[]
  onboarding_completed: boolean
  onboarding_completed_at?: string
  profile_last_updated_at: string
  created_at: string
  updated_at: string
  has_business_embedding: boolean
  has_style_embedding: boolean
  has_topic_embeddings: boolean
}

export interface ProfileCompletionStatusResponse {
  user_id: string
  completion_percentage: number
  completed_sections: string[]
  missing_sections: string[]
  onboarding_completed: boolean
  profile_exists: boolean
  recommendations: string[]
}

// ================================
// Form Step Types
// ================================

export interface Step1Data {
  business_name: string
  industry: string
  website_url?: string
  target_audience: string
  audience_pain_points: string[]
  audience_demographics?: AudienceDemographics
}

export interface Step2Data {
  brand_voice: string
  brand_personality: string
  brand_values: string[]
}

export interface Step3Data {
  content_goals: string[]
  key_topics: string[]
  content_style_preferences?: string
  posting_frequency?: string
  best_performing_topics?: string[]
  example_copy_they_like?: string
  example_hooks?: string[]
}

export interface Step4Data {
  preferred_colors?: string[]
  visual_style?: string
}

export interface Step5Data {
  competitors?: string[]
  unique_selling_points: string[]
  current_follower_count?: number
}

// ================================
// UI State Types
// ================================

export interface OnboardingState {
  currentStep: number
  totalSteps: number
  progress: OnboardingProgressResponse | null
  isLoading: boolean
  error: string | null
}
