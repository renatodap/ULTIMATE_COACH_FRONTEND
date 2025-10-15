'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { BottomNav } from '@/components/BottomNav'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { getWearableStatus, connectWearable, triggerWearableSync, triggerWearableSyncInline } from '@/lib/api/wearables'
import toast from 'react-hot-toast'

export default function ConnectedAppsPage() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [provider] = useState<'garmin'>('garmin')
  const [syncing, setSyncing] = useState(false)

  async function load() {
    try {
      setLoading(true)
      const s = await getWearableStatus()
      setStatus(s)
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    const t = toast.loading('Connecting…')
    try {
      await connectWearable(provider, { email, password })
      toast.success('Connected!', { id: t })
      setEmail('')
      setPassword('')
      await load()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to connect', { id: t })
    }
  }

  async function handleSync(enqueue = true) {
    const t = toast.loading(enqueue ? 'Syncing (background)…' : 'Syncing…')
    setSyncing(true)
    try {
      if (enqueue) {
        await triggerWearableSync(provider, 7)
      } else {
        await triggerWearableSyncInline(provider, 7)
      }
      toast.success(enqueue ? 'Sync enqueued!' : 'Sync completed!', { id: t })
      await load()
    } catch (err: any) {
      toast.error(err?.message || 'Sync failed', { id: t })
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <>
        <LoadingScreen message="Loading connected apps…" showBottomNav />
        <BottomNav />
      </>
    )
  }

  const garminAccount = status?.accounts?.find((a: any) => a.provider === 'garmin')
  const latestJob = status?.latest_job

  return (
    <div className="min-h-screen bg-iron-black pb-20">
      <PageHeader title="Connected Apps" />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Garmin Card */}
        <div className="rounded-xl border border-iron-gray/40 bg-iron-dark-gray/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-iron-white">Garmin</h2>
              <p className="text-xs text-iron-gray">Connect your Garmin account to sync activities</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-iron-gray">Status</div>
              <div className="text-sm text-iron-white font-medium">{garminAccount?.status || 'disconnected'}</div>
            </div>
          </div>

          {!garminAccount || garminAccount.status !== 'connected' ? (
            <form onSubmit={handleConnect} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Garmin email"
                className="w-full bg-iron-black border border-iron-gray rounded-lg px-3 py-2 text-iron-white text-sm focus:outline-none focus:border-iron-orange"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Garmin password"
                className="w-full bg-iron-black border border-iron-gray rounded-lg px-3 py-2 text-iron-white text-sm focus:outline-none focus:border-iron-orange"
                required
              />
              <button
                type="submit"
                className="bg-iron-orange text-iron-white rounded-lg px-4 py-2 text-sm hover:opacity-90"
              >
                Connect
              </button>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleSync(true)}
                disabled={syncing}
                className="flex-1 bg-iron-orange text-iron-white rounded-lg px-4 py-2 text-sm hover:opacity-90 disabled:opacity-50"
              >
                Sync Now (Background)
              </button>
              <button
                onClick={() => handleSync(false)}
                disabled={syncing}
                className="flex-1 bg-iron-gray/40 text-iron-white rounded-lg px-4 py-2 text-sm hover:opacity-80 disabled:opacity-50"
              >
                Sync Now (Inline)
              </button>
            </div>
          )}

          {/* Job status */}
          {latestJob && (
            <div className="mt-4 text-xs text-iron-gray">
              <div>Last Job: <span className="text-iron-white">{latestJob.status}</span></div>
              {latestJob.error_message && <div className="text-red-500">{latestJob.error_message}</div>}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

