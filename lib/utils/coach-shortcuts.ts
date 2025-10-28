/**
 * Coach Navigation Shortcuts
 *
 * Enables natural language navigation through Coach
 * When Coach detects these phrases, it can provide clickable navigation
 *
 * Part of Phase 3: 2026 AI-First UX Transformation
 */

export interface CoachShortcut {
  patterns: string[]  // Phrases that trigger this shortcut
  path: string        // Navigation path
  title: string       // Display title for the navigation card
  description: string // Brief description
  icon: string        // Emoji icon
}

export const COACH_SHORTCUTS: Record<string, CoachShortcut> = {
  nutrition: {
    patterns: [
      'show nutrition',
      'view nutrition',
      'see nutrition',
      'my nutrition',
      'nutrition dashboard',
      'nutrition page',
      'food log',
      'meal log'
    ],
    path: '/nutrition',
    title: 'Nutrition Dashboard',
    description: 'View your daily meals and nutrition',
    icon: '🍽️'
  },

  log_meal: {
    patterns: [
      'log meal',
      'log food',
      'add meal',
      'add food',
      'log breakfast',
      'log lunch',
      'log dinner',
      'log snack',
      'track meal',
      'track food'
    ],
    path: '/nutrition/log',
    title: 'Log Meal',
    description: 'Add a new meal to your log',
    icon: '✏️'
  },

  activities: {
    patterns: [
      'show activities',
      'view activities',
      'see activities',
      'my activities',
      'activities dashboard',
      'activities page',
      'workout log',
      'exercise log'
    ],
    path: '/activities',
    title: 'Activities Dashboard',
    description: 'View your workouts and activities',
    icon: '⚡'
  },

  log_workout: {
    patterns: [
      'log workout',
      'log activity',
      'log exercise',
      'add workout',
      'add activity',
      'add exercise',
      'track workout',
      'track activity'
    ],
    path: '/activities/log',
    title: 'Log Workout',
    description: 'Record a new workout',
    icon: '💪'
  },

  weight: {
    patterns: [
      'show weight',
      'view weight',
      'see weight',
      'my weight',
      'weight dashboard',
      'weight page',
      'weight tracking',
      'weight history',
      'weight log'
    ],
    path: '/weight',
    title: 'Weight Tracking',
    description: 'View your weight history and progress',
    icon: '⚖️'
  },

  profile: {
    patterns: [
      'show profile',
      'view profile',
      'my profile',
      'profile page',
      'settings',
      'account'
    ],
    path: '/profile',
    title: 'Profile',
    description: 'View and edit your profile',
    icon: '👤'
  },

  plan: {
    patterns: [
      'show plan',
      'view plan',
      'my plan',
      'check plan',
      'plan page',
      'workout plan',
      'training plan'
    ],
    path: '/plan',
    title: 'Plan',
    description: 'View your personalized fitness plan',
    icon: '📅'
  },

  dashboard: {
    patterns: [
      'home',
      'dashboard',
      'main page',
      'overview'
    ],
    path: '/dashboard',
    title: 'Dashboard',
    description: 'Return to your dashboard',
    icon: '🏠'
  }
}

/**
 * Detect if a message contains a navigation shortcut
 * Returns the matching shortcut or null
 */
export function detectShortcut(message: string): CoachShortcut | null {
  const lowerMessage = message.toLowerCase()

  for (const shortcut of Object.values(COACH_SHORTCUTS)) {
    for (const pattern of shortcut.patterns) {
      if (lowerMessage.includes(pattern)) {
        return shortcut
      }
    }
  }

  return null
}

/**
 * Get all available shortcuts for display
 */
export function getAllShortcuts(): CoachShortcut[] {
  return Object.values(COACH_SHORTCUTS)
}
