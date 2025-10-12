'use client'

/**
 * Cinematic Message Component
 *
 * Messages slide in with slight offsets creating movie subtitle effect
 * Minimal, fast, follows design system
 */

import { useEffect, useState } from 'react'

interface MessageProps {
  text: string
  delay?: number
  offset?: number  // px offset for layering
  onComplete?: () => void
}

export function Message({ text, delay = 0, offset = 0, onComplete }: MessageProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
      onComplete?.()
    }, delay)
    return () => clearTimeout(timer)
  }, [delay, onComplete])

  if (!visible) return null

  return (
    <div
      className="mb-3 opacity-0 translate-y-2 animate-fade-in"
      style={{
        marginLeft: `${offset}px`,
        animationDelay: '50ms'
      }}
    >
      <p className="text-base text-neutral-white leading-relaxed">
        {text}
      </p>
    </div>
  )
}
