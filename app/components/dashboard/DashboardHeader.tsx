'use client'

/**
 * Dashboard Header Component
 *
 * Sticky header with greeting and current date
 * Mobile-first, sharp design, NO rounded corners
 */

interface DashboardHeaderProps {
  displayName?: string | null
  date: string
}

export default function DashboardHeader({ displayName, date }: DashboardHeaderProps) {
  // Format date: "Monday, Oct 13"
  const dateObj = new Date(date)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  })

  // Get greeting based on time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'

  return (
    <header className="sticky top-0 z-[100] bg-iron-black border-b border-iron-gray/30">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-iron-white uppercase tracking-wider mb-1">
              {greeting}
              {displayName && <span className="text-iron-orange">, {displayName}</span>}
            </h1>
            <p className="text-sm text-iron-gray uppercase tracking-wider">
              {formattedDate}
            </p>
          </div>

          {/* Date badge */}
          <div className="bg-iron-dark-gray border border-iron-gray/30 px-3 py-2">
            <p className="text-2xl font-bold text-iron-white">
              {dateObj.getDate()}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
