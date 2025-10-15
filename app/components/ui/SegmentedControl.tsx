'use client'

import React from 'react'

interface Option {
  key: string
  label: string
}

interface SegmentedControlProps {
  options: Option[]
  value: string
  onChange: (key: string) => void
  className?: string
}

export default function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  return (
    <div className={`flex items-center gap-2 p-1 rounded-lg bg-iron-dark-gray border border-iron-gray overflow-hidden ${className || ''}`}>
      {options.map(opt => (
        <button
          key={opt.key}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
            value === opt.key ? 'bg-iron-orange text-iron-white' : 'text-iron-white hover:bg-iron-gray/40'
          }`}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

