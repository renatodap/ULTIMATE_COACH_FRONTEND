/**
 * Loading State Implementation Example
 *
 * This file shows how to implement smart loading states in your chat component.
 * Copy the relevant parts into your existing chat component.
 */

import React, { useState } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface LoadingStatus {
  show: boolean;
  message: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ApiResponse {
  success: boolean;
  message_id: string;
  message: string;
  conversation_id: string;
  context_used?: {
    is_temporary_ack?: boolean;
  };
}

// ============================================================================
// SMART LOADING MESSAGE DETECTION
// ============================================================================

/**
 * Detects message intent and returns appropriate loading message.
 * This runs on the FRONTEND to provide immediate context-aware feedback.
 */
function getSmartLoadingMessage(message: string): string {
  const msg = message.toLowerCase();

  // Nutrition logging
  if (/\b(log|ate|eat|meal|breakfast|lunch|dinner|food|snack)\b/i.test(msg)) {
    return "Calculating nutrition...";
  }

  // Workout requests
  if (/\b(workout|exercise|train|training|lifting|cardio|plan|routine)\b/i.test(msg)) {
    return "Finding exercises...";
  }

  // Progress/stats
  if (/\b(progress|stats|results|weight|analyze|review|summary)\b/i.test(msg)) {
    return "Checking your progress...";
  }

  // Multi-action (complex operations)
  if (/\band\b/i.test(msg) && msg.split(' ').length > 10) {
    return "Working on it...";
  }

  // Plan creation
  if (/\b(create|generate|make|build).*\b(plan|program|schedule)\b/i.test(msg)) {
    return "Building your plan...";
  }

  // Recipe/meal planning
  if (/\b(recipe|meal plan|shopping list)\b/i.test(msg)) {
    return "Preparing meal info...";
  }

  // Default
  return "Coach is typing...";
}

// ============================================================================
// LOADING INDICATOR COMPONENT
// ============================================================================

interface LoadingIndicatorProps {
  message: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 my-2 text-gray-600 bg-gray-50 rounded-lg animate-fade-in">
      {/* Animated bouncing dots */}
      <div className="flex gap-1">
        <span
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>

      {/* Status text */}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// ============================================================================
// EXAMPLE CHAT COMPONENT WITH SMART LOADING STATES
// ============================================================================

const CoachChatExample: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>({
    show: false,
    message: "Coach is typing..."
  });
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  /**
   * Send message with 3-tier loading state management
   */
  const sendMessage = async () => {
    if (!messageInput.trim() || isWaitingForResponse) return;

    const messageText = messageInput.trim();
    setMessageInput('');
    setIsWaitingForResponse(true);

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // TIER 1: Show basic loading immediately
    setLoadingStatus({ show: true, message: "Coach is typing..." });

    // TIER 2: After 2s, upgrade to context-aware status
    const contextTimeout = setTimeout(() => {
      setLoadingStatus({
        show: true,
        message: getSmartLoadingMessage(messageText)
      });
    }, 2000);

    try {
      // Call backend API
      const response = await fetch('/api/coach/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversation_id: 'current-conversation-id' // Replace with actual ID
        })
      });

      const data: ApiResponse = await response.json();

      // Clear loading
      clearTimeout(contextTimeout);
      setLoadingStatus({ show: false, message: "" });
      setIsWaitingForResponse(false);

      if (data.success) {
        // TIER 3: Handle quick ACK (if backend sent one)
        // Option: Just show final response (cleaner)
        // Backend ACKs like "Let me check." are informational only

        // Add AI response to chat
        const aiMessage: Message = {
          id: data.message_id,
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Handle error
        throw new Error('Failed to send message');
      }

    } catch (error) {
      // Clear loading and handle error
      clearTimeout(contextTimeout);
      setLoadingStatus({ show: false, message: "" });
      setIsWaitingForResponse(false);

      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 shadow'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loadingStatus.show && (
          <LoadingIndicator message={loadingStatus.message} />
        )}
      </div>

      {/* Message input */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Message your coach..."
            disabled={isWaitingForResponse}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            onClick={sendMessage}
            disabled={isWaitingForResponse || !messageInput.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachChatExample;

// ============================================================================
// TAILWIND CSS ANIMATIONS (add to tailwind.config.js)
// ============================================================================

/*
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
}
*/

// ============================================================================
// USAGE NOTES
// ============================================================================

/*
1. Copy getSmartLoadingMessage() into your chat component
2. Copy LoadingIndicator component
3. Add the 3-tier loading state logic to your sendMessage function
4. Add the Tailwind animations to your config

TESTING:
- Fast message: "How much protein?" → Should show "Coach is typing..." for ~1s
- Medium message: "Log breakfast" → Should show "Calculating nutrition..." after 2s
- Slow message: "Log breakfast and give me workout" → Backend sends ACK + context status

CUSTOMIZATION:
- Adjust timeout from 2s to something else (line 171)
- Modify loading messages in getSmartLoadingMessage()
- Change loading indicator styling
- Add more pattern matches for your specific use cases
*/
