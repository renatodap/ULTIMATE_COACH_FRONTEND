/**
 * ChatInput - Message input field with send button
 *
 * Mobile-optimized with proper keyboard handling
 */

import React, { forwardRef, KeyboardEvent } from 'react';
import { ChatInputProps } from '../CoachChat/CoachChat.types';
import { hapticFeedback } from '../shared/utils';
import './Input.css';

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  ({ value, onChange, onSend, onVoiceInput, onImageUpload, disabled = false, placeholder = 'Message your coach...' }, ref) => {
    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !disabled) {
        e.preventDefault();
        onSend();
      }
    };

    const handleSend = () => {
      if (!disabled && value.trim()) {
        hapticFeedback('medium');
        onSend();
      }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onImageUpload) {
        hapticFeedback('light');
        onImageUpload(file);
      }
    };

    return (
      <div className="chat-input">
        <div className="chat-input__container">
          {/* Image upload button (optional) */}
          {onImageUpload && (
            <label className="chat-input__button chat-input__button--icon">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={disabled}
                className="chat-input__file-input"
              />
              <span>📷</span>
            </label>
          )}

          {/* Text input */}
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder={placeholder}
            className="chat-input__field"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
          />

          {/* Voice input button (optional) */}
          {onVoiceInput && (
            <button
              type="button"
              className="chat-input__button chat-input__button--icon"
              onClick={() => {
                hapticFeedback('light');
                onVoiceInput();
              }}
              disabled={disabled}
              aria-label="Voice input"
            >
              🎤
            </button>
          )}

          {/* Send button */}
          <button
            type="button"
            className={`chat-input__button chat-input__button--send ${value.trim() ? 'chat-input__button--send-active' : ''}`}
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            aria-label="Send message"
          >
            <span className="chat-input__send-icon">↑</span>
          </button>
        </div>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;
