'use client'

/**
 * Bottom Navigation Component
 *
 * Fixed bottom navigation bar for mobile-first navigation.
 * Features glass morphism design with active state indicators.
 */

import { usePathname, useRouter } from 'next/navigation'

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const tabs = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname?.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-iron-dark-gray/80 backdrop-blur-xl border-t border-iron-gray/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const active = isActive(tab.path)
            return (
              <button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-all duration-200 ${
                  active
                    ? 'text-iron-orange'
                    : 'text-iron-gray hover:text-iron-white'
                }`}
              >
                {/* Icon */}
                <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                  {tab.icon}
                </div>

                {/* Label */}
                <span className={`text-xs font-medium uppercase tracking-wider ${
                  active ? 'font-bold' : ''
                }`}>
                  {tab.name}
                </span>

                {/* Active indicator */}
                {active && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-iron-orange rounded-t-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
