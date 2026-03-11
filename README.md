# Derin Chat UI - Complete Documentation Portal

Welcome to the definitive developer portal for **Derin Chat UI**. This documentation provides exhaustive detail on configurations, SDK hooks, theming, deployment modes, and custom data processing for the most demanding enterprise integrations.

---

## 🚀 Quick Start (Vanilla JS)

If you just need to drop the chat onto an existing HTML application:

```html
<!-- Include React/Preact (if not already bundled) -->
<script type="module">
  import { DerinChat } from 'https://unpkg.com/derin-chat-ui@latest/dist/index.js';

  DerinChat.init({
    apiUrl: 'https://api.yourbackend.com/v1/chat',
    ui: {
      theme: 'auto',
      colors: { primary: '#60A5FA' },
      texts: { title: 'Acme Support' }
    }
  });
</script>
```

---

## 💻 React / Next.js Integration

For React or Next.js projects, the widget mounts safely under `useEffect` preventing SSR hydration mismatches:

```tsx
'use client'; // Required for Next.js App Router
import { useEffect } from 'react';
import { DerinChat } from 'derin-chat-ui';
import 'derin-chat-ui/dist/index.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    DerinChat.init({
      apiUrl: '/api/chat',
      features: {
        voice: { input: true, output: true, language: 'en-US' },
        messageTools: true,
        fileUpload: true
      },
      ui: {
        theme: 'dark',
        position: 'bottom-right'
      }
    });

    return () => DerinChat.destroy(); // Optional cleanup
  }, []);

  return <html><body>{children}</body></html>;
}
```

---

## ⚙️ Configuration Object (Reference)

The `ChatConfig` powers every capability of `DerinChat.init()`. Here is an extensive breakdown:

### 1. Networking (`apiUrl`, `connection`, `mock`)

```typescript
{
  apiUrl: 'https://...', // Primary endpoint for HTTP/SSE
  apiKey: 'sk-...',      // Passed as Bearer Token implicitly
  
  // Connection Modes
  connection: {
    mode: 'auto',        // 'http' | 'websocket' | 'auto'. 'auto' tries WS, falls back to HTTP.
    stream: true,        // Enable Server-Sent Events (SSE) streaming
    config: {
      reconnectTime: 3000,
      maxAttempts: 5,
      pingInterval: 30000 
    }
  },

  // Mocking (Offline Dev Mode)
  mock: {
    handler: async (message, context) => {
      // Access history, user info, and attachments
      console.log(context.history);
      return `Mock Backend Received: ${message}`;
    }
  }
}
```

### 2. UI & Theming (`ui`)

The layout engine heavily utilizes CSS Variables under the hood, making specific theming effortless.

```typescript
{
  ui: {
    theme: 'auto', // 'light' | 'dark' | 'auto' (respects OS scheme)
    layout: 'normal', // 'normal' | 'compact' | 'full-screen'
    position: 'bottom-right', 
    zIndex: 99999,
    fontFamily: '"Geist", "Inter", sans-serif',
    logo: 'https://mycdn.com/logo.png',

    colors: {
      primary: '#4F46E5',         // Drives button colors and overall tint
      headerBg: '#1e1e24',        // Forced header background
      headerText: '#ffffff',      // Header text
      userMessageBg: '#4F46E5',   // User text bubble background
      userMessageText: '#ffffff', // User text color
      botMessageBg: '#f3f4f6',    // Bot bubble
      botMessageText: '#1f2937',  // Bot text
      background: '#ffffff',      // Entire chat window body
      inputBg: '#f9fafb',         // Text input bar
      inputText: '#111827'        // Text typing color
    },

    texts: {
      title: 'Customer Service',
      subtitle: 'We usually respond in 2m',
      placeholder: 'Type your message...',
      sendButton: 'Send',
      loading: 'Agent is typing...',
      errorMessage: 'Network error. Attempting reconnect...',
      openChat: 'Open Support',
      closeChat: 'Close'
    }
  }
}
```

### 3. Feature Flags (`features`)

Toggle specific UI logic and UX capabilities.

```typescript
{
  features: {
    images: true,        // Allow images from bot responses
    quickReplies: true,  // Allow structured quick reply buttons
    markdown: true,      // Turn bold, italic, code strings into DOM nodes
    fileUpload: true,    // Shows paperclip icon
    timestamps: true,    // Displays hours:minutes under bubbles
    avatars: true,       // Shows Bot avatar on the left margin
    messageTools: true,  // Advanced UI block for Copy/Regenerate/Feedback

    voice: {
      input: true,           // Microphone icon for dictation
      output: true,          // Speaker icon to read agent messages
      language: 'tr-TR',     // Locale dictation/voice target
      voiceName: 'Microsoft Tolga' // Forced OS Voice Engine if found
    }
  }
}
```

### 4. User Identity (`user`)

Pass critical identifiers to tie SDK sessions to your actual Auth accounts.

```typescript
{
  user: {
    id: 'usr_12345',
    name: 'John Doe',
    avatar: 'https://.../avatar.png',
    hash: '0xabc123...', // Use HMAC signing to securely authenticate in WS connections
    metadata: {
      plan: 'premium',
      deviceOS: 'iOS'
    }
  }
}
```

### 5. Event Callbacks (Hooks)

Tie the SDK's lifecycle events directly into your overarching metrics/analytics setup.

```typescript
{
  onChatOpened: () => console.log('Chat opened'),
  onChatClosed: () => console.log('Chat closed'),
  onMessageSent: (msg) => tracking.track('MESSAGE_SENT', { msg }),
  onMessageReceived: (apiObj) => tracking.track('MESSAGE_RECEIVED'),
  onMessageCopy: (id, text) => clipboardMetrics.record(id),
  onFeedback: (id, type) => backend.post('/feedback', { id, type }), // type: 'positive' | 'negative'
  onChatClear: () => console.log('User wiped their SDK history'),
  
  onConnectionChange: (status) => console.log(`WebSocket Status: ${status}`),
  onVoiceError: (err) => console.error(`Mic permission denied: ${err}`)
}
```

---

## 🌩️ Advanced Integration Concepts

### File Uploads & Interceptors
If `features.fileUpload` is enabled, any file chosen via the widget converts via `FileReader` into Base64 format. The SDK attaches this as:
```json
{
  "message": "Can you summarize this?",
  "file": {
    "name": "report.pdf",
    "type": "application/pdf",
    "size": 1024500,
    "data": "data:application/pdf;base64,...(blob)..."
  }
}
```
*Note: Depending on server ingress limits, chunking base64 over WS may be necessary if payload exceeds 1MB buffer.*

### Real-Time Telemetry (SSE/Streaming)
When `connection.stream: true`, the SDK immediately appends an empty bot bubble to the DOM. It issues an HTTP POST where `stream: true` is enforced in the payload. The widget opens a standard Fetch ReadableStream. It anticipates traditional Server Sent Event format:
```text
data: {"text": "I can"}
data: {"text": " help with"}
data: {"text": " that!"}
data: [DONE]
```
Text updates lazily flush to the preact hook system, skipping Markdown rerenders until typing pauses or parsing boundaries are resolved automatically.

---
*Created and Maintained strictly for developer references.*
