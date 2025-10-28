'use client'

/**
 * Consultation Page
 *
 * AI-powered consultation that walks users through 7 sections to build
 * a comprehensive profile for personalized coaching.
 *
 * Flow:
 * 1. Auto-start consultation on page load
 * 2. Chat interface with progress tracking
 * 3. Complete button when all sections done
 * 4. Generate personalized coach (5-10 second loading)
 * 5. Redirect to dashboard
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Send, CheckCircle2, Loader2 } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import {
  startConsultation,
  sendConsultationMessage,
  completeConsultation,
  type ConsultationMessage,
  type StartConsultationResponse,
} from '@/lib/api/consultation'

export default function ConsultationPage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ConsultationMessage[]>([])
  const [currentSection, setCurrentSection] = useState<string>('')
  const [progressPercentage, setProgressPercentage] = useState<number>(0)
  const [sectionsCompleted, setSectionsCompleted] = useState<number>(0)
  const [totalSections, setTotalSections] = useState<number>(7)

  // Input state
  const [inputMessage, setInputMessage] = useState<string>('')
  const [isSending, setIsSending] = useState<boolean>(false)

  // Loading states
  const [showIntro, setShowIntro] = useState<boolean>(true)
  const [isStarting, setIsStarting] = useState<boolean>(false)
  const [isCompleting, setIsCompleting] = useState<boolean>(false)
  const [showSuccess, setShowSuccess] = useState<boolean>(false)
  const [completionError, setCompletionError] = useState<string | null>(null)

  // UI state
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false)
  const [showTypingIndicator, setShowTypingIndicator] = useState<boolean>(false)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, showTypingIndicator])

  // Start consultation handler (manual)
  const handleStartConsultation = async () => {
    try {
      setShowIntro(false)
      setIsStarting(true)
      const response = await startConsultation()

      setSessionId(response.session_id)
      setCurrentSection(response.current_section)
      setProgressPercentage(response.progress_percentage)
      setSectionsCompleted(response.sections_completed)
      setTotalSections(response.total_sections)

      // If resuming session, load full conversation history
      if (response.conversation_history && response.conversation_history.length > 0) {
        const formattedMessages = response.conversation_history.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }))
        setMessages(formattedMessages)
      } else {
        // New session - just add initial AI message
        setMessages([
          {
            role: 'assistant',
            content: response.message,
            timestamp: new Date(),
          },
        ])
      }
    } catch (error: any) {
      console.error('Failed to start consultation:', error)

      setShowIntro(false)

      // Handle 422 (session already exists - this is OK, just means user refreshed)
      if (error.status === 422 || error.message?.includes('422')) {
        setMessages([
          {
            role: 'assistant',
            content:
              'Welcome back! It looks like you already have a consultation in progress. Please continue where you left off, or refresh the page to start over.',
            timestamp: new Date(),
          },
        ])
        setIsStarting(false)
        return
      }

      // Handle 403 (consultation not enabled)
      if (error.status === 403 || error.message?.includes('403') || error.message?.includes('not enabled')) {
        setMessages([
          {
            role: 'assistant',
            content:
              "I'm sorry, but consultation access isn't enabled for your account yet. Please contact support to get started with personalized coaching.",
            timestamp: new Date(),
          },
        ])
      } else {
        setMessages([
          {
            role: 'assistant',
            content:
              'Sorry, I encountered an error starting the consultation. Please refresh the page to try again.',
            timestamp: new Date(),
          },
        ])
      }
    } finally {
      setIsStarting(false)
    }
  }

  // Send message handler
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isSending) return

    const userMessage = inputMessage.trim()
    setInputMessage('')

    // Add user message to chat
    const newUserMessage: ConsultationMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newUserMessage])

    // Show typing indicator
    setShowTypingIndicator(true)
    setIsSending(true)

    try {
      const response = await sendConsultationMessage(sessionId, userMessage)

      // Check for milestone before updating
      const oldProgress = progressPercentage
      const newProgress = response.progress_percentage

      // Update progress
      setCurrentSection(response.current_section)
      setProgressPercentage(newProgress)
      setSectionsCompleted(response.sections_completed)
      setTotalSections(response.total_sections)

      // Add AI response
      const aiMessage: ConsultationMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])

      // Celebrate milestones
      if (oldProgress < 25 && newProgress >= 25) {
        setTimeout(() => {
          const celebrationMessage: ConsultationMessage = {
            role: 'assistant',
            content: "🎉 Great progress! You're a quarter of the way through. Keep going!",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, celebrationMessage])
        }, 1000)
      } else if (oldProgress < 50 && newProgress >= 50) {
        setTimeout(() => {
          const celebrationMessage: ConsultationMessage = {
            role: 'assistant',
            content: "🔥 Halfway there! You're doing awesome. Let's keep building your personalized plan!",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, celebrationMessage])
        }, 1000)
      } else if (oldProgress < 75 && newProgress >= 75) {
        setTimeout(() => {
          const celebrationMessage: ConsultationMessage = {
            role: 'assistant',
            content: "💪 Almost done! Just one more section and we'll generate your personalized coach.",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, celebrationMessage])
        }, 1000)
      }
    } catch (error: any) {
      console.error('Failed to send message:', error)

      // Add error message
      const errorMessage: ConsultationMessage = {
        role: 'assistant',
        content:
          "I'm having trouble processing your message. Please try again or refresh the page if the issue persists.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setShowTypingIndicator(false)
      setIsSending(false)
    }
  }

  // Complete consultation handler
  const handleComplete = async () => {
    if (!sessionId || isCompleting) return

    setIsCompleting(true)
    setCompletionError(null)

    try {
      const response = await completeConsultation(sessionId)

      if (response.success && response.consultation_completed) {
        // Success! Show success screen then redirect
        setIsCompleting(false)
        setShowSuccess(true)
        setTimeout(() => {
          window.location.href = '/coach'
        }, 4000)
      } else {
        setCompletionError(response.message || 'Failed to complete consultation')
        setIsCompleting(false)
      }
    } catch (error: any) {
      console.error('Failed to complete consultation:', error)
      setCompletionError(
        'An error occurred while generating your personalized coach. Please try again.'
      )
      setIsCompleting(false)
    }
  }

  // Keyboard handlers
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Check if consultation is complete
  const isConsultationComplete = progressPercentage >= 100

  // Intro Screen (Value Preview)
  if (showIntro) {
    return (
      <div className="min-h-screen bg-iron-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-4xl font-bold text-iron-white mb-3">
              AI Consultation
            </h1>
            <p className="text-xl text-iron-gray">
              5-minute conversation to create your personalized fitness plan
            </p>
          </div>

          <div className="bg-iron-dark-gray border border-iron-gray/40 rounded-xl p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-iron-white mb-4">
                What You&apos;ll Get:
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-iron-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-iron-orange">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-iron-white mb-1">Custom Training Program</h3>
                    <p className="text-iron-gray">
                      Workouts designed for your goals, experience level, and available time
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-iron-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-iron-orange">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-iron-white mb-1">Personalized Meal Plans</h3>
                    <p className="text-iron-gray">
                      Nutrition strategy based on your preferences, lifestyle, and goals
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-iron-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-iron-orange">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-iron-white mb-1">AI Coach That Knows You</h3>
                    <p className="text-iron-gray">
                      Your coach will understand your challenges, motivations, and what works for you
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="border-t border-iron-gray/40 pt-6">
              <h3 className="text-lg font-bold text-iron-white mb-3">How It Works:</h3>
              <div className="space-y-2 text-iron-gray">
                <p>• Answer questions about your fitness background and goals</p>
                <p>• Share your preferences and challenges</p>
                <p>• Our AI creates your personalized coaching profile</p>
                <p className="text-sm text-iron-gray/70 mt-3">
                  ⏱️ Takes about 5 minutes • 💬 Natural conversation • ✅ 7 sections to complete
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartConsultation}
            className="w-full px-8 py-6 rounded-xl text-xl font-bold bg-iron-orange text-iron-white shadow-xl shadow-iron-orange/50 hover:shadow-2xl hover:shadow-iron-orange/60 transition-all"
          >
            Start Consultation
          </button>

          <button
            onClick={() => router.back()}
            className="w-full px-6 py-3 rounded-xl text-sm font-medium border-2 border-iron-gray text-iron-gray hover:border-iron-white hover:text-iron-white transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Success Screen (After Completion)
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-iron-black flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-8">
          <div className="text-6xl mb-4 animate-bounce">✅</div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-iron-white">
              Consultation Complete!
            </h2>
            <p className="text-xl text-iron-gray">
              Your personalized coaching profile has been created
            </p>
          </div>

          <div className="bg-iron-dark-gray border-2 border-green-500/30 rounded-xl p-8 space-y-4">
            <h3 className="text-xl font-bold text-iron-white mb-4">What&apos;s Next:</h3>
            <ul className="space-y-3 text-left">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-iron-gray">Your AI coach now understands your goals and challenges</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-iron-gray">Recommendations are personalized to your profile</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-iron-gray">Start chatting with your coach to get started</span>
              </li>
            </ul>
          </div>

          <p className="text-iron-gray">
            Taking you to your coach...
          </p>

          <div className="flex gap-1 justify-center">
            <div className="w-2 h-2 bg-iron-orange rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-iron-orange rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-iron-orange rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    )
  }

  // Full-screen loading during completion
  if (isCompleting) {
    return (
      <div className="min-h-screen bg-iron-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 mx-auto">
              <Loader2 className="w-24 h-24 text-iron-orange animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-2xl text-iron-white uppercase tracking-wider">
              Creating Your Personalized Coach
            </h2>
            <p className="text-iron-gray">
              Analyzing your conversation and generating your unique coaching persona...
            </p>
            <p className="text-sm text-iron-gray/70">This takes about 10 seconds</p>
          </div>
          {completionError && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{completionError}</p>
              <button
                onClick={() => {
                  setIsCompleting(false)
                  setCompletionError(null)
                }}
                className="mt-2 text-iron-orange hover:text-iron-orange/80 text-sm"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-iron-black flex flex-col">
      {/* Progress Bar Header */}
      <header className="sticky top-0 bg-iron-black border-b border-iron-gray/40 z-[100]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-iron-orange" />
            <h1 className="font-heading text-lg text-iron-white uppercase tracking-wider">
              AI Consultation
            </h1>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-iron-gray">{currentSection || 'Loading...'}</span>
              <span className="text-iron-orange font-medium">{progressPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-iron-dark-gray rounded-full overflow-hidden">
              <div
                className="h-full bg-iron-orange transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-iron-gray">
              Section {sectionsCompleted} of {totalSections} completed
            </div>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <main
        className={`flex-1 overflow-y-auto ${
          keyboardVisible ? 'pb-[200px]' : 'pb-24'
        } transition-all duration-300`}
      >
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {isStarting ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-iron-orange animate-spin" />
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-iron-orange text-iron-white'
                        : 'bg-iron-dark-gray/50 text-iron-white border border-iron-gray/40'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {showTypingIndicator && (
                <div className="flex justify-start">
                  <div className="bg-iron-dark-gray/50 border border-iron-gray/40 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-iron-gray rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-iron-gray rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="w-2 h-2 bg-iron-gray rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Complete Button (shows when done) */}
              {isConsultationComplete && !isStarting && (
                <div className="flex justify-center pt-6">
                  <button
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-heading text-lg uppercase tracking-wider rounded-xl hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Complete Consultation
                  </button>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area (Floating) */}
      {!isConsultationComplete && (
        <div
          className={`fixed left-0 right-0 bg-iron-black border-t border-iron-gray/40 z-[400] transition-all duration-300 ${
            keyboardVisible ? 'bottom-0 pb-4' : 'bottom-16 pb-2'
          }`}
        >
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setKeyboardVisible(true)}
                onBlur={() => setTimeout(() => setKeyboardVisible(false), 100)}
                placeholder="Type your response..."
                disabled={isSending || isStarting}
                rows={1}
                className="flex-1 min-h-[44px] max-h-32 px-4 py-3 bg-iron-dark-gray border border-iron-gray text-iron-white placeholder-iron-gray rounded-xl focus:outline-none focus:border-iron-orange resize-none disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isSending || isStarting}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-iron-orange text-iron-white rounded-xl hover:bg-iron-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav hideOnScroll={false} />
    </div>
  )
}
