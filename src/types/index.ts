// Main configuration types

import type { ApiMessageFormat, ApiResponse } from './api';
import type { ConnectionConfig, ConnectionStatus } from './connection';
import type { Message } from './message';
import type { ComponentChild } from 'preact';

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
  // Instance & Mounting
  instanceId?: string;
  target?: string | HTMLElement;

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
    history?: boolean; // Persist session history
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
      voiceName?: string; // Optional precise internal voice name to use (e.g. 'Yelda', 'Microsoft Tolga')
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
    showWelcomeScreen?: boolean; // Enable/disable the empty state welcome screen (default: true)

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

      // Welcome Screen
      welcomeBadge?: string;    // e.g. "AI assistant"
      welcomeMessage?: string;  // e.g. "Hello! How can I help you?"
      welcomeHints?: string[];  // e.g. ["Ask a question", "Get instant answers"]

      // Message edit actions
      cancel?: string;          // default: 'Cancel'
      save?: string;            // default: 'Save'

      // File / Drag-drop
      dropFile?: string;        // default: 'Drop file here'
      fileSizeError?: string;   // default: 'File must be smaller than {maxSize}MB'
      imageLoadError?: string;  // default: 'Failed to load image'

      // Tooltips
      copy?: string;
      copied?: string;
      regenerate?: string;
      readAloud?: string;
      stopSpeaking?: string;
      helpful?: string;
      notHelpful?: string;
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

  // 6. EVENT HOOKS (all callbacks live at the top level for a flat, consistent API)
  /** @deprecated Use onUserTyping directly instead */
  events?: {
    onUserTyping?: () => void;
    onVisibilityChange?: (isHidden: boolean) => void;
    onVoiceStart?: () => void;
    onVoiceEnd?: () => void;
  };

  // Lifecycle events
  onUserTyping?: () => void;
  onVisibilityChange?: (isHidden: boolean) => void;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  
  onBeforeMessageSend?: (message: string) => string | Promise<string>;
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
  onMessageEdit?: (messageId: string, newContent: string) => void;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
  onChatClear?: () => void; // Triggered when user clicks clear chat
  
  // Voice Events
  onVoiceError?: (error: string) => void;

  // Custom Renderers
  // Can return a Virtual DOM node (Preact/React) or an object { html: '...' } for vanilla JS environments
  renderCustomMessage?: (message: Message) => ComponentChild | { html: string };
}
