/**
 * LoadingIndicator - Shows loading state with animated dots
 *
 * Mobile-optimized, personality-consistent loading UI
 */

import React from 'react';
import { LoadingIndicatorProps } from '../CoachChat/CoachChat.types';
import './Loading.css';

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message,
  variant = 'dots',
  size = 'md'
}) => {
  return (
    <div className={`loading-indicator loading-indicator--${size}`}>
      {/* Avatar */}
      <div className="loading-indicator__avatar">
        <span className="loading-indicator__avatar-icon">💪</span>
      </div>

      {/* Content */}
      <div className="loading-indicator__content">
        {/* Animated dots */}
        {variant === 'dots' && (
          <div className="loading-indicator__dots">
            <span className="loading-indicator__dot" style={{ animationDelay: '0ms' }} />
            <span className="loading-indicator__dot" style={{ animationDelay: '150ms' }} />
            <span className="loading-indicator__dot" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {/* Message */}
        <div className="loading-indicator__message">{message}</div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
