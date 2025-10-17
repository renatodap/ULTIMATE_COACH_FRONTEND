'use client'

/**
 * Bottom Navigation Component
 *
 * Fixed bottom navigation bar for mobile-first navigation.
 * Features:
 * - Glass morphism design with active state indicators
 * - Auto-hide on scroll down (reclaim 64px screen space)
 * - Show on scroll up or when near page top
 * - Smooth transitions for professional feel
 */

import { usePathname, useRouter } from 'next/navigation'
import { FEATURE_PLAN_IN_NAV } from '@/lib/constants/features'
import { useScrollDirection } from '@/hooks/useScrollDirection'

interface BottomNavProps {
  hideOnScroll?: boolean
}

export function BottomNav({ hideOnScroll = true }: BottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const scrollDirection = useScrollDirection()

  const baseTabs = [
    {
      name: 'Home',
      path: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
  ] as const

  const activitiesTab = {
    name: 'Activities',
    path: '/activities',
    icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
  }

  const planTab = {
    name: 'Plan',
    path: '/plan/day/today',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 19h14M5 11v8m14-8v8" />
      </svg>
    ),
  }

  const coachTab = {
    name: 'Coach',
    path: '/coach',
    icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
  }

  const nutritionTab = {
    name: 'Nutrition',
    path: '/nutrition',
    icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" d="M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2m18 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6m18 0H3" />
        </svg>
      ),
  }

  const profileTab = {
    name: 'Profile',
    path: '/profile',
    icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
  }

  const tabs = FEATURE_PLAN_IN_NAV
    ? [baseTabs[0], planTab, coachTab, profileTab]
    : [baseTabs[0], activitiesTab, coachTab, nutritionTab, profileTab]

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname?.startsWith(path)
  }

  // Determine if nav should be hidden
  const shouldHide = hideOnScroll && scrollDirection === 'down'

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-[300]
        bg-iron-black border-t border-iron-gray/30
        transition-transform duration-300 ease-in-out
        ${shouldHide ? 'translate-y-full' : 'translate-y-0'}
      `}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const active = isActive(tab.path)
            return (
              <button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className={`
                  flex flex-col items-center justify-center gap-1 px-2 py-2 min-w-0 flex-1
                  tap-target focus-ring-iron active-press
                  transition-all duration-200
                  ${active ? 'text-iron-white accent-edge' : 'text-iron-gray/60 hover:text-iron-white'}
                `}
              >
                {/* Icon */}
                <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                  {tab.icon}
                </div>

                {/* Label */}
                <span className={`text-[11px] font-medium uppercase tracking-wider ${
                  active ? 'font-bold' : ''
                }`}>
                  {tab.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
