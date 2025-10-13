/**
 * Activity Templates Page - Manage workout templates
 *
 * Shows:
 * - List of user's activity templates grouped by category
 * - Create new template button
 * - Edit/delete functionality
 * - View template stats
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getTemplates, deleteTemplate } from '@/lib/api/templates'
import TemplateCard from '@/app/components/templates/TemplateCard'
import type { ActivityTemplate } from '@/lib/types/templates'
import { groupTemplatesByCategory, ACTIVITY_TYPE_META } from '@/lib/types/templates'

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<ActivityTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other'>('all')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getTemplates({ limit: 100, is_active: true })
      setTemplates(response.templates)
    } catch (err) {
      console.error('Failed to load templates:', err)
      setError('Failed to load templates. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/activities/templates/${id}/edit`)
  }

  const handleDelete = async (id: string) => {
    const template = templates.find(t => t.id === id)
    if (!template) return

    if (!confirm(`Delete "${template.template_name}"? This will not delete activities that used this template.`)) {
      return
    }

    try {
      await deleteTemplate(id)
      // Refresh templates list
      await loadTemplates()
    } catch (err) {
      console.error('Failed to delete template:', err)
      alert('Failed to delete template. Please try again.')
    }
  }

  const handleViewStats = (id: string) => {
    router.push(`/activities/templates/${id}/stats`)
  }

  const handleUseTemplate = (id: string) => {
    // Navigate to activity log page with template pre-selected
    router.push(`/activities/log?template=${id}`)
  }

  const filteredTemplates = templates.filter(template => {
    if (filter === 'all') return true
    const meta = ACTIVITY_TYPE_META[template.activity_type]
    return meta.category === filter
  })

  const groupedTemplates = groupTemplatesByCategory(filteredTemplates)
  const hasTemplates = templates.length > 0

  if (loading) {
    return (
      <div className="min-h-screen bg-iron-black flex items-center justify-center">
        <div className="text-iron-white">Loading templates...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-iron-black pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-iron-black border-b border-iron-gray">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/activities')}
            className="text-iron-gray hover:text-iron-white transition mb-3"
            aria-label="Back to activities"
          >
            ← Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-iron-white">Activity Templates</h1>
              <p className="text-sm text-iron-gray mt-1">
                Create templates for recurring workouts
              </p>
            </div>
            <button
              onClick={() => router.push('/activities/templates/new')}
              className="bg-iron-orange text-iron-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
            >
              + New Template
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        {hasTemplates && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-iron-orange text-iron-white'
                  : 'bg-iron-dark-gray text-iron-gray hover:text-iron-white'
              }`}
            >
              All ({templates.length})
            </button>
            {['cardio', 'strength', 'flexibility', 'sports', 'other'].map(category => {
              const count = templates.filter(t => {
                const meta = ACTIVITY_TYPE_META[t.activity_type]
                return meta.category === category
              }).length

              if (count === 0) return null

              return (
                <button
                  key={category}
                  onClick={() => setFilter(category as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap capitalize ${
                    filter === category
                      ? 'bg-iron-orange text-iron-white'
                      : 'bg-iron-dark-gray text-iron-gray hover:text-iron-white'
                  }`}
                >
                  {category} ({count})
                </button>
              )
            })}
          </div>
        )}

        {/* Templates List */}
        {!hasTemplates ? (
          // Empty State
          <div className="bg-iron-dark-gray rounded-xl p-12 border border-iron-gray text-center">
            <div className="text-4xl mb-4">🏋️</div>
            <h3 className="text-xl font-semibold text-iron-white mb-2">
              No templates yet
            </h3>
            <p className="text-iron-gray mb-6 max-w-md mx-auto">
              Create templates for your recurring workouts to auto-match activities and prefill log data.
            </p>
            <button
              onClick={() => router.push('/activities/templates/new')}
              className="bg-iron-orange text-iron-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
            >
              Create Your First Template
            </button>
          </div>
        ) : filteredTemplates.length === 0 ? (
          // No results for filter
          <div className="bg-iron-dark-gray rounded-xl p-12 border border-iron-gray text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-iron-white mb-2">
              No {filter} templates
            </h3>
            <p className="text-iron-gray mb-6">
              Try selecting a different category
            </p>
            <button
              onClick={() => setFilter('all')}
              className="text-iron-orange hover:underline"
            >
              View all templates
            </button>
          </div>
        ) : (
          // Grouped Templates
          <div className="space-y-8">
            {Object.entries(groupedTemplates)
              .sort(([catA], [catB]) => {
                // Order: cardio, strength, flexibility, sports, other
                const order = ['cardio', 'strength', 'flexibility', 'sports', 'other']
                return order.indexOf(catA) - order.indexOf(catB)
              })
              .map(([category, categoryTemplates]) => (
                <div key={category}>
                  {/* Category Header */}
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-iron-white capitalize">
                      {category} Templates
                    </h2>
                    <p className="text-sm text-iron-gray">
                      {categoryTemplates.length} {categoryTemplates.length === 1 ? 'template' : 'templates'}
                    </p>
                  </div>

                  {/* Templates Grid */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {categoryTemplates
                      .sort((a, b) => {
                        // Sort by use_count desc, then last_used_at desc, then name asc
                        if (b.use_count !== a.use_count) {
                          return b.use_count - a.use_count
                        }
                        if (a.last_used_at && b.last_used_at) {
                          return new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime()
                        }
                        return a.template_name.localeCompare(b.template_name)
                      })
                      .map(template => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onViewStats={handleViewStats}
                          onUseTemplate={handleUseTemplate}
                        />
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Create from activity hint */}
        {hasTemplates && (
          <div className="bg-iron-dark-gray/50 rounded-lg p-4 border border-iron-gray/50 text-center">
            <p className="text-sm text-iron-gray">
              💡 Tip: You can also create templates from existing activities in your activity log
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
