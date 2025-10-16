'use client'

/**
 * Timezone Context
 *
 * Provides user's timezone to all components in the app.
 *
 * The timezone comes from:
 * 1. User's profile (set during onboarding or in preferences)
 * 2. Browser's timezone (fallback if not set)
 *
 * USAGE:
 * ```tsx
 * import { useTimezone } from '@/lib/context/TimezoneContext'
 *
 * function MyComponent() {
 *   const { timezone } = useTimezone()
 *   const formattedDate = formatDateInTimezone(date, timezone)
 *   return <div>{formattedDate}</div>
 * }
 * ```
 */

import { createContext, useContext, ReactNode } from 'react'
import { getUserTimezone } from '@/lib/utils/timezone'

interface TimezoneContextValue {
  /**
   * User's IANA timezone string (e.g., 'America/New_York', 'Asia/Tokyo')
   *
   * This value is used for:
   * - Converting UTC timestamps to user's local time
   * - Calculating date boundaries for queries
   * - Grouping activities/meals by date
   * - Displaying times in user's timezone
   */
  timezone: string
}

const TimezoneContext = createContext<TimezoneContextValue | undefined>(undefined)

interface TimezoneProviderProps {
  children: ReactNode
  /**
   * User's timezone from profile (optional)
   * If not provided, will use browser's timezone as fallback
   */
  profileTimezone?: string
}

/**
 * TimezoneProvider Component
 *
 * Wrap your app with this provider to make timezone available to all components.
 *
 * @param children - React children
 * @param profileTimezone - User's timezone from profile (IANA format)
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * export default function RootLayout({ children }) {
 *   const profile = await getProfile()
 *
 *   return (
 *     <TimezoneProvider profileTimezone={profile?.timezone}>
 *       {children}
 *     </TimezoneProvider>
 *   )
 * }
 * ```
 */
export function TimezoneProvider({
  children,
  profileTimezone
}: TimezoneProviderProps) {
  const timezone = getUserTimezone(profileTimezone)

  return (
    <TimezoneContext.Provider value={{ timezone }}>
      {children}
    </TimezoneContext.Provider>
  )
}

/**
 * useTimezone Hook
 *
 * Access user's timezone from any component.
 *
 * @throws Error if used outside TimezoneProvider
 * @returns Object containing timezone string
 *
 * @example
 * ```tsx
 * function ActivityCard({ activity }) {
 *   const { timezone } = useTimezone()
 *   const displayTime = formatTimeInTimezone(activity.start_time, timezone)
 *   return <div>{displayTime}</div>
 * }
 * ```
 */
export function useTimezone(): TimezoneContextValue {
  const context = useContext(TimezoneContext)

  if (!context) {
    throw new Error('useTimezone must be used within TimezoneProvider')
  }

  return context
}
