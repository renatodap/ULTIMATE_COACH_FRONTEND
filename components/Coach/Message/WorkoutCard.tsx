/**
 * WorkoutCard - Display workout information in a card format
 *
 * Shows exercises with sets/reps in a clean, scannable layout
 */

import React from 'react';
import './Message.css';

interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: string;
}

interface WorkoutCardProps {
  exercises: Exercise[];
  duration?: string;
  type?: string;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  exercises,
  duration,
  type
}) => {
  return (
    <div className="workout-card">
      {/* Header */}
      <div className="workout-card__header">
        <span className="workout-card__icon">💪</span>
        <div className="workout-card__title">
          <strong>{type || 'Workout'}</strong>
          {duration && <span className="workout-card__duration"> • {duration}</span>}
        </div>
      </div>

      {/* Exercises list */}
      <div className="workout-card__exercises">
        {exercises.map((exercise, index) => (
          <div key={index} className="workout-card__exercise">
            <div className="workout-card__exercise-number">{index + 1}</div>
            <div className="workout-card__exercise-content">
              <div className="workout-card__exercise-name">{exercise.name}</div>
              <div className="workout-card__exercise-details">
                {exercise.sets && exercise.reps && (
                  <span>{exercise.sets} × {exercise.reps}</span>
                )}
                {exercise.weight && (
                  <span className="workout-card__exercise-weight"> @ {exercise.weight}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutCard;
