/**
 * LogPreviewCard - Preview before confirming a log entry
 *
 * Shows extracted data with ability to edit before saving
 */

import React, { useState } from 'react';
import { LogPreviewCardProps, NutritionLogData, WorkoutLogData } from '../CoachChat/CoachChat.types';
import { formatNutrition, hapticFeedback } from '../shared/utils';
import './LogPreview.css';

export const LogPreviewCard: React.FC<LogPreviewCardProps> = ({
  preview,
  onConfirm,
  onCancel,
  onEdit
}) => {
  const [editedData, setEditedData] = useState(preview.data);

  const handleConfirm = () => {
    hapticFeedback('medium');
    onConfirm(editedData);
  };

  const handleCancel = () => {
    hapticFeedback('light');
    onCancel();
  };

  const handleFieldEdit = (field: string, value: any) => {
    const newData = { ...editedData, [field]: value };
    setEditedData(newData);
    if (onEdit) onEdit(field, value);
  };

  // Render nutrition log preview
  if (preview.type === 'nutrition') {
    const data = editedData as NutritionLogData;

    return (
      <div className="log-preview-card log-preview-card--nutrition">
        <div className="log-preview-card__header">
          <span className="log-preview-card__icon">🍽️</span>
          <h3 className="log-preview-card__title">Nutrition Log</h3>
          {preview.confidence && (
            <span className="log-preview-card__confidence">
              {Math.round(preview.confidence * 100)}% confident
            </span>
          )}
        </div>

        <div className="log-preview-card__content">
          {/* Food name */}
          <div className="log-preview-card__field">
            <label className="log-preview-card__label">Food</label>
            <input
              type="text"
              value={data.foodName}
              onChange={(e) => handleFieldEdit('foodName', e.target.value)}
              className="log-preview-card__input"
            />
          </div>

          {/* Amount */}
          <div className="log-preview-card__field-group">
            <div className="log-preview-card__field log-preview-card__field--half">
              <label className="log-preview-card__label">Amount</label>
              <input
                type="number"
                value={data.amount}
                onChange={(e) => handleFieldEdit('amount', parseFloat(e.target.value))}
                className="log-preview-card__input"
              />
            </div>
            <div className="log-preview-card__field log-preview-card__field--half">
              <label className="log-preview-card__label">Unit</label>
              <select
                value={data.unit}
                onChange={(e) => handleFieldEdit('unit', e.target.value)}
                className="log-preview-card__input"
              >
                <option value="g">grams (g)</option>
                <option value="oz">ounces (oz)</option>
                <option value="cup">cups</option>
                <option value="serving">servings</option>
              </select>
            </div>
          </div>

          {/* Nutrition breakdown */}
          <div className="log-preview-card__nutrition">
            <div className="log-preview-card__nutrition-item">
              <span className="log-preview-card__nutrition-label">Calories</span>
              <strong className="log-preview-card__nutrition-value">{data.calories}</strong>
            </div>
            <div className="log-preview-card__nutrition-item">
              <span className="log-preview-card__nutrition-label">Protein</span>
              <strong className="log-preview-card__nutrition-value">{formatNutrition(data.protein)}</strong>
            </div>
            <div className="log-preview-card__nutrition-item">
              <span className="log-preview-card__nutrition-label">Carbs</span>
              <strong className="log-preview-card__nutrition-value">{formatNutrition(data.carbs)}</strong>
            </div>
            <div className="log-preview-card__nutrition-item">
              <span className="log-preview-card__nutrition-label">Fat</span>
              <strong className="log-preview-card__nutrition-value">{formatNutrition(data.fat)}</strong>
            </div>
          </div>

          {/* Meal type */}
          <div className="log-preview-card__field">
            <label className="log-preview-card__label">Meal</label>
            <div className="log-preview-card__meal-types">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(type => (
                <button
                  key={type}
                  className={`log-preview-card__meal-type ${data.mealType === type ? 'log-preview-card__meal-type--active' : ''}`}
                  onClick={() => handleFieldEdit('mealType', type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="log-preview-card__actions">
          <button
            className="log-preview-card__button log-preview-card__button--cancel"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="log-preview-card__button log-preview-card__button--confirm"
            onClick={handleConfirm}
          >
            ✓ Confirm
          </button>
        </div>
      </div>
    );
  }

  // Render workout log preview
  if (preview.type === 'workout') {
    const data = editedData as WorkoutLogData;

    return (
      <div className="log-preview-card log-preview-card--workout">
        <div className="log-preview-card__header">
          <span className="log-preview-card__icon">💪</span>
          <h3 className="log-preview-card__title">Workout Log</h3>
        </div>

        <div className="log-preview-card__content">
          {/* Activity type */}
          <div className="log-preview-card__field">
            <label className="log-preview-card__label">Activity</label>
            <input
              type="text"
              value={data.activityType}
              onChange={(e) => handleFieldEdit('activityType', e.target.value)}
              className="log-preview-card__input"
            />
          </div>

          {/* Duration */}
          {data.duration !== undefined && (
            <div className="log-preview-card__field">
              <label className="log-preview-card__label">Duration (minutes)</label>
              <input
                type="number"
                value={data.duration}
                onChange={(e) => handleFieldEdit('duration', parseInt(e.target.value))}
                className="log-preview-card__input"
              />
            </div>
          )}

          {/* Exercises */}
          {data.exercises && data.exercises.length > 0 && (
            <div className="log-preview-card__exercises">
              <label className="log-preview-card__label">Exercises</label>
              {data.exercises.map((exercise, index) => (
                <div key={index} className="log-preview-card__exercise">
                  <strong>{exercise.name}</strong>
                  <span> • {exercise.sets} × {exercise.reps}</span>
                  {exercise.weight && <span> @ {exercise.weight}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="log-preview-card__actions">
          <button
            className="log-preview-card__button log-preview-card__button--cancel"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="log-preview-card__button log-preview-card__button--confirm"
            onClick={handleConfirm}
          >
            ✓ Confirm
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default LogPreviewCard;
