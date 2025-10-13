/**
 * QuickActions - Shortcut buttons for common actions
 *
 * Horizontal scrollable row of quick action buttons
 */

import React from 'react';
import { QuickActionsProps } from '../CoachChat/CoachChat.types';
import { hapticFeedback } from '../shared/utils';
import './QuickActions.css';

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  onActionClick,
  visible = true
}) => {
  if (!visible || actions.length === 0) return null;

  const handleClick = (action: typeof actions[0]) => {
    hapticFeedback('light');
    onActionClick(action);
  };

  return (
    <div className="quick-actions">
      <div className="quick-actions__scroll-container">
        {actions.map(action => (
          <button
            key={action.id}
            className="quick-actions__button"
            onClick={() => handleClick(action)}
          >
            <span className="quick-actions__icon">{action.icon}</span>
            <span className="quick-actions__label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
