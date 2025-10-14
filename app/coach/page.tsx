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
import { sendCoachMessage, confirmLog, type SendMessageRequest, type SendMessageResponse, type LogPreview } from '@/lib/api/coach'
import { BottomNav } from '@/components/BottomNav'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { useOnboardingCheck } from '@/lib/hooks/useOnboardingCheck'

// Import coach components
import { MessageBubble } from '@/components/Coach/Message/MessageBubble'
import { LoadingIndicator } from '@/components/Coach/Loading/LoadingIndicator'
import { LogPreviewCard } from '@/components/Coach/LogPreview/LogPreviewCard'
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
  const [error, setError] = useState<string | null>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

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

      // Handle log preview
      if (data.is_log_preview && data.log_preview) {
        setLogPreview(data.log_preview)
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
          toolsUsed: data.tools_used
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

  // Handle log preview confirmation
  const handleLogConfirm = useCallback(async (logData: any) => {
    setLogPreview(null)
    hapticFeedback('medium')

    const toastId = toast.loading('Saving log...')

    try {
      if (conversationId) {
        await confirmLog({
          conversation_id: conversationId,
          data: logData
        })

        toast.success('Log saved successfully!', { id: toastId })

        // Add success message
        const successMessage: Message = {
          id: `success_${Date.now()}`,
          role: 'assistant',
          content: 'Successfully logged!',
          timestamp: new Date(),
          type: 'text'
        }

        setMessages(prev => [...prev, successMessage])
      }
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
  }, [conversationId])

  // Handle log preview cancellation
  const handleLogCancel = useCallback(() => {
    setLogPreview(null)
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

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto overflow-x-hidden px-4 ${messages.length === 0 && !loading.isLoading ? 'flex items-center justify-center' : 'py-6 space-y-4'}`}
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

        {/* Log preview overlay */}
        <AnimatePresence>
          {logPreview && (
            <motion.div
              key="log-preview-overlay"
              className="fixed inset-0 z-[250] bg-iron-black/80 backdrop-blur-sm flex items-end justify-center p-4"
              variants={overlayVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <motion.div
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <LogPreviewCard
                  preview={logPreview}
                  onConfirm={handleLogConfirm}
                  onCancel={handleLogCancel}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* Input (fixed to bottom, above BottomNav) */}
      <motion.div
        className="px-4 pb-2"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChatInput
          ref={inputRef}
          value={inputValue}
          onChange={setInputValue}
          onSend={sendMessage}
          disabled={loading.isLoading || !!logPreview}
          placeholder={logPreview ? 'Confirm or cancel log first...' : 'Message your coach...'}
        />
      </motion.div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
