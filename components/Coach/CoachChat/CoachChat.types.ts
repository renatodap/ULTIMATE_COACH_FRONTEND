/**
 * TypeScript Types for Coach Components
 */

// Message types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: MessageType;
  metadata?: MessageMetadata;
}

export type MessageType =
  | 'text'
  | 'nutrition_log'
  | 'workout_log'
  | 'nutrition_card'
  | 'workout_card'
  | 'progress_card'
  | 'quick_ack'
  | 'error';

export interface MessageMetadata {
  // For nutrition messages
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    foodName?: string;
    amount?: string;
  };

  // For workout messages
  workout?: {
    exercises?: Array<{
      name: string;
      sets?: number;
      reps?: number;
      weight?: string;
    }>;
    duration?: string;
    type?: string;
  };

  // For progress messages
  progress?: {
    metric: string;
    current: number;
    previous?: number;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
  };

  // API response metadata
  model?: string;
  tokens?: number;
  cost?: number;
  toolsUsed?: string[];
}

// Log preview types - imported from @/lib/api/coach
// See: lib/api/coach.ts for LogPreview, NutritionLogData, WorkoutLogData, MeasurementLogData

// Quick action types
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string; // Message to send
  category?: 'nutrition' | 'workout' | 'progress' | 'general';
}

// Loading state
export interface LoadingState {
  isLoading: boolean;
  message: string;
  progress?: number; // 0-100 for progress bar
}

// API request/response types - imported from @/lib/api/coach
// See: lib/api/coach.ts for SendMessageRequest, SendMessageResponse

// Component props types
export interface CoachChatProps {
  conversationId?: string;
  onConversationChange?: (conversationId: string) => void;
  userId?: string;
  initialMessages?: Message[];
}

export interface MessageBubbleProps {
  message: Message;
  isLatest?: boolean;
  onCopy?: () => void;
  onRetry?: () => void;
}

export interface LogPreviewCardProps {
  preview: LogPreview;
  onConfirm: (data: any) => void;
  onCancel: () => void;
  onEdit?: (field: string, value: any) => void;
}

export interface LoadingIndicatorProps {
  message: string;
  variant?: 'dots' | 'spinner' | 'bar';
  size?: 'sm' | 'md' | 'lg';
}

export interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: QuickAction) => void;
  visible?: boolean;
}

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoiceInput?: () => void;
  onImageUpload?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Conversation types
export interface Conversation {
  id: string;
  title?: string;
  lastMessage?: string;
  lastMessageAt: Date;
  messageCount: number;
  userId: string;
}

// Error types
export interface CoachError {
  message: string;
  code?: string;
  recoverable?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}
