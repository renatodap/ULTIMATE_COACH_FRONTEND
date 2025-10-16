/**
 * Timezone Utilities
 *
 * Centralized timezone handling for the entire application.
 *
 * KEY PRINCIPLES:
 * 1. Backend stores all timestamps as UTC (ISO 8601 format)
 * 2. Frontend displays all times in user's selected timezone
 * 3. Date boundaries (start/end of day) calculated in user's timezone, converted to UTC for API queries
 * 4. Date grouping (activities by date, meals by date) uses user's timezone, not UTC
 *
 * USAGE:
 * - Import timezone from useTimezone() hook (accesses user's profile timezone)
 * - Use fromUTC() when parsing API responses (logged_at, start_time, etc.)
 * - Use toUTC() when sending dates to backend (create meal, log activity)
 * - Use formatDateInTimezone() for date grouping and display
 * - Use getStartOfDayUTC() / getEndOfDayUTC() for date range queries
 */

import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz'
import { format, parseISO, startOfDay, endOfDay, addDays, subDays } from 'date-fns'

/**
 * Get user's timezone from profile or fallback to browser
 * This should be called from a hook/context that has access to user profile
 *
 * @param profileTimezone - Timezone from user's profile (IANA format)
 * @returns IANA timezone string (e.g., 'America/New_York', 'Asia/Tokyo')
 */
export function getUserTimezone(profileTimezone?: string): string {
  if (profileTimezone) return profileTimezone
  // Fallback to browser timezone
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'
}

/**
 * Convert UTC timestamp to user's timezone Date object
 *
 * Use this when parsing API responses (logged_at, start_time, created_at, etc.)
 *
 * @param utcTimestamp - ISO 8601 UTC timestamp string from API (e.g., '2025-10-13T15:30:00Z')
 * @param timezone - User's IANA timezone
 * @returns Date object representing the same instant in user's timezone
 *
 * @example
 * const utcTime = '2025-10-13T15:30:00Z' // 3:30 PM UTC
 * const userTime = fromUTC(utcTime, 'America/New_York') // 11:30 AM EST
 */
export function fromUTC(utcTimestamp: string, timezone: string): Date {
  const utcDate = parseISO(utcTimestamp)
  return toZonedTime(utcDate, timezone)
}

/**
 * Convert user's local date/time to UTC ISO string for API submission
 *
 * Use this when sending dates to backend (create meal, log activity, update timestamps)
 *
 * @param localDate - Date object in user's local timezone
 * @param timezone - User's IANA timezone
 * @returns UTC ISO 8601 timestamp string (e.g., '2025-10-13T15:30:00.000Z')
 *
 * @example
 * const now = new Date() // User's current time
 * const utcTime = toUTC(now, 'America/New_York') // '2025-10-13T15:30:00.000Z'
 */
export function toUTC(localDate: Date, timezone: string): string {
  const utcDate = fromZonedTime(localDate, timezone)
  return utcDate.toISOString()
}

/**
 * Get date in user's timezone as YYYY-MM-DD string
 *
 * Use this for date grouping (activities by date, meals by date) and display
 *
 * @param date - Date object or ISO string
 * @param timezone - User's IANA timezone
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * const utcTime = '2025-10-13T23:30:00Z' // 11:30 PM UTC on Oct 13
 * formatDateInTimezone(utcTime, 'Asia/Tokyo') // '2025-10-14' (next day in Tokyo)
 * formatDateInTimezone(utcTime, 'America/Los_Angeles') // '2025-10-13' (same day in LA)
 */
export function formatDateInTimezone(date: Date | string, timezone: string): string {
  return formatInTimeZone(date, timezone, 'yyyy-MM-dd')
}

/**
 * Get start of day (00:00:00) in user's timezone, converted to UTC
 *
 * Use this for date range queries (start_date parameter in API calls)
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timezone - User's IANA timezone
 * @returns UTC ISO 8601 timestamp string for start of day
 *
 * @example
 * // User in Tokyo (UTC+9) queries for Oct 14
 * getStartOfDayUTC('2025-10-14', 'Asia/Tokyo')
 * // Returns: '2025-10-13T15:00:00.000Z' (Oct 13 3PM UTC = Oct 14 midnight Tokyo)
 */
export function getStartOfDayUTC(dateStr: string, timezone: string): string {
  // Parse date as local in user's timezone (avoid UTC interpretation)
  const localDate = toZonedTime(new Date(dateStr + 'T00:00:00'), timezone)
  const startOfDayLocal = startOfDay(localDate)
  return toUTC(startOfDayLocal, timezone)
}

/**
 * Get end of day (23:59:59.999) in user's timezone, converted to UTC
 *
 * Use this for date range queries (end_date parameter in API calls)
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timezone - User's IANA timezone
 * @returns UTC ISO 8601 timestamp string for end of day
 *
 * @example
 * // User in LA (UTC-8) queries for Oct 13
 * getEndOfDayUTC('2025-10-13', 'America/Los_Angeles')
 * // Returns: '2025-10-14T07:59:59.999Z' (Oct 14 7:59AM UTC = Oct 13 11:59PM LA)
 */
export function getEndOfDayUTC(dateStr: string, timezone: string): string {
  const localDate = toZonedTime(new Date(dateStr + 'T00:00:00'), timezone)
  const endOfDayLocal = endOfDay(localDate)
  return toUTC(endOfDayLocal, timezone)
}

/**
 * Format timestamp for time display in user's timezone
 *
 * @param timestamp - ISO 8601 UTC timestamp string
 * @param timezone - User's IANA timezone
 * @returns Formatted time string (e.g., '2:30 PM')
 *
 * @example
 * formatTimeInTimezone('2025-10-13T15:30:00Z', 'America/New_York') // '11:30 AM'
 */
export function formatTimeInTimezone(timestamp: string, timezone: string): string {
  return formatInTimeZone(timestamp, timezone, 'h:mm a')
}

/**
 * Format timestamp for date display in user's timezone
 *
 * @param timestamp - ISO 8601 UTC timestamp string or date string
 * @param timezone - User's IANA timezone
 * @param includeYear - Whether to include year in output
 * @returns Formatted date string (e.g., 'Oct 13' or 'Oct 13, 2025')
 *
 * @example
 * formatDateDisplay('2025-10-13', 'America/New_York') // 'Oct 13'
 * formatDateDisplay('2025-10-13', 'America/New_York', true) // 'Oct 13, 2025'
 */
export function formatDateDisplay(timestamp: string, timezone: string, includeYear = false): string {
  const pattern = includeYear ? 'MMM d, yyyy' : 'MMM d'
  return formatInTimeZone(timestamp, timezone, pattern)
}

/**
 * Get "Today", "Yesterday", or formatted date in user's timezone
 *
 * Use this for date headers in activity/meal lists
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timezone - User's IANA timezone
 * @returns Relative date string ('Today', 'Yesterday', or formatted date)
 *
 * @example
 * const today = getTodayInTimezone('America/New_York')
 * formatRelativeDate(today, 'America/New_York') // 'Today'
 */
export function formatRelativeDate(dateStr: string, timezone: string): string {
  const date = toZonedTime(new Date(dateStr + 'T00:00:00'), timezone)
  const today = toZonedTime(new Date(), timezone)
  const yesterday = subDays(today, 1)

  const dateOnly = formatInTimeZone(date, timezone, 'yyyy-MM-dd')
  const todayOnly = formatInTimeZone(today, timezone, 'yyyy-MM-dd')
  const yesterdayOnly = formatInTimeZone(yesterday, timezone, 'yyyy-MM-dd')

  if (dateOnly === todayOnly) return 'Today'
  if (dateOnly === yesterdayOnly) return 'Yesterday'
  return formatDateDisplay(dateStr, timezone)
}

/**
 * Get current date in user's timezone as YYYY-MM-DD
 *
 * Use this for default date values (e.g., initializing date pickers)
 *
 * @param timezone - User's IANA timezone
 * @returns Current date in YYYY-MM-DD format
 *
 * @example
 * // Current UTC time: Oct 13 11:30 PM UTC
 * getTodayInTimezone('Asia/Tokyo') // '2025-10-14' (next day in Tokyo)
 * getTodayInTimezone('America/Los_Angeles') // '2025-10-13' (same day in LA)
 */
export function getTodayInTimezone(timezone: string): string {
  return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd')
}

/**
 * Add days to a date string in user's timezone
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param days - Number of days to add (can be negative)
 * @param timezone - User's IANA timezone
 * @returns New date string in YYYY-MM-DD format
 *
 * @example
 * addDaysInTimezone('2025-10-13', 1, 'America/New_York') // '2025-10-14'
 * addDaysInTimezone('2025-10-13', -1, 'America/New_York') // '2025-10-12'
 */
export function addDaysInTimezone(dateStr: string, days: number, timezone: string): string {
  const date = toZonedTime(new Date(dateStr + 'T00:00:00'), timezone)
  const newDate = addDays(date, days)
  return formatInTimeZone(newDate, timezone, 'yyyy-MM-dd')
}

/**
 * Check if a date string represents today in user's timezone
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timezone - User's IANA timezone
 * @returns True if date is today in user's timezone
 *
 * @example
 * const today = getTodayInTimezone('America/New_York')
 * isToday(today, 'America/New_York') // true
 * isToday('2025-10-12', 'America/New_York') // false
 */
export function isToday(dateStr: string, timezone: string): boolean {
  const todayStr = getTodayInTimezone(timezone)
  return dateStr === todayStr
}
