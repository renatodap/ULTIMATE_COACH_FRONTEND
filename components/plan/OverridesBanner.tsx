import React from 'react'

export default function OverridesBanner({ reasons }: { reasons: string[] }) {
  if (!reasons?.length) return null
  return (
    <div className="p-3 rounded-md bg-amber-900/30 border border-amber-700 text-amber-200">
      <strong>Adjusted Today:</strong> {reasons.join(', ')}
    </div>
  )
}

