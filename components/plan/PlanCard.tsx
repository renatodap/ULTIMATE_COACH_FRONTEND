import React from 'react'

export default function PlanCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-3 rounded-md bg-iron-black border border-iron-gray/30 ${className}`}>{children}</div>
  )
}

