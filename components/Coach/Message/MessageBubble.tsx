/**
 * MessageBubble - Displays individual messages with different types
 *
 * Supports: text, nutrition cards, workout cards, error messages
 * Mobile-optimized with proper touch targets
 */

import React, { useState } from 'react';
import { MessageBubbleProps } from '../CoachChat/CoachChat.types';
import { formatTimestamp, extractNutritionFromMessage, copyToClipboard, hapticFeedback } from '../shared/utils';
import { NutritionCard } from './NutritionCard';
import { WorkoutCard } from './WorkoutCard';
import { ClarificationMessage } from './ClarificationMessage';
import './Message.css';

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLatest = false,
  onCopy,
  onRetry
}) => {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const isError = message.type === 'error';

  // Check if this is a clarification message (coach asking for more details)
  const isClarification = message.metadata?.waiting_for_clarification === true;
  const nutritionConfidence = message.metadata?.nutrition_confidence;

  // Handle copy to clipboard
  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      hapticFeedback('light');
      setTimeout(() => setCopied(false), 2000);
      if (onCopy) onCopy();
    }
  };

  // Handle retry
  const handleRetry = () => {
    hapticFeedback('medium');
    if (onRetry) onRetry();
  };

  // Extract nutrition data from message content if present
  const nutritionData = extractNutritionFromMessage(message.content);

  // Determine if this is a special message type
  const hasNutritionCard = message.type === 'nutrition_card' ||
    (message.metadata?.nutrition && nutritionData.hasNutrition);

  const hasWorkoutCard = message.type === 'workout_card' || message.metadata?.workout;

  // Render clarification message with special styling
  if (isClarification && !isUser) {
    return (
      <ClarificationMessage
        message={message.content}
        nutrition_confidence={nutritionConfidence}
      />
    );
  }

  return (
    <div
      className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--assistant'} ${isError ? 'message-bubble--error' : ''}`}
      onTouchStart={() => setShowActions(true)}
      onTouchEnd={() => setTimeout(() => setShowActions(false), 3000)}
    >
      {/* Avatar (only for assistant) */}
      {!isUser && (
        <div className="message-bubble__avatar">
          <span className="message-bubble__avatar-icon">💪</span>
        </div>
      )}

      <div className="message-bubble__content-wrapper">
        {/* Main content */}
        <div className="message-bubble__content">
          {/* Nutrition card (if applicable) */}
          {hasNutritionCard && message.metadata?.nutrition && (
            <NutritionCard
              calories={message.metadata.nutrition.calories || 0}
              protein={message.metadata.nutrition.protein || 0}
              carbs={message.metadata.nutrition.carbs || 0}
              fat={message.metadata.nutrition.fat || 0}
              foodName={message.metadata.nutrition.foodName}
              amount={message.metadata.nutrition.amount}
            />
          )}

          {/* Workout card (if applicable) */}
          {hasWorkoutCard && message.metadata?.workout && (
            <WorkoutCard
              exercises={message.metadata.workout.exercises || []}
              duration={message.metadata.workout.duration}
              type={message.metadata.workout.type}
            />
          )}

          {/* Text content */}
          <div className="message-bubble__text">
            {message.content}
          </div>

          {/* Timestamp */}
          <div className="message-bubble__timestamp">
            {formatTimestamp(message.timestamp)}
            {message.metadata?.model && (
              <span className="message-bubble__model">
                {' • '}{message.metadata.model.split('-')[0]}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons (shown on long-press or hover) */}
        {(showActions || isLatest) && !isUser && (
          <div className="message-bubble__actions">
            <button
              className="message-bubble__action-btn"
              onClick={handleCopy}
              aria-label="Copy message"
            >
              {copied ? '✓' : '📋'}
            </button>
            {isError && (
              <button
                className="message-bubble__action-btn"
                onClick={handleRetry}
                aria-label="Retry"
              >
                🔄
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
