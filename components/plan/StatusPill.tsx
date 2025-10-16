import React from 'react'

type Status = 'planned' | 'completed' | 'similar' | 'skipped' | 'modified'

const statusClasses: Record<Status, string> = {
  planned: 'bg-iron-gray/20 border-iron-gray/40 text-iron-gray',
  completed: 'bg-green-900/30 border-green-700 text-green-300',
  similar: 'bg-blue-900/30 border-blue-700 text-blue-300',
  skipped: 'bg-red-900/30 border-red-700 text-red-300',
  modified: 'bg-amber-900/30 border-amber-700 text-amber-200',
}

export default function StatusPill({ status }: { status: Status }) {
  const cls = statusClasses[status] || statusClasses.planned
  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${cls}`}>{status}</span>
  )
}

