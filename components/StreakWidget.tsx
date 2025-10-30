'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserStreak, type UserStreakResponse } from '@/lib/api/check-ins'

export default function StreakWidget() {
  const router = useRouter()
  const [streak, setStreak] = useState<UserStreakResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStreak() {
      try {
        const data = await getUserStreak()
        setStreak(data)
      } catch (err) {
        console.error('Failed to fetch streak:', err)
        setError('Failed to load streak data')
      } finally {
        setLoading(false)
      }
    }

    fetchStreak()
  }, [])

  const handleClick = () => {
    router.push('/coach?message=' + encodeURIComponent('Tell me about my streak'))
  }

  if (loading) {
    return (
      <div className="bg-iron-dark-gray border border-iron-gray rounded-xl p-6">
        <div className="h-20 flex items-center justify-center">
          <div className="text-iron-gray">Loading...</div>
        </div>
      </div>
    )
  }

  if (error || !streak) {
    return null // Silently hide widget if error
  }

  const { current_streak, longest_streak, total_check_ins } = streak

  return (
    <button
      onClick={handleClick}
      className="
        w-full
        bg-iron-dark-gray
        border border-iron-gray
        hover:border-iron-orange
        rounded-xl
        p-6
        text-left
        transition-colors
        duration-200
      "
    >
      {/* Fire Icon + Current Streak */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-5xl">🔥</span>
        <div>
          <div className="text-4xl font-bold text-iron-white">
            {current_streak}
          </div>
          <div className="text-sm text-iron-gray">day streak</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-iron-gray">Longest</div>
          <div className="text-xl font-semibold text-iron-white">
            {longest_streak} days
          </div>
        </div>
        <div>
          <div className="text-iron-gray">Total</div>
          <div className="text-xl font-semibold text-iron-white">
            {total_check_ins} check-ins
          </div>
        </div>
      </div>

      {/* CTA Text */}
      <div className="mt-4 text-xs text-iron-gray">
        Tap to view details →
      </div>
    </button>
  )
}
