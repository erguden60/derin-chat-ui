# derin-chat-ui

Production-ready embeddable AI chat widget for websites and web apps. It ships as a framework-agnostic SDK with Shadow DOM style isolation, TypeScript declarations, HTTP/WebSocket support, SSE streaming, markdown rendering, quick replies, file attachments, voice controls, multi-instance mounting, and session persistence.

## Install

```bash
npm install derin-chat-ui
yarn add derin-chat-ui
pnpm add derin-chat-ui
```

Preact is bundled into the distributed SDK output. Consumer projects do not need to install `preact`, and the public TypeScript declarations do not require `preact` types.

No CSS import is required. Widget styles are injected into the widget Shadow DOM.

## Quick Start

### React / Next.js

```tsx
'use client';

import { useEffect } from 'react';
import DerinChat from 'derin-chat-ui';

export default function ChatWidget() {
  useEffect(() => {
    DerinChat.init({
      instanceId: 'support-widget',
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

    return () => DerinChat.destroy('support-widget');
  }, []);

  return null;
}
```

### Vue

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import DerinChat from 'derin-chat-ui';

onMounted(() => {
  DerinChat.init({
    instanceId: 'vue-support',
    apiUrl: 'https://api.example.com/chat',
    ui: { theme: 'auto' },
  });
});

onUnmounted(() => DerinChat.destroy('vue-support'));
</script>
```

### Angular

```ts
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import DerinChat from 'derin-chat-ui';

@Component({
  selector: 'app-derin-chat',
  standalone: true,
  template: '',
})
export class DerinChatWidgetComponent implements AfterViewInit, OnDestroy {
  private instanceId = 'angular-support';

  ngAfterViewInit() {
    DerinChat.init({
      instanceId: this.instanceId,
      apiUrl: 'https://api.example.com/chat',
      ui: { theme: 'auto' },
    });
  }

  ngOnDestroy() {
    DerinChat.destroy(this.instanceId);
  }
}
```

### Vanilla HTML

```html
<script src="https://unpkg.com/derin-chat-ui@1.0.13/dist/index.umd.js"></script>
<script>
  window.DerinChat.init({
    apiUrl: 'https://api.example.com/chat',
    ui: {
      theme: 'light',
      texts: { title: 'Support' },
    },
  });
</script>
```

## Backend Contract

By default, the widget sends an HTTP `POST` request to `apiUrl`.

```json
{
  "message": "Hello",
  "sessionId": "session-id",
  "user": {
    "id": "user-123",
    "name": "Jane"
  },
  "history": []
}
```

Streaming requests also include:

```json
{ "stream": true }
```

If a file is attached, the request includes:

```json
{
  "file": {
    "name": "document.pdf",
    "type": "application/pdf",
    "size": 102400,
    "data": "data:application/pdf;base64,..."
  }
}
```

The minimal response shape is:

```json
{ "reply": "Hello! How can I help?" }
```

Full response example:

```json
{
  "reply": "Choose an option:",
  "type": "bot",
  "quickReplies": [
    { "label": "Order status", "value": "order-status" },
    { "label": "Return policy", "value": "return-policy" }
  ],
  "actions": [
    { "text": "Open docs", "url": "https://example.com/docs" }
  ],
  "agent": {
    "name": "Support",
    "isOnline": true
  }
}
```

If your backend uses different field names, map them with `messageFormat`.

```ts
DerinChat.init({
  apiUrl: 'https://api.example.com/chat',
  messageFormat: {
    textField: 'answer',
    quickRepliesField: 'suggestions',
  },
});
```

## Configuration

```ts
DerinChat.init({
  instanceId: 'support',
  target: 'body',
  apiUrl: 'https://api.example.com/chat',
  apiKey: 'public-or-ephemeral-token',
  nonce: 'csp-nonce',

  ui: {
    theme: 'auto', // 'light' | 'dark' | 'auto'
    layout: 'normal', // 'normal' | 'compact' | 'full-screen'
    position: 'bottom-right', // 'bottom-right' | 'bottom-left'
    locale: 'en-US',
    zIndex: 99999,
    colors: {
      primary: '#2563eb',
      background: '#ffffff',
      botMessageBg: '#f8fafc',
      botMessageText: '#1f2937',
      userMessageBg: '#2563eb',
      userMessageText: '#ffffff',
      inputBg: '#f8fafc',
      inputText: '#111827',
    },
    texts: {
      title: 'Support',
      subtitle: 'Online',
      placeholder: 'Type your message...',
      edit: 'Edit',
      edited: 'edited',
    },
  },

  features: {
    quickReplies: true,
    markdown: true,
    timestamps: true,
    avatars: true,
    messageTools: true,
    voice: {
      input: false,
      output: false,
      language: 'en-US',
    },
  },

  behavior: {
    openOnLoad: false,
    closeOnOutsideClick: true,
    persistSession: true,
    persistSessionId: true,
    maxMessages: 100,
  },
});
```

Do not expose secret server-side keys in browser config. If `apiKey` is used, prefer public, scoped, or ephemeral tokens.

## Attachments

Use `attachments` for new integrations. The older `features.fileUpload` plus `ui.fileUpload` path is still supported for compatibility.

```ts
DerinChat.init({
  attachments: {
    enabled: true,
    maxSize: 10,
    types: [
      {
        id: 'image',
        label: 'Image',
        accept: 'image/*',
        kind: 'image',
        description: 'PNG, JPG, GIF',
      },
      {
        id: 'pdf',
        label: 'PDF',
        accept: '.pdf,application/pdf',
        kind: 'pdf',
        description: 'PDF documents',
      },
      {
        id: 'document',
        label: 'Document',
        accept: '.doc,.docx,.txt,.xls,.xlsx,.csv',
        kind: 'document',
        description: 'Docs, sheets, text',
      },
    ],
  },
});
```

Custom attachment UI hooks are also available:

```ts
DerinChat.init({
  attachments: {
    enabled: true,
    renderTrigger: ({ open }) => customTrigger,
    renderMenuItem: (type) => customMenuItem,
    renderPreview: (attachment, onRemove) => customPreview,
  },
});
```

## Connection Modes

### HTTP

```ts
DerinChat.init({
  apiUrl: 'https://api.example.com/chat',
});
```

### HTTP Streaming / SSE

```ts
DerinChat.init({
  apiUrl: 'https://api.example.com/chat',
  connection: { stream: true },
});
```

Supported streaming payloads:

```text
data: {"reply":"Hello"}
data: {"text":"Hello"}
data: {"choices":[{"delta":{"content":"Hello"}}]}
data: [DONE]
```

### WebSocket

```ts
DerinChat.init({
  connection: {
    mode: 'websocket',
    websocket: {
      url: 'wss://api.example.com/ws',
      reconnect: true,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
    },
  },
});
```

Outgoing WebSocket messages include the same session identity used by HTTP:

```json
{
  "type": "message",
  "data": {
    "text": "Hello",
    "sessionId": "session-id",
    "user": { "id": "user-123" },
    "timestamp": "2026-08-09T00:00:00.000Z"
  }
}
```

### Auto Fallback

```ts
DerinChat.init({
  apiUrl: 'https://api.example.com/chat',
  connection: {
    mode: 'auto',
    websocket: { url: 'wss://api.example.com/ws' },
  },
});
```

Auto mode uses WebSocket while available and falls back to HTTP when the WebSocket status becomes `failed` or `disconnected`.

### Mock

```ts
DerinChat.init({
  mock: true,
});
```

Custom mock handler:

```ts
DerinChat.init({
  mock: {
    handler: async (message, context) => ({
      reply: `Received: ${message}`,
      quickReplies: [{ label: 'Talk to support', value: 'support' }],
    }),
  },
});
```

## Public API

```ts
DerinChat.init(config)
DerinChat.destroy(instanceId?)
DerinChat.isActive(instanceId?)
DerinChat.clearHistory(instanceId?)
DerinChat.loadMessages(messages, instanceId?)
```

## TypeScript

```ts
import DerinChat, {
  type ChatConfig,
  type Message,
  type ApiResponse,
  type QuickReply,
  type AttachmentKind,
  type AttachmentTypeConfig,
  type FileAttachment,
  type ConnectionStatus,
  type ConnectionConfig,
  type UnreadBadgeConfig,
  type DerinChatRenderable,
} from 'derin-chat-ui';
```

## Session Persistence

When `behavior.persistSession` is `true`, message history, open state, and unread count are stored in `localStorage`.

When `behavior.persistSessionId` is `true`, a stable `sessionId` is stored and attached to HTTP, streaming, and WebSocket payloads. Set it to `false` for a fresh runtime session on each page load.

Named instances use instance-scoped storage keys, so multiple widgets can run on the same page without sharing history.

## Package Verification

The package is checked against a clean consumer install before release:

- local `.tgz` install into a fresh TypeScript project
- public type imports without installing Preact
- ESM import smoke test
- CJS require smoke test
- UMD browser smoke test
- `npm pack --dry-run` package contents check

## Bundle Size

Current v1.0.13 build:

| Format | File | Raw | Gzip |
|---|---|---:|---:|
| ESM | `dist/index.js` | 153.29 KB | 37.54 KB |
| CJS | `dist/index.cjs` | 121.09 KB | 33.23 KB |
| UMD | `dist/index.umd.js` | 121.26 KB | 33.30 KB |

## Local Development

```bash
npm install
npm run dev
npm run test
npm run build
```

`npm run dev` opens the local UI Lab, where the real package is mounted with `DerinChat.init()`.

## Documentation

- Full GitHub documentation: [`README.github.md`](./README.github.md)
- Developer docs: [`devdocs.md`](./devdocs.md)
- Changelog: [`CHANGELOG.md`](./CHANGELOG.md)

## License

MIT
