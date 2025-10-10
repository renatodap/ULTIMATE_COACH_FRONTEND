/**
 * Profile management page - view and edit business profile
 */
'use client'

import { useBusinessProfile } from '@/hooks/useBusinessProfile'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ProfilePage() {
  const router = useRouter()
  const {
    profile,
    completionStatus,
    isLoading,
    isLoadingStatus,
    hasProfile,
    updateProfile,
    isUpdating,
  } = useBusinessProfile()

  const [editMode, setEditMode] = useState(false)

  if (isLoading || isLoadingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!hasProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center max-w-md">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Profile Found</h2>
          <p className="text-gray-400 mb-6">
            Please complete onboarding to create your business profile.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Start Onboarding
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Business Profile</h1>
            <p className="text-gray-400">
              Manage your profile to improve AI personalization
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Completion Status Card */}
        {completionStatus && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Profile Completion</h2>
              <span className="text-2xl font-bold text-purple-400">
                {completionStatus.completion_percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionStatus.completion_percentage}%` }}
              />
            </div>

            {completionStatus.recommendations &&
              completionStatus.recommendations.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">
                    Recommendations:
                  </h3>
                  <ul className="space-y-1">
                    {completionStatus.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        {/* Profile Data Card */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Profile Details</h2>
            <button
              onClick={() =>
                editMode ? setEditMode(false) : router.push('/onboarding')
              }
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="space-y-6">
            {/* Business Info */}
            {profile?.business_name && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">
                  Business Name
                </label>
                <p className="text-lg text-white font-medium mt-1">
                  {profile.business_name}
                </p>
              </div>
            )}

            {profile?.industry && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">
                  Industry
                </label>
                <p className="text-lg text-white font-medium mt-1">{profile.industry}</p>
              </div>
            )}

            {profile?.target_audience && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">
                  Target Audience
                </label>
                <p className="text-white mt-1">{profile.target_audience}</p>
              </div>
            )}

            {profile?.brand_voice && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">
                  Brand Voice
                </label>
                <p className="text-white mt-1">{profile.brand_voice}</p>
              </div>
            )}

            {/* Profile Data Summary */}
            <div className="border-t border-gray-700 pt-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                Complete Profile Data
              </h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                  {JSON.stringify(profile?.profile_data, null, 2)}
                </pre>
              </div>
            </div>

            {/* Embedding Status */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                AI Personalization Status
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-2">
                    {profile?.has_business_embedding ? '✓' : '✗'}
                  </div>
                  <div className="text-xs text-gray-400">Business Profile</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-2">
                    {profile?.has_style_embedding ? '✓' : '✗'}
                  </div>
                  <div className="text-xs text-gray-400">Style Matching</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-2">
                    {profile?.has_topic_embeddings ? '✓' : '✗'}
                  </div>
                  <div className="text-xs text-gray-400">Topic Learning</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            Profile created: {new Date(profile?.created_at || '').toLocaleDateString()}
          </p>
          <p>
            Last updated:{' '}
            {new Date(profile?.profile_last_updated_at || '').toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
