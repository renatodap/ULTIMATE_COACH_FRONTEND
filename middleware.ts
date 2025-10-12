/**
 * Next.js Middleware - Authentication & Routing
 *
 * PURPOSE:
 * - Enforces authentication for protected routes
 * - Redirects unauthenticated users to login
 * - Allows public routes (landing, login, signup)
 *
 * ONBOARDING ENFORCEMENT:
 * Onboarding is NOT enforced here because Next.js middleware cannot make
 * async API calls to check user profile data. Instead:
 * - Login page checks onboarding_completed and redirects appropriately
 * - Dashboard and all protected pages use useOnboardingCheck() hook
 * - Hook fetches user profile and redirects to /onboarding if incomplete
 *
 * This client-side approach is:
 * - More flexible (can make API calls)
 * - More performant (cached user data)
 * - Recommended by Next.js docs for user-specific data checks
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public routes - no authentication required
  const publicRoutes = ['/', '/login', '/signup']
  if (publicRoutes.includes(path)) {
    return NextResponse.next()
  }

  // Check authentication (httpOnly cookie)
  const hasAuthCookie = request.cookies.has('access_token')
  if (!hasAuthCookie) {
    // Not authenticated - redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Allow onboarding and auth callback routes (authenticated but may not have completed onboarding)
  if (path === '/onboarding' || path.startsWith('/auth/')) {
    return NextResponse.next()
  }

  // For all other protected routes:
  // - Middleware ensures user is authenticated ✅
  // - Client-side hooks (useOnboardingCheck) ensure onboarding is complete
  // - See: lib/hooks/useOnboardingCheck.ts for implementation

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
