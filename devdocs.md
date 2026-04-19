# derin-chat-ui Developer Docs

**Version:** 1.0.11  
**License:** MIT  
**Repository:** [github.com/erguden60/derin-chat-ui](https://github.com/erguden60/derin-chat-ui)

This document describes the API and runtime behavior of `derin-chat-ui` based on the current source code in this repository.

---

## Table of Contents

1. [Install](#1-install)
2. [Quick Start](#2-quick-start)
3. [How It Works](#3-how-it-works)
4. [Configuration Reference](#4-configuration-reference)
5. [Connection Modes](#5-connection-modes)
6. [Backend Contracts](#6-backend-contracts)
7. [Feature Notes](#7-feature-notes)
8. [Callbacks](#8-callbacks)
9. [Persistence](#9-persistence)
10. [TypeScript Exports](#10-typescript-exports)
11. [Keyboard Shortcuts](#11-keyboard-shortcuts)
12. [Implementation Notes](#12-implementation-notes)

---

## 1. Install

```bash
npm install derin-chat-ui preact
```

`preact >= 10` is a peer dependency.

---

## 2. Quick Start

### React / Next.js

```tsx
'use client';

import { useEffect } from 'react';
import DerinChat from 'derin-chat-ui';

export default function ChatWidget() {
  useEffect(() => {
    DerinChat.init({
      instanceId: 'support',
      apiUrl: 'https://api.example.com/chat',
      user: { id: 'user-123', name: 'Jane' },
      ui: {
        theme: 'auto',
        texts: {
          title: 'Support',
          subtitle: 'Online',
        },
      },
    });

    return () => DerinChat.destroy('support');
  }, []);

  return null;
}
```

### Vanilla HTML

```html
<script src="https://unpkg.com/derin-chat-ui@1.0.11/dist/index.umd.js"></script>
<script>
  window.DerinChat.init({
    apiUrl: 'https://api.example.com/chat',
    ui: {
      theme: 'light',
      texts: { title: 'Support' }
    }
  });
</script>
```

---

## 3. How It Works

Calling `DerinChat.init(config)`:

1. validates the config
2. merges it with defaults
3. resolves the mount target
4. creates a host element per `instanceId`
5. attaches an open Shadow DOM
6. injects compiled widget styles into that shadow root
7. renders the Preact widget

Each instance gets its own host:

- default instance: `#derin-chat-host`
- named instance: `#derin-chat-host-<instanceId>`

Destroy an instance with:

```ts
DerinChat.destroy();
DerinChat.destroy('support');
```

Check mount state with:

```ts
DerinChat.isActive();
DerinChat.isActive('support');
```

---

## 4. Configuration Reference

`DerinChat.init()` accepts a `ChatConfig`.

### 4.1 Instance and Mounting

```ts
{
  instanceId?: string; // default: 'default'
  target?: string | HTMLElement; // default: 'body'
}
```

### 4.2 Network

```ts
{
  apiUrl?: string;
  apiKey?: string;
  mock?: boolean | {
    handler?: (
      message: string,
      context: MockHandlerContext
    ) => MockHandlerResult | Promise<MockHandlerResult>;
  };
  connection?: {
    mode?: 'http' | 'websocket' | 'auto'; // default: 'http'
    stream?: boolean; // default: false
    websocket?: {
      url: string;
      protocols?: string | string[];
      reconnect?: boolean; // default: true
      reconnectInterval?: number; // default: 3000
      maxReconnectAttempts?: number; // default: 5, 0 = infinite
      heartbeatInterval?: number; // default: 30000
      headers?: Record<string, string>;
    };
  };
  messageFormat?: {
    textField?: string; // default: 'reply'
    imageField?: string; // default: 'image'
    quickRepliesField?: string; // default: 'quickReplies'
    actionsField?: string; // default: 'actions'
    agentField?: string; // default: 'agent'
    typeField?: string; // default: 'type'
  };
}
```

Validation rules:

- `instanceId` must be a non-empty string if provided
- `target` must be a selector string or `HTMLElement`
- `apiUrl` must be a non-empty `http:` or `https:` URL if provided
- if neither `apiUrl` nor `mock` is set, the widget still renders in UI-only mode

### 4.3 Features

```ts
{
  features?: {
    images?: boolean; // default: true
    quickReplies?: boolean; // default: true
    agentMode?: boolean; // default: true
    markdown?: boolean; // default: true
    fileUpload?: boolean; // default: false
    timestamps?: boolean; // default: true
    avatars?: boolean; // default: true
    messageTools?: boolean; // shown unless explicitly set to false
    voice?: {
      input?: boolean;
      output?: boolean;
      language?: string; // defaults to 'en-US' when voice config exists
      voiceName?: string;
    };
  };
}
```

### 4.4 UI

```ts
{
  ui?: {
    position?: 'bottom-right' | 'bottom-left'; // default: 'bottom-right'
    zIndex?: number; // default: 99999
    fontFamily?: string;
    logo?: string;
    theme?: 'light' | 'dark' | 'auto'; // default: 'light'
    layout?: 'normal' | 'compact' | 'full-screen'; // default: 'normal'
    colors?: {
      primary?: string; // default: '#4F46E5'
      headerBg?: string;
      headerText?: string;
      userMessageBg?: string;
      userMessageText?: string;
      botMessageBg?: string;
      botMessageText?: string;
      background?: string;
      inputBg?: string;
      inputText?: string;
    };
    texts?: {
      title?: string; // default: 'Support'
      subtitle?: string; // default: 'Online'
      placeholder?: string; // default: 'Type your message...'
      sendButton?: string; // default: 'Send'
      loading?: string; // default: 'Typing...'
      errorMessage?: string; // default: 'Connection error. Please try again.'
      rateLimitError?: string; // default: 'You are sending messages too fast. Please wait.'
      mockModeInfo?: string;
      openChat?: string;
      closeChat?: string;
    };
    fileUpload?: {
      maxSize?: number; // MB
      accept?: string;
    };
  };
}
```

### 4.5 Behavior

```ts
{
  behavior?: {
    openOnLoad?: boolean; // default: false
    closeOnOutsideClick?: boolean; // default: true
    persistSession?: boolean; // default: true
    maxMessages?: number; // default: 100
  };
}
```

### 4.6 User

```ts
{
  user?: {
    id?: string;
    name?: string;
    avatar?: string;
    hash?: string;
    metadata?: Record<string, unknown>;
  };
}
```

---

## 5. Connection Modes

### 5.1 HTTP

Default mode.

```ts
DerinChat.init({
  apiUrl: 'https://api.example.com/chat'
});
```

HTTP behavior:

- sends `POST` requests with JSON
- uses a 30s timeout
- retries up to 3 times
- backoff delays are `1000ms`, `2000ms`, `4000ms`

### 5.2 HTTP + Streaming

```ts
DerinChat.init({
  apiUrl: 'https://api.example.com/chat',
  connection: { stream: true }
});
```

Streaming parser currently supports:

- `data: {"reply":"..."}`
- `data: {"text":"..."}`
- `data: {"choices":[{"delta":{"content":"..."}}]}`
- `data: [DONE]`

If the response is not SSE-formatted, raw text chunks are appended as plain text.

### 5.3 WebSocket

```ts
DerinChat.init({
  connection: {
    mode: 'websocket',
    websocket: {
      url: 'wss://api.example.com/ws'
    }
  }
});
```

WebSocket behavior:

- connects on mount
- sends heartbeat `ping` messages on an interval
- queues outgoing messages while offline
- reconnects with exponential backoff
- marks status as `failed` after max retries

Status values:

```ts
'idle' | 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'failed'
```

### 5.4 Auto

```ts
DerinChat.init({
  apiUrl: 'https://api.example.com/chat',
  connection: {
    mode: 'auto',
    websocket: { url: 'wss://api.example.com/ws' }
  }
});
```

`auto` uses WebSocket while the manager is active. It falls back to HTTP when WebSocket status becomes `failed` or `disconnected`.

During `connecting` or `reconnecting`, messages may still be queued through the WebSocket path instead of immediately falling back to HTTP.

### 5.5 Mock

```ts
DerinChat.init({
  mock: true
});
```

Built-in mock replies with:

```text
Received: "your message"
```

Custom mock:

```ts
DerinChat.init({
  mock: {
    handler: async (message, context) => {
      if (message.includes('hello')) {
        return 'Hi there';
      }

      return {
        reply: 'Choose one',
        quickReplies: [
          { label: 'Sales', value: 'sales' },
          { label: 'Support', value: 'support' }
        ]
      };
    }
  }
});
```

Mock handler context:

```ts
{
  user?: ChatConfig['user'];
  history: Message[];
  file?: {
    name: string;
    type: string;
    size: number;
    data?: string;
  };
}
```

---

## 6. Backend Contracts

### 6.1 HTTP Request Body

Standard HTTP mode sends:

```ts
{
  message: string;
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
    timestamp: string;
  }>;
  file?: {
    name: string;
    type: string;
    size: number;
    data: string;
  };
}
```

Streaming HTTP adds:

```ts
{
  stream: true
}
```

If `apiKey` is set, requests include:

```http
Authorization: Bearer <apiKey>
```

### 6.2 HTTP Response Shape

Minimal response:

```json
{ "reply": "Hello!" }
```

Full response:

```json
{
  "reply": "Hello!",
  "type": "bot",
  "image": {
    "url": "https://example.com/chart.png",
    "alt": "Chart"
  },
  "quickReplies": [
    { "label": "More", "value": "more" }
  ],
  "actions": [
    { "text": "Open docs", "url": "https://example.com/docs" }
  ],
  "agent": {
    "name": "Sarah",
    "avatar": "https://example.com/sarah.png",
    "isOnline": true
  }
}
```

You can remap backend field names with `messageFormat`.

### 6.3 WebSocket Protocol

Outgoing user message:

```json
{
  "type": "message",
  "data": {
    "text": "Hello",
    "user": { "id": "u1" },
    "timestamp": "2026-03-23T10:00:00.000Z"
  }
}
```

Heartbeat:

```json
{ "type": "ping" }
```

Expected pong:

```json
{ "type": "pong" }
```

Incoming bot payload:

```json
{
  "type": "message",
  "data": {
    "reply": "Hi there"
  }
}
```

The SDK parses incoming `data` with the same response mapper used for HTTP.

---

## 7. Feature Notes

### 7.1 Intro State

Without persisted history, the widget starts with:

```text
Hello!
```

If `user.name` exists:

```text
Hello Jane!
```

When only this intro message exists, the UI shows an empty-state panel instead of rendering that message as a normal chat bubble.

### 7.2 File Upload

Enable it with:

```ts
features: { fileUpload: true }
```

Behavior:

- selected files are read as base64 data URLs
- images are previewed inline
- non-image files are shown as file cards
- `ui.fileUpload.maxSize` is interpreted in MB
- `ui.fileUpload.accept` is passed to the file input

### 7.3 Voice

Input mode:

- uses `SpeechRecognition` / `webkitSpeechRecognition`
- appends recognized text to the current input
- if unsupported, the mic button is not rendered

Output mode:

- uses `speechSynthesis`
- selects a voice using `voiceName`, then exact language, then language prefix
- clicking again while speaking stops playback

### 7.4 Quick Replies

Quick replies are rendered from message data like:

```json
[
  { "label": "Sales", "value": "sales" }
]
```

Click behavior:

1. sets the input value to the reply `value`
2. triggers send shortly after

### 7.5 Agent Mode

When the backend returns:

```json
{
  "type": "agent",
  "agent": {
    "name": "Sarah",
    "avatar": "https://example.com/avatar.png"
  }
}
```

the UI can show:

- agent avatar beside the message
- agent name above the message
- agent avatar/name in the header

### 7.6 Message Tools

Bot-side message tools appear when:

- the message is not from the user
- the message is not actively streaming
- `features.messageTools !== false`

Available UI actions:

- copy
- feedback up/down, if `onFeedback` is provided
- text-to-speech button, if `features.voice.output` is enabled

### 7.7 Unread Badge

Unread count increases when:

- chat is closed
- a new `bot` or `agent` message arrives
- the message is not the intro message

The count resets when the chat opens.

### 7.8 Rate Limiting

Client-side limits:

- max 10 messages per minute
- minimum 1 second between sends

When blocked, the widget adds a system message using `ui.texts.rateLimitError`.

---

## 8. Callbacks

Currently wired callbacks:

```ts
{
  onMessageSent?: (message: string) => void;
  onMessageReceived?: (response: unknown) => void;
  onChatOpened?: () => void;
  onChatClosed?: () => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
  onReconnecting?: (attempt: number) => void;
  onReconnected?: () => void;
  onUnreadCountChange?: (count: number) => void;
  onMessageCopy?: (messageId: string, text: string) => void;
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
  onChatClear?: () => void;
}
```

Example:

```ts
DerinChat.init({
  apiUrl: '/api/chat',
  onMessageSent: (message) => console.log('sent', message),
  onMessageReceived: (response) => console.log('received', response),
  onFeedback: (id, type) => {
    fetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({ id, type }),
    });
  }
});
```

---

## 9. Persistence

When `behavior.persistSession` is `true`, the widget uses `localStorage`.

Stored keys:

- `derin-chat-v1-messages`
- `derin-chat-v1-is-open`
- `derin-chat-v1-session-id`
- `derin-chat-v1-unread-count`

Named instances add `-<instanceId>`.

Examples:

- `derin-chat-v1-messages-support`
- `derin-chat-v1-unread-count-support`

Legacy default-instance keys are migrated automatically:

- `derin-chat-messages`
- `derin-chat-is-open`
- `derin-chat-session-id`
- `derin-chat-unread-count`

---

## 10. TypeScript Exports

```ts
import DerinChat, {
  type ChatConfig,
  type Message,
  type ApiResponse
} from 'derin-chat-ui';
```

Primary exported types:

- `ChatConfig`
- `Message`
- `ApiResponse`
- connection and message helper types re-exported from `src/types`

---

## 11. Keyboard Shortcuts

- `Escape`: closes the chat if open
- `Ctrl + K` / `Cmd + K`: toggles the widget
- `Enter`: sends the current message
- `Shift + Enter`: inserts a newline in the textarea

---

## 12. Implementation Notes

These are important current-code details that can save debugging time:

- `messageTools` is effectively on by default unless you set it to `false`.
- `sessionId` exists in storage helpers and request typings, but the current send flow does not actively attach a stored `sessionId` to outgoing requests.
- `actions` are parsed from backend responses, but there is no UI renderer for action buttons/links yet.
- `ui.logo` is supported in the header and is overridden by an active agent avatar when present.
- `ui.texts.mockModeInfo` exists in config defaults, but there is no dedicated mock-mode banner in the current UI.
- `onVoiceError` exists in the public type definition, but the current voice input path reports errors through the widget `onError` display path instead of firing `onVoiceError`.
- in `auto` mode, fallback to HTTP only happens after WebSocket reaches `failed` or `disconnected`; while reconnecting, sends may still queue through WebSocket.

---

*Verified against the repository source on March 23, 2026.*
