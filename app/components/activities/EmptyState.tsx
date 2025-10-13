/**
 * Empty State Component for Activities
 *
 * Shown when user has no activities logged yet
 * Encourages first activity log
 */

'use client'

import Link from 'next/link'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4">🏃‍♂️</div>

      <h3 className="text-xl font-bold text-iron-white mb-2">
        No activities logged yet
      </h3>

      <p className="text-iron-gray max-w-sm mb-6">
        Start tracking your workouts and physical activities to monitor your progress and stay motivated
      </p>

      <Link href="/activities/log">
        <button className="bg-iron-orange text-iron-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition">
          Log Your First Activity
        </button>
      </Link>
    </div>
  )
}
