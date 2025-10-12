'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.push('/login')
  }

  return (
    <div className="min-h-screen p-8 animate-fade-in">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-iron-black via-iron-black to-iron-dark-gray -z-10" />

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gradient-orange mb-2">
              DASHBOARD
            </h1>
            <p className="text-iron-gray text-sm uppercase tracking-wider">
              Your transformation hub
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-secondary text-sm"
          >
            Logout
          </button>
        </div>

        {/* Coming soon placeholder */}
        <div className="card-glass p-12 text-center space-y-6">
          <div className="text-6xl">🚀</div>
          <h2 className="text-2xl font-bold text-iron-white uppercase tracking-wider">
            Dashboard Coming Soon
          </h2>
          <p className="text-iron-gray max-w-md mx-auto">
            Your personalized fitness dashboard with nutrition tracking, AI coach, and progress analytics is under construction.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <div className="card p-4">
              <div className="text-iron-orange font-bold text-2xl">0</div>
              <div className="text-iron-gray text-xs uppercase tracking-wider">Meals Logged</div>
            </div>
            <div className="card p-4">
              <div className="text-iron-orange font-bold text-2xl">0</div>
              <div className="text-iron-gray text-xs uppercase tracking-wider">Workouts</div>
            </div>
            <div className="card p-4">
              <div className="text-iron-orange font-bold text-2xl">0</div>
              <div className="text-iron-gray text-xs uppercase tracking-wider">Days Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
