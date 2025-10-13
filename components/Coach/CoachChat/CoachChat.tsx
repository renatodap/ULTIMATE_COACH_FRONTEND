/**
 * CoachChat - Main chat interface component
 *
 * Mobile-first, production-ready chat UI for AI coach interactions.
 * Handles all message types, loading states, and user interactions.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Message,
  LoadingState,
  LogPreview,
  QuickAction,
  SendMessageRequest,
  SendMessageResponse,
  CoachChatProps
} from './CoachChat.types';
import { getSmartLoadingMessage, scrollToBottom, isScrolledToBottom, hapticFeedback } from '../shared/utils';
import { MessageBubble } from '../Message/MessageBubble';
import { LoadingIndicator } from '../Loading/LoadingIndicator';
import { LogPreviewCard } from '../LogPreview/LogPreviewCard';
import { QuickActions } from '../QuickActions/QuickActions';
import { ChatInput } from '../Input/ChatInput';
import { EmptyState } from '../EmptyState/EmptyState';
import './CoachChat.css';

export const CoachChat: React.FC<CoachChatProps> = ({
  conversationId: initialConversationId,
  onConversationChange,
  userId,
  initialMessages = []
}) => {
  // State
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    message: 'Coach is typing...'
  });
  const [logPreview, setLogPreview] = useState<LogPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      const isAtBottom = isScrolledToBottom(messagesContainerRef.current);
      if (isAtBottom || loading.isLoading) {
        scrollToBottom(messagesContainerRef.current);
      }
    }
  }, [messages, loading.isLoading]);

  // Handle scroll to show/hide "scroll to bottom" button
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const isAtBottom = isScrolledToBottom(messagesContainerRef.current);
      setShowScrollButton(!isAtBottom && messages.length > 0);
    }
  }, [messages.length]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Send message handler
  const sendMessage = useCallback(async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || loading.isLoading) return;

    // Clear input and add user message
    setInputValue('');
    setError(null);
    hapticFeedback('light');

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);

    // Start loading (Tier 1)
    setLoading({
      isLoading: true,
      message: 'Coach is typing...'
    });

    // Upgrade to context-aware loading after 2s (Tier 2)
    loadingTimeoutRef.current = setTimeout(() => {
      setLoading(prev => ({
        ...prev,
        message: getSmartLoadingMessage(textToSend)
      }));
    }, 2000);

    try {
      const request: SendMessageRequest = {
        message: textToSend,
        conversation_id: conversationId
      };

      const response = await fetch('/api/coach/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if needed
          // 'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: SendMessageResponse = await response.json();

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Update conversation ID if new
      if (data.conversation_id && data.conversation_id !== conversationId) {
        setConversationId(data.conversation_id);
        if (onConversationChange) {
          onConversationChange(data.conversation_id);
        }
      }

      // Handle log preview
      if (data.is_log_preview && data.log_preview) {
        setLogPreview(data.log_preview);
        setLoading({ isLoading: false, message: '' });
        return;
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
      };

      setMessages(prev => [...prev, aiMessage]);
      setLoading({ isLoading: false, message: '' });

      // Focus input for next message
      if (inputRef.current) {
        inputRef.current.focus();
      }

    } catch (err: any) {
      console.error('Failed to send message:', err);

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      setLoading({ isLoading: false, message: '' });
      setError(err.message || 'Failed to send message. Please try again.');

      // Show error message in chat
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'I\'m having trouble responding right now. Please try again.',
        timestamp: new Date(),
        type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  }, [inputValue, loading.isLoading, conversationId, onConversationChange]);

  // Handle log preview confirmation
  const handleLogConfirm = useCallback(async (logData: any) => {
    setLogPreview(null);
    hapticFeedback('medium');

    // Add confirmation message
    const confirmMessage: Message = {
      id: `confirm_${Date.now()}`,
      role: 'assistant',
      content: 'Logged. Processing...',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, confirmMessage]);

    // TODO: Send confirmation to backend
    // This would save the log and get the coach's response

  }, []);

  // Handle log preview cancellation
  const handleLogCancel = useCallback(() => {
    setLogPreview(null);
    hapticFeedback('light');
  }, []);

  // Quick action handler
  const handleQuickAction = useCallback((action: QuickAction) => {
    sendMessage(action.action);
  }, [sendMessage]);

  // Retry failed message
  const handleRetry = useCallback((message: Message) => {
    if (message.role === 'user') {
      sendMessage(message.content);
    }
  }, [sendMessage]);

  // Scroll to bottom button handler
  const handleScrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      scrollToBottom(messagesContainerRef.current, true);
      hapticFeedback('light');
    }
  }, []);

  // Quick actions (shown when chat is empty or after message sent)
  const quickActions: QuickAction[] = [
    { id: '1', label: 'Log meal', icon: '🍽️', action: 'I ate', category: 'nutrition' },
    { id: '2', label: 'Log workout', icon: '💪', action: 'I worked out', category: 'workout' },
    { id: '3', label: 'Check progress', icon: '📊', action: 'How\'s my progress?', category: 'progress' },
    { id: '4', label: 'Get meal ideas', icon: '🥗', action: 'Give me meal ideas', category: 'nutrition' },
  ];

  return (
    <div className="coach-chat">
      {/* Header */}
      <div className="coach-chat__header">
        <div className="coach-chat__header-content">
          <div className="coach-chat__avatar">
            <span className="coach-chat__avatar-icon">💪</span>
          </div>
          <div className="coach-chat__header-text">
            <h1 className="coach-chat__title">Coach</h1>
            <p className="coach-chat__subtitle">
              {loading.isLoading ? loading.message : 'Always here to help'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className="coach-chat__messages"
      >
        {messages.length === 0 && !loading.isLoading ? (
          <EmptyState onQuickAction={handleQuickAction} />
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
                onRetry={() => handleRetry(message)}
              />
            ))}

            {loading.isLoading && (
              <LoadingIndicator
                message={loading.message}
                variant="dots"
              />
            )}
          </>
        )}

        {/* Log preview overlay */}
        {logPreview && (
          <div className="coach-chat__log-preview-overlay">
            <LogPreviewCard
              preview={logPreview}
              onConfirm={handleLogConfirm}
              onCancel={handleLogCancel}
            />
          </div>
        )}
      </div>

      {/* Quick actions (shown when not loading) */}
      {!loading.isLoading && messages.length > 0 && (
        <QuickActions
          actions={quickActions}
          onActionClick={handleQuickAction}
          visible={!logPreview}
        />
      )}

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          className="coach-chat__scroll-button"
          onClick={handleScrollToBottom}
          aria-label="Scroll to bottom"
        >
          ↓
        </button>
      )}

      {/* Error banner */}
      {error && (
        <div className="coach-chat__error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Input (fixed to bottom) */}
      <ChatInput
        ref={inputRef}
        value={inputValue}
        onChange={setInputValue}
        onSend={sendMessage}
        disabled={loading.isLoading || !!logPreview}
        placeholder={logPreview ? 'Confirm or cancel log first...' : 'Message your coach...'}
      />
    </div>
  );
};

export default CoachChat;
