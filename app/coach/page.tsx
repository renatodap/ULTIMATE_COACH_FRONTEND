/**
 * Coach Chat Page - AI Coach Interface
 *
 * Full-screen AI coach chat interface with:
 * - Real-time messaging
 * - 3-tier loading states
 * - Log previews for nutrition/workout logging
 * - Context-aware responses
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { sendCoachMessage, confirmLog, confirmLogs, type SendMessageRequest, type SendMessageResponse, type LogPreview } from '@/lib/api/coach'
import { BottomNav } from '@/components/BottomNav'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { useOnboardingCheck } from '@/lib/hooks/useOnboardingCheck'

// Import coach components
import { MessageBubble } from '@/components/Coach/Message/MessageBubble'
import { LoadingIndicator } from '@/components/Coach/Loading/LoadingIndicator'
import { ConfirmationModal } from '@/components/Coach/ConfirmationModal/ConfirmationModal'
import { ChatInput } from '@/components/Coach/Input/ChatInput'
import { EmptyState } from '@/components/Coach/EmptyState/EmptyState'

// Import utils and types
import { getSmartLoadingMessage, scrollToBottom, isScrolledToBottom, hapticFeedback } from '@/components/Coach/shared/utils'
import type { Message, LoadingState } from '@/components/Coach/CoachChat/CoachChat.types'

// Animation variants
const messageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 }
}

const emptyStateVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const loadingVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 }
}

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

const modalVariants = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 50, scale: 0.95 }
}

const buttonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
}

export default function CoachPage() {
  const router = useRouter()
  
  // CRITICAL: Check authentication and onboarding status
  const { loading: authLoading, onboardingComplete } = useOnboardingCheck()

  // State
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    message: 'Coach is typing...'
  })
  const [logPreview, setLogPreview] = useState<LogPreview | null>(null)
  const [logPreviews, setLogPreviews] = useState<LogPreview[]>([])
  const [isMultiLog, setIsMultiLog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      const isAtBottom = isScrolledToBottom(messagesContainerRef.current)
      if (isAtBottom || loading.isLoading) {
        scrollToBottom(messagesContainerRef.current)
      }
    }
  }, [messages, loading.isLoading])

  // Handle scroll to show/hide "scroll to bottom" button
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const isAtBottom = isScrolledToBottom(messagesContainerRef.current)
      setShowScrollButton(!isAtBottom && messages.length > 0)
    }
  }, [messages.length])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Send message handler
  const sendMessage = useCallback(async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim()
    if (!textToSend || loading.isLoading) return

    // Clear input and add user message
    setInputValue('')
    setError(null)
    hapticFeedback('light')

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])

    // Add a brief human-like pause before showing loading (400ms)
    await new Promise(resolve => setTimeout(resolve, 400))

    // Start loading (Tier 1)
    setLoading({
      isLoading: true,
      message: 'Coach is typing...'
    })

    // Upgrade to context-aware loading after 2s (Tier 2)
    loadingTimeoutRef.current = setTimeout(() => {
      setLoading(prev => ({
        ...prev,
        message: getSmartLoadingMessage(textToSend)
      }))
    }, 2000)

    try {
      const request: SendMessageRequest = {
        message: textToSend,
        conversation_id: conversationId
      }

      const data: SendMessageResponse = await sendCoachMessage(request)

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Update conversation ID if new
      if (data.conversation_id && data.conversation_id !== conversationId) {
        setConversationId(data.conversation_id)
      }

      // Handle log preview - support both single and multi-logging
      if (data.is_log_preview) {
        console.log('[Coach Page] Log preview detected:', {
          multi_log: data.multi_log,
          log_count: data.log_count,
          single_preview: !!data.log_preview,
          previews_array: !!data.log_previews,
          previews_length: data.log_previews?.length
        })

        // CRITICAL: Validate multi-log response
        if (data.multi_log) {
          if (!data.log_previews || data.log_previews.length === 0) {
            console.error('[Coach Page] Multi-log flag set but no log_previews provided:', data)
            setLoading({ isLoading: false, message: '' })

            const errorMsg: Message = {
              id: `error_${Date.now()}`,
              role: 'assistant',
              content: 'I detected multiple logs but couldn\'t process them. Please try again or log them separately.',
              timestamp: new Date(),
              type: 'error'
            }
            setMessages(prev => [...prev, errorMsg])
            toast.error('Failed to process multiple logs')
            return
          }

          // Multi-logging mode
          console.log('[Coach Page] Setting multiple log previews:', data.log_previews)
          setLogPreviews(data.log_previews)
          setIsMultiLog(true)
          setLogPreview(null)
        } else if (data.log_preview) {
          // Single log mode (backward compatible)
          console.log('[Coach Page] Setting single log preview:', data.log_preview)
          setLogPreview(data.log_preview)
          setLogPreviews([])
          setIsMultiLog(false)
        } else {
          // Edge case: is_log_preview true but no data
          console.error('[Coach Page] is_log_preview true but no preview data:', data)
          setLoading({ isLoading: false, message: '' })

          const errorMsg: Message = {
            id: `error_${Date.now()}`,
            role: 'assistant',
            content: 'I couldn\'t create a log preview. Please try again.',
            timestamp: new Date(),
            type: 'error'
          }
          setMessages(prev => [...prev, errorMsg])
          toast.error('Failed to create log preview')
          return
        }

        setLoading({ isLoading: false, message: '' })
        return
      }

      // Add AI response
      const aiMessage: Message = {
        id: data.message_id || `ai_${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        type: 'text',
        metadata: {
          model: data.model,
          tokens: data.tokens_used,
          cost: data.cost_usd,
          toolsUsed: data.tools_used,
          // Include clarification metadata (when nutrition_confidence < 60%)
          waiting_for_clarification: data.waiting_for_clarification,
          nutrition_confidence: data.nutrition_confidence,
          classification_confidence: data.classification_confidence
        }
      }

      setMessages(prev => [...prev, aiMessage])
      setLoading({ isLoading: false, message: '' })

      // Focus input for next message
      if (inputRef.current) {
        inputRef.current.focus()
      }

    } catch (err: any) {
      console.error('Failed to send message:', err)

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }

      setLoading({ isLoading: false, message: '' })
      setError(err.message || 'Failed to send message. Please try again.')

      // Show error message in chat
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'I\'m having trouble responding right now. Please try again.',
        timestamp: new Date(),
        type: 'error'
      }

      setMessages(prev => [...prev, errorMessage])
    }
  }, [inputValue, loading.isLoading, conversationId])

  // Handle batch log confirmation (multi-logging)
  const handleBatchLogConfirm = useCallback(async (logIds: string[]) => {
    if (logIds.length === 0) return

    hapticFeedback('medium')

    console.log('[Batch Confirm] Confirming multiple logs:', logIds)

    // Close modal immediately for better UX
    setLogPreview(null)
    setLogPreviews([])
    setIsMultiLog(false)

    const toastId = toast.loading(`Saving ${logIds.length} logs...`)

    try {
      // NEW: Use batch confirmation endpoint (atomic backend processing)
      const response = await confirmLogs({ quick_entry_ids: logIds })

      const { success_count: successCount, failed_count: failedCount, results } = response

      console.log('[Batch Confirm] Results:', { successCount, failedCount, results })

      if (successCount > 0) {
        toast.success(`${successCount} log${successCount > 1 ? 's' : ''} saved successfully!`, { id: toastId })

        // Add success message
        const successMessage: Message = {
          id: `success_${Date.now()}`,
          role: 'assistant',
          content: `Successfully logged ${successCount} item${successCount > 1 ? 's' : ''}! 🎉${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
          timestamp: new Date(),
          type: 'text'
        }

        setMessages(prev => [...prev, successMessage])

        // Log detailed results if any failed
        if (failedCount > 0) {
          const failedLogs = results.filter(r => !r.success)
          console.warn('[Batch Confirm] Failed logs:', failedLogs)
        }
      } else {
        throw new Error('All logs failed to save')
      }

    } catch (err: any) {
      console.error('Failed to confirm logs:', err)
      toast.error('Failed to save logs', { id: toastId })

      const errorMsg: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Failed to save logs. Please try again.',
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMsg])
    }
  }, [])

  // Handle single log confirmation
  const handleSingleLogConfirm = useCallback(async (logId: string) => {
    hapticFeedback('medium')

    console.log('[Single Confirm] Confirming log:', logId)

    // Close modal immediately for better UX
    setLogPreview(null)
    setLogPreviews([])
    setIsMultiLog(false)

    const toastId = toast.loading('Saving log...')

    try {
      const response = await confirmLog({ quick_entry_id: logId })

      toast.success('Log saved successfully!', { id: toastId })

      // Add success message
      const successMessage: Message = {
        id: `success_${Date.now()}`,
        role: 'assistant',
        content: response.message || 'Log saved successfully! 🎉',
        timestamp: new Date(),
        type: 'text'
      }

      setMessages(prev => [...prev, successMessage])

    } catch (err: any) {
      console.error('Failed to confirm log:', err)
      toast.error('Failed to save log', { id: toastId })

      const errorMsg: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Failed to save log. Please try again.',
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMsg])
    }
  }, [])

  // Handle log preview cancellation
  const handleLogCancel = useCallback(() => {
    setLogPreview(null)
    setLogPreviews([])
    setIsMultiLog(false)
    hapticFeedback('light')
  }, [])

  // Handle skip individual log (multi-logging)
  const handleLogSkip = useCallback((logId: string) => {
    console.log('[Skip] Skipping log:', logId)
    // Skip is handled locally in the carousel - just log for now
    hapticFeedback('light')
  }, [])

  // Retry failed message
  const handleRetry = useCallback((message: Message) => {
    if (message.role === 'user') {
      sendMessage(message.content)
    }
  }, [sendMessage])

  // Scroll to bottom button handler
  const handleScrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      scrollToBottom(messagesContainerRef.current, true)
      hapticFeedback('light')
    }
  }, [])

  // Clear chat handler
  const handleClearChat = useCallback(() => {
    if (messages.length === 0) return

    if (confirm('Clear all messages? This cannot be undone.')) {
      setMessages([])
      setConversationId(undefined)
      setError(null)
      hapticFeedback('medium')
      toast.success('Chat cleared')
    }
  }, [messages.length])

  // CRITICAL: Show loading state while checking authentication
  if (authLoading) {
    return (
      <>
        <LoadingScreen message="Verifying authentication..." showBottomNav />
        <BottomNav />
      </>
    )
  }

  // CRITICAL: Don't render if onboarding not complete (hook will redirect)
  if (!onboardingComplete) {
    return null
  }

  return (
    <div className="min-h-screen bg-iron-black flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-[200] bg-iron-black border-b border-iron-gray/30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-iron-orange to-iron-orange/70 flex items-center justify-center flex-shrink-0"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <span className="text-xl">💪</span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-iron-white uppercase tracking-wider">Coach</h1>
              <p className="text-xs text-iron-gray uppercase tracking-wider">
                {loading.isLoading ? loading.message : 'Always here to help'}
              </p>
            </div>
            <AnimatePresence>
              {messages.length > 0 && (
                <motion.button
                  key="clear-button"
                  onClick={handleClearChat}
                  className="text-iron-gray hover:text-iron-orange transition text-sm uppercase tracking-wider font-medium px-3 py-2 border border-iron-gray hover:border-iron-orange"
                  aria-label="Clear chat"
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Messages container - Dynamic padding based on keyboard state */}
      <div
        ref={messagesContainerRef}
        className={`
          flex-1 overflow-y-auto overflow-x-hidden px-4
          ${messages.length === 0 && !loading.isLoading ? 'flex items-center justify-center' : 'py-6 space-y-4'}
          ${keyboardVisible ? 'pb-[200px]' : 'pb-24'}
        `}
        style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 && !loading.isLoading ? (
          <motion.div
            key="empty-state"
            variants={emptyStateVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
          >
            <EmptyState />
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  variants={messageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut',
                    delay: 0
                  }}
                  layout
                >
                  <MessageBubble
                    message={message}
                    isLatest={index === messages.length - 1}
                    onRetry={() => handleRetry(message)}
                  />
                </motion.div>
              ))}

              {loading.isLoading && (
                <motion.div
                  key="loading"
                  variants={loadingVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <LoadingIndicator
                    message={loading.message}
                    variant="dots"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Confirmation Modal - Supports single and multi-logging */}
        <ConfirmationModal
          preview={logPreview}
          previews={logPreviews.length > 0 ? logPreviews : undefined}
          onConfirm={handleBatchLogConfirm}
          onConfirmSingle={handleSingleLogConfirm}
          onSkip={handleLogSkip}
          onCancel={handleLogCancel}
          isOpen={!!logPreview || logPreviews.length > 0}
        />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            key="scroll-button"
            className="fixed bottom-32 right-4 z-[150] w-12 h-12 rounded-full bg-iron-orange text-iron-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
            onClick={handleScrollToBottom}
            aria-label="Scroll to bottom"
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ↓
          </motion.button>
        )}
      </AnimatePresence>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error-banner"
            className="fixed top-20 left-4 right-4 z-[150] bg-red-500/10 border border-red-500/50 p-4 flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-red-500 text-sm uppercase tracking-wider">{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 text-xl">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Input - Overlays nav when keyboard is up */}
      <motion.div
        className={`
          fixed left-0 right-0 z-[400]
          px-4 pt-3 border-t border-iron-gray/20 bg-iron-black
          transition-all duration-300 ease-in-out
          ${keyboardVisible ? 'bottom-0 pb-4' : 'bottom-16 pb-2'}
        `}
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChatInput
          ref={inputRef}
          value={inputValue}
          onChange={setInputValue}
          onSend={sendMessage}
          onFocus={() => setKeyboardVisible(true)}
          onBlur={() => {
            // Delay to allow click events to fire before blur
            setTimeout(() => setKeyboardVisible(false), 100)
          }}
          disabled={loading.isLoading || !!logPreview}
          placeholder={logPreview ? 'Confirm or cancel log first...' : 'Message your coach...'}
        />
      </motion.div>

      {/* Bottom Navigation - Always accessible on Coach page */}
      <BottomNav hideOnScroll={false} alwaysOnTop={true} />
    </div>
  )
}
