/**
 * Create Template Modal Component
 *
 * Modal for creating an activity template from an existing activity
 * Uses React Portal for proper z-index handling
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { createTemplateFromActivity } from '@/lib/api/templates'
import type { ActivityTemplate, CreateTemplateFromActivityRequest } from '@/lib/types/templates'
import { ACTIVITY_TYPE_META } from '@/lib/types/templates'

interface CreateTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  activityId: string
  activityName: string
  activityType: string
  onSuccess?: (template: ActivityTemplate) => void
}

export default function CreateTemplateModal({
  isOpen,
  onClose,
  activityId,
  activityName,
  activityType,
  onSuccess
}: CreateTemplateModalProps) {
  const [templateName, setTemplateName] = useState('')
  const [autoMatchEnabled, setAutoMatchEnabled] = useState(true)
  const [requireGpsMatch, setRequireGpsMatch] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Set mounted flag for portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Pre-fill template name with activity name
  useEffect(() => {
    if (isOpen && activityName) {
      setTemplateName(activityName)
    }
  }, [isOpen, activityName])

  // ESC key handler
  const handleEscKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    },
    [isOpen, onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleEscKey])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTemplateName('')
      setAutoMatchEnabled(true)
      setRequireGpsMatch(false)
      setError(null)
    }
  }, [isOpen])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!templateName.trim()) {
      setError('Template name is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data: CreateTemplateFromActivityRequest = {
        template_name: templateName.trim(),
        auto_match_enabled: autoMatchEnabled,
        require_gps_match: requireGpsMatch
      }

      const template = await createTemplateFromActivity(activityId, data)

      // Success!
      if (onSuccess) {
        onSuccess(template)
      }
      onClose()
    } catch (err: any) {
      console.error('Failed to create template:', err)
      setError(err.message || 'Failed to create template. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Don't render until mounted (prevents SSR issues)
  if (!mounted || !isOpen) {
    return null
  }

  const activityMeta = ACTIVITY_TYPE_META[activityType as keyof typeof ACTIVITY_TYPE_META] || {
    icon: '🎯',
    label: activityType
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-iron-dark-gray rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-iron-gray">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-iron-gray">
          <h2 id="modal-title" className="text-xl font-bold text-iron-white">
            Create Template from Activity
          </h2>
          <button
            onClick={onClose}
            className="text-iron-gray hover:text-iron-white transition"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Template Name Input */}
          <div className="space-y-2">
            <label htmlFor="template-name" className="block text-sm font-medium text-iron-white">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              id="template-name"
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white placeholder-iron-gray focus:outline-none focus:border-iron-orange transition"
              placeholder="e.g., Morning Run Route"
              autoFocus
              disabled={loading}
            />
          </div>

          {/* Auto-Match Checkbox */}
          <div className="flex items-start gap-3">
            <input
              id="auto-match"
              type="checkbox"
              checked={autoMatchEnabled}
              onChange={(e) => setAutoMatchEnabled(e.target.checked)}
              className="mt-1 w-4 h-4 bg-iron-black border-iron-gray rounded focus:ring-2 focus:ring-iron-orange text-iron-orange"
              disabled={loading}
            />
            <label htmlFor="auto-match" className="flex-1 text-sm text-iron-white">
              <span className="font-medium">Enable auto-matching</span>
              <p className="text-iron-gray mt-1">
                Automatically suggest this template when logging similar activities
              </p>
            </label>
          </div>

          {/* GPS Match Checkbox */}
          <div className="flex items-start gap-3">
            <input
              id="gps-match"
              type="checkbox"
              checked={requireGpsMatch}
              onChange={(e) => setRequireGpsMatch(e.target.checked)}
              className="mt-1 w-4 h-4 bg-iron-black border-iron-gray rounded focus:ring-2 focus:ring-iron-orange text-iron-orange"
              disabled={loading}
            />
            <label htmlFor="gps-match" className="flex-1 text-sm text-iron-white">
              <span className="font-medium">Require GPS route match</span>
              <p className="text-iron-gray mt-1">
                Only suggest for activities on the same route (requires GPS data)
              </p>
            </label>
          </div>

          {/* Preview Box */}
          <div className="bg-iron-black/50 rounded-lg p-4 border border-iron-gray/50">
            <h3 className="text-sm font-semibold text-iron-white mb-3">
              This template will include:
            </h3>
            <ul className="space-y-2 text-sm text-iron-gray">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Activity type: <strong className="text-iron-white">{activityMeta.icon} {activityMeta.label}</strong>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Distance and duration (expected ranges)</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>All metrics (heart rate, pace, etc.)</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Notes and workout description</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Time of day preferences</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-iron-gray/30 text-iron-white px-4 py-3 rounded-lg font-medium hover:bg-iron-gray/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-iron-orange text-iron-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !templateName.trim()}
            >
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
