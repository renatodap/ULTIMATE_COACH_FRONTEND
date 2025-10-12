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

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include', // Include httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
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

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include', // Include httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    })

    return this.processResponse<T>(response)
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

    const response = await fetch(url, {
      method: 'PATCH',
      credentials: 'include', // Include httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
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

    const response = await fetch(url, {
      method: 'PUT',
      credentials: 'include', // Include httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
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

    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include', // Include httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
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

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include', // Include httpOnly cookies
      // Don't set Content-Type header - browser will set it with boundary
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
