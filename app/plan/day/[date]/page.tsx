"use client"
import { useEffect, useState } from 'react'
import { getCalendarFull, getOverridesToday } from '@/lib/api/planning'
import { useParams } from 'next/navigation'

export default function DayPage() {
  const params = useParams<{ date: string }>()
  const dateISO = (params?.date === 'today' ? new Date().toISOString().slice(0, 10) : (params?.date as string)) || new Date().toISOString().slice(0, 10)
  const [events, setEvents] = useState<any[]>([])
  const [overrides, setOverrides] = useState<any[]>([])
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || 'demo-user' : 'demo-user'

  useEffect(() => {
    getCalendarFull(userId, dateISO, 'day').then((res) => setEvents(res.events)).catch(() => {})
    getOverridesToday(userId).then((res) => setOverrides(res.overrides || [])).catch(() => {})
  }, [dateISO])

  return (
    <div className="space-y-3">
      {overrides?.length > 0 && (
        <div className="p-3 rounded-md bg-amber-900/30 border border-amber-700 text-amber-200">
          <strong>Today adjusted:</strong> {overrides.map((o: any) => o.reason_code).join(', ')}
        </div>
      )}
      {events.map((e) => (
        <div key={e.id} className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{e.title || e.event_type}</div>
            <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">{e.status}</span>
          </div>
          {e.ref_table === 'session_instances' && (
            <div className="text-xs text-neutral-400 mt-2">
              {e.plan?.session_kind === 'resistance' ? (
                <ul className="list-disc pl-4 space-y-1">
                  {(e.plan?.exercises || []).map((ex: any) => (
                    <li key={ex.id}>
                      {ex.name} — {ex.sets} sets ({ex.rep_range})
                    </li>
                  ))}
                </ul>
              ) : (
                <div>{e.plan?.parameters_json?.intervals ? `${e.plan.parameters_json.intervals.length} intervals` : e.plan?.modality}</div>
              )}
            </div>
          )}
          {e.ref_table === 'meal_instances' && (
            <div className="text-xs text-neutral-400 mt-2">
              <ul className="list-disc pl-4 space-y-1">
                {(e.plan?.items || []).map((it: any) => (
                  <li key={it.id}>
                    {it.food_name} — {it.serving_size}
                    {it.serving_unit}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <a className="flex-1 text-center py-2 rounded bg-green-700" href="#" onClick={(ev) => ev.preventDefault()}>
              Completed
            </a>
            <a className="flex-1 text-center py-2 rounded bg-blue-700" href="#" onClick={(ev) => ev.preventDefault()}>
              Similar
            </a>
            <a className="flex-1 text-center py-2 rounded bg-red-700" href="#" onClick={(ev) => ev.preventDefault()}>
              Skipped
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}

