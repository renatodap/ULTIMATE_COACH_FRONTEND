import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // Store tokens in cookies or handle as needed
      // For now, redirect to dashboard with session info in URL (temporary)
      const response = NextResponse.redirect(new URL('/dashboard', request.url))

      // Set session tokens as httpOnly cookies for security
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
    }
  }

  // If error or no code, redirect to login
  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
}
