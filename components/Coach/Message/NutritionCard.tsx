/**
 * NutritionCard - Display nutrition information in a card format
 *
 * Shows calories, macros in a visually appealing, mobile-optimized layout
 */

import React from 'react';
import { formatNutrition } from '../shared/utils';
import './Message.css';

interface NutritionCardProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foodName?: string;
  amount?: string;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({
  calories,
  protein,
  carbs,
  fat,
  foodName,
  amount
}) => {
  // Calculate macro percentages for visual bars
  const totalMacroGrams = protein + carbs + fat;
  const proteinPercent = totalMacroGrams > 0 ? (protein / totalMacroGrams) * 100 : 0;
  const carbsPercent = totalMacroGrams > 0 ? (carbs / totalMacroGrams) * 100 : 0;
  const fatPercent = totalMacroGrams > 0 ? (fat / totalMacroGrams) * 100 : 0;

  return (
    <div className="nutrition-card">
      {/* Header */}
      {foodName && (
        <div className="nutrition-card__header">
          <span className="nutrition-card__icon">🍽️</span>
          <div className="nutrition-card__title">
            <strong>{foodName}</strong>
            {amount && <span className="nutrition-card__amount"> • {amount}</span>}
          </div>
        </div>
      )}

      {/* Calories (prominent) */}
      <div className="nutrition-card__calories">
        <div className="nutrition-card__calories-value">{calories}</div>
        <div className="nutrition-card__calories-label">calories</div>
      </div>

      {/* Macro bars */}
      <div className="nutrition-card__macros-bars">
        <div className="nutrition-card__macro-bar">
          <div
            className="nutrition-card__macro-bar-fill nutrition-card__macro-bar-fill--protein"
            style={{ width: `${proteinPercent}%` }}
          />
        </div>
      </div>

      {/* Macro breakdown */}
      <div className="nutrition-card__macros">
        <div className="nutrition-card__macro nutrition-card__macro--protein">
          <div className="nutrition-card__macro-value">{formatNutrition(protein)}</div>
          <div className="nutrition-card__macro-label">Protein</div>
          <div className="nutrition-card__macro-icon">💪</div>
        </div>

        <div className="nutrition-card__macro nutrition-card__macro--carbs">
          <div className="nutrition-card__macro-value">{formatNutrition(carbs)}</div>
          <div className="nutrition-card__macro-label">Carbs</div>
          <div className="nutrition-card__macro-icon">🌾</div>
        </div>

        <div className="nutrition-card__macro nutrition-card__macro--fat">
          <div className="nutrition-card__macro-value">{formatNutrition(fat)}</div>
          <div className="nutrition-card__macro-label">Fat</div>
          <div className="nutrition-card__macro-icon">🥑</div>
        </div>
      </div>
    </div>
  );
};

export default NutritionCard;
