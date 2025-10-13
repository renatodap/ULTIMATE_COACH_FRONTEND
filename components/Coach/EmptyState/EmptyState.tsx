/**
 * EmptyState - Shown when conversation is empty
 *
 * Welcomes user with minimal, centered message
 */

import React from 'react';
import './EmptyState.css';

export const EmptyState: React.FC = () => {
  return (
    <div className="empty-state empty-state--minimal">
      {/* Avatar */}
      <div className="empty-state__avatar">
        <span className="empty-state__avatar-icon">💪</span>
      </div>

      {/* Welcome message */}
      <h2 className="empty-state__title">Ready to work?</h2>
      <p className="empty-state__subtitle">
        No BS. Just results.
        <br />
        Log food. Ask questions. Track progress.
      </p>

      {/* Footer hint */}
      <p className="empty-state__hint">
        I track your goals, injuries, and allergies. You tell me once.
      </p>
    </div>
  );
};

export default EmptyState;
