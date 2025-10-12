import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public routes - no auth required
  const publicRoutes = ['/', '/login', '/signup']
  if (publicRoutes.includes(path)) {
    return NextResponse.next()
  }

  // Check auth
  const hasAuthCookie = request.cookies.has('access_token')
  if (!hasAuthCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Allow onboarding and auth routes
  if (path === '/onboarding' || path.startsWith('/auth/')) {
    return NextResponse.next()
  }

  // Check onboarding completion
  // Note: We can't make API calls in middleware, so we check on client side
  // Middleware just ensures auth, client-side redirect handles onboarding

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
