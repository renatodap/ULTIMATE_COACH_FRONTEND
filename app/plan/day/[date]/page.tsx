"use client"
import { useEffect, useState } from 'react'
import { getCalendarFull, getOverridesToday, postAdherence } from '@/lib/api/planning'
import { useParams } from 'next/navigation'
import PlanCard from '@/components/plan/PlanCard'
import StatusPill from '@/components/plan/StatusPill'
import OverridesBanner from '@/components/plan/OverridesBanner'
import AdherenceModal from '@/components/plan/AdherenceModal'

export default function DayPage() {
  const params = useParams<{ date: string }>()
  const dateISO = (params?.date === 'today' ? new Date().toISOString().slice(0, 10) : (params?.date as string)) || new Date().toISOString().slice(0, 10)
  const [events, setEvents] = useState<any[]>([])
  const [overrides, setOverrides] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [activeEvent, setActiveEvent] = useState<any>(null)
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || 'demo-user' : 'demo-user'

  useEffect(() => {
    getCalendarFull(userId, dateISO, 'day').then((res) => setEvents(res.events)).catch(() => {})
    getOverridesToday(userId).then((res) => setOverrides(res.overrides || [])).catch(() => {})
  }, [dateISO])

  return (
    <div className="space-y-3">
      <OverridesBanner reasons={overrides.map((o: any)=>o.reason_code)} />
      {events.map((e) => (
        <PlanCard key={e.id}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{e.title || e.event_type}</div>
            <StatusPill status={e.status} />
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
            <button className="flex-1 text-center py-2 rounded bg-green-700" onClick={()=>handleAdherence(e,'completed')}>Completed</button>
            <button className="flex-1 text-center py-2 rounded bg-blue-700" onClick={()=>{ setActiveEvent(e); setModalOpen(true) }}>Similar</button>
            <button className="flex-1 text-center py-2 rounded bg-red-700" onClick={()=>handleAdherence(e,'skipped')}>Skipped</button>
          </div>
        </PlanCard>
      ))}
      <AdherenceModal
        open={modalOpen}
        onClose={()=>setModalOpen(false)}
        onSubmit={(payload)=>{
          if (!activeEvent) return
          handleAdherence(activeEvent,'similar', payload.similarity_score, payload.notes)
          setModalOpen(false)
        }}
        defaultStatus='similar'
      />
    </div>
  )
}

async function handleAdherence(e: any, status: 'completed'|'similar'|'skipped', similarity?: number, notes?: string) {
  try {
    const planned_entity_type = e.ref_table === 'meal_instances' ? 'meal' : 'session'
    await postAdherence({
      user_id: (typeof window !== 'undefined' ? localStorage.getItem('user_id') || 'demo-user' : 'demo-user') as string,
      planned_entity_type,
      planned_entity_id: e.ref_id,
      status,
      adherence_json: notes ? { notes } : undefined,
      similarity_score: similarity,
    })
    // Optimistic update
    e.status = status
  } catch (err) {
    console.error('Failed to set adherence', err)
  }
}
