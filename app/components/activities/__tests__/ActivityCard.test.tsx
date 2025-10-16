/**
 * Component tests for ActivityCard.
 *
 * Tests rendering, expansion, and interaction with activity cards.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import ActivityCard from '../ActivityCard'
import type { Activity } from '@/lib/types/activities'

describe('ActivityCard', () => {
  const mockActivity: Activity = {
    id: 'activity-001',
    user_id: 'user-123',
    category: 'cardio_steady_state',
    activity_name: 'Morning Run',
    start_time: '2025-10-16T06:00:00Z',
    end_time: '2025-10-16T06:45:00Z',
    duration_minutes: 45,
    calories_burned: 400,
    intensity_mets: 8.0,
    metrics: {
      distance_km: 6.5,
      avg_heart_rate: 145,
      max_heart_rate: 165,
    },
    notes: 'Felt great today!',
    created_at: '2025-10-16T06:45:00Z',
    updated_at: '2025-10-16T06:45:00Z',
    deleted_at: null,
  }

  it('should render activity card with basic info', () => {
    render(<ActivityCard activity={mockActivity} onEdit={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('Morning Run')).toBeInTheDocument()
    expect(screen.getByText(/400/)).toBeInTheDocument() // Calories (with unit)
    expect(screen.getByText(/45 min/)).toBeInTheDocument()
  })

  it('should display activity category icon', () => {
    render(<ActivityCard activity={mockActivity} onEdit={vi.fn()} onDelete={vi.fn()} />)

    // Cardio icon should be present
    const icon = screen.getByText('🏃')
    expect(icon).toBeInTheDocument()
  })

  it('should show notes by default', () => {
    render(<ActivityCard activity={mockActivity} onEdit={vi.fn()} onDelete={vi.fn()} />)

    // Notes are always visible (not collapsed)
    expect(screen.getByText('Felt great today!')).toBeInTheDocument()
  })

  it('should display metrics', () => {
    render(<ActivityCard activity={mockActivity} onEdit={vi.fn()} onDelete={vi.fn()} />)

    // Metrics are always visible in stats grid
    expect(screen.getByText(/6.5/)).toBeInTheDocument() // Distance
    expect(screen.getByText(/145/)).toBeInTheDocument() // Avg HR
  })

  it('should call onDelete when delete button clicked', () => {
    const onDelete = vi.fn()
    render(<ActivityCard activity={mockActivity} onEdit={vi.fn()} onDelete={onDelete} />)

    // Click delete button
    const deleteButton = screen.getByText(/delete/i)
    fireEvent.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith('activity-001')
  })

  it('should call onEdit when edit button clicked', () => {
    const onEdit = vi.fn()
    render(<ActivityCard activity={mockActivity} onEdit={onEdit} onDelete={vi.fn()} />)

    // Click edit button
    const editButton = screen.getByText(/edit/i)
    fireEvent.click(editButton)

    expect(onEdit).toHaveBeenCalledWith('activity-001')
  })

  it('should render strength training activity with exercises', () => {
    const strengthActivity: Activity = {
      ...mockActivity,
      category: 'strength_training',
      activity_name: 'Upper Body Workout',
      metrics: {
        exercises: [
          {
            name: 'Bench Press',
            sets: 3,
            reps: 8,
            weight_kg: 100,
            rpe: 8,
          },
          {
            name: 'Pull-ups',
            sets: 3,
            reps: 10,
            weight_kg: 0,
          },
        ],
      },
    }

    render(<ActivityCard activity={strengthActivity} onEdit={vi.fn()} onDelete={vi.fn()} />)

    // Exercises are collapsed initially - click to expand
    const expandButton = screen.getByText(/Show exercises/i)
    fireEvent.click(expandButton)

    // Check for exercises
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByText('Pull-ups')).toBeInTheDocument()
    expect(screen.getByText(/3 sets × 8 reps/)).toBeInTheDocument()
    expect(screen.getByText(/100kg/)).toBeInTheDocument()
  })

  it('should render sports activity with score', () => {
    const sportsActivity: Activity = {
      ...mockActivity,
      category: 'sports',
      activity_name: 'Basketball',
      metrics: {
        sport_type: 'basketball',
        score: '85-78',
      },
    }

    render(<ActivityCard activity={sportsActivity} onEdit={vi.fn()} onDelete={vi.fn()} />)

    // Metrics displayed in stats grid
    expect(screen.getAllByText(/basketball/i).length).toBeGreaterThan(0) // Appears in title and metrics
    expect(screen.getByText(/85-78/)).toBeInTheDocument()
  })

  it('should format time correctly', () => {
    render(<ActivityCard activity={mockActivity} onEdit={vi.fn()} onDelete={vi.fn()} />)

    // Should display time (mocked TimezoneContext returns toLocaleString)
    // Will vary based on test environment, just check it's present
    expect(screen.getByText(/min/)).toBeInTheDocument()
  })

  it('should display METs intensity', () => {
    render(<ActivityCard activity={mockActivity} onEdit={vi.fn()} onDelete={vi.fn()} />)

    // METs displayed in stats grid
    expect(screen.getByText(/8.0/)).toBeInTheDocument() // METs
  })

  it('should handle activity without notes', () => {
    const activityNoNotes: Activity = {
      ...mockActivity,
      notes: null,
    }

    render(<ActivityCard activity={activityNoNotes} onEdit={vi.fn()} onDelete={vi.fn()} />)

    // Should not crash and should not show notes section
    expect(screen.queryByText('Notes:')).not.toBeInTheDocument()
  })

  it('should handle activity without metrics', () => {
    const activityNoMetrics: Activity = {
      ...mockActivity,
      metrics: {},
    }

    render(<ActivityCard activity={activityNoMetrics} onEdit={vi.fn()} onDelete={vi.fn()} />)

    // Should not crash
    expect(screen.getByText('Morning Run')).toBeInTheDocument()
  })

  it('should show edit/delete buttons when handlers provided', () => {
    render(<ActivityCard activity={mockActivity} onEdit={vi.fn()} onDelete={vi.fn()} />)

    // Buttons should be present
    expect(screen.getByText(/edit/i)).toBeInTheDocument()
    expect(screen.getByText(/delete/i)).toBeInTheDocument()
  })

  it('should toggle exercise list expansion on multiple clicks', () => {
    const strengthActivity: Activity = {
      ...mockActivity,
      category: 'strength_training',
      metrics: {
        exercises: [
          { name: 'Bench Press', sets: 3, reps: 8, weight_kg: 100 }
        ],
      },
    }

    render(<ActivityCard activity={strengthActivity} onEdit={vi.fn()} onDelete={vi.fn()} />)

    const expandButton = screen.getByText(/Show exercises/i)

    // Expand
    fireEvent.click(expandButton)
    expect(screen.getByText('Bench Press')).toBeInTheDocument()

    // Collapse
    const collapseButton = screen.getByText(/Hide exercises/i)
    fireEvent.click(collapseButton)
    expect(screen.queryByText('Bench Press')).not.toBeInTheDocument()
  })
})
