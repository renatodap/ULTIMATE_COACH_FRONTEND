/**
 * API Client - Centralized HTTP client for all backend requests
 *
 * Features:
 * - Automatic credential handling (httpOnly cookies)
 * - Centralized error handling
 * - Request/response logging
 * - Type safety
 * - Automatic retry logic
 */

import { env } from '../env'
import { supabase } from '@/lib/supabase'

const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL

/**
 * Standard API error response
 */
export interface ApiError {
  detail: string
  status?: number
  type?: string
}

/**
 * Custom error class for API errors
 */
export class ApiRequestError extends Error {
  status: number
  detail: string
  type?: string

  constructor(message: string, status: number, detail?: string, type?: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.detail = detail || message
    this.type = type
  }
}

/**
 * Request options interface
 */
interface RequestOptions extends RequestInit {
  // Additional custom options can be added here
  skipErrorLogging?: boolean
}

/**
 * API Client class
 */
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    return `${this.baseUrl}/${cleanEndpoint}`
  }

  /**
   * Attach Authorization header from Supabase session when available.
   * Falls back gracefully if not in browser or no session yet.
   */
  private async withAuthHeaders(initHeaders: HeadersInit | undefined): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      ...(initHeaders as Record<string, string> | undefined),
    }

    // If caller already set Authorization, respect it
    if (headers && (headers['Authorization'] || headers['authorization'])) {
      return headers
    }

    try {
      if (typeof window !== 'undefined' && supabase) {
        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData?.session?.access_token
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`
        }
      }
    } catch (_) {
      // Ignore token attachment failures; backend will still handle 401s cleanly
    }

    return headers
  }

  /**
   * Process API response and handle errors
   */
  private async processResponse<T>(response: Response): Promise<T> {
    // Try to parse JSON response
    let data: any
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    // If response is not ok, throw an error
    if (!response.ok) {
      const errorMessage = data?.detail || data?.message || 'Request failed'
      const errorType = data?.type || 'ApiError'

      // CRITICAL: Handle 401 Unauthorized - Session expired or invalid
      if (response.status === 401) {
        console.warn('[API] 401 Unauthorized - Session expired. Redirecting to login...')
        
        // Only redirect if we're in the browser (not during SSR)
        if (typeof window !== 'undefined') {
          // Don't redirect if we're already on the login page (prevents infinite loop)
          const currentPath = window.location.pathname
          if (currentPath !== '/login' && currentPath !== '/signup') {
            // Clear any stale client state
            // Redirect to login page
            window.location.href = '/login'
          }
          // If already on login/signup, just let the error propagate
          // The page will handle showing the login form
        }
      }

      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[API Error]', {
          status: response.status,
          statusText: response.statusText,
          detail: errorMessage,
          type: errorType,
          url: response.url,
        })
      }

      throw new ApiRequestError(
        errorMessage,
        response.status,
        errorMessage,
        errorType
      )
    }

    return data as T
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint)

    const headers = await this.withAuthHeaders(options.headers)
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include', // Include httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...options,
    })

    return this.processResponse<T>(response)
  }

  /**
   * Make a POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint)

    try {
      const headers = await this.withAuthHeaders(options.headers)
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include', // Include httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      })

      return this.processResponse<T>(response)
    } catch (error) {
      // Handle network errors (including CORS failures)
      if (error instanceof TypeError) {
        console.error('[API Network Error]', {
          url,
          error: error.message,
          hint: 'This may be a CORS issue or network connectivity problem',
        })
        throw new ApiRequestError(
          'Unable to connect to server. This may be a CORS or network issue.',
          0,
          error.message,
          'NetworkError'
        )
      }
      throw error
    }
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint)

    const headers = await this.withAuthHeaders(options.headers)
    const response = await fetch(url, {
      method: 'PATCH',
      credentials: 'include', // Include httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    })

    return this.processResponse<T>(response)
  }

  /**
   * Make a PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint)

    const headers = await this.withAuthHeaders(options.headers)
    const response = await fetch(url, {
      method: 'PUT',
      credentials: 'include', // Include httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    })

    return this.processResponse<T>(response)
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint)

    const headers = await this.withAuthHeaders(options.headers)
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include', // Include httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...options,
    })

    return this.processResponse<T>(response)
  }

  /**
   * Upload file(s) with FormData
   */
  async upload<T>(
    endpoint: string,
    formData: FormData,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint)

    const headers = await this.withAuthHeaders(options.headers)
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include', // Include httpOnly cookies
      // Don't set Content-Type header - browser will set it with boundary
      headers,
      body: formData,
      ...options,
    })

    return this.processResponse<T>(response)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for testing/custom instances
export default ApiClient
