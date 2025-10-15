"use client"
import { useEffect, useState } from 'react'
import { getCurrentProgram, getOverridesToday } from '@/lib/api/planning'

export default function PlanSummaryPage() {
  const [program, setProgram] = useState<any>(null)
  const [overrides, setOverrides] = useState<any[]>([])
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || 'demo-user' : 'demo-user'

  useEffect(() => {
    getCurrentProgram(userId, false).then((res) => setProgram(res.program)).catch(() => {})
    getOverridesToday(userId).then((res) => setOverrides(res.overrides || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      {overrides?.length > 0 && (
        <div className="p-3 rounded-md bg-amber-900/30 border border-amber-700 text-amber-200">
          <strong>Today adjusted:</strong> {overrides.map((o: any) => o.reason_code).join(', ')}
        </div>
      )}
      <section className="grid grid-cols-2 gap-3">
        <Tile label="Goal" value={program?.primary_goal || '—'} />
        <Tile label="Duration" value={`${program?.program_duration_weeks || 12} wks`} />
        <Tile label="Start" value={program?.program_start_date || '—'} />
        <Tile label="Reassess" value={program?.next_reassessment_date || '—'} />
      </section>
      <a href="/plan/calendar" className="block w-full text-center py-3 bg-blue-600 rounded-md font-semibold">Open Calendar</a>
      <a href="/plan/notifications" className="block w-full text-center py-3 bg-neutral-800 rounded-md">Notifications</a>
    </div>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
      <div className="text-xs text-neutral-400">{label}</div>
      <div className="text-base font-medium mt-1">{value}</div>
    </div>
  )
}

