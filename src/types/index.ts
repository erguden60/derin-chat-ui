// Main configuration types

import type { ApiMessageFormat, ApiResponse } from './api';
import type { ConnectionConfig, ConnectionStatus } from './connection';
import type { Message } from './message';

// Unread Badge Configuration
export interface UnreadBadgeConfig {
  enabled?: boolean; // Default: true
  maxCount?: number; // Max number to show (e.g., 9+), default: 99
  backgroundColor?: string; // Badge color, default: '#EF4444' (red)
  textColor?: string; // Text color, default: '#FFFFFF'
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'; // Default: 'top-right'
  animate?: boolean; // Pulse animation on new message, default: true
}

export * from './message';
export * from './api';
export * from './connection';

export type MockHandlerResult = ApiResponse | Message | string | null | undefined;

export interface MockHandlerContext {
  user?: ChatConfig['user'];
  history: Message[];
  file?: {
    name: string;
    type: string;
    size: number;
    data?: string;
  };
}

export interface ChatConfig {
  // 1. API & MODE
  apiUrl?: string;
  mock?:
    | boolean
    | {
        handler?: (
          message: string,
          context: MockHandlerContext
        ) => MockHandlerResult | Promise<MockHandlerResult>;
      };
  apiKey?: string;

  // Connection Configuration (HTTP vs WebSocket)
  connection?: ConnectionConfig;

  // API Response Mapping (if backend uses different format)
  messageFormat?: ApiMessageFormat;

  // 2. FEATURE TOGGLES
  features?: {
    images?: boolean; // Image display
    quickReplies?: boolean; // Quick reply buttons
    agentMode?: boolean; // Live agent mode
    markdown?: boolean; // Markdown rendering
    fileUpload?: boolean; // File upload
    timestamps?: boolean; // Message timestamps
    avatars?: boolean; // Avatar display
    messageTools?: boolean; // Show advanced tools (copy, regenerate, feedback) on bot messages
    voice?: {
      input?: boolean; // Enable microphone for Speech-to-Text
      output?: boolean; // Enable speaker icon on bot messages for Text-to-Speech
      language?: string; // Default language for recognition/synthesis (e.g., 'tr-TR', 'en-US')
    };
  };

  // 3. USER
  user?: {
    id?: string;
    name?: string;
    avatar?: string;
    hash?: string; // HMAC hash for identity verification
    metadata?: Record<string, unknown>;
  };

  // 4. UI SETTINGS
  ui?: {
    // General
    position?: 'bottom-right' | 'bottom-left';
    zIndex?: number;
    fontFamily?: string;
    logo?: string;
    theme?: 'light' | 'dark' | 'auto';
    layout?: 'normal' | 'compact' | 'full-screen';

    // Color Palette (Complete control)
    colors?: {
      primary?: string;
      headerBg?: string;    // Defaults to primary
      headerText?: string;
      userMessageBg?: string; // Defaults to primary
      userMessageText?: string;
      botMessageBg?: string;
      botMessageText?: string;
      background?: string;
      inputBg?: string;     // Text input background
      inputText?: string;   // Text input color
    };

    // Texts (for i18n)
    texts?: {
      title?: string;
      subtitle?: string;
      placeholder?: string;
      sendButton?: string;
      loading?: string;
      errorMessage?: string;
      rateLimitError?: string;
      mockModeInfo?: string;
      openChat?: string;
      closeChat?: string;
    };

    // File Upload Config
    fileUpload?: {
      maxSize?: number; // MB
      accept?: string; // MIME types
    };
  };

  // 5. BEHAVIOR
  behavior?: {
    openOnLoad?: boolean;
    closeOnOutsideClick?: boolean;
    persistSession?: boolean; // Store in LocalStorage
    maxMessages?: number; // Maximum message count
  };

  // 6. EVENT HOOKS
  onMessageSent?: (message: string) => void;
  onMessageReceived?: (message: unknown) => void;
  onChatOpened?: () => void;
  onChatClosed?: () => void;
  onError?: (error: Error) => void;

  // WebSocket Connection Events
  onConnectionChange?: (status: ConnectionStatus) => void;
  onReconnecting?: (attempt: number) => void;
  onReconnected?: () => void;

  // Unread Badge
  unreadBadge?: UnreadBadgeConfig;
  onUnreadCountChange?: (count: number) => void;

  // Advanced Message Tools callbacks
  onMessageCopy?: (messageId: string, text: string) => void;
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
  onChatClear?: () => void; // Triggered when user clicks clear chat
  
  // Voice Events
  onVoiceError?: (error: string) => void;
}
