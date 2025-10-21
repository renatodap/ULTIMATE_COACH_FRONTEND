import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Simple server-side logging (route handlers cannot import client components)
function logError(message: string, context?: any) {
  console.error(`[AUTH_CALLBACK] ${message}`, context)
}

function logInfo(message: string, context?: any) {
  console.log(`[AUTH_CALLBACK] ${message}`, context)
}

/**
 * Auth Callback Route
 *
 * Handles both:
 * 1. Google OAuth redirects after authentication
 * 2. Email verification links from Supabase
 *
 * Flow:
 * 1. Exchange OAuth/email verification code for Supabase session
 * 2. Sync Supabase client session (critical for preventing orphaned sessions)
 * 3. Fetch user profile to check onboarding status
 * 4. Set httpOnly cookies with session tokens
 * 5. Redirect to /onboarding if incomplete, /dashboard if complete
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  // Check for token_hash (email verification) or error params
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle errors from Supabase (email verification or OAuth)
  if (error) {
    logError('Auth callback failed with error', {
      type,
      error,
      errorDescription,
      url: request.url
    })
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url))
  }

  if (!code) {
    logError('Auth callback failed - no code parameter', {
      url: request.url,
      type
    })
    return NextResponse.redirect(new URL('/login?error=no_code', request.url))
  }

  try {
    // Step 1: Exchange code for Supabase session (works for both OAuth and email verification)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    // Determine if this is email verification or OAuth based on 'type' param
    const isEmailVerification = type === 'signup' || type === 'recovery' || type === 'email'

    if (error) {
      logError(`Failed to exchange ${isEmailVerification ? 'email verification' : 'OAuth'} code for session`, {
        error,
        url: request.url,
        type
      })
      return NextResponse.redirect(new URL('/login?error=exchange_failed', request.url))
    }

    if (!data.session) {
      logError(`No session in ${isEmailVerification ? 'email verification' : 'OAuth'} exchange response`, {
        url: request.url,
        type
      })
      return NextResponse.redirect(new URL('/login?error=no_session', request.url))
    }

    // Step 2: CRITICAL - Sync Supabase client session
    // This prevents "orphaned session" errors by ensuring the Supabase client
    // and backend are using the same session reference
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })

    // Step 3: Fetch user profile to check onboarding status
    // Use backend API to get profile (includes onboarding_completed flag)
    let onboardingCompleted = false
    try {
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me`, {
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (profileResponse.ok) {
        const profile = await profileResponse.json()
        onboardingCompleted = profile.onboarding_completed || false
      } else {
        logError('Failed to fetch user profile after auth', {
          statusCode: profileResponse.status,
          userId: data.user?.id,
          type
        })
        // Default to false - redirect to onboarding to be safe
      }
    } catch (profileError) {
      logError('Error fetching profile after auth', {
        error: profileError,
        userId: data.user?.id,
        type
      })
      // Default to false - redirect to onboarding to be safe
    }

    // Log successful authentication
    logInfo(isEmailVerification ? 'Email verified successfully' : 'User logged in via OAuth', {
      userId: data.user?.id,
      userEmail: data.user?.email,
      onboardingCompleted,
      redirectUrl: onboardingCompleted ? '/dashboard' : '/onboarding',
      authType: isEmailVerification ? 'email_verification' : 'oauth'
    })

    // Step 4: Set httpOnly cookies with session tokens
    const redirectUrl = onboardingCompleted ? '/dashboard' : '/onboarding'

    const response = NextResponse.redirect(new URL(redirectUrl, request.url))

    response.cookies.set('access_token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    if (data.session.refresh_token) {
      response.cookies.set('refresh_token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    return response
  } catch (error) {
    // Determine error category based on type parameter
    const isEmailVerification = type === 'signup' || type === 'recovery' || type === 'email'

    logError(`Unexpected error in ${isEmailVerification ? 'email verification' : 'OAuth'} callback`, {
      error,
      url: request.url,
      type
    })
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
  }
}
