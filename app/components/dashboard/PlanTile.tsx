"use client"
import { useEffect, useState } from 'react'
import { getCurrentProgram, getOverridesToday } from '@/lib/api/planning'
import { FEATURE_PLAN_ENABLED } from '@/lib/constants/features'

export default function PlanTile() {
  const [program, setProgram] = useState<any>(null)
  const [overrides, setOverrides] = useState<any[]>([])
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || 'demo-user' : 'demo-user'
  useEffect(() => {
    getCurrentProgram(userId, false).then((res)=>setProgram(res.program)).catch(()=>{})
    getOverridesToday(userId).then((res)=>setOverrides(res.overrides||[])).catch(()=>{})
  }, [])
  return (
    <div className="card-glass border border-iron-gray/30 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider">Your Plan</h3>
        {!FEATURE_PLAN_ENABLED && <span className="text-[10px] text-iron-gray">Coming soon</span>}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-iron-gray text-[11px]">Goal</div>
          <div className="font-medium">{program?.primary_goal || '—'}</div>
        </div>
        <div>
          <div className="text-iron-gray text-[11px]">Reassess</div>
          <div className="font-medium">{program?.next_reassessment_date || '—'}</div>
        </div>
      </div>
      {overrides?.length>0 && (
        <div className="mt-2 text-[12px] text-amber-200">Adjusted today: {overrides.map((o:any)=>o.reason_code).join(', ')}</div>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a href="/plan/day/today" className="block text-center py-2 bg-blue-600 rounded font-semibold">Today</a>
        <a href="/plan/calendar" className="block text-center py-2 bg-iron-gray/20 border border-iron-gray/30 rounded">This Week</a>
      </div>
    </div>
  )
}

