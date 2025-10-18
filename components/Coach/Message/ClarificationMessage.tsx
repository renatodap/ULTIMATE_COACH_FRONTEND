/**
 * ClarificationMessage - Displays coach's clarification questions
 *
 * When nutrition_confidence < 60%, the backend asks for more details.
 * This component renders those questions in a user-friendly format.
 *
 * Mobile-first, visually distinct from regular messages
 */

import React from 'react';
import './Message.css';

export interface ClarificationMessageProps {
  message: string;
  nutrition_confidence?: number;
}

export const ClarificationMessage: React.FC<ClarificationMessageProps> = ({
  message,
  nutrition_confidence
}) => {
  // Parse message to extract questions (lines starting with • or -)
  const lines = message.split('\n');
  const introLines: string[] = [];
  const questions: string[] = [];
  const outroLines: string[] = [];

  let section: 'intro' | 'questions' | 'outro' = 'intro';

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      section = 'questions';
      questions.push(trimmed.replace(/^[•\-*]\s*/, ''));
    } else if (section === 'intro') {
      introLines.push(trimmed);
    } else if (section === 'questions') {
      section = 'outro';
      outroLines.push(trimmed);
    } else {
      outroLines.push(trimmed);
    }
  });

  const intro = introLines.join(' ');
  const outro = outroLines.join(' ');

  return (
    <div className="message-bubble message-bubble--assistant message-bubble--clarification">
      {/* Avatar */}
      <div className="message-bubble__avatar">
        <span className="message-bubble__avatar-icon">💪</span>
      </div>

      <div className="message-bubble__content-wrapper">
        <div className="message-bubble__content">
          {/* Confidence indicator */}
          {nutrition_confidence !== undefined && (
            <div className="clarification-message__confidence">
              <div className="clarification-message__confidence-bar">
                <div
                  className="clarification-message__confidence-fill"
                  style={{ width: `${Math.round(nutrition_confidence * 100)}%` }}
                />
              </div>
              <p className="clarification-message__confidence-text">
                {Math.round(nutrition_confidence * 100)}% confidence
                <span className="clarification-message__confidence-note">
                  {' '}• Need more details
                </span>
              </p>
            </div>
          )}

          {/* Intro text */}
          {intro && (
            <div className="clarification-message__intro">
              {intro}
            </div>
          )}

          {/* Questions list */}
          {questions.length > 0 && (
            <div className="clarification-message__questions">
              {questions.map((question, index) => (
                <div key={index} className="clarification-message__question">
                  <span className="clarification-message__question-bullet">•</span>
                  <span className="clarification-message__question-text">{question}</span>
                </div>
              ))}
            </div>
          )}

          {/* Outro text */}
          {outro && (
            <div className="clarification-message__outro">
              {outro}
            </div>
          )}

          {/* Hint text */}
          <div className="clarification-message__hint">
            💡 The more details you provide, the more accurate your log will be!
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClarificationMessage;
