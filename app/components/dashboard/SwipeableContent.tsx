'use client'

/**
 * Swipeable Content - GESTURE NAVIGATION
 *
 * Intuitive: Swipe left (next) or right (previous)
 * Mobile-first: Natural touch gestures
 * Easy to use: Visual feedback during swipe
 *
 * Swipe threshold: 50px (Apple HIG standard)
 */

import { useState } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'

interface SwipeableContentProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

export default function SwipeableContent({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = ''
}: SwipeableContentProps) {
  const [isDragging, setIsDragging] = useState(false)
  const x = useMotionValue(0)

  // Opacity based on drag distance
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5])

  const handleDragEnd = (_event: any, info: PanInfo) => {
    setIsDragging(false)

    const swipeThreshold = 50 // 50px swipe to trigger

    if (info.offset.x > swipeThreshold && onSwipeRight) {
      // Swiped right (show previous period)
      onSwipeRight()
    } else if (info.offset.x < -swipeThreshold && onSwipeLeft) {
      // Swiped left (show next period)
      onSwipeLeft()
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Swipe indicators */}
      {isDragging && (
        <>
          {/* Left indicator (swipe right to see) */}
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-iron-orange/20 border-l-4 border-iron-orange p-4">
              <p className="text-4xl">👈</p>
            </div>
          </motion.div>

          {/* Right indicator (swipe left to see) */}
          <motion.div
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="bg-iron-orange/20 border-r-4 border-iron-orange p-4">
              <p className="text-4xl">👉</p>
            </div>
          </motion.div>
        </>
      )}

      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x, opacity }}
        className={`cursor-grab active:cursor-grabbing ${className}`}
      >
        {children}
      </motion.div>

      {/* Swipe hint (shows on first load) */}
      <div className="text-center py-2">
        <p className="text-iron-gray/50 text-xs uppercase tracking-wider">
          👈 Swipe to change period 👉
        </p>
      </div>
    </div>
  )
}
