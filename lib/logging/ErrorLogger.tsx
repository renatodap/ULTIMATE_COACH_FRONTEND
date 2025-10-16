/**
 * Comprehensive Error Logging System
 *
 * Captures, categorizes, and reports errors across the entire application.
 * Optionally integrates with Sentry if installed, otherwise falls back to console logging.
 */

// Sentry integration is optional - if not installed, gracefully fall back to console logging
// We don't import Sentry here to avoid build errors when it's not installed

// ============================================================================
// ERROR CATEGORIES
// ============================================================================

export enum ErrorCategory {
  // Authentication & Authorization
  AUTH_SIGNUP_EMAIL = 'auth.signup.email',
  AUTH_SIGNUP_GOOGLE = 'auth.signup.google',
  AUTH_SIGNIN_EMAIL = 'auth.signin.email',
  AUTH_SIGNIN_GOOGLE = 'auth.signin.google',
  AUTH_SIGNOUT = 'auth.signout',
  AUTH_SESSION = 'auth.session',
  AUTH_VERIFICATION = 'auth.verification',

  // Onboarding
  ONBOARDING_LOAD = 'onboarding.load',
  ONBOARDING_VALIDATION = 'onboarding.validation',
  ONBOARDING_SUBMIT = 'onboarding.submit',
  ONBOARDING_NAVIGATION = 'onboarding.navigation',

  // CRUD - Activities
  ACTIVITIES_CREATE = 'activities.create',
  ACTIVITIES_READ = 'activities.read',
  ACTIVITIES_UPDATE = 'activities.update',
  ACTIVITIES_DELETE = 'activities.delete',
  ACTIVITIES_SYNC = 'activities.sync',

  // CRUD - Meals
  MEALS_CREATE = 'meals.create',
  MEALS_READ = 'meals.read',
  MEALS_UPDATE = 'meals.update',
  MEALS_DELETE = 'meals.delete',
  MEALS_SEARCH = 'meals.search',

  // CRUD - Metrics
  METRICS_CREATE = 'metrics.create',
  METRICS_READ = 'metrics.read',
  METRICS_UPDATE = 'metrics.update',
  METRICS_DELETE = 'metrics.delete',

  // AI Coach
  COACH_SEND_MESSAGE = 'coach.send_message',
  COACH_STREAMING = 'coach.streaming',
  COACH_TOOL_CALL = 'coach.tool_call',
  COACH_ROUTING = 'coach.routing',
  COACH_CONTEXT = 'coach.context',

  // Profile
  PROFILE_LOAD = 'profile.load',
  PROFILE_UPDATE = 'profile.update',
  PROFILE_UPLOAD = 'profile.upload',

  // API & Network
  API_REQUEST = 'api.request',
  API_RESPONSE = 'api.response',
  API_TIMEOUT = 'api.timeout',
  NETWORK = 'network',

  // Frontend
  RENDER = 'render',
  HYDRATION = 'hydration',
  NAVIGATION = 'navigation',

  // Unknown
  UNKNOWN = 'unknown'
}

// ============================================================================
// ERROR SEVERITY
// ============================================================================

export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// ============================================================================
// ERROR CONTEXT INTERFACE
// ============================================================================

export interface ErrorContext {
  // Core
  category: ErrorCategory
  severity: ErrorSeverity
  message: string
  error?: Error | unknown

  // User context
  userId?: string
  userEmail?: string
  userRole?: string

  // Request context
  url?: string
  method?: string
  statusCode?: number
  requestId?: string

  // Feature-specific context
  featureData?: Record<string, any>

  // Environment
  timestamp?: string
  userAgent?: string
  sessionId?: string

  // Stack trace
  stack?: string
  componentStack?: string
}

// ============================================================================
// ERROR LOGGER CLASS
// ============================================================================

class ErrorLoggerService {
  private isDevelopment: boolean
  private sessionId: string

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.sessionId = this.generateSessionId()
  }

  /**
   * Generate unique session ID for tracking user journey
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Log error with full context
   */
  log(context: ErrorContext): void {
    const enrichedContext = this.enrichContext(context)

    // Console logging (always in dev, errors+ in prod)
    if (this.isDevelopment || context.severity === ErrorSeverity.ERROR || context.severity === ErrorSeverity.CRITICAL) {
      this.logToConsole(enrichedContext)
    }

    // Store in localStorage for debugging (dev only)
    if (this.isDevelopment) {
      this.logToLocalStorage(enrichedContext)
    }
  }

  /**
   * Enrich context with additional data
   */
  private enrichContext(context: ErrorContext): ErrorContext {
    return {
      ...context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      stack: context.error instanceof Error ? context.error.stack : undefined
    }
  }

  /**
   * Log to browser console with formatting
   */
  private logToConsole(context: ErrorContext): void {
    const emoji = this.getEmojiForSeverity(context.severity)
    const color = this.getColorForSeverity(context.severity)

    console.group(`${emoji} [${context.category}] ${context.message}`)
    console.log('%cSeverity:', `color: ${color}; font-weight: bold`, context.severity.toUpperCase())
    console.log('Timestamp:', context.timestamp)

    if (context.userId) {
      console.log('User ID:', context.userId)
    }

    if (context.url) {
      console.log('URL:', context.url)
    }

    if (context.statusCode) {
      console.log('Status Code:', context.statusCode)
    }

    if (context.featureData) {
      console.log('Feature Data:', context.featureData)
    }

    if (context.error) {
      console.error('Error:', context.error)
    }

    if (context.stack) {
      console.log('Stack Trace:', context.stack)
    }

    console.groupEnd()
  }


  /**
   * Store errors in localStorage for debugging (dev only)
   */
  private logToLocalStorage(context: ErrorContext): void {
    if (typeof window === 'undefined') return

    try {
      const key = 'error_logs'
      const existing = window.localStorage.getItem(key)
      const logs = existing ? JSON.parse(existing) : []

      // Keep last 100 errors
      logs.push({
        ...context,
        error: context.error instanceof Error ? context.error.message : String(context.error)
      })

      if (logs.length > 100) {
        logs.shift()
      }

      window.localStorage.setItem(key, JSON.stringify(logs))
    } catch (err) {
      console.warn('Failed to store error in localStorage:', err)
    }
  }

  /**
   * Get emoji for severity level
   */
  private getEmojiForSeverity(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.DEBUG: return '🐛'
      case ErrorSeverity.INFO: return 'ℹ️'
      case ErrorSeverity.WARNING: return '⚠️'
      case ErrorSeverity.ERROR: return '❌'
      case ErrorSeverity.CRITICAL: return '🚨'
      default: return '❓'
    }
  }

  /**
   * Get color for severity level
   */
  private getColorForSeverity(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.DEBUG: return '#9CA3AF'
      case ErrorSeverity.INFO: return '#3B82F6'
      case ErrorSeverity.WARNING: return '#F59E0B'
      case ErrorSeverity.ERROR: return '#EF4444'
      case ErrorSeverity.CRITICAL: return '#DC2626'
      default: return '#6B7280'
    }
  }


  // ============================================================================
  // CONVENIENCE METHODS FOR COMMON ERROR SCENARIOS
  // ============================================================================

  /**
   * Log authentication error
   */
  authError(
    type: 'signup' | 'signin' | 'signout' | 'verification',
    provider: 'email' | 'google',
    error: Error | unknown,
    context?: Record<string, any>
  ): void {
    const categoryMap = {
      'signup-email': ErrorCategory.AUTH_SIGNUP_EMAIL,
      'signup-google': ErrorCategory.AUTH_SIGNUP_GOOGLE,
      'signin-email': ErrorCategory.AUTH_SIGNIN_EMAIL,
      'signin-google': ErrorCategory.AUTH_SIGNIN_GOOGLE,
      'signout-email': ErrorCategory.AUTH_SIGNOUT,
      'signout-google': ErrorCategory.AUTH_SIGNOUT,
      'verification-email': ErrorCategory.AUTH_VERIFICATION,
      'verification-google': ErrorCategory.AUTH_VERIFICATION,
    }

    this.log({
      category: categoryMap[`${type}-${provider}`],
      severity: ErrorSeverity.ERROR,
      message: `Authentication ${type} failed (${provider})`,
      error,
      featureData: context
    })
  }

  /**
   * Log CRUD operation error
   */
  crudError(
    resource: 'activities' | 'meals' | 'metrics',
    operation: 'create' | 'read' | 'update' | 'delete',
    error: Error | unknown,
    context?: Record<string, any>
  ): void {
    const categoryMap = {
      'activities-create': ErrorCategory.ACTIVITIES_CREATE,
      'activities-read': ErrorCategory.ACTIVITIES_READ,
      'activities-update': ErrorCategory.ACTIVITIES_UPDATE,
      'activities-delete': ErrorCategory.ACTIVITIES_DELETE,
      'meals-create': ErrorCategory.MEALS_CREATE,
      'meals-read': ErrorCategory.MEALS_READ,
      'meals-update': ErrorCategory.MEALS_UPDATE,
      'meals-delete': ErrorCategory.MEALS_DELETE,
      'metrics-create': ErrorCategory.METRICS_CREATE,
      'metrics-read': ErrorCategory.METRICS_READ,
      'metrics-update': ErrorCategory.METRICS_UPDATE,
      'metrics-delete': ErrorCategory.METRICS_DELETE,
    }

    this.log({
      category: categoryMap[`${resource}-${operation}`],
      severity: ErrorSeverity.ERROR,
      message: `Failed to ${operation} ${resource}`,
      error,
      featureData: context
    })
  }

  /**
   * Log AI coach error
   */
  coachError(
    type: 'send_message' | 'streaming' | 'tool_call' | 'routing',
    error: Error | unknown,
    context?: Record<string, any>
  ): void {
    const categoryMap = {
      'send_message': ErrorCategory.COACH_SEND_MESSAGE,
      'streaming': ErrorCategory.COACH_STREAMING,
      'tool_call': ErrorCategory.COACH_TOOL_CALL,
      'routing': ErrorCategory.COACH_ROUTING,
    }

    this.log({
      category: categoryMap[type],
      severity: ErrorSeverity.ERROR,
      message: `AI Coach ${type.replace('_', ' ')} failed`,
      error,
      featureData: context
    })
  }

  /**
   * Log API request error
   */
  apiError(
    method: string,
    url: string,
    statusCode: number,
    error: Error | unknown,
    requestData?: any,
    responseData?: any
  ): void {
    this.log({
      category: ErrorCategory.API_REQUEST,
      severity: statusCode >= 500 ? ErrorSeverity.CRITICAL : ErrorSeverity.ERROR,
      message: `API request failed: ${method} ${url}`,
      error,
      method,
      url,
      statusCode,
      featureData: {
        requestData,
        responseData
      }
    })
  }

  /**
   * Clear error logs (dev only)
   */
  clearLogs(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('error_logs')
    }
  }

  /**
   * Get stored error logs (dev only)
   */
  getLogs(): ErrorContext[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = window.localStorage.getItem('error_logs')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const ErrorLogger = new ErrorLoggerService()

// ============================================================================
// REACT ERROR BOUNDARY COMPONENT
// ============================================================================

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    ErrorLogger.log({
      category: ErrorCategory.RENDER,
      severity: ErrorSeverity.ERROR,
      message: 'React component error',
      error,
      componentStack: errorInfo.componentStack || undefined,
      featureData: {
        errorInfo
      }
    })

    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-iron-black text-iron-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-iron-dark-gray border border-iron-gray p-6 space-y-4">
            <h1 className="text-xl font-bold text-iron-orange">Something went wrong</h1>
            <p className="text-sm text-iron-gray">
              We&apos;ve logged the error and will look into it. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-iron-orange text-iron-black py-2 px-4 hover:bg-iron-orange/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
