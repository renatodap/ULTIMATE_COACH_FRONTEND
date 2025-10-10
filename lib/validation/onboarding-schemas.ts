/**
 * Zod validation schemas for onboarding forms
 */
import { z } from 'zod'

// ================================
// Helper Schemas
// ================================

export const audienceDemographicsSchema = z.object({
  age_range: z.string().optional(),
  location: z.string().optional(),
  income_level: z.string().optional(),
})

// ================================
// Step-by-Step Schemas
// ================================

export const step1Schema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters').max(100),
  industry: z.string().min(2, 'Industry must be at least 2 characters').max(100),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  target_audience: z.string().min(5, 'Target audience description must be at least 5 characters').max(200),
  audience_pain_points: z.array(z.string()).min(1, 'Add at least one pain point').max(10),
  audience_demographics: audienceDemographicsSchema.optional(),
})

export const step2Schema = z.object({
  brand_voice: z.string().min(3, 'Brand voice must be at least 3 characters').max(100),
  brand_personality: z.string().min(5, 'Brand personality description must be at least 5 characters').max(200),
  brand_values: z.array(z.string()).min(1, 'Add at least one brand value').max(10),
})

export const step3Schema = z.object({
  content_goals: z.array(z.string()).min(1, 'Select at least one content goal').max(10),
  key_topics: z.array(z.string()).min(1, 'Add at least one key topic').max(20),
  content_style_preferences: z.string().max(200).optional(),
  posting_frequency: z.string().max(50).optional(),
  best_performing_topics: z.array(z.string()).max(10).optional(),
  example_copy_they_like: z.string().min(50, 'Example must be at least 50 characters').max(2000).optional().or(z.literal('')),
  example_hooks: z.array(z.string()).max(10).optional(),
})

export const step4Schema = z.object({
  preferred_colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color')).max(5).optional(),
  visual_style: z.string().max(100).optional(),
})

export const step5Schema = z.object({
  competitors: z.array(z.string()).max(10).optional(),
  unique_selling_points: z.array(z.string()).min(1, 'Add at least one unique selling point').max(10),
  current_follower_count: z.number().int().nonnegative().optional(),
})

// ================================
// Complete Profile Schema
// ================================

export const businessProfileSchema = z.object({
  // Step 1
  business_name: z.string().min(2).max(100),
  industry: z.string().min(2).max(100),
  website_url: z.string().url().optional().or(z.literal('')),
  target_audience: z.string().min(5).max(200),
  audience_pain_points: z.array(z.string()).min(1).max(10),
  audience_demographics: audienceDemographicsSchema.optional(),

  // Step 2
  brand_voice: z.string().min(3).max(100),
  brand_personality: z.string().min(5).max(200),
  brand_values: z.array(z.string()).min(1).max(10),

  // Step 3
  content_goals: z.array(z.string()).min(1).max(10),
  key_topics: z.array(z.string()).min(1).max(20),
  content_style_preferences: z.string().max(200).optional(),
  posting_frequency: z.string().max(50).optional(),
  best_performing_topics: z.array(z.string()).max(10).optional(),
  example_copy_they_like: z.string().min(50).max(2000).optional().or(z.literal('')),
  example_hooks: z.array(z.string()).max(10).optional(),

  // Step 4
  preferred_colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).max(5).optional(),
  visual_style: z.string().max(100).optional(),

  // Step 5
  competitors: z.array(z.string()).max(10).optional(),
  unique_selling_points: z.array(z.string()).min(1).max(10),
  current_follower_count: z.number().int().nonnegative().optional(),
})

// ================================
// Type Exports
// ================================

export type Step1FormData = z.infer<typeof step1Schema>
export type Step2FormData = z.infer<typeof step2Schema>
export type Step3FormData = z.infer<typeof step3Schema>
export type Step4FormData = z.infer<typeof step4Schema>
export type Step5FormData = z.infer<typeof step5Schema>
export type BusinessProfileFormData = z.infer<typeof businessProfileSchema>
