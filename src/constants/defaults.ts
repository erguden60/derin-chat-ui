// Default configuration values

export const DEFAULT_COLORS = {
  primary: '#4F46E5',
  // Removed hardcoded light-mode colors to allow CSS classes (theme-light/dark) to work naturally.
};

export const DEFAULT_TEXTS = {
  title: 'Support',
  subtitle: 'Online',
  placeholder: 'Type your message...',
  sendButton: 'Send',
  loading: 'Typing...',
  errorMessage: 'Connection error. Please try again.',
  rateLimitError: 'You are sending messages too fast. Please wait.',
  mockModeInfo: 'You are in mock mode. No backend connection.',
  openChat: 'Open chat',
  closeChat: 'Close chat',
  welcomeBadge: 'AI assistant',
  welcomeMessage: 'Hello! How can I help?',
  welcomeHints: ['Ask a question', 'Upload a file'],
  // Edit actions
  cancel: 'Cancel',
  save: 'Save',
  // File / Drag-drop
  dropFile: 'Drop file here',
  fileSizeError: 'File must be smaller than {maxSize}MB.',
  imageLoadError: 'Failed to load image.',
  copy: 'Copy',
  copied: 'Copied',
  regenerate: 'Regenerate',
  readAloud: 'Read aloud',
  stopSpeaking: 'Stop speaking',
  helpful: 'Helpful',
  notHelpful: 'Not helpful',
  edit: 'Edit',
  edited: 'edited',
  voiceInput: 'Voice input',
  startVoiceInput: 'Start voice input',
  stopVoiceInput: 'Stop voice input',
  addFile: 'Add file',
  selectFile: 'Select file',
  attachmentType: 'Attachment type',
  chatWidget: 'Chat widget',
};

export const DEFAULT_FEATURES = {
  images: true,
  quickReplies: true,
  agentMode: true,
  markdown: true, // ✅ Markdown enabled
  fileUpload: false,
  timestamps: true,
  avatars: true,
  messageTools: true,
  voice: {
    input: false,
    output: false,
    language: 'en-US',
  },
};

export const DEFAULT_ATTACHMENT_TYPES = [
  {
    id: 'image',
    label: 'Image',
    accept: 'image/*',
    kind: 'image' as const,
    description: 'PNG, JPG, GIF',
  },
  {
    id: 'pdf',
    label: 'PDF',
    accept: '.pdf,application/pdf',
    kind: 'pdf' as const,
    description: 'PDF documents',
  },
  {
    id: 'document',
    label: 'Document',
    accept: '.doc,.docx,.txt,.xls,.xlsx,.csv',
    kind: 'document' as const,
    description: 'Docs, sheets, text',
  },
];

export const DEFAULT_BEHAVIOR = {
  openOnLoad: false,
  closeOnOutsideClick: true,
  persistSession: true,
  persistSessionId: true,
  maxMessages: 100,
};

export const DEFAULT_MESSAGE_FORMAT = {
  textField: 'reply',
  imageField: 'image',
  quickRepliesField: 'quickReplies',
  actionsField: 'actions',
  agentField: 'agent',
  typeField: 'type',
};

export const DEFAULT_CONFIG = {
  instanceId: 'default',
  target: 'body',
  ui: {
    position: 'bottom-right' as const,
    zIndex: 99999,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    locale: 'en-US',
    theme: 'light' as const,
    layout: 'normal' as const,
    colors: DEFAULT_COLORS,
    texts: DEFAULT_TEXTS,
  },
  attachments: {
    enabled: false,
    maxSize: 10,
    types: DEFAULT_ATTACHMENT_TYPES,
  },
  features: DEFAULT_FEATURES,
  behavior: DEFAULT_BEHAVIOR,
  messageFormat: DEFAULT_MESSAGE_FORMAT,
  mock: false,
};

// API Retry Configuration
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Rate Limiting
export const RATE_LIMIT = {
  maxMessagesPerMinute: 10,
  cooldownPeriod: 1000, // 1 second
};

// WebSocket Configuration
export const DEFAULT_WEBSOCKET_CONFIG = {
  reconnect: true,
  reconnectInterval: 3000, // 3 seconds
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000, // 30 seconds
};

// Unread Badge Configuration
export const DEFAULT_UNREAD_BADGE_CONFIG = {
  enabled: true,
  maxCount: 99,
  backgroundColor: '#EF4444', // Tailwind Red-500
  textColor: '#FFFFFF',
  position: 'top-right' as const,
  animate: true,
};
