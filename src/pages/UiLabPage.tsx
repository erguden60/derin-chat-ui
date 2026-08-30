import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import DerinChat from '../index';
import type { AttachmentTypeConfig, ChatConfig, Message } from '../types';
import type { ComponentChildren } from 'preact';

type Scenario = 'welcome' | 'conversation' | 'long' | 'markdown' | 'media' | 'agent';
type QaPreset = 'idle' | 'loading' | 'error' | 'connection' | 'streaming';
type FrameworkTab = 'json' | 'vanilla' | 'react' | 'next' | 'vite' | 'cdn';
type ConnectionStudioMode = 'mock' | 'http' | 'websocket' | 'streaming';
type SectionId =
  | 'studio'
  | 'appearance'
  | 'copy'
  | 'features'
  | 'behavior'
  | 'connection'
  | 'attachments'
  | 'contrast';

interface LabState {
  scenario: Scenario;
  qaPreset: QaPreset;
  viewport: 'desktop' | 'mobile';
  frameworkTab: FrameworkTab;
  connectionMode: ConnectionStudioMode;
  layout: 'normal' | 'compact' | 'full-screen';
  theme: 'light' | 'dark' | 'auto';
  position: 'bottom-right' | 'bottom-left';
  title: string;
  subtitle: string;
  placeholder: string;
  welcomeBadge: string;
  welcomeMessage: string;
  welcomeHints: string;
  primary: string;
  headerBg: string;
  headerText: string;
  background: string;
  botMessageBg: string;
  botMessageText: string;
  userMessageBg: string;
  userMessageText: string;
  inputBg: string;
  inputText: string;
  logo: string;
  fontFamily: string;
  apiUrl: string;
  websocketUrl: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  attachmentMaxSize: number;
  customAttachmentTypes: boolean;
  messageFormatTextField: string;
  messageFormatImageField: string;
  messageFormatQuickRepliesField: string;
  messageFormatActionsField: string;
  messageFormatAgentField: string;
  messageFormatTypeField: string;
  maxMessages: number;
  features: {
    markdown: boolean;
    quickReplies: boolean;
    fileUpload: boolean;
    images: boolean;
    agentMode: boolean;
    timestamps: boolean;
    avatars: boolean;
    messageTools: boolean;
    voiceInput: boolean;
    voiceOutput: boolean;
    unreadBadge: boolean;
    showWelcomeScreen: boolean;
  };
  behavior: {
    openOnLoad: boolean;
    closeOnOutsideClick: boolean;
    persistSession: boolean;
    persistSessionId: boolean;
  };
}

type LabPalette = Pick<
  LabState,
  | 'primary'
  | 'headerBg'
  | 'headerText'
  | 'background'
  | 'botMessageBg'
  | 'botMessageText'
  | 'userMessageBg'
  | 'userMessageText'
  | 'inputBg'
  | 'inputText'
>;

const INSTANCE_ID = 'ui-lab-widget';
const now = new Date('2026-07-28T10:00:00.000Z').toISOString();
const LAB_PREVIEW_STYLE_ID = 'ui-lab-preview-shadow-overrides';
const defaultFontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const fontFamilyOptions = [
  { label: 'System', value: defaultFontFamily },
  { label: 'Clean sans', value: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { label: 'Classic UI', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Mono', value: '"SFMono-Regular", Consolas, "Liberation Mono", monospace' },
];
function getLabPreviewStyles(viewport: LabState['viewport']) {
  const mobilePreviewStyles =
    viewport === 'mobile'
      ? `
    .derin-widget-container {
      padding: 10px;
      align-items: stretch !important;
    }

    .derin-widget-container > div[style] {
      width: 100% !important;
      height: 100% !important;
    }

    .chat-window {
      border: 1px solid var(--internal-panel-border) !important;
      border-radius: 16px !important;
      transform: scale(0.98) translateY(14px) !important;
    }

    .chat-window.is-open {
      transform: scale(1) translateY(0) !important;
    }
`
      : '';

  return `
  .derin-widget-container {
    position: absolute !important;
    inset: 0 !important;
    box-sizing: border-box;
    justify-content: flex-end;
    padding: 20px;
    pointer-events: none;
  }

  .derin-widget-container > * {
    pointer-events: auto;
  }

  .derin-widget-container > div[style] {
    position: relative !important;
    display: flex !important;
    min-height: 0 !important;
    width: min(380px, 100%) !important;
    height: min(620px, 100%) !important;
  }

  .chat-window {
    box-sizing: border-box !important;
    position: relative !important;
    inset: auto !important;
    width: 100% !important;
    height: 100% !important;
    max-height: none !important;
  }

  .derin-layout-compact > div[style] {
    width: min(320px, 100%) !important;
    height: min(480px, 100%) !important;
  }

  .derin-layout-full-screen {
    align-items: stretch !important;
    justify-content: stretch;
  }

  .derin-layout-full-screen > div[style] {
    width: 100% !important;
    height: 100% !important;
  }

  .derin-layout-full-screen .chat-window {
    position: relative !important;
    inset: auto !important;
    max-width: none !important;
    max-height: none !important;
    transform: scale(0.98) translateY(12px) !important;
  }

  .derin-layout-full-screen .chat-window.is-open {
    transform: scale(1) translateY(0) !important;
  }

  @media (max-width: 480px) {
    .chat-window {
      position: relative !important;
      inset: auto !important;
      width: 100% !important;
      height: 100% !important;
      max-height: none !important;
    }

${mobilePreviewStyles}
  }
`;
}

const lightPalette: LabPalette = {
  primary: '#4F46E5',
  headerBg: '#4F46E5',
  headerText: '#ffffff',
  background: '#ffffff',
  botMessageBg: '#ffffff',
  botMessageText: '#1f2937',
  userMessageBg: '#4F46E5',
  userMessageText: '#ffffff',
  inputBg: '#f9fafb',
  inputText: '#111827',
};

const darkPalette: LabPalette = {
  primary: '#4F46E5',
  headerBg: '#4F46E5',
  headerText: '#ffffff',
  background: '#1f2937',
  botMessageBg: '#374151',
  botMessageText: '#f9fafb',
  userMessageBg: '#4F46E5',
  userMessageText: '#ffffff',
  inputBg: '#374151',
  inputText: '#f9fafb',
};

const initialState: LabState = {
  scenario: 'conversation',
  qaPreset: 'idle',
  viewport: 'desktop',
  frameworkTab: 'next',
  connectionMode: 'mock',
  layout: 'normal',
  theme: 'light',
  position: 'bottom-right',
  title: 'Support',
  subtitle: 'Online',
  placeholder: 'Type your message...',
  welcomeBadge: 'AI assistant',
  welcomeMessage: 'Hello! How can I help?',
  welcomeHints: 'Ask a question, Upload a file',
  logo: '',
  fontFamily: defaultFontFamily,
  apiUrl: 'https://api.example.com/chat',
  websocketUrl: 'wss://api.example.com/chat',
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  attachmentMaxSize: 10,
  customAttachmentTypes: false,
  messageFormatTextField: 'reply',
  messageFormatImageField: 'image',
  messageFormatQuickRepliesField: 'quickReplies',
  messageFormatActionsField: 'actions',
  messageFormatAgentField: 'agent',
  messageFormatTypeField: 'type',
  maxMessages: 100,
  features: {
    markdown: true,
    quickReplies: true,
    fileUpload: true,
    images: true,
    agentMode: true,
    timestamps: true,
    avatars: true,
    messageTools: true,
    voiceInput: true,
    voiceOutput: true,
    unreadBadge: true,
    showWelcomeScreen: true,
  },
  behavior: {
    openOnLoad: true,
    closeOnOutsideClick: false,
    persistSession: false,
    persistSessionId: false,
  },
  ...lightPalette,
};

const scenarioMessages: Record<Scenario, Message[]> = {
  welcome: [],
  conversation: [
    {
      id: 'lab-1',
      sender: 'bot',
      text: 'Hi, I can help with order status, returns, and product questions.',
      timestamp: now,
      quickReplies: [
        { label: 'Order status', value: 'order-status' },
        { label: 'Return policy', value: 'return-policy' },
      ],
    },
    {
      id: 'lab-2',
      sender: 'user',
      text: 'Can you check my last order?',
      timestamp: now,
    },
    {
      id: 'lab-3',
      sender: 'agent',
      text: 'Of course. Please share your order number and I will look it up.',
      timestamp: now,
      agent: { name: 'Derin Support', isOnline: true },
    },
  ],
  long: [
    {
      id: 'lab-long-1',
      sender: 'user',
      text: 'I need a detailed explanation of how your SDK handles styling inside a host app.',
      timestamp: now,
    },
    {
      id: 'lab-long-2',
      sender: 'bot',
      text:
        'Derin Chat UI renders into an open Shadow DOM root and injects its compiled styles into that root. Host page selectors such as button, input, h3, or .message do not accidentally restyle the widget. The SDK also exposes theme tokens so product teams can customize the widget without importing a global CSS file.',
      timestamp: now,
    },
  ],
  markdown: [
    {
      id: 'lab-md-1',
      sender: 'bot',
      text:
        'Here is a **markdown** response with a link to [npm](https://www.npmjs.com/package/derin-chat-ui) and a small code sample:\n\n```ts\nDerinChat.init({\n  mock: true,\n  ui: { theme: "auto" }\n});\n```',
      timestamp: now,
    },
  ],
  media: [
    {
      id: 'lab-media-1',
      sender: 'bot',
      text: 'Media and attachment states should keep spacing stable.',
      timestamp: now,
      image: {
        url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=640&q=80',
        alt: 'Team dashboard',
        width: 280,
      },
      file: {
        url: '#',
        name: 'support-screenshot.png',
        size: 245000,
        type: 'image',
      },
    },
  ],
  agent: [
    {
      id: 'lab-agent-1',
      sender: 'agent',
      text: 'I am joining from live support. The header should show my name and avatar state.',
      timestamp: now,
      agent: {
        name: 'Derin Support',
        avatar: 'https://i.pravatar.cc/96?img=12',
        isOnline: true,
      },
    },
  ],
};

const presetMessages: Record<Exclude<QaPreset, 'idle'>, Message[]> = {
  loading: [
    {
      id: 'preset-loading-1',
      sender: 'user',
      text: 'Please prepare a detailed account summary.',
      timestamp: now,
    },
  ],
  error: [
    {
      id: 'preset-error-1',
      sender: 'system',
      text: 'UI Lab forced error: backend returned a recoverable failure.',
      timestamp: now,
    },
  ],
  connection: [
    {
      id: 'preset-connection-1',
      sender: 'bot',
      text: 'This preset connects to an unavailable WebSocket endpoint so the connection banner can be reviewed.',
      timestamp: now,
    },
  ],
  streaming: [
    {
      id: 'preset-streaming-1',
      sender: 'bot',
      text: 'Send a message to review streaming markdown, disabled input, and stop generation.',
      timestamp: now,
    },
  ],
};

const customAttachmentTypes: AttachmentTypeConfig[] = [
  {
    id: 'screenshot',
    label: 'Screenshot',
    accept: 'image/png,image/jpeg',
    kind: 'image',
    description: 'PNG or JPG evidence',
  },
  {
    id: 'contract',
    label: 'Contract',
    accept: '.pdf,application/pdf',
    kind: 'pdf',
    description: 'Signed PDFs',
  },
  {
    id: 'voice-note',
    label: 'Voice note',
    accept: 'audio/*',
    kind: 'audio',
    description: 'Audio files',
  },
];

const frameworkLabels: Record<FrameworkTab, string> = {
  json: 'Config JSON',
  vanilla: 'Vanilla JS',
  react: 'React',
  next: 'Next.js',
  vite: 'Vite',
  cdn: 'CDN / UMD',
};

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;

  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function luminance(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const values = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string) {
  const fg = luminance(foreground);
  const bg = luminance(background);
  if (fg === null || bg === null) return 0;

  const light = Math.max(fg, bg);
  const dark = Math.min(fg, bg);
  return (light + 0.05) / (dark + 0.05);
}

function cleanList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripEmpty<T extends Record<string, unknown>>(value: T): T {
  const result: Record<string, unknown> = {};

  Object.entries(value).forEach(([key, entry]) => {
    if (entry === '' || entry === undefined || entry === null) return;

    if (Array.isArray(entry)) {
      if (entry.length > 0) result[key] = entry;
      return;
    }

    if (typeof entry === 'object') {
      const nested = stripEmpty(entry as Record<string, unknown>);
      if (Object.keys(nested).length > 0) result[key] = nested;
      return;
    }

    result[key] = entry;
  });

  return result as T;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ComponentChildren;
}) {
  return (
    <label class="ui-lab-field">
      <span>{label}</span>
      {children}
      {hint && <em>{hint}</em>}
    </label>
  );
}

function Section({
  id,
  title,
  eyebrow,
  collapsed = false,
  onToggle,
  children,
}: {
  id: SectionId;
  title: string;
  eyebrow?: string;
  collapsed?: boolean;
  onToggle?: (id: SectionId) => void;
  children: ComponentChildren;
}) {
  return (
    <section class={`ui-lab-panel ${collapsed ? 'is-collapsed' : ''}`}>
      <div class="ui-lab-panel-title">
        <button
          type="button"
          class="ui-lab-panel-toggle"
          aria-expanded={!collapsed}
          aria-controls={`ui-lab-panel-body-${id}`}
          onClick={() => onToggle?.(id)}
        >
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          <i aria-hidden="true" />
        </button>
      </div>
      <div id={`ui-lab-panel-body-${id}`} class="ui-lab-panel-body" hidden={collapsed}>
        {children}
      </div>
    </section>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label class="ui-lab-toggle">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} />
      <i />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <div class="ui-lab-color-input">
        <input type="color" value={value} onInput={(event) => onChange(event.currentTarget.value)} />
        <input value={value} onInput={(event) => onChange(event.currentTarget.value)} />
      </div>
    </Field>
  );
}

function ContrastRow({
  label,
  foreground,
  background,
}: {
  label: string;
  foreground: string;
  background: string;
}) {
  const ratio = contrastRatio(foreground, background);
  const passes = ratio >= 4.5;

  return (
    <div class={`ui-lab-contrast-row ${passes ? 'is-pass' : 'is-fail'}`}>
      <div>
        <strong>{label}</strong>
        <span>{ratio.toFixed(2)}:1 contrast</span>
      </div>
      <span>{passes ? 'Pass' : 'Fix'}</span>
    </div>
  );
}

function buildMockConfig(state: LabState): Pick<ChatConfig, 'mock' | 'connection' | 'apiUrl'> {
  if (state.qaPreset === 'connection' || state.connectionMode === 'websocket') {
    return {
      mock: false,
      connection: {
        mode: 'websocket',
        websocket: {
          url:
            state.qaPreset === 'connection'
              ? 'ws://127.0.0.1:9/derin-chat-ui-lab'
              : state.websocketUrl,
          reconnect: true,
          reconnectInterval: state.reconnectInterval,
          maxReconnectAttempts: state.maxReconnectAttempts,
        },
      },
    };
  }

  if (state.connectionMode === 'http') {
    return {
      mock: false,
      apiUrl: state.apiUrl,
      connection: {
        mode: 'http',
        stream: false,
      },
    };
  }

  if (state.qaPreset === 'loading') {
    return {
      mock: {
        handler: async () => {
          await new Promise((resolve) => setTimeout(resolve, 45000));
          return 'This delayed UI Lab response finished after the loading state was reviewed.';
        },
      },
    };
  }

  if (state.qaPreset === 'error') {
    return {
      mock: {
        handler: async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          throw new Error('UI Lab forced backend failure.');
        },
      },
    };
  }

  if (state.connectionMode === 'streaming') {
    return {
      mock: false,
      apiUrl: state.apiUrl,
      connection: {
        mode: 'http',
        stream: true,
      },
    };
  }

  if (state.qaPreset === 'streaming') {
    return {
      mock: {
        handler: async (message) =>
          `Streaming response for **${message}**.\n\nThe widget should keep the input disabled while this answer arrives and render the final markdown cleanly.\n\n\`\`\`ts\nDerinChat.init({\n  connection: { stream: true },\n  mock: true\n});\n\`\`\``,
      },
      connection: {
        mode: 'http',
        stream: true,
      },
    };
  }

  return {
    mock: {
      handler: async (message) => ({
        reply: `Received: "${message}". This is a mock response for UI review.`,
        quickReplies: [
          { label: 'Looks good', value: 'looks-good' },
          { label: 'Try another state', value: 'try-another-state' },
        ],
      }),
    },
  };
}

function getInitialLabMessages(state: LabState): Message[] {
  const messages = state.scenario === 'welcome' ? [] : scenarioMessages[state.scenario];

  if (state.qaPreset === 'idle') {
    return messages;
  }

  return [...messages, ...presetMessages[state.qaPreset]];
}

function buildConfig(state: LabState, includeFunctions = true): ChatConfig {
  const transportConfig = buildMockConfig(state);
  const attachmentTypes = state.customAttachmentTypes ? customAttachmentTypes : undefined;
  const unreadBadge = state.features.unreadBadge
    ? {
        enabled: true,
        maxCount: 99,
        backgroundColor: '#ef4444',
        textColor: '#ffffff',
        position: 'top-right' as const,
        animate: true,
      }
    : { enabled: false };

  const config: ChatConfig = {
    instanceId: INSTANCE_ID,
    target: '#ui-lab-widget-mount',
    ...transportConfig,
    features: {
      fileUpload: state.features.fileUpload,
      quickReplies: state.features.quickReplies,
      agentMode: state.features.agentMode,
      timestamps: state.features.timestamps,
      avatars: state.features.avatars,
      messageTools: state.features.messageTools,
      markdown: state.features.markdown,
      images: state.features.images,
      voice: {
        input: state.features.voiceInput,
        output: state.features.voiceOutput,
      },
    },
    attachments: {
      enabled: state.features.fileUpload,
      maxSize: state.attachmentMaxSize,
      types: attachmentTypes,
    },
    ui: {
      theme: state.theme,
      layout: state.layout,
      position: state.position,
      fontFamily: state.fontFamily,
      logo: state.logo,
      showWelcomeScreen: state.features.showWelcomeScreen,
      colors: {
        primary: state.primary,
        headerBg: state.headerBg,
        headerText: state.headerText,
        background: state.background,
        botMessageBg: state.botMessageBg,
        botMessageText: state.botMessageText,
        userMessageBg: state.userMessageBg,
        userMessageText: state.userMessageText,
        inputBg: state.inputBg,
        inputText: state.inputText,
      },
      texts: {
        title: state.title,
        subtitle: state.subtitle,
        placeholder: state.placeholder,
        welcomeBadge: state.welcomeBadge,
        welcomeMessage: state.welcomeMessage,
        welcomeHints: cleanList(state.welcomeHints),
        errorMessage: 'UI Lab request failed. Review the error state.',
        loading: 'Typing...',
        openChat: 'Open chat',
        closeChat: 'Close chat',
        addFile: 'Add file',
        selectFile: 'Select file',
        attachmentType: 'Attachment type',
        readAloud: 'Read aloud',
        stopSpeaking: 'Stop speaking',
      },
    },
    behavior: {
      openOnLoad: state.behavior.openOnLoad,
      closeOnOutsideClick: state.behavior.closeOnOutsideClick,
      persistSession: state.behavior.persistSession,
      persistSessionId: state.behavior.persistSessionId,
      maxMessages: state.maxMessages,
    },
    messageFormat: {
      textField: state.messageFormatTextField,
      imageField: state.messageFormatImageField,
      quickRepliesField: state.messageFormatQuickRepliesField,
      actionsField: state.messageFormatActionsField,
      agentField: state.messageFormatAgentField,
      typeField: state.messageFormatTypeField,
    },
    unreadBadge,
    user: {
      id: 'demo-user-42',
      name: 'Demo User',
      metadata: {
        source: 'ui-lab',
        plan: 'pro',
      },
    },
  };

  if (!includeFunctions) return config;

  return config;
}

function buildExportConfig(state: LabState) {
  const full = buildConfig(state, false);
  const transport = {
    ...(state.connectionMode === 'mock' ? { mock: true } : {}),
    ...(state.connectionMode === 'http'
      ? {
          apiUrl: state.apiUrl,
          connection: {
            mode: 'http' as const,
            stream: false,
          },
        }
      : {}),
    ...(state.connectionMode === 'websocket'
      ? {
          connection: {
            mode: 'websocket' as const,
            websocket: {
              url: state.websocketUrl,
              reconnect: true,
              reconnectInterval: state.reconnectInterval,
              maxReconnectAttempts: state.maxReconnectAttempts,
            },
          },
        }
      : {}),
    ...(state.connectionMode === 'streaming'
      ? {
          apiUrl: state.apiUrl,
          connection: {
            mode: 'http' as const,
            stream: true,
          },
        }
      : {}),
  };

  return stripEmpty({
    ...transport,
    features: full.features,
    attachments: full.attachments,
    ui: full.ui,
    behavior: full.behavior,
    messageFormat: full.messageFormat,
    unreadBadge: full.unreadBadge,
  });
}

function indentConfig(config: unknown) {
  return JSON.stringify(config, null, 2);
}

function generateCode(state: LabState, tab: FrameworkTab) {
  const config = buildExportConfig(state);
  const json = indentConfig(config);

  if (tab === 'json') return json;

  if (tab === 'vanilla') {
    return `import DerinChat from 'derin-chat-ui';\n\nDerinChat.init(${json});`;
  }

  if (tab === 'react') {
    return `import { useEffect } from 'react';\nimport DerinChat from 'derin-chat-ui';\n\nconst chatConfig = ${json};\n\nexport function SupportChat() {\n  useEffect(() => {\n    DerinChat.init(chatConfig);\n    return () => DerinChat.destroy(chatConfig.instanceId);\n  }, []);\n\n  return null;\n}`;
  }

  if (tab === 'next') {
    return `'use client';\n\nimport { useEffect } from 'react';\nimport DerinChat from 'derin-chat-ui';\n\nconst chatConfig = ${json};\n\nexport default function DerinChatClient() {\n  useEffect(() => {\n    DerinChat.init(chatConfig);\n    return () => DerinChat.destroy(chatConfig.instanceId);\n  }, []);\n\n  return null;\n}`;
  }

  if (tab === 'vite') {
    return `import DerinChat from 'derin-chat-ui';\n\nconst chatConfig = ${json};\n\nDerinChat.init(chatConfig);`;
  }

  return `<script src="https://unpkg.com/derin-chat-ui/dist/index.umd.js"></script>\n<script>\n  window.DerinChat.init(${json.replace(/\n/g, '\n  ')});\n</script>`;
}

function getWidgetConfigSignature(state: LabState) {
  return JSON.stringify({
    qaPreset: state.qaPreset,
    connectionMode: state.connectionMode,
    layout: state.layout,
    theme: state.theme,
    position: state.position,
    title: state.title,
    subtitle: state.subtitle,
    placeholder: state.placeholder,
    welcomeBadge: state.welcomeBadge,
    welcomeMessage: state.welcomeMessage,
    welcomeHints: state.welcomeHints,
    primary: state.primary,
    headerBg: state.headerBg,
    headerText: state.headerText,
    background: state.background,
    botMessageBg: state.botMessageBg,
    botMessageText: state.botMessageText,
    userMessageBg: state.userMessageBg,
    userMessageText: state.userMessageText,
    inputBg: state.inputBg,
    inputText: state.inputText,
    logo: state.logo,
    fontFamily: state.fontFamily,
    apiUrl: state.apiUrl,
    websocketUrl: state.websocketUrl,
    reconnectInterval: state.reconnectInterval,
    maxReconnectAttempts: state.maxReconnectAttempts,
    attachmentMaxSize: state.attachmentMaxSize,
    customAttachmentTypes: state.customAttachmentTypes,
    messageFormatTextField: state.messageFormatTextField,
    messageFormatImageField: state.messageFormatImageField,
    messageFormatQuickRepliesField: state.messageFormatQuickRepliesField,
    messageFormatActionsField: state.messageFormatActionsField,
    messageFormatAgentField: state.messageFormatAgentField,
    messageFormatTypeField: state.messageFormatTypeField,
    maxMessages: state.maxMessages,
    features: state.features,
    behavior: state.behavior,
  });
}

function getMessageSignature(state: LabState) {
  return `${state.scenario}:${state.qaPreset}`;
}

function applyLabPreviewStyles(viewport: LabState['viewport']) {
  const host = document.getElementById(`derin-chat-host-${INSTANCE_ID}`);
  const shadow = host?.shadowRoot;
  if (!shadow) return;

  let style = shadow.getElementById(LAB_PREVIEW_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = LAB_PREVIEW_STYLE_ID;
    shadow.appendChild(style);
  }

  style.textContent = getLabPreviewStyles(viewport);
}

export function UiLabPage() {
  const [state, setState] = useState<LabState>(initialState);
  const [collapsedSections, setCollapsedSections] = useState<Partial<Record<SectionId, boolean>>>({});
  const [configCopied, setConfigCopied] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const widgetConfigSignature = useMemo(() => getWidgetConfigSignature(state), [state]);
  const messageSignature = useMemo(() => getMessageSignature(state), [state.scenario, state.qaPreset]);
  const configText = useMemo(() => generateCode(state, state.frameworkTab), [state]);
  const initialMessages = useMemo(() => getInitialLabMessages(state), [messageSignature]);

  const config = useMemo<ChatConfig>(
    () => buildConfig(state),
    [widgetConfigSignature]
  );

  useEffect(() => {
    document.body.classList.add('ui-lab-body-lock');
    document.documentElement.classList.add('ui-lab-body-lock');

    return () => {
      document.body.classList.remove('ui-lab-body-lock');
      document.documentElement.classList.remove('ui-lab-body-lock');
    };
  }, []);

  useEffect(() => {
    const scrollState = {
      windowX: window.scrollX,
      sidebar: sidebarRef.current?.scrollTop ?? 0,
    };

    DerinChat.destroy(INSTANCE_ID);
    DerinChat.init(config);
    applyLabPreviewStyles(state.viewport);
    if (initialMessages.length > 0) {
      window.setTimeout(() => {
        applyLabPreviewStyles(state.viewport);
        DerinChat.loadMessages(initialMessages, INSTANCE_ID);
      }, 0);
    }

    window.requestAnimationFrame(() => {
      sidebarRef.current?.scrollTo({ top: scrollState.sidebar, left: 0 });
      previewRef.current?.scrollTo({ top: 0, left: 0 });
      window.scrollTo(scrollState.windowX, 0);
    });

    return () => DerinChat.destroy(INSTANCE_ID);
  }, [config, initialMessages]);

  useEffect(() => {
    applyLabPreviewStyles(state.viewport);
  }, [state.viewport]);

  const keepPreviewAnchored = () => {
    window.requestAnimationFrame(() => {
      previewRef.current?.scrollTo({ top: 0, left: 0 });
      window.scrollTo(0, 0);
    });
  };

  const patchState = (patch: Partial<LabState>) => {
    setState((current) => ({ ...current, ...patch }));
    keepPreviewAnchored();
  };

  const patchFeatures = (patch: Partial<LabState['features']>) => {
    setState((current) => ({ ...current, features: { ...current.features, ...patch } }));
    keepPreviewAnchored();
  };

  const patchBehavior = (patch: Partial<LabState['behavior']>) => {
    setState((current) => ({ ...current, behavior: { ...current.behavior, ...patch } }));
    keepPreviewAnchored();
  };

  const toggleSection = (id: SectionId) => {
    setCollapsedSections((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const hasCollapsedSections = Object.values(collapsedSections).some(Boolean);

  const changeTheme = (theme: LabState['theme']) => {
    patchState({
      theme,
      ...(theme === 'dark' ? darkPalette : lightPalette),
    });
  };

  const reset = () => {
    setState(initialState);
    setCollapsedSections({});
    sidebarRef.current?.scrollTo({ top: 0, left: 0 });
    previewRef.current?.scrollTo({ top: 0, left: 0 });
    window.scrollTo(0, 0);
  };

  const copyConfig = () => {
    const write = navigator.clipboard?.writeText(configText);
    write?.then(() => {
      setConfigCopied(true);
      window.setTimeout(() => setConfigCopied(false), 1600);
    });
  };

  return (
    <main class="ui-lab-page">
      <aside class="ui-lab-sidebar" ref={sidebarRef}>
        <div class="ui-lab-header">
          <div>
            <span>Derin Config Studio</span>
            <h1>Customize, preview, export</h1>
          </div>
          <div class="ui-lab-header-actions">
            <button type="button" onClick={() => setCollapsedSections(hasCollapsedSections ? {} : {
              studio: true,
              appearance: true,
              copy: true,
              features: true,
              behavior: true,
              connection: true,
              attachments: true,
              contrast: true,
            })}>
              {hasCollapsedSections ? 'Expand' : 'Collapse'}
            </button>
            <button type="button" onClick={reset}>Reset</button>
          </div>
        </div>

        <Section id="studio" title="Studio flow" eyebrow="Start" collapsed={!!collapsedSections.studio} onToggle={toggleSection}>
          <Field label="Scenario">
            <select value={state.scenario} onChange={(event) => patchState({ scenario: event.currentTarget.value as Scenario })}>
              <option value="welcome">Welcome</option>
              <option value="conversation">Conversation</option>
              <option value="long">Long copy</option>
              <option value="markdown">Markdown</option>
              <option value="media">Media</option>
              <option value="agent">Agent handoff</option>
            </select>
          </Field>
          <Field label="Runtime state">
            <select value={state.qaPreset} onChange={(event) => patchState({ qaPreset: event.currentTarget.value as QaPreset })}>
              <option value="idle">Idle</option>
              <option value="loading">Loading</option>
              <option value="error">Error</option>
              <option value="connection">Connection issue</option>
              <option value="streaming">Streaming</option>
            </select>
          </Field>
        </Section>

        <Section id="appearance" title="Appearance" eyebrow="Widget" collapsed={!!collapsedSections.appearance} onToggle={toggleSection}>
          <div class="ui-lab-grid-two">
            <Field label="Layout">
              <select value={state.layout} onChange={(event) => patchState({ layout: event.currentTarget.value as LabState['layout'] })}>
                <option value="normal">Normal</option>
                <option value="compact">Compact</option>
                <option value="full-screen">Full screen</option>
              </select>
            </Field>
            <Field label="Position">
              <select value={state.position} onChange={(event) => patchState({ position: event.currentTarget.value as LabState['position'] })}>
                <option value="bottom-right">Bottom right</option>
                <option value="bottom-left">Bottom left</option>
              </select>
            </Field>
          </div>
          <div class="ui-lab-grid-two">
            <Field label="Theme">
              <select value={state.theme} onChange={(event) => changeTheme(event.currentTarget.value as LabState['theme'])}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </Field>
            <Field label="Font family">
              <select value={state.fontFamily} onChange={(event) => patchState({ fontFamily: event.currentTarget.value })}>
                {fontFamilyOptions.map((option) => (
                  <option value={option.value}>{option.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Logo URL">
            <input value={state.logo} placeholder="https://..." onInput={(event) => patchState({ logo: event.currentTarget.value })} />
          </Field>
          <ColorField label="Primary" value={state.primary} onChange={(primary) => patchState({ primary, userMessageBg: primary })} />
          <ColorField label="Header background" value={state.headerBg} onChange={(headerBg) => patchState({ headerBg })} />
          <ColorField label="Header text" value={state.headerText} onChange={(headerText) => patchState({ headerText })} />
          <ColorField label="Widget background" value={state.background} onChange={(background) => patchState({ background })} />
          <ColorField label="Bot bubble" value={state.botMessageBg} onChange={(botMessageBg) => patchState({ botMessageBg })} />
          <ColorField label="Bot text" value={state.botMessageText} onChange={(botMessageText) => patchState({ botMessageText })} />
          <ColorField label="User bubble" value={state.userMessageBg} onChange={(userMessageBg) => patchState({ userMessageBg })} />
          <ColorField label="User text" value={state.userMessageText} onChange={(userMessageText) => patchState({ userMessageText })} />
          <ColorField label="Input background" value={state.inputBg} onChange={(inputBg) => patchState({ inputBg })} />
          <ColorField label="Input text" value={state.inputText} onChange={(inputText) => patchState({ inputText })} />
        </Section>

        <Section id="copy" title="Copy and i18n" eyebrow="Text" collapsed={!!collapsedSections.copy} onToggle={toggleSection}>
          <Field label="Title">
            <input value={state.title} onInput={(event) => patchState({ title: event.currentTarget.value })} />
          </Field>
          <Field label="Subtitle">
            <input value={state.subtitle} onInput={(event) => patchState({ subtitle: event.currentTarget.value })} />
          </Field>
          <Field label="Placeholder">
            <input value={state.placeholder} onInput={(event) => patchState({ placeholder: event.currentTarget.value })} />
          </Field>
          <Field label="Welcome badge">
            <input value={state.welcomeBadge} onInput={(event) => patchState({ welcomeBadge: event.currentTarget.value })} />
          </Field>
          <Field label="Welcome message">
            <input value={state.welcomeMessage} onInput={(event) => patchState({ welcomeMessage: event.currentTarget.value })} />
          </Field>
          <Field label="Welcome hints" hint="Comma-separated values">
            <input value={state.welcomeHints} onInput={(event) => patchState({ welcomeHints: event.currentTarget.value })} />
          </Field>
        </Section>

        <Section id="features" title="Features" eyebrow="Toggles" collapsed={!!collapsedSections.features} onToggle={toggleSection}>
          <ToggleField label="Welcome screen" checked={state.features.showWelcomeScreen} onChange={(showWelcomeScreen) => patchFeatures({ showWelcomeScreen })} />
          <ToggleField label="Markdown" checked={state.features.markdown} onChange={(markdown) => patchFeatures({ markdown })} />
          <ToggleField label="Quick replies" checked={state.features.quickReplies} onChange={(quickReplies) => patchFeatures({ quickReplies })} />
          <ToggleField label="File upload" checked={state.features.fileUpload} onChange={(fileUpload) => patchFeatures({ fileUpload })} />
          <ToggleField label="Images" checked={state.features.images} onChange={(images) => patchFeatures({ images })} />
          <ToggleField label="Agent mode" checked={state.features.agentMode} onChange={(agentMode) => patchFeatures({ agentMode })} />
          <ToggleField label="Timestamps" checked={state.features.timestamps} onChange={(timestamps) => patchFeatures({ timestamps })} />
          <ToggleField label="Avatars" checked={state.features.avatars} onChange={(avatars) => patchFeatures({ avatars })} />
          <ToggleField label="Message tools" checked={state.features.messageTools} onChange={(messageTools) => patchFeatures({ messageTools })} />
          <ToggleField label="Voice input" checked={state.features.voiceInput} onChange={(voiceInput) => patchFeatures({ voiceInput })} />
          <ToggleField label="Voice output" checked={state.features.voiceOutput} onChange={(voiceOutput) => patchFeatures({ voiceOutput })} />
          <ToggleField label="Unread badge" checked={state.features.unreadBadge} onChange={(unreadBadge) => patchFeatures({ unreadBadge })} />
        </Section>

        <Section id="behavior" title="Behavior" eyebrow="Runtime" collapsed={!!collapsedSections.behavior} onToggle={toggleSection}>
          <ToggleField label="Open on load" checked={state.behavior.openOnLoad} onChange={(openOnLoad) => patchBehavior({ openOnLoad })} />
          <ToggleField label="Close on outside click" checked={state.behavior.closeOnOutsideClick} onChange={(closeOnOutsideClick) => patchBehavior({ closeOnOutsideClick })} />
          <ToggleField label="Persist session" checked={state.behavior.persistSession} onChange={(persistSession) => patchBehavior({ persistSession })} />
          <ToggleField label="Persist session id" checked={state.behavior.persistSessionId} onChange={(persistSessionId) => patchBehavior({ persistSessionId })} />
          <Field label="Max messages">
            <input type="number" min="1" value={state.maxMessages} onInput={(event) => patchState({ maxMessages: Number(event.currentTarget.value) })} />
          </Field>
        </Section>

        <Section id="connection" title="Connection" eyebrow="Backend" collapsed={!!collapsedSections.connection} onToggle={toggleSection}>
          <Field label="Mode">
            <select value={state.connectionMode} onChange={(event) => patchState({ connectionMode: event.currentTarget.value as ConnectionStudioMode })}>
              <option value="mock">Mock</option>
              <option value="http">HTTP</option>
              <option value="websocket">WebSocket</option>
              <option value="streaming">Streaming</option>
            </select>
          </Field>
          <Field label="API URL">
            <input value={state.apiUrl} onInput={(event) => patchState({ apiUrl: event.currentTarget.value })} />
          </Field>
          <Field label="WebSocket URL">
            <input value={state.websocketUrl} onInput={(event) => patchState({ websocketUrl: event.currentTarget.value })} />
          </Field>
          <div class="ui-lab-grid-two">
            <Field label="Reconnect ms">
              <input type="number" value={state.reconnectInterval} onInput={(event) => patchState({ reconnectInterval: Number(event.currentTarget.value) })} />
            </Field>
            <Field label="Max attempts">
              <input type="number" value={state.maxReconnectAttempts} onInput={(event) => patchState({ maxReconnectAttempts: Number(event.currentTarget.value) })} />
            </Field>
          </div>
          <div class="ui-lab-grid-two">
            <Field label="Text field">
              <input value={state.messageFormatTextField} onInput={(event) => patchState({ messageFormatTextField: event.currentTarget.value })} />
            </Field>
            <Field label="Image field">
              <input value={state.messageFormatImageField} onInput={(event) => patchState({ messageFormatImageField: event.currentTarget.value })} />
            </Field>
          </div>
          <div class="ui-lab-grid-two">
            <Field label="Replies field">
              <input value={state.messageFormatQuickRepliesField} onInput={(event) => patchState({ messageFormatQuickRepliesField: event.currentTarget.value })} />
            </Field>
            <Field label="Actions field">
              <input value={state.messageFormatActionsField} onInput={(event) => patchState({ messageFormatActionsField: event.currentTarget.value })} />
            </Field>
          </div>
          <div class="ui-lab-grid-two">
            <Field label="Agent field">
              <input value={state.messageFormatAgentField} onInput={(event) => patchState({ messageFormatAgentField: event.currentTarget.value })} />
            </Field>
            <Field label="Type field">
              <input value={state.messageFormatTypeField} onInput={(event) => patchState({ messageFormatTypeField: event.currentTarget.value })} />
            </Field>
          </div>
        </Section>

        <Section id="attachments" title="Attachments" eyebrow="Files" collapsed={!!collapsedSections.attachments} onToggle={toggleSection}>
          <ToggleField label="Custom type menu" checked={state.customAttachmentTypes} onChange={(customAttachmentTypes) => patchState({ customAttachmentTypes })} />
          <Field label="Max file size">
            <input type="number" min="1" value={state.attachmentMaxSize} onInput={(event) => patchState({ attachmentMaxSize: Number(event.currentTarget.value) })} />
          </Field>
        </Section>

        <Section id="contrast" title="Contrast checks" eyebrow="A11y" collapsed={!!collapsedSections.contrast} onToggle={toggleSection}>
          <ContrastRow label="Header" foreground={state.headerText} background={state.headerBg} />
          <ContrastRow label="Bot message" foreground={state.botMessageText} background={state.botMessageBg} />
          <ContrastRow label="User message" foreground={state.userMessageText} background={state.userMessageBg} />
          <ContrastRow label="Input" foreground={state.inputText} background={state.inputBg} />
        </Section>
      </aside>

      <section class="ui-lab-preview" ref={previewRef}>
        <div class="ui-lab-preview-toolbar">
          <select value={state.viewport} onChange={(event) => patchState({ viewport: event.currentTarget.value as LabState['viewport'] })}>
            <option value="desktop">Desktop preview</option>
            <option value="mobile">Mobile preview</option>
          </select>
        </div>

        <div class={`ui-lab-preview-stage is-${state.viewport}`}>
          <div id="ui-lab-widget-mount" />
        </div>

        <section class="ui-lab-export" aria-label="Current ChatConfig">
          <div class="ui-lab-export-header">
            <div>
              <h3>Framework-ready output</h3>
              <p>Choose a target framework and copy the generated implementation.</p>
            </div>
            <div class="ui-lab-toolbar">
              <button type="button" onClick={copyConfig}>{configCopied ? 'Copied' : 'Copy'}</button>
            </div>
          </div>

          <div class="ui-lab-tabs">
            {(Object.keys(frameworkLabels) as FrameworkTab[]).map((tab) => (
              <button
                type="button"
                class={state.frameworkTab === tab ? 'active' : ''}
                onClick={() => patchState({ frameworkTab: tab })}
              >
                {frameworkLabels[tab]}
              </button>
            ))}
          </div>

          <div class="ui-lab-config-code">
            <div class="ui-lab-config-codebar">
              <span />
              <span />
              <span />
              <strong>{frameworkLabels[state.frameworkTab]}</strong>
            </div>
            <pre><code>{configText}</code></pre>
          </div>
        </section>
      </section>
    </main>
  );
}
