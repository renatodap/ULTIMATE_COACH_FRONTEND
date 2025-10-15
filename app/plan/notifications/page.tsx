"use client"
import { useEffect, useState } from 'react'
import { getNotifications, markNotificationRead } from '@/lib/api/planning'

export default function NotificationsPage() {
  const [rows, setRows] = useState<any[]>([])
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || 'demo-user' : 'demo-user'
  useEffect(() => {
    getNotifications(userId).then((res) => setRows(res.notifications)).catch(() => {})
  }, [])

  async function handleRead(id: string) {
    try {
      await markNotificationRead(userId, id)
      setRows((cur) => cur.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)))
    } catch {}
  }

  return (
    <div className="space-y-2">
      {rows.length === 0 && <div className="text-sm text-neutral-400">No notifications yet</div>}
      {rows.map((n) => (
        <div key={n.id} className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{n.type}</div>
            {!n.read_at && (
              <button className="text-xs px-2 py-1 rounded bg-neutral-800 border border-neutral-700" onClick={() => handleRead(n.id)}>
                Mark Read
              </button>
            )}
          </div>
          <div className="text-sm mt-1">{n.message}</div>
          <div className="text-xs text-neutral-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
        </div>
      ))}
    </div>
  )
}

