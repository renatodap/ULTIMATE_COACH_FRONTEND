/**
 * Utility Functions for Coach Components
 */

/**
 * Get smart loading message based on user input
 */
export function getSmartLoadingMessage(message: string): string {
  const msg = message.toLowerCase();

  // Nutrition logging
  if (/\b(log|ate|eat|meal|breakfast|lunch|dinner|food|snack)\b/i.test(msg)) {
    return "Calculating nutrition...";
  }

  // Workout requests
  if (/\b(workout|exercise|train|training|lifting|cardio|plan|routine)\b/i.test(msg)) {
    return "Finding exercises...";
  }

  // Progress/stats
  if (/\b(progress|stats|results|weight|analyze|review|summary)\b/i.test(msg)) {
    return "Checking your progress...";
  }

  // Multi-action (complex operations)
  if (/\band\b/i.test(msg) && msg.split(' ').length > 10) {
    return "Working on it...";
  }

  // Plan creation
  if (/\b(create|generate|make|build).*\b(plan|program|schedule)\b/i.test(msg)) {
    return "Building your plan...";
  }

  // Recipe/meal planning
  if (/\b(recipe|meal plan|shopping list)\b/i.test(msg)) {
    return "Preparing meal info...";
  }

  // Default
  return "Coach is typing...";
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  // Show actual time for older messages
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format date for day separator
 */
export function formatDateSeparator(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (messageDate.getTime() === today.getTime()) return 'Today';
  if (messageDate.getTime() === yesterday.getTime()) return 'Yesterday';

  // Show actual date for older
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Scroll to bottom of container smoothly
 */
export function scrollToBottom(element: HTMLElement | null, smooth: boolean = true) {
  if (!element) return;

  element.scrollTo({
    top: element.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  });
}

/**
 * Check if element is scrolled to bottom
 */
export function isScrolledToBottom(element: HTMLElement | null, threshold: number = 50): boolean {
  if (!element) return true;

  const { scrollTop, scrollHeight, clientHeight } = element;
  return scrollHeight - scrollTop - clientHeight < threshold;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Haptic feedback (mobile)
 */
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
  if ('vibrate' in navigator) {
    const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 30;
    navigator.vibrate(duration);
  }
}

/**
 * Check if device is iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if device is Android
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * Get safe area insets (for notch/home indicator)
 */
export function getSafeAreaInsets() {
  const style = getComputedStyle(document.documentElement);

  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0'),
  };
}

/**
 * Format nutrition value
 */
export function formatNutrition(value: number, unit: string = 'g'): string {
  if (value === 0) return `0${unit}`;
  if (value < 1) return `${value.toFixed(1)}${unit}`;
  return `${Math.round(value)}${unit}`;
}

/**
 * Parse message for nutrition data (simple extraction)
 */
export function extractNutritionFromMessage(message: string): {
  hasNutrition: boolean;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
} {
  const caloriesMatch = message.match(/(\d+)\s*cal/i);
  const proteinMatch = message.match(/(\d+)g?\s*protein/i);
  const carbsMatch = message.match(/(\d+)g?\s*carb/i);
  const fatMatch = message.match(/(\d+)g?\s*fat/i);

  const hasNutrition = !!(caloriesMatch || proteinMatch || carbsMatch || fatMatch);

  return {
    hasNutrition,
    calories: caloriesMatch ? parseInt(caloriesMatch[1]) : undefined,
    protein: proteinMatch ? parseInt(proteinMatch[1]) : undefined,
    carbs: carbsMatch ? parseInt(carbsMatch[1]) : undefined,
    fat: fatMatch ? parseInt(fatMatch[1]) : undefined,
  };
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}
