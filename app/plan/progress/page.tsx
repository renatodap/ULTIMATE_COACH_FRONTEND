"use client"
import { useEffect, useState } from 'react'
import { getCalendarSummary } from '@/lib/api/planning'

function todayISO() { return new Date().toISOString().slice(0,10) }
function weekAgoISO() { const d=new Date(); d.setDate(d.getDate()-6); return d.toISOString().slice(0,10) }

export default function ProgressPage(){
  const [summary,setSummary]=useState<any[]>([])
  const userId = typeof window!=='undefined'?localStorage.getItem('user_id')||'demo-user':'demo-user'
  const end=todayISO(); const start=weekAgoISO()
  useEffect(()=>{ getCalendarSummary(userId,start,end).then(r=>setSummary(r.summary||[])).catch(()=>{}) },[])
  return (
    <div className="space-y-3">
      <div className="text-sm text-neutral-400">Last 7 days</div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {summary.map(d=> (
          <div key={d.date} className="p-2 rounded bg-neutral-900 border border-neutral-800">
            <div className="text-[10px] text-neutral-500">{d.date.slice(5)}</div>
            <div className="text-xs">✅ {d.counts.completed||0}</div>
            <div className="text-xs">~ {d.counts.similar||0}</div>
            <div className="text-xs">✗ {d.counts.skipped||0}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

