/**
 * AuthErrorMessage Component
 *
 * Professional error message component for authentication pages.
 * Uses app design system (iron-* colors) for consistency.
 *
 * Features:
 * - Consistent styling across all auth pages
 * - Icon for visual emphasis
 * - User-friendly error messages
 * - Dismissable
 */

interface AuthErrorMessageProps {
  message: string
  onDismiss?: () => void
}

export default function AuthErrorMessage({ message, onDismiss }: AuthErrorMessageProps) {
  if (!message) return null

  return (
    <div className="bg-iron-orange/10 border-2 border-iron-orange p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Error Icon */}
        <svg
          className="w-5 h-5 flex-shrink-0 mt-0.5 text-iron-orange"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        {/* Error Message */}
        <div className="flex-1">
          <p className="text-iron-orange font-semibold text-sm">
            {message}
          </p>
        </div>

        {/* Dismiss Button (optional) */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 text-iron-orange hover:text-iron-white transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * AuthSuccessMessage Component
 *
 * Professional success message component for authentication pages.
 */

interface AuthSuccessMessageProps {
  message: string
  onDismiss?: () => void
}

export function AuthSuccessMessage({ message, onDismiss }: AuthSuccessMessageProps) {
  if (!message) return null

  return (
    <div className="bg-success/10 border-2 border-success p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Success Icon */}
        <svg
          className="w-5 h-5 flex-shrink-0 mt-0.5 text-success"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        {/* Success Message */}
        <div className="flex-1">
          <p className="text-success font-semibold text-sm">
            {message}
          </p>
        </div>

        {/* Dismiss Button (optional) */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 text-success hover:text-iron-white transition-colors"
            aria-label="Dismiss message"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Error message mapper
 * Maps technical errors to user-friendly messages
 */
export function getUserFriendlyErrorMessage(error: any): string {
  const message = error?.detail || error?.message || String(error)
  const lowerMessage = message.toLowerCase()

  // Map common errors to user-friendly messages
  if (lowerMessage.includes('invalid credentials') || lowerMessage.includes('invalid email or password')) {
    return 'Email or password is incorrect. Please try again.'
  }

  if (lowerMessage.includes('email not confirmed') || lowerMessage.includes('verify your email')) {
    return 'Please verify your email before signing in. Check your inbox for the confirmation link.'
  }

  if (lowerMessage.includes('user already exists') || lowerMessage.includes('already registered')) {
    return 'This email is already registered. Try signing in instead.'
  }

  if (lowerMessage.includes('password') && lowerMessage.includes('weak')) {
    return 'Password is too weak. Please use 8+ characters with uppercase, lowercase, numbers, and symbols.'
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('cors')) {
    return 'Unable to connect to server. Please check your internet connection and try again.'
  }

  if (lowerMessage.includes('timeout')) {
    return 'Request timed out. Please check your internet connection and try again.'
  }

  if (lowerMessage.includes('session') && lowerMessage.includes('expired')) {
    return 'Your session has expired. Please sign in again.'
  }

  if (lowerMessage.includes('too many requests') || lowerMessage.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }

  // If no specific mapping, return a generic but professional message
  // Don't expose technical details to users
  return 'An error occurred. Please try again or contact support if the problem persists.'
}
