'use client'

/**
 * Recent Activity Feed Component
 *
 * Shows recent activities and meals in a compact feed
 * Sharp design, NO rounded corners, mobile-first
 */

import { useRouter } from 'next/navigation'

interface RecentActivityFeedProps {
  // For MVP, we'll keep this simple - can expand later
}

export default function RecentActivityFeed(props: RecentActivityFeedProps) {
  const router = useRouter()

  return (
    <div className="card-glass border border-iron-gray/30 p-6">
      <p className="text-iron-gray text-xs uppercase tracking-wider mb-4">
        📝 Recent Activity
      </p>

      {/* Navigation buttons to full logs */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => router.push('/nutrition')}
          className="bg-iron-black border border-iron-gray/30 p-4 hover:border-iron-orange transition-colors active:scale-95"
        >
          <p className="text-2xl mb-2">🍽️</p>
          <p className="text-xs uppercase tracking-wider text-iron-white font-bold">
            View Meals
          </p>
          <p className="text-xs text-iron-gray mt-1">
            See all logged meals
          </p>
        </button>

        <button
          onClick={() => router.push('/activities')}
          className="bg-iron-black border border-iron-gray/30 p-4 hover:border-iron-orange transition-colors active:scale-95"
        >
          <p className="text-2xl mb-2">💪</p>
          <p className="text-xs uppercase tracking-wider text-iron-white font-bold">
            View Workouts
          </p>
          <p className="text-xs text-iron-gray mt-1">
            See all activities
          </p>
        </button>
      </div>

      {/* Quick tip */}
      <div className="mt-4 pt-4 border-t border-iron-gray/30">
        <p className="text-xs text-iron-gray text-center">
          💡 Tip: Use Quick Actions above to log your meals and workouts
        </p>
      </div>
    </div>
  )
}
