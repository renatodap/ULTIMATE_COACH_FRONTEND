/**
 * Sentry Configuration for Error Tracking
 *
 * Initializes Sentry for production error monitoring
 */

import * as Sentry from '@sentry/nextjs'
import { env } from './env'

/**
 * Initialize Sentry
 * Only runs in production or when SENTRY_DSN is provided
 */
export function initSentry() {
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN

  if (!sentryDsn) {
    console.log('[Sentry] Not initialized - NEXT_PUBLIC_SENTRY_DSN not set')
    return
  }

  try {
    Sentry.init({
      dsn: sentryDsn,
      environment: env.NODE_ENV,

      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Capture Replay for 10% of all sessions,
      // plus 100% of sessions with an error
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Don't send errors in development
      enabled: env.NODE_ENV === 'production',

      // Ignore common errors that aren't actionable
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',
        // Network errors
        'Network request failed',
        'NetworkError',
        'Failed to fetch',
        // Random plugins/extensions
        'ResizeObserver loop',
      ],

      beforeSend(event, hint) {
        // Filter out errors from browser extensions
        if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
          frame => frame.filename?.includes('chrome-extension://')
        )) {
          return null
        }

        // Add custom tags
        if (event.tags) {
          event.tags.app = 'sharpened-frontend'
        }

        return event
      },
    })

    console.log('[Sentry] Initialized for', env.NODE_ENV)
  } catch (error) {
    console.warn('[Sentry] Failed to initialize:', error)
    // Continue without Sentry - don't break the app
  }
}

/**
 * Capture exception manually
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    })
  } else {
    // Fallback to console in development
    console.error('[Error]', error, context)
  }
}

/**
 * Capture message manually
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(message, level)
  } else {
    console.log('[Message]', message, level)
  }
}

/**
 * Set user context for Sentry
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  Sentry.setUser(user)
}

/**
 * Add breadcrumb (user action trail)
 */
export function addBreadcrumb(message: string, category?: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  })
}
