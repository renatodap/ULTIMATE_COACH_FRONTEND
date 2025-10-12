'use client'

/**
 * Button Group - Choice buttons that appear after message
 * Clean, minimal, follows design tokens
 */

import { useEffect, useState } from 'react'

interface ButtonOption {
  label: string
  value: string
  description?: string
}

interface ButtonGroupProps {
  options: ButtonOption[]
  onSelect: (value: string) => void
  delay?: number
  selected?: string
}

export function ButtonGroup({ options, onSelect, delay = 0, selected }: ButtonGroupProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!visible) return null

  return (
    <div className="space-y-3 mb-6">
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          disabled={selected !== undefined}
          className={`
            w-full p-4 rounded-lg text-left
            transition-all duration-200
            opacity-0 translate-y-2 animate-fade-in
            ${selected === option.value
              ? 'bg-primary text-white'
              : selected
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : 'bg-neutral-800 text-neutral-white hover:bg-neutral-700 active:scale-98'
            }
          `}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="font-medium">{option.label}</div>
          {option.description && (
            <div className="text-sm opacity-70 mt-1">{option.description}</div>
          )}
        </button>
      ))}
    </div>
  )
}
