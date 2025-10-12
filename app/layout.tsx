import * as Sentry from '@sentry/nextjs'
import type { Metadata } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { initSentry } from '@/lib/sentry'

// Initialize Sentry as early as possible (client-side only)
if (typeof window !== 'undefined') {
  initSentry()
}

export function generateMetadata(): Metadata {
  return {
    title: 'SHARPENED - AI Fitness & Nutrition',
    description: 'Become a sharpened version of yourself with AI-powered fitness and nutrition coaching',
    other: {
      ...Sentry.getTraceData()
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}
