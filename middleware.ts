/**
 * Next.js Middleware - Authentication & Routing
 *
 * PURPOSE:
 * - Enforces authentication for protected routes
 * - Redirects unauthenticated users to landing page
 * - Redirects authenticated users away from auth pages
 * - Allows public routes (landing, login, signup, legal)
 *
 * AUTHENTICATION METHOD:
 * - Checks for httpOnly cookies set by backend API
 * - Backend sets 'access_token' cookie after successful login
 * - No Supabase session checks (backend handles auth entirely)
 *
 * AUTHENTICATION FLOW:
 * - Unauthenticated + protected route → Redirect to / (landing)
 * - Authenticated + auth page → Redirect to /dashboard
 * - Public routes → Allow access for everyone
 *
 * ONBOARDING ENFORCEMENT:
 * Onboarding is NOT enforced here because Next.js middleware cannot make
 * async API calls to check user profile data. Instead:
 * - Login page checks onboarding_completed and redirects appropriately
 * - Dashboard and all protected pages use useOnboardingCheck() hook
 * - Hook fetches user profile and redirects to /onboarding if incomplete
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for authentication token (httpOnly cookie set by backend API)
  const accessToken = request.cookies.get('access_token')
  const isAuthenticated = !!accessToken

  // Define public routes (accessible without authentication)
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/privacy', '/terms']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Define auth pages (login, signup, etc.)
  const authPages = ['/login', '/signup', '/forgot-password']
  const isAuthPage = authPages.includes(pathname)

  // CASE 1: User is NOT authenticated
  if (!isAuthenticated) {
    // If trying to access protected route → redirect to landing page
    if (!isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    // If accessing public route → allow
    return NextResponse.next()
  }

  // CASE 2: User IS authenticated
  // NOTE: We DON'T redirect away from auth pages here because:
  // 1. Cookie might be stale/invalid (checked by API calls)
  // 2. Login page itself will redirect to dashboard after successful login
  // 3. Allows users to re-login if session expired
  // The auth pages will handle their own redirect logic

  // Allow access to all routes
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
