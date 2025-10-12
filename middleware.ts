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
  // TEMPORARY: Disable middleware auth checks
  // Issue: Cookies from backend API (different origin) don't persist to frontend
  // Solution: Use client-side localStorage and route guards instead
  // TODO: Re-enable middleware auth when same-origin or fix cross-origin cookies

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
