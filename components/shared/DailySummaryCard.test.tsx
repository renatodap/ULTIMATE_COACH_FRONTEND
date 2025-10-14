
/** @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import DailySummaryCard from './DailySummaryCard'
import { describe, it, expect } from 'vitest'

// Mock data for the activity summary
const mockActivitySummary = {
  activity_count: 3,
  total_calories_burned: 500,
  daily_goal_calories: 2000,
  goal_percentage: 25,
  total_duration_minutes: 60,
  average_intensity: 5,
}

// Mock data for the nutrition summary
const mockNutritionSummary = {
  totalCalories: 1800,
  totalProtein: 150,
  totalCarbs: 200,
  totalFat: 60,
  calorieGoal: 2200,
  proteinGoal: 160,
  carbsGoal: 250,
  fatGoal: 70,
}

describe('DailySummaryCard', () => {
  it('renders the activity summary correctly', () => {
    render(<DailySummaryCard type="activity" summary={mockActivitySummary} />)

    // Check for activity-specific elements
    expect(screen.getByText("Today's Activity")).toBeInTheDocument()
    expect(screen.getByText('🔥 500 kcal')).toBeInTheDocument()
    expect(screen.getByText('3 activities')).toBeInTheDocument()
    expect(screen.getByText('1h 0m')).toBeInTheDocument()
    expect(screen.getByText('5.0 METs')).toBeInTheDocument()
  })

  it('renders the nutrition summary correctly', () => {
    render(
      <DailySummaryCard type="nutrition" summary={mockNutritionSummary} />,
    )

    // Check for nutrition-specific elements
    expect(screen.getByText("Today's Nutrition")).toBeInTheDocument()
    expect(screen.getByText('1,800')).toBeInTheDocument()
    expect(screen.getByText('/ 2,200')).toBeInTheDocument()

    // Check for macro progress circles
    expect(screen.getByText('Protein')).toBeInTheDocument()
    expect(screen.getByText('Carbs')).toBeInTheDocument()
    expect(screen.getByText('Fats')).toBeInTheDocument()
  })
})
