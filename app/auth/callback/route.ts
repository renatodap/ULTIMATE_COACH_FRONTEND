import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * OAuth Callback Route
 *
 * Handles Google OAuth redirects after authentication.
 * Exchanges OAuth code for session, syncs Supabase client, and redirects based on onboarding status.
 *
 * Flow:
 * 1. Exchange OAuth code for Supabase session
 * 2. Sync Supabase client session (critical for preventing orphaned sessions)
 * 3. Fetch user profile to check onboarding status
 * 4. Set httpOnly cookies with session tokens
 * 5. Redirect to /onboarding if incomplete, /dashboard if complete
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('[OAuth Callback] Starting OAuth callback processing')

  if (!code) {
    console.error('[OAuth Callback] No code parameter in URL')
    return NextResponse.redirect(new URL('/login?error=no_code', request.url))
  }

  try {
    // Step 1: Exchange OAuth code for Supabase session
    console.log('[OAuth Callback] Exchanging code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[OAuth Callback] Failed to exchange code:', error.message)
      return NextResponse.redirect(new URL('/login?error=exchange_failed', request.url))
    }

    if (!data.session) {
      console.error('[OAuth Callback] No session in exchange response')
      return NextResponse.redirect(new URL('/login?error=no_session', request.url))
    }

    console.log('[OAuth Callback] Session obtained, user_id:', data.user?.id)

    // Step 2: CRITICAL - Sync Supabase client session
    // This prevents "orphaned session" errors by ensuring the Supabase client
    // and backend are using the same session reference
    console.log('[OAuth Callback] Syncing Supabase client session...')
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })
    console.log('[OAuth Callback] Supabase client session synced successfully')

    // Step 3: Fetch user profile to check onboarding status
    // Use backend API to get profile (includes onboarding_completed flag)
    let onboardingCompleted = false
    try {
      console.log('[OAuth Callback] Fetching user profile to check onboarding status...')
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me`, {
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (profileResponse.ok) {
        const profile = await profileResponse.json()
        onboardingCompleted = profile.onboarding_completed || false
        console.log('[OAuth Callback] Onboarding status:', onboardingCompleted ? 'completed' : 'incomplete')
      } else {
        console.warn('[OAuth Callback] Failed to fetch profile:', profileResponse.status)
        // Default to false - redirect to onboarding to be safe
      }
    } catch (profileError) {
      console.error('[OAuth Callback] Error fetching profile:', profileError)
      // Default to false - redirect to onboarding to be safe
    }

    // Step 4: Set httpOnly cookies with session tokens
    const redirectUrl = onboardingCompleted ? '/dashboard' : '/onboarding'
    console.log('[OAuth Callback] Redirecting to:', redirectUrl)

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
    console.error('[OAuth Callback] Unexpected error:', error)
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
  }
}
