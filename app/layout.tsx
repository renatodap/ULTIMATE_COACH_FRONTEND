import type { Metadata } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { TimezoneProvider } from '@/lib/context/TimezoneContext'
import { createClient } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'SHARPENED - AI Fitness & Nutrition',
  description: 'Become a sharpened version of yourself with AI-powered fitness and nutrition coaching',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch user's timezone from profile (server-side)
  let profileTimezone: string | undefined

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Fetch profile to get timezone
      const { data: profile } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', user.id)
        .single()

      profileTimezone = profile?.timezone
    }
  } catch (error) {
    // Not authenticated or error fetching profile
    // TimezoneProvider will use browser timezone as fallback
    console.log('Could not fetch user timezone, will use browser timezone')
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <ErrorBoundary>
          <TimezoneProvider profileTimezone={profileTimezone}>
            {children}
            <ToastProvider />
          </TimezoneProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
