"use client"
import React, { useState } from 'react'

type Status = 'completed' | 'similar' | 'skipped'

export default function AdherenceModal({
  open,
  onClose,
  onSubmit,
  defaultStatus = 'completed',
}: {
  open: boolean
  onClose: () => void
  onSubmit: (payload: { status: Status; similarity_score?: number; notes?: string }) => void
  defaultStatus?: Status
}) {
  const [status, setStatus] = useState<Status>(defaultStatus)
  const [similarity, setSimilarity] = useState<number>(0.8)
  const [notes, setNotes] = useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[400] flex items-end justify-center bg-black/50">
      <div className="w-full max-w-screen-sm bg-iron-black border-t border-iron-gray/30 rounded-t-xl p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Mark Adherence</h3>
          <button className="text-iron-gray" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-sm">
            {(['completed','similar','skipped'] as Status[]).map((s) => (
              <button key={s} onClick={()=>setStatus(s)} className={`py-2 rounded border ${status===s?'border-iron-white text-iron-white':'border-iron-gray/30 text-iron-gray'}`}>{s}</button>
            ))}
          </div>

          {status === 'similar' && (
            <div className="space-y-2 text-sm">
              <label className="block text-iron-gray">Similarity: {Math.round(similarity*100)}%</label>
              <input type="range" min={50} max={100} value={similarity*100} onChange={(e)=>setSimilarity(Number(e.target.value)/100)} className="w-full" />
              <textarea className="w-full bg-iron-black border border-iron-gray/30 rounded p-2" rows={3} placeholder="What changed?" value={notes} onChange={(e)=>setNotes(e.target.value)} />
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 bg-iron-gray/20 border border-iron-gray/30 rounded">Cancel</button>
          <button
            className="flex-1 py-2 bg-blue-600 rounded font-semibold"
            onClick={()=>onSubmit({ status, similarity_score: status==='similar'? similarity: undefined, notes })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

