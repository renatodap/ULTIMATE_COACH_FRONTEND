'use client'

/**
 * Onboarding Input - Appears when buttons don't apply
 * Minimal, clean, autofocus
 */

import { useEffect, useRef, useState } from 'react'

interface InputProps {
  type?: 'text' | 'number'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  delay?: number
  min?: number
  max?: number
  step?: number
  unit?: string
}

export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  onSubmit,
  delay = 0,
  min,
  max,
  step,
  unit
}: InputProps) {
  const [visible, setVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
      setTimeout(() => inputRef.current?.focus(), 100)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!visible) return null

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value) {
      onSubmit()
    }
  }

  return (
    <div className="mb-6 opacity-0 translate-y-2 animate-fade-in">
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className="
            w-full px-4 py-3 rounded-lg
            bg-neutral-800 text-neutral-white
            border-2 border-transparent
            focus:border-primary focus:outline-none
            transition-all duration-200
          "
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">
            {unit}
          </span>
        )}
      </div>
      {value && (
        <button
          onClick={onSubmit}
          className="
            mt-3 px-6 py-2 rounded-lg
            bg-primary text-white
            hover:bg-primary-dark
            transition-all duration-200
            opacity-0 animate-fade-in
          "
        >
          Continue
        </button>
      )}
    </div>
  )
}
