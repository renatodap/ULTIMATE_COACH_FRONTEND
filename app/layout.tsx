import type { Metadata } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { TimezoneProvider } from '@/lib/context/TimezoneContext'
import { createClient } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'SHARPENED - AI Fitness & Nutrition',
  description: 'Become a sharpened version of yourself with AI-powered fitness and nutrition coaching',
  manifest: '/manifest.json',
  themeColor: '#0A0A0B', // Iron black - matches app background
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black', // Opaque black status bar (no translucency)
    title: 'SHARPENED',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
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
      <head>
        {/* Force black status bar on iOS PWA - prevents white bezel on notch area */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="theme-color" content="#0A0A0B" />
      </head>
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
