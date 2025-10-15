"use client"
import { useEffect, useMemo, useState } from 'react'
import { getCalendarFull } from '@/lib/api/planning'
import { format, startOfWeek } from 'date-fns'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([])
  const [dateISO, setDateISO] = useState(todayISO())
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || 'demo-user' : 'demo-user'

  useEffect(() => {
    getCalendarFull(userId, dateISO, 'week').then((res) => setEvents(res.events)).catch(() => {})
  }, [dateISO])

  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {}
    for (const e of events) {
      ;(map[e.date] ||= []).push(e)
    }
    return map
  }, [events])

  const start = startOfWeek(new Date(dateISO), { weekStartsOn: 1 })

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">Week of {format(start, 'MMM d')}</div>
        <input
          type="date"
          className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm"
          value={dateISO}
          onChange={(e) => setDateISO(e.target.value)}
        />
      </header>
      {Object.entries(eventsByDate).map(([date, evs]) => (
        <section key={date} className="space-y-2">
          <h3 className="text-sm text-neutral-400">{format(new Date(date), 'EEEE, MMM d')}</h3>
          <div className="space-y-2">
            {evs.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function EventCard({ e }: { e: any }) {
  const color = e.status === 'completed' ? 'bg-green-900/40 border-green-700' : e.status === 'similar' ? 'bg-blue-900/40 border-blue-700' : e.status === 'skipped' ? 'bg-red-900/40 border-red-700' : e.status === 'modified' ? 'bg-amber-900/40 border-amber-700' : 'bg-neutral-900 border-neutral-800'
  return (
    <a href={e.ref_table === 'meal_instances' ? `/plan/meal/${e.ref_id}` : `/plan/session/${e.ref_id}`} className={`block p-3 rounded-md border ${color}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{e.title || e.event_type}</div>
        <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">{e.status}</span>
      </div>
      <div className="text-xs text-neutral-400 mt-1">{e.details?.time_of_day || (e.details?.start_hour != null ? `${e.details.start_hour}:00` : '')}</div>
    </a>
  )
}

