'use client'

/**
 * Settings Page - MVP Version
 *
 * Minimal settings for Week 1 ruthless scope cut:
 * - Language preference
 * - Unit system (metric/imperial)
 * - Timezone
 * - Sign out
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Globe, Scale, Clock } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { getFullUserProfile, updateFullUserProfile, type FullUserProfile } from '@/lib/api/profile'
import { logout } from '@/lib/api/auth'
import { useTimezone } from '@/lib/context/TimezoneContext'

export default function SettingsPage() {
  const router = useRouter()
  const { timezone } = useTimezone()
  const [profile, setProfile] = useState<FullUserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true)
        const profileData = await getFullUserProfile()
        setProfile(profileData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings')
        console.error('Settings load error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSignOut = async () => {
    await logout()
  }

  const handleUpdateSetting = async (updates: Partial<FullUserProfile>) => {
    if (!profile) return

    try {
      setIsSaving(true)
      const updated = await updateFullUserProfile(updates)
      setProfile(updated)
    } catch (err) {
      console.error('Failed to update setting:', err)
      setError('Failed to update setting')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen message="Loading settings..." />
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-iron-black text-iron-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md px-4">
            <h2 className="font-heading text-2xl text-iron-orange mb-2 uppercase">Unable to Load</h2>
            <p className="text-iron-gray mb-6">{error}</p>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-iron-black text-iron-white pb-40">
      {/* Header */}
      <header className="border-b border-iron-gray sticky top-0 bg-iron-black z-[100]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-iron-white uppercase tracking-wider">
            Settings
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* User Info Card */}
        <div className="rounded-xl border border-iron-gray/40 bg-iron-dark-gray/50 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-iron-orange/20 border border-iron-orange/30 flex items-center justify-center text-iron-orange font-heading text-xl">
              {(profile.full_name || profile.email || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate">{profile.full_name || profile.email}</h2>
              <p className="text-sm text-iron-gray">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Language Setting */}
        <div className="rounded-xl border border-iron-gray/40 bg-iron-dark-gray/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-iron-orange" />
              <div>
                <h3 className="font-heading text-lg text-iron-white uppercase tracking-wider">Language</h3>
                <p className="text-sm text-iron-gray">Choose your preferred language</p>
              </div>
            </div>
            <select
              value={profile.language || 'en'}
              onChange={(e) => handleUpdateSetting({ language: e.target.value })}
              disabled={isSaving}
              className="px-4 py-2 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange rounded-lg disabled:opacity-50"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="pt">Português</option>
            </select>
          </div>
        </div>

        {/* Unit System Setting */}
        <div className="rounded-xl border border-iron-gray/40 bg-iron-dark-gray/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-iron-orange" />
              <div>
                <h3 className="font-heading text-lg text-iron-white uppercase tracking-wider">Unit System</h3>
                <p className="text-sm text-iron-gray">Metric or Imperial units</p>
              </div>
            </div>
            <select
              value={profile.unit_system || 'metric'}
              onChange={(e) => handleUpdateSetting({ unit_system: e.target.value as 'metric' | 'imperial' })}
              disabled={isSaving}
              className="px-4 py-2 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange rounded-lg disabled:opacity-50"
            >
              <option value="metric">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lb, ft)</option>
            </select>
          </div>
        </div>

        {/* Timezone Setting */}
        <div className="rounded-xl border border-iron-gray/40 bg-iron-dark-gray/50 p-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-iron-orange" />
            <div>
              <h3 className="font-heading text-lg text-iron-white uppercase tracking-wider">Timezone</h3>
              <p className="text-sm text-iron-gray mt-1">Current: {profile.timezone || timezone || 'UTC'}</p>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full border-2 border-red-600/80 text-red-500 font-heading text-lg py-4 uppercase tracking-wider hover:bg-red-600 hover:text-iron-white transition-colors flex items-center justify-center gap-2 rounded-xl"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </main>

      <BottomNav />
    </div>
  )
}
