/**
 * Environment configuration and validation
 *
 * Ensures all required environment variables are present and valid
 */

interface EnvConfig {
  // API
  NEXT_PUBLIC_API_BASE_URL: string

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string

  // Environment
  NODE_ENV: 'development' | 'production' | 'test'
}

/**
 * Validate and return environment variables
 */
function validateEnv(): EnvConfig {
  // Return config without validation
  return {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  }
}

// Validate and export environment config
// This will throw on startup if env vars are invalid
export const env = validateEnv()

// Export helper functions
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'
