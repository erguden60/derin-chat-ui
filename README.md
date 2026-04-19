# 💬 Derin Chat UI

**Production-grade embeddable AI chat SDK.** Built for developers who need reliable, scalable, and highly customizable chat infrastructure — with zero setup complexity.

[![npm version](https://img.shields.io/npm/v/derin-chat-ui.svg)](https://www.npmjs.com/package/derin-chat-ui)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/derin-chat-ui)](https://bundlephobia.com/package/derin-chat-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Preact](https://img.shields.io/badge/Preact-10+-673AB8?logo=preact)](https://preactjs.com/)

> **📦 Current stable:** v1.0.11 &nbsp;|&nbsp; **🚀 Next milestone:** v1.1.0 — [see roadmap](#-developer-roadmap)

---

## 📋 Table of Contents

- [✨ What Makes It Different?](#-what-makes-it-different)
- [⚡ Zero-CSS Architecture](#-zero-css-architecture)
- [📦 Installation](#-installation)
- [⚡ Quick Start](#-quick-start)
  - [Next.js / React](#nextjs--react)
  - [Vanilla JS / HTML (CDN)](#vanilla-js--html-via-cdn)
  - [Vue.js](#vuejs)
  - [Svelte](#svelte)
- [🛠 Configuration Reference](#-complete-configuration-api)
  - [Instance & Mounting](#instanceid--target-mounting)
  - [Networking](#apiurl--connection-networking)
  - [Features](#features-capabilities)
  - [UI & Theming](#ui-theming--texts)
  - [Behavior](#behavior)
  - [User Identity](#user-identity--auth)
  - [Message Format Mapping](#messageformat-backend-field-remapping)
  - [Event Hooks](#event-hooks-callbacks)
- [🔌 Connection Modes](#-connection-modes)
  - [HTTP (Default)](#1-http-default)
  - [HTTP + Streaming (SSE)](#2-http--streaming-sse)
  - [WebSocket](#3-websocket)
  - [Auto Fallback](#4-auto-fallback)
  - [Mock / Headless](#5-mock--headless-mode)
- [📡 Backend Contracts](#-backend-contracts)
  - [HTTP Request Body](#http-request-body)
  - [HTTP Response Shape](#http-response-shape)
  - [WebSocket Protocol](#websocket-protocol)
- [🧰 Public API Methods](#-public-api-methods)
- [🔷 TypeScript Types](#-typescript-types)
- [⌨️ Keyboard Shortcuts](#️-keyboard-shortcuts)
- [💾 Session Persistence](#-session-persistence)
- [🔒 Security](#-security)
- [🗺 Developer Roadmap](#-developer-roadmap)
- [💻 Local Development](#-local-development)
- [🤝 Contributing](#-contributing)

---

## ✨ What Makes It Different?

Derin Chat UI revolves around delivering an **unopinionated developer experience**. It is not just a UI widget — it is a full-fledged chat engine designed to plug into any backend infrastructure natively.

| Feature | Description |
|---|---|
| 🎯 **Framework-agnostic** | Native integration with HTML/JS, React, Vue, Next.js, Svelte, and more |
| 🔌 **Protocol flexible** | Ships with `HTTP REST`, `WebSocket` (with exponential-backoff reconnects), or pure headless `Mock Handler` layers |
| 🌊 **AI Streaming (SSE)** | Real-time typewriter effect built straight into the core |
| 🎙️ **Voice Assistant** | Native Speech-to-Text & Text-to-Speech — no external dependencies |
| 🎨 **Shadow DOM isolated** | Zero CSS bleed. Your app styles won't break the widget, and the widget won't break your app |
| 🧩 **Multi-Instance Ready** | Mount multiple isolated widgets simultaneously using `instanceId` + `target` |
| 📦 **Lightweight** | ~20 KB gzipped including the Preact engine |
| 🔒 **Secure by default** | XSS-safe markdown, URL-protocol allowlisting, rate limiting, HMAC user verification |

---

## ⚡ Zero-CSS Architecture

Derin Chat UI uses Shadow DOM style isolation. You do **not** need to import or compile a separate CSS file such as `derin-chat-ui/dist/style.css`; the SDK injects its scoped styles directly into the widget shadow root.

This keeps the host application's CSS from breaking the widget, and keeps the widget styles from leaking back into the host page.

---

## 📦 Installation

Install via your preferred package manager. `preact >= 10` is a **peer dependency** and must be installed alongside:

```bash
# npm
npm install derin-chat-ui preact

# yarn
yarn add derin-chat-ui preact

# pnpm
pnpm add derin-chat-ui preact
```

**CDN (no bundler):**

```html
<script src="https://unpkg.com/derin-chat-ui@1.0.11/dist/index.umd.js"></script>
```

---

## ⚡ Quick Start

### Next.js / React

```tsx
'use client';

import { useEffect } from 'react';
import DerinChat from 'derin-chat-ui';

export default function ChatWidget() {
  useEffect(() => {
    DerinChat.init({
      instanceId: 'support-widget',
      apiUrl: 'https://api.example.com/chat',
      user: { id: 'user-123', name: 'John Doe' },
      ui: {
        theme: 'auto',
        colors: { primary: '#4F46E5' },
        texts: { title: 'Support', subtitle: 'Typically replies in seconds' }
      },
      features: {
        voice: { input: true, output: true, language: 'en-US' }
      },
      onMessageSent: (msg) => console.log('User sent:', msg),
    });

    return () => DerinChat.destroy('support-widget');
  }, []);

  return null;
}
```

### Vanilla JS / HTML (via CDN)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Chat Demo</title>
</head>
<body>
  <script src="https://unpkg.com/derin-chat-ui@1.0.11/dist/index.umd.js"></script>
  <script>
    window.DerinChat.init({
      instanceId: 'landing-chat',
      apiUrl: 'https://api.example.com/chat',
      ui: {
        theme: 'dark',
        colors: { primary: '#4F46E5' }
      }
    });
  </script>
</body>
</html>
```

### Vue.js

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'
import DerinChat from 'derin-chat-ui'

onMounted(() => {
  DerinChat.init({
    apiUrl: 'https://api.example.com/chat',
    ui: { theme: 'auto' }
  })
})

onUnmounted(() => DerinChat.destroy())
</script>

<template>
  <div>Your App Layout</div>
</template>
```

### Svelte

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import DerinChat from 'derin-chat-ui';

  onMount(() => {
    DerinChat.init({ apiUrl: 'https://api.example.com/chat' });
  });

  onDestroy(() => DerinChat.destroy());
</script>
```

---

## 🛠 Complete Configuration API

`DerinChat.init(config)` accepts a `ChatConfig` object. All fields are optional unless stated otherwise.

---

### `instanceId` & `target` (Mounting)

Run multiple widgets on the same page, or mount into a specific DOM node.

```typescript
DerinChat.init({
  instanceId: 'support',          // default: 'default'
  target: '#support-chat-root',   // CSS selector | HTMLElement | 'body' (default)
  apiUrl: 'https://api.example.com/chat',
});

// Mount a second instance simultaneously
DerinChat.init({
  instanceId: 'sales',
  target: '#sales-chat-root',
  mock: true,
});

// Destroy a specific instance
DerinChat.destroy('support');

// Check if an instance is alive
DerinChat.isActive('support'); // → boolean
```

> **Validation rules:**
> - `instanceId` must be a non-empty string if provided
> - `target` must be a valid CSS selector string or an `HTMLElement`
> - If `target` selector doesn't match any element, an error is thrown

---

### `apiUrl` & `connection` (Networking)

Define how the chat communicates with your backend.

```typescript
DerinChat.init({
  // Simple HTTP POST
  apiUrl: 'https://api.example.com/chat',
  apiKey: 'your-secret-key',          // Sent as: Authorization: Bearer <apiKey>

  // Advanced connection options
  connection: {
    mode: 'websocket',                // 'http' | 'websocket' | 'auto'   (default: 'http')
    stream: true,                     // Enable SSE character streaming    (default: false)
    websocket: {
      url: 'wss://api.example.com/ws',
      protocols: ['chat-v1'],
      reconnect: true,                // default: true
      reconnectInterval: 3000,        // ms between retries               (default: 3000)
      maxReconnectAttempts: 5,        // 0 = infinite                      (default: 5)
      heartbeatInterval: 30000,       // ping interval in ms               (default: 30000)
      headers: { Authorization: 'Bearer token' }
    }
  }
});
```

---

### `features` (Capabilities)

Toggle individual features on or off.

```typescript
DerinChat.init({
  features: {
    images: true,          // Render inline images from bot responses     (default: true)
    quickReplies: true,    // Guided predefined reply buttons             (default: true)
    agentMode: true,       // Human handoff / agent indicators           (default: true)
    markdown: true,        // XSS-safe markdown rendering                (default: true)
    fileUpload: false,     // File & image upload support                (default: false)
    timestamps: true,      // Show message timestamps                    (default: true)
    avatars: true,         // Show user & bot avatars                    (default: true)
    messageTools: true,    // Copy & feedback buttons on bot messages    (default: true)
    voice: {
      input: true,         // Speech-to-Text microphone                  (default: false)
      output: true,        // Text-to-Speech playback button             (default: false)
      language: 'en-US',   // BCP 47 language tag                        (default: 'en-US')
      voiceName: 'Google US English'   // Specific voice name (optional)
    }
  }
});
```

---

### `ui` (Theming & Texts)

Controls the look, feel, layout, and i18n text strings.

```typescript
DerinChat.init({
  ui: {
    theme: 'auto',          // 'light' | 'dark' | 'auto'         (default: 'light')
    position: 'bottom-right', // 'bottom-right' | 'bottom-left'  (default: 'bottom-right')
    layout: 'normal',       // 'normal' | 'compact' | 'full-screen' (default: 'normal')
    zIndex: 99999,          // CSS z-index of the widget          (default: 99999)
    fontFamily: 'Inter, sans-serif', // Override widget font family
    logo: 'https://example.com/logo.png', // Custom header logo URL

    colors: {
      primary: '#4F46E5',          // Accent color (buttons, send icon)
      headerBg: '#1E1E2E',         // Chat header background
      headerText: '#FFFFFF',       // Chat header text
      userMessageBg: '#4F46E5',    // User bubble background
      userMessageText: '#FFFFFF',  // User bubble text
      botMessageBg: '#F3F4F6',     // Bot bubble background
      botMessageText: '#111827',   // Bot bubble text
      background: '#FFFFFF',       // Chat window background
      inputBg: '#F9FAFB',          // Input field background
      inputText: '#111827',        // Input field text
    },

    texts: {
      title: 'Support',
      subtitle: 'Online',
      placeholder: 'Type your message...',
      sendButton: 'Send',
      loading: 'Typing...',
      errorMessage: 'Connection error. Please try again.',
      rateLimitError: 'You are sending messages too fast. Please wait.',
      mockModeInfo: 'Running in demo mode.',
      openChat: 'Open chat',
      closeChat: 'Close chat',
    },

    fileUpload: {
      maxSize: 5,          // Maximum file size in MB
      accept: 'image/*,application/pdf',  // Accepted MIME types / extensions
    }
  }
});
```

---

### `behavior`

```typescript
DerinChat.init({
  behavior: {
    openOnLoad: false,           // Auto-open widget on page load    (default: false)
    closeOnOutsideClick: true,   // Close when clicking outside      (default: true)
    persistSession: true,        // Persist messages in localStorage (default: true)
    maxMessages: 100,            // Max messages kept in state       (default: 100)
  }
});
```

---

### `user` (Identity & Auth)

Pass identity data to your backend. Use `hash` for secure HMAC verification.

```typescript
DerinChat.init({
  user: {
    id: 'user_98765',
    name: 'Alice Smith',
    avatar: 'https://example.com/avatar.png',
    hash: 'hmac_sha256_hash_here',           // For secure identity verification
    metadata: { tier: 'pro', source: 'landing_page' }
  }
});
```

---

### `messageFormat` (Backend Field Remapping)

If your API returns fields with different names, remap them here instead of modifying your backend.

```typescript
DerinChat.init({
  apiUrl: 'https://api.example.com/chat',
  messageFormat: {
    textField: 'reply',           // default: 'reply'
    imageField: 'image',          // default: 'image'
    quickRepliesField: 'buttons', // default: 'quickReplies'
    actionsField: 'actions',      // default: 'actions'
    agentField: 'agent',          // default: 'agent'
    typeField: 'type',            // default: 'type'
  }
});
```

---

### `Event Hooks` (Callbacks)

Hook into the full conversation lifecycle for analytics, tracking, or side-effects.

```typescript
DerinChat.init({
  apiUrl: 'https://api.example.com/chat',

  onMessageSent:      (message) => console.log('User said:', message),
  onMessageReceived:  (response) => console.log('Bot replied:', response),
  onChatOpened:       () => analytics.track('chat_opened'),
  onChatClosed:       () => analytics.track('chat_closed'),
  onChatClear:        () => console.log('Chat history cleared'),
  onUnreadCountChange:(count) => updateBadge(count),
  onConnectionChange: (status) => console.log('Connection:', status),
  onReconnecting:     (attempt) => console.log(`Reconnect attempt #${attempt}`),
  onReconnected:      () => console.log('Reconnected successfully'),
  onMessageCopy:      (messageId, text) => console.log('Copied:', text),
  onFeedback:         (messageId, type) => {
    // type: 'positive' | 'negative'
    fetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({ messageId, type }),
    });
  },
  onError:            (err) => Sentry.captureException(err),
});
```

---

## 🔌 Connection Modes

### 1. HTTP (Default)

Simple request-response over `POST`. Best for standard REST backends.

```typescript
DerinChat.init({ apiUrl: 'https://api.example.com/chat' });
```

**HTTP behavior:**
- Sends `POST` requests with JSON body
- 30s request timeout
- Auto-retries up to 3 times with exponential backoff: `1000ms → 2000ms → 4000ms`

---

### 2. HTTP + Streaming (SSE)

Enable real-time typewriter streaming from your AI backend.

```typescript
DerinChat.init({
  apiUrl: 'https://api.example.com/chat',
  connection: { stream: true }
});
```

Supported SSE payload formats:

```
data: {"reply":"Hello"}
data: {"text":"Hello"}
data: {"choices":[{"delta":{"content":"Hello"}}]}
data: [DONE]
```

If the response is not standard SSE, raw text chunks are appended as plain text.

---

### 3. WebSocket

Full-duplex real-time communication with automatic reconnection.

```typescript
DerinChat.init({
  connection: {
    mode: 'websocket',
    websocket: {
      url: 'wss://api.example.com/ws',
      reconnect: true,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
    }
  }
});
```

**WebSocket lifecycle:**
- Connects on widget mount
- Sends `ping` heartbeats on an interval, expects `pong` responses
- Queues outgoing messages while offline — delivered on reconnection
- Reconnects with exponential backoff after disconnect
- Marks status as `failed` after exhausting max retries

**Connection status values:**

```
'idle' | 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'failed'
```

---

### 4. Auto Fallback

Uses WebSocket while available, falls back to HTTP automatically.

```typescript
DerinChat.init({
  apiUrl: 'https://api.example.com/chat',
  connection: {
    mode: 'auto',
    websocket: { url: 'wss://api.example.com/ws' }
  }
});
```

> ⚠️ Fallback to HTTP only occurs after WebSocket reaches `failed` or `disconnected` status. During `connecting` or `reconnecting`, messages may still queue through the WebSocket path.

---

### 5. Mock / Headless Mode

Build your UI without needing a live backend. Perfect for prototyping and testing.

```typescript
// Built-in simple mock
DerinChat.init({ mock: true });

// Custom mock handler
DerinChat.init({
  mock: {
    handler: async (message, context) => {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 800));

      if (message.toLowerCase().includes('hello')) {
        return 'Hi there! How can I help you today?';
      }

      return {
        reply: 'Please choose an option:',
        quickReplies: [
          { label: 'Sales',   value: 'sales' },
          { label: 'Support', value: 'support' }
        ]
      };
    }
  }
});
```

**Mock handler context:**

```typescript
interface MockHandlerContext {
  user?: ChatConfig['user'];
  history: Message[];
  file?: {
    name: string;
    type: string;
    size: number;
    data?: string; // Base64 encoded
  };
}
```

---

## 📡 Backend Contracts

### HTTP Request Body

```typescript
{
  message: string;
  stream?: true;                  // Present only when streaming is enabled
  user?: {
    id?: string;
    name?: string;
    avatar?: string;
    hash?: string;
    metadata?: Record<string, unknown>;
  };
  history?: Array<{
    text: string;
    sender: 'user' | 'bot' | 'agent' | 'system';
    timestamp: string;            // ISO 8601
  }>;
  file?: {
    name: string;
    type: string;
    size: number;
    data: string;                 // Base64 data URL
  };
}
```

If `apiKey` is set, each request includes:
```http
Authorization: Bearer <apiKey>
```

---

### HTTP Response Shape

**Minimal (required):**
```json
{ "reply": "Hello!" }
```

**Full response:**
```json
{
  "reply": "Hello! Here's what I found:",
  "type": "bot",
  "image": {
    "url": "https://example.com/chart.png",
    "alt": "Sales Chart"
  },
  "quickReplies": [
    { "label": "Learn More", "value": "more" },
    { "label": "Talk to Sales", "value": "sales" }
  ],
  "actions": [
    { "text": "Open Docs", "url": "https://example.com/docs" }
  ],
  "agent": {
    "name": "Sarah",
    "avatar": "https://example.com/sarah.png",
    "isOnline": true
  }
}
```

Use `messageFormat` to remap response field names if your API uses different keys.

---

### WebSocket Protocol

**Outgoing user message:**
```json
{
  "type": "message",
  "data": {
    "text": "Hello!",
    "user": { "id": "u1", "name": "Jane" },
    "timestamp": "2026-04-19T00:00:00.000Z"
  }
}
```

**Heartbeat (sent by SDK):**
```json
{ "type": "ping" }
```

**Expected pong (from server):**
```json
{ "type": "pong" }
```

**Incoming bot message:**
```json
{
  "type": "message",
  "data": {
    "reply": "Hi there! How can I help?"
  }
}
```

The SDK parses the `data` payload with the same response mapper used for HTTP, so the same response shape applies.

---

## 🧰 Public API Methods

```typescript
// Initialize a widget instance
DerinChat.init(config: ChatConfig): void

// Destroy a widget instance and remove it from the DOM
// Note: localStorage session data is preserved
DerinChat.destroy(instanceId?: string): void   // default instanceId: 'default'

// Check if a widget instance is currently active
DerinChat.isActive(instanceId?: string): boolean

// Programmatically clear persisted message history
DerinChat.clearHistory(instanceId?: string): void

// Hydrate a widget with messages loaded from an external database
DerinChat.loadMessages(messages: Message[], instanceId?: string): void
```

**Example: Hydrating with server-side message history:**
```typescript
const history = await fetch('/api/chat/history').then(r => r.json());
DerinChat.loadMessages(history, 'support');
```

---

## 🔷 TypeScript Types

```typescript
import DerinChat, {
  type ChatConfig,
  type Message,
  type ApiResponse
} from 'derin-chat-ui';
```

**Key exported types:**

```typescript
// Full configuration object
type ChatConfig = {
  instanceId?: string;
  target?: string | HTMLElement;
  apiUrl?: string;
  apiKey?: string;
  mock?: boolean | { handler?: MockHandler };
  connection?: ConnectionConfig;
  features?: FeaturesConfig;
  ui?: UIConfig;
  behavior?: BehaviorConfig;
  user?: UserConfig;
  messageFormat?: MessageFormatConfig;
  // ... event callbacks
};

// A single chat message
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'agent' | 'system';
  timestamp: string;    // ISO 8601
  isStreaming?: boolean;
  image?: { url: string; alt?: string };
  quickReplies?: QuickReply[];
  agent?: AgentInfo;
};

// The shape returned from your backend
type ApiResponse = {
  reply?: string;
  type?: string;
  image?: { url: string; alt?: string };
  quickReplies?: QuickReply[];
  actions?: Action[];
  agent?: AgentInfo;
};

// WebSocket connection status
type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'failed';
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Escape` | Close the chat widget |
| `Ctrl + K` / `Cmd + K` | Toggle (open/close) the widget |
| `Enter` | Send the current message |
| `Shift + Enter` | Insert a newline in the textarea |

---

## 💾 Session Persistence

When `behavior.persistSession` is `true` (default), the widget uses `localStorage` to persist session data across page reloads.

**Storage keys for the default instance:**

| Key | Content |
|---|---|
| `derin-chat-v1-messages` | Chat message history (JSON array) |
| `derin-chat-v1-is-open` | Widget open/closed state |
| `derin-chat-v1-session-id` | Session identifier |
| `derin-chat-v1-unread-count` | Unread message badge count |

**Named instances** (`instanceId: 'support'`) append the ID:
- `derin-chat-v1-messages-support`
- `derin-chat-v1-unread-count-support`

**Legacy key migration:** Old keys from v1.0.x (without version prefix) are migrated automatically on first load.

**Programmatic control:**
```typescript
// Clear history for a specific instance (persisted + live UI state)
DerinChat.clearHistory('support');
```

---

## 🔒 Security

Derin Chat is built with a security-first approach:

- **XSS Protection** — All markdown is parsed with strict HTML escaping and dangerous protocol blocking (`javascript:`, `data:`, etc.)
- **URL Allowlisting** — Only `http://` and `https://` protocols are allowed in links and images
- **Input Sanitization** — All user input is escaped before rendering
- **Rate Limiting** — Built-in client-side limits: max **10 messages/minute**, minimum **1 second** cooldown between sends
- **HMAC Identity Verification** — Pass a server-generated `user.hash` to securely verify user identity on your backend
- **Prototype Pollution Prevention** — Safe deep-merge operations throughout the SDK
- **Shadow DOM Isolation** — Widget styles are fully encapsulated; global CSS cannot bleed in or out

**Recommended server-side security practices:**

```typescript
// Generate HMAC hash on your server (Node.js example)
import crypto from 'crypto';

const userHash = crypto
  .createHmac('sha256', process.env.DERIN_SECRET_KEY!)
  .update(userId)
  .digest('hex');

// Pass to the client securely
DerinChat.init({
  user: { id: userId, hash: userHash }
});
```

> ⚠️ Client-side rate limiting is a UX safeguard only. Always implement server-side rate limiting for production deployments.

---

## 🗺 Developer Roadmap

### ✅ Phase 1: Foundation (v1.0.0 – v1.0.7)
- Core widget with Shadow DOM isolation
- HTTP & WebSocket connectivity
- File uploads, Quick Replies, Unread Badges
- Session persistence with localStorage
- XSS-safe markdown renderer
- Rate limiting (client-side)

### 🎙️ Phase 2: Experience Augmentation (v1.0.8 – v1.0.10)
- **Voice Capabilities** — Native Speech-to-Text & Text-to-Speech
- **Message Action Layer** — Feedback (👍/👎), copy, clear history
- **AI Streaming** — Chunked SSE response rendering (typewriter effect)
- **Multi-Instance Support** — `instanceId` + `target` isolation
- **Connection Recovery UX** — Reconnecting/failed states surfaced in UI
- **localStorage Versioning** — v1 keys with seamless migration

### 🏗 Phase 3: Enterprise Update (Upcoming — v1.1.0+)
- **Custom Render Hooks** — Pass custom JSX/HTML renderers for message bubbles (e.g., interactive charts)
- **Analytics Bridges** — Out-of-the-box hooks for token burn, user drop-off, interaction depth
- **Context Viz Engine** — Multi-turn session visualization for AI context tracing
- **Stronger Config Validation** — Full runtime schema validation with descriptive errors
- **Broader Test Coverage** — Edge cases for all connection modes and lifecycle events

---

## 💻 Local Development

```bash
# 1. Clone the repository
git clone https://github.com/erguden60/derin-chat-ui.git
cd derin-chat-ui

# 2. Install dependencies (requires Node.js 18+)
npm install

# 3. Start the development server
npm run dev
# → Opens the playground app at http://localhost:5173
#   The playground lives in src/demo/ and lets you interact with the widget in real-time.

# 4. Run tests
npm run test          # Single run
npm run test:watch    # Watch mode
npm run test:ui       # Vitest UI (browser-based test explorer)

# 5. Build the distributable package
npm run build

# 6. Preview the production build
npm run preview

# 7. Build the demo app
npm run build:demo

# 8. Lint & format
npm run lint          # Check for lint errors
npm run lint:fix      # Auto-fix lint errors
npm run format        # Prettier format all source files
```

**Project structure:**
```
derin-chat-ui/
├── src/
│   ├── components/        # Preact UI components
│   │   ├── ChatWidget.tsx     # Root widget entry
│   │   ├── ChatWindow.tsx     # Main chat panel
│   │   ├── ChatHeader.tsx     # Header with status
│   │   ├── ChatInput.tsx      # Message input & actions
│   │   ├── ChatMessages.tsx   # Message list
│   │   ├── Message.tsx        # Single message renderer
│   │   ├── Launcher.tsx       # FAB launcher button
│   │   ├── VoiceInput.tsx     # Mic button (STT)
│   │   ├── FileUpload.tsx     # File picker & preview
│   │   ├── QuickReplies.tsx   # Quick reply buttons
│   │   ├── ConnectionStatus.tsx # WS status indicator
│   │   └── UnreadBadge.tsx    # Unread count badge
│   ├── hooks/             # State & side-effect logic
│   │   ├── useChatState.ts    # Core state machine
│   │   ├── useMessageSender.ts# HTTP/WS send logic
│   │   ├── useWebSocket.ts    # WebSocket hook
│   │   ├── useMessages.ts     # Message list management
│   │   └── usePersistence.ts  # localStorage sync
│   ├── styles/            # SCSS component styles
│   │   ├── main.scss          # Widget base styles & themes
│   │   └── components/        # Per-component styles
│   ├── types/             # TypeScript type definitions
│   ├── constants/         # Default values & config constants
│   ├── utils/             # Validators, helpers, storage, WebSocket manager
│   ├── demo/              # Playground app (not part of the package)
│   └── index.ts           # Public SDK entry point
├── dist/                  # Build output (ESM, CJS, UMD + .d.ts)
├── vite.config.ts         # Library build config
├── vite.config.demo.ts    # Demo app build config
└── package.json
```

---

## 🤝 Contributing

Derin Chat thrives on developer feedback. Feature requests, new themes, or bug reports are welcome!

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/my-feature`
3. **Commit** your changes: `git commit -m 'feat: add my feature'`
4. **Push** to the branch: `git push origin feat/my-feature`
5. **Open** a Pull Request

- 🐛 [Report a Bug / Drop an Issue](https://github.com/erguden60/derin-chat-ui/issues)
- 💡 [Start a Discussion](https://github.com/erguden60/derin-chat-ui/discussions)

**Commit message format** — please follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat:     New feature
fix:      Bug fix
docs:     Documentation change
refactor: Code refactor
test:     Test additions/changes
chore:    Build/tooling changes
```

---

**Built for builders.**

> MIT License © 2026 [Emirhan Ergüden](https://github.com/erguden60)
