/**
 * API Proxy Route - Forwards requests to Railway backend
 *
 * Purpose: Solve third-party cookie blocking by making all API calls same-origin.
 *
 * How it works:
 * 1. Browser makes request to www.sharpened.me/api/proxy/* (same-origin)
 * 2. Next.js server forwards request to Railway backend
 * 3. Railway backend sets cookies in response
 * 4. Next.js forwards cookies to browser
 * 5. Browser stores cookies (no third-party blocking!)
 *
 * This route handles ALL HTTP methods (GET, POST, PATCH, PUT, DELETE, OPTIONS)
 */

import { NextRequest, NextResponse } from 'next/server'

// Railway backend URL (set in environment variables)
const RAILWAY_API_URL = process.env.RAILWAY_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

/**
 * Forward request to Railway backend and return response with cookies
 */
async function proxyRequest(req: NextRequest, method: string): Promise<NextResponse> {
  try {
    // Extract path from URL (everything after /api/proxy/)
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/api/proxy/').slice(1)
    const targetPath = pathSegments.join('/')
    const queryString = url.search

    // Build target URL
    const targetUrl = `${RAILWAY_API_URL}/${targetPath}${queryString}`

    console.log(`[API Proxy] ${method} ${targetPath}${queryString} -> ${targetUrl}`)

    // Build request headers (forward most headers, but not all)
    const headers = new Headers()
    const headersToForward = [
      'content-type',
      'authorization',
      'accept',
      'accept-language',
      'user-agent',
    ]

    headersToForward.forEach(header => {
      const value = req.headers.get(header)
      if (value) {
        headers.set(header, value)
      }
    })

    // Forward cookies from browser request to Railway
    const cookieHeader = req.headers.get('cookie')
    if (cookieHeader) {
      headers.set('cookie', cookieHeader)
    }

    // If Authorization is missing, attempt to derive from cookies
    if (!headers.get('authorization') && cookieHeader) {
      // Try multiple cookie names in order of preference
      // 1. Backend's expected cookie name
      const accessTokenMatch = cookieHeader.match(/access_token=([^;]+)/)
      if (accessTokenMatch?.[1]) {
        try {
          const token = decodeURIComponent(accessTokenMatch[1])
          headers.set('authorization', `Bearer ${token}`)
          console.log('[API Proxy] Using access_token cookie for authorization')
        } catch (err) {
          console.error('[API Proxy] Failed to decode access_token:', err)
        }
      }
      // 2. Supabase cookie name (fallback)
      else {
        const sbAccessMatch = cookieHeader.match(/sb-access-token=([^;]+)/)
        if (sbAccessMatch?.[1]) {
          try {
            const token = decodeURIComponent(sbAccessMatch[1])
            headers.set('authorization', `Bearer ${token}`)
            console.log('[API Proxy] Using sb-access-token cookie for authorization')
          } catch (err) {
            console.error('[API Proxy] Failed to decode sb-access-token:', err)
          }
        }
      }
    }

    // Log auth status for debugging
    if (headers.get('authorization')) {
      const authHeader = headers.get('authorization') || ''
      console.log('[API Proxy] Authorization header present:', authHeader.substring(0, 30) + '...')
    } else {
      console.warn('[API Proxy] No Authorization header - request may fail if auth required')
    }

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers,
      credentials: 'include', // Important: include cookies
    }

    // Add body for POST/PUT/PATCH requests
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      try {
        const body = await req.text()
        if (body) {
          requestOptions.body = body
        }
      } catch (err) {
        console.error('[API Proxy] Error reading request body:', err)
      }
    }

    // Make request to Railway backend
    const response = await fetch(targetUrl, requestOptions)

    // Read response body
    const responseBody = await response.text()

    // Build response headers
    const responseHeaders = new Headers()

    // Forward specific headers from Railway response
    const headersToForwardFromResponse = [
      'content-type',
      'cache-control',
      'expires',
      'etag',
      'last-modified',
    ]

    headersToForwardFromResponse.forEach(header => {
      const value = response.headers.get(header)
      if (value) {
        responseHeaders.set(header, value)
      }
    })

    // CRITICAL: Forward Set-Cookie headers from Railway to browser
    // This is what makes cookies work!
    const setCookieHeaders = response.headers.get('set-cookie')
    if (setCookieHeaders) {
      responseHeaders.set('set-cookie', setCookieHeaders)
    }

    // Log cookie forwarding for debugging
    if (setCookieHeaders) {
      console.log('[API Proxy] Forwarding Set-Cookie headers:', setCookieHeaders.substring(0, 100) + '...')
    }

    // Return response
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })

  } catch (error) {
    console.error('[API Proxy] Error:', error)

    return new NextResponse(
      JSON.stringify({
        error: 'Proxy Error',
        detail: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

// Export handlers for all HTTP methods
export async function GET(req: NextRequest) {
  return proxyRequest(req, 'GET')
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, 'POST')
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req, 'PUT')
}

export async function PATCH(req: NextRequest) {
  return proxyRequest(req, 'PATCH')
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req, 'DELETE')
}

export async function OPTIONS(req: NextRequest) {
  // Handle CORS preflight
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
