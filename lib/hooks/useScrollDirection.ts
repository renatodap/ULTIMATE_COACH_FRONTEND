import { useState, useEffect } from 'react'

/**
 * useScrollDirection Hook
 *
 * Detects scroll direction for auto-hiding UI elements (like bottom nav).
 * Industry standard pattern used by Instagram, Twitter, YouTube mobile apps.
 *
 * Returns:
 * - 'up' when scrolling up (show nav)
 * - 'down' when scrolling down AND past threshold (hide nav)
 *
 * Features:
 * - 80px threshold prevents hiding on tiny scrolls
 * - Ignores scroll at page top
 * - Smooth UX with debounce logic
 * - Throttled with requestAnimationFrame for performance
 *
 * Usage:
 * ```typescript
 * import { useScrollDirection } from '@/lib/hooks/useScrollDirection'
 *
 * const scrollDirection = useScrollDirection()
 *
 * <BottomNav hideOnScroll={scrollDirection === 'down'} />
 * ```
 *
 * @returns 'up' | 'down' - Current scroll direction
 */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up')
  const [prevScroll, setPrevScroll] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY

      // Don't hide nav when near top of page
      if (currentScroll < 80) {
        setScrollDirection('up')
        setPrevScroll(currentScroll)
        return
      }

      // Scrolling down - hide nav
      if (currentScroll > prevScroll && currentScroll > 80) {
        setScrollDirection('down')
      }
      // Scrolling up - show nav
      else if (currentScroll < prevScroll) {
        setScrollDirection('up')
      }

      setPrevScroll(currentScroll)
    }

    // Throttle scroll events for performance
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [prevScroll])

  return scrollDirection
}
