'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { approvalApi } from '@/lib/api'
import Link from 'next/link'
import { VariantRating } from '@/components/variant-rating'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Edit3,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'

export default function ApprovalPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const carouselId = params.id as string

  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [regenerationPrompt, setRegenerationPrompt] = useState('')

  // Fetch approval workflow status
  const { data: workflowStatus, isLoading } = useQuery({
    queryKey: ['approval-status', carouselId],
    queryFn: () => approvalApi.getStatus(carouselId),
    refetchInterval: 5000, // Poll every 5 seconds
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (data: { variant_id: string; user_notes?: string; selection_reason?: string }) =>
      approvalApi.approveVariant(carouselId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-status', carouselId] })
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (data: {
      carousel_id: string
      stage: string
      rejection_reason: string
      regeneration_prompt?: string
    }) => approvalApi.rejectStage(carouselId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-status', carouselId] })
      setShowRejectDialog(false)
      setRejectionReason('')
      setRegenerationPrompt('')
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-brand-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading approval workflow...</p>
        </div>
      </div>
    )
  }

  if (!workflowStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Approval workflow not found</p>
        </div>
      </div>
    )
  }

  const currentStageData = workflowStatus.stages.find(
    (s: any) => s.stage === workflowStatus.current_stage
  )

  const stageIcons: Record<string, any> = {
    research: '🔍',
    outline: '📋',
    copywriting: '✍️',
    hook: '🎣',
    visual: '🎨',
  }

  const stageLabels: Record<string, string> = {
    research: 'Research',
    outline: 'Outline',
    copywriting: 'Copywriting',
    hook: 'Hook',
    visual: 'Visual Design',
  }

  const handleApprove = (variantId: string, selectionReason?: string) => {
    approveMutation.mutate({
      variant_id: variantId,
      selection_reason: selectionReason,
    })
  }

  const handleReject = (stage: string) => {
    if (!rejectionReason) {
      alert('Please provide a rejection reason')
      return
    }

    rejectMutation.mutate({
      carousel_id: carouselId,
      stage,
      rejection_reason: rejectionReason,
      regeneration_prompt: regenerationPrompt || undefined,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Approval Workflow</h1>
              <p className="text-gray-600 mt-1">
                Review and approve content at each stage
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-brand-600">
                {workflowStatus.overall_progress_percentage}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="relative">
              <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                <div
                  style={{ width: `${workflowStatus.overall_progress_percentage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand-600 transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stage Navigation */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {workflowStatus.stages.map((stage: any, index: number) => {
            const isActive = stage.stage === workflowStatus.current_stage
            const isCompleted = stage.status === 'approved'
            const isAwaiting = stage.status === 'awaiting_approval'
            const isGenerating = stage.status === 'generating'

            return (
              <button
                key={stage.stage}
                onClick={() => isAwaiting && setSelectedStage(stage.stage)}
                className={`p-4 rounded-lg border-2 transition ${
                  isActive
                    ? 'border-brand-600 bg-brand-50'
                    : isCompleted
                    ? 'border-green-500 bg-green-50'
                    : isGenerating
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                } ${isAwaiting ? 'cursor-pointer hover:border-brand-400' : 'cursor-default'}`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{stageIcons[stage.stage]}</div>
                  <div className="text-sm font-semibold mb-1">
                    {stageLabels[stage.stage]}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    {isCompleted && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600">Approved</span>
                      </>
                    )}
                    {isGenerating && (
                      <>
                        <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                        <span className="text-xs text-blue-600">Generating</span>
                      </>
                    )}
                    {isAwaiting && (
                      <>
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-orange-600">Review</span>
                      </>
                    )}
                    {stage.status === 'pending' && (
                      <span className="text-xs text-gray-400">Pending</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Current Stage Details */}
        {currentStageData && currentStageData.status === 'awaiting_approval' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {stageIcons[currentStageData.stage]} {stageLabels[currentStageData.stage]} Stage
                </h2>
                <p className="text-gray-600">
                  {workflowStatus.next_action_required}
                </p>
              </div>
              <button
                onClick={() => setShowRejectDialog(true)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject All & Regenerate
              </button>
            </div>

            {/* Variants Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentStageData.variants.map((variant: any, index: number) => (
                <VariantCard
                  key={variant.id}
                  variant={variant}
                  variantNumber={index + 1}
                  stage={currentStageData.stage}
                  carouselId={carouselId}
                  onApprove={handleApprove}
                />
              ))}
            </div>
          </div>
        )}

        {/* Generating State */}
        {currentStageData && currentStageData.status === 'generating' && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Sparkles className="w-16 h-16 text-brand-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">
              Generating {stageLabels[currentStageData.stage]} Variants
            </h3>
            <p className="text-gray-600">
              Please wait while we create 3 options for you to review...
            </p>
          </div>
        )}

        {/* Workflow Complete */}
        {workflowStatus.overall_progress_percentage === 100 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-12 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-900 mb-2">
              All Stages Approved! 🎉
            </h2>
            <p className="text-green-700 mb-6 text-lg">
              Your carousel is ready for final generation
            </p>
            <Link
              href={`/carousel/${carouselId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              View Final Carousel
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Reject & Regenerate</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting these variants and optional instructions
              for regeneration.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  rows={3}
                  placeholder="e.g., All hooks feel too salesy, need more educational angle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Regeneration Instructions (Optional)
                </label>
                <textarea
                  value={regenerationPrompt}
                  onChange={(e) => setRegenerationPrompt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  rows={2}
                  placeholder="e.g., Focus on curiosity and learning, avoid FOMO tactics"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRejectDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(currentStageData!.stage)}
                disabled={!rejectionReason || rejectMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject & Regenerate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VariantCard({
  variant,
  variantNumber,
  stage,
  carouselId,
  onApprove,
}: {
  variant: any
  variantNumber: number
  stage: string
  carouselId: string
  onApprove: (variantId: string, selectionReason?: string) => void
}) {
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [selectionReason, setSelectionReason] = useState('')
  const [userRating, setUserRating] = useState<number | null>(null)

  const handleApproveClick = () => {
    onApprove(variant.id, selectionReason || undefined)
    setShowApproveDialog(false)
    setSelectionReason('')
  }

  const handleScoreSubmit = async (score: number, feedback?: string) => {
    try {
      const response = await fetch(
        `/api/v1/carousels/${carouselId}/variants/${variant.id}/score`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            variant_id: variant.id,
            carousel_id: carouselId,
            stage: stage,
            user_score: score,
            user_feedback: feedback,
            selected: false,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to submit rating')
      }

      setUserRating(score)
      console.log('Rating submitted successfully:', { variant_id: variant.id, score })
    } catch (error) {
      console.error('Failed to submit rating:', error)
      alert('Failed to submit rating. Please try again.')
    }
  }

  return (
    <>
      <div className="border-2 border-gray-200 rounded-lg p-5 hover:border-brand-300 transition">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-semibold">
              Option {variantNumber}
            </span>
            {variant.heuristic_score && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-600">
                  {variant.heuristic_score.toFixed(1)}/10
                </span>
              </div>
            )}
          </div>
          {variant.user_edited && (
            <span className="text-xs text-purple-600 flex items-center gap-1">
              <Edit3 className="w-3 h-3" />
              Edited
            </span>
          )}
        </div>

        {/* Variant Content Preview */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg min-h-[120px]">
          {stage === 'hook' && (
            <div>
              <p className="font-semibold text-lg mb-2">{variant.data.hook}</p>
              <p className="text-sm text-gray-600">Pattern: {variant.data.pattern}</p>
            </div>
          )}
          {stage === 'research' && (
            <div className="text-sm space-y-2">
              <div>
                <strong>Key Facts:</strong> {variant.data.key_facts?.length || 0}
              </div>
              <div>
                <strong>Sources:</strong> {variant.data.sources?.length || 0}
              </div>
            </div>
          )}
          {stage === 'copywriting' && (
            <div>
              <p className="font-semibold mb-1">{variant.data.headline}</p>
              <p className="text-sm text-gray-600 line-clamp-3">
                {variant.data.body_text}
              </p>
            </div>
          )}
          {stage === 'outline' && (
            <div className="text-sm">
              <strong>Slides:</strong> {variant.data.slides?.length || 0}
            </div>
          )}
          {stage === 'visual' && (
            <div className="text-sm space-y-1">
              <div>
                <strong>Style:</strong> {variant.data.style}
              </div>
              <div>
                <strong>Colors:</strong> {variant.data.colors}
              </div>
            </div>
          )}
        </div>

        {/* Scoring Criteria */}
        {variant.scoring_criteria && (
          <div className="mb-4 text-xs text-gray-600 space-y-1">
            {Object.entries(variant.scoring_criteria).map(([key, value]: [string, any]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-semibold">{value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Star Rating Component */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <VariantRating
            variantId={variant.id}
            carouselId={carouselId}
            stage={stage}
            onScoreSubmit={handleScoreSubmit}
            disabled={false}
          />
        </div>

        <button
          onClick={() => setShowApproveDialog(true)}
          className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-semibold flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Approve This Option
        </button>
      </div>

      {/* Approve Dialog */}
      {showApproveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Approve Option {variantNumber}</h3>
            <p className="text-gray-600 mb-4">
              Why did you choose this variant? (Optional but helps the system learn)
            </p>

            <textarea
              value={selectionReason}
              onChange={(e) => setSelectionReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              rows={3}
              placeholder="e.g., Most scroll-stopping and relevant to audience"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowApproveDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveClick}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
