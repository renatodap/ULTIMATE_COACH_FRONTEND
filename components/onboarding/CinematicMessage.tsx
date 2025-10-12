'use client'

/**
 * Cinematic Message Component
 *
 * Displays text with typewriter effect and layered positioning
 * Like movie subtitles - dynamic, engaging, conversational
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface CinematicMessageProps {
  text: string
  delay?: number  // Delay before starting (ms)
  speed?: number  // Characters per second
  onComplete?: () => void
  alignment?: 'left' | 'center' | 'right'
  offset?: number  // Horizontal offset for layering effect
}

export function CinematicMessage({
  text,
  delay = 0,
  speed = 20,  // 20 characters per second
  onComplete,
  alignment = 'left',
  offset = 0,
}: CinematicMessageProps) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Reset on text change
    setDisplayText('')
    setIsComplete(false)

    const timeout = setTimeout(() => {
      let currentIndex = 0
      const msPerChar = 1000 / speed

      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(interval)
          setIsComplete(true)
          onComplete?.()
        }
      }, msPerChar)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [text, delay, speed, onComplete])

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[alignment]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      className={`mb-6 ${alignmentClass}`}
      style={{ marginLeft: `${offset}px` }}
    >
      <p className="text-lg text-neutral-white leading-relaxed">
        {displayText}
        {!isComplete && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-2 h-5 ml-1 bg-primary"
          />
        )}
      </p>
    </motion.div>
  )
}
