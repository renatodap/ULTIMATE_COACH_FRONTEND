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
  const config = {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  }

  // Only validate in production builds (not during runtime)
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    const missing: string[] = []

    if (!config.NEXT_PUBLIC_API_BASE_URL) {
      missing.push('NEXT_PUBLIC_API_BASE_URL')
    }
    if (!config.NEXT_PUBLIC_SUPABASE_URL) {
      missing.push('NEXT_PUBLIC_SUPABASE_URL')
    }
    if (!config.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    if (missing.length > 0) {
      const errorMessage = [
        '\n❌ Missing required environment variables:',
        ...missing.map(key => `   - ${key}`),
        '\nPlease check your .env.local file or Vercel environment variables.',
        'See vercel-env-setup.txt for configuration guide.\n',
      ].join('\n')

      throw new Error(errorMessage)
    }
  }

  return config
}

// Validate and export environment config
// This will throw on startup if env vars are invalid
export const env = validateEnv()

// Export helper functions
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'
