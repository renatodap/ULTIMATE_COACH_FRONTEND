'use client'

import { useEffect, useState } from 'react'
import { getTodayCheckIn, getUserStreak } from '@/lib/api/check-ins'

interface CheckInButtonProps {
  onCheckInClick: () => void
}

export default function CheckInButton({ onCheckInClick }: CheckInButtonProps) {
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false)
  const [streak, setStreak] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkTodayStatus() {
      try {
        // Check if already checked in today
        await getTodayCheckIn()
        setAlreadyCheckedIn(true)

        // Get current streak
        const streakData = await getUserStreak()
        setStreak(streakData.current_streak)
      } catch (err) {
        // 404 means no check-in today - that's expected
        setAlreadyCheckedIn(false)
      } finally {
        setLoading(false)
      }
    }

    checkTodayStatus()
  }, [])

  if (loading) {
    return null // Don't show button while loading
  }

  return (
    <button
      onClick={onCheckInClick}
      disabled={alreadyCheckedIn}
      className={`
        flex items-center gap-2
        px-4 py-2.5
        rounded-lg
        font-medium
        transition-all
        duration-200
        ${
          alreadyCheckedIn
            ? 'bg-iron-gray/20 text-iron-gray cursor-not-allowed'
            : 'bg-iron-orange text-iron-black hover:bg-iron-orange/90 active:scale-95'
        }
      `}
    >
      <span className="text-lg">✅</span>
      <span>
        {alreadyCheckedIn ? 'Checked In Today' : 'Daily Check-in'}
      </span>
      {streak !== null && alreadyCheckedIn && (
        <span className="ml-1">🔥 {streak}</span>
      )}
    </button>
  )
}
