# 💬 Derin Chat UI

**Production-grade embeddable AI chat SDK.** Built for developers who need reliable, scalable, and highly customizable chat infrastructure with zero setup complexity.

[![npm version](https://img.shields.io/npm/v/derin-chat-ui.svg)](https://www.npmjs.com/package/derin-chat-ui)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/derin-chat-ui)](https://bundlephobia.com/package/derin-chat-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **📦 Current stable:** v1.0.8 | **🚀 Next milestone:** v1.1.0 - [see roadmap](#-developer-roadmap)

---

## ⚡ What Makes It Different?

Derin Chat revolves around delivering an **unopinionated developer experience**. It is not just a UI widget; it is a full-fledged chat engine designed to plug into any backend infrastructure natively.

- 🎯 **Framework-agnostic** - Native integration with HTML/JS, React, Vue, Next.js, or Svelte.
- 🔌 **Protocol flexible** - Ships with `HTTP REST`, `WebSocket` (with exponential backoff reconnects), or pure headless `Mock Handler` layers.
- 🌊 **AI Streaming (SSE)** - Real-time typewriter effect built straight into the core.
- 🎙️ **Voice Assistant (v1.0.8)** - Native Speech-to-Text and Text-to-Speech integration without external dependencies.
- 🎨 **Shadow DOM Isolated** - Zero CSS bleed. Your app styles won't break the widget, and the widget won't break your app.
- 📦 **Lightweight** - ~20KB gzipped including Preact engine.

---

## 🚀 Quick Start

### 1. Installation

Install via npm, yarn, or pnpm:

```bash
npm install derin-chat-ui
# or
yarn add derin-chat-ui
# or
pnpm add derin-chat-ui
```

### 2. Usage Examples

Derin Chat is designed to work everywhere. Pick your flavor:

#### Next.js / React
```tsx
'use client';

import { useEffect } from 'react';
import DerinChat from 'derin-chat-ui';

export default function ChatWidget() {
  useEffect(() => {
    DerinChat.init({
      apiUrl: 'https://api.example.com/chat',
      user: { id: 'user-123', name: 'John Doe' },
      features: {
        voice: { input: true, output: true, language: 'en-US' }
      }
    });

    return () => DerinChat.destroy();
  }, []);

  return null;
}
```

#### Vanilla JS / HTML (via CDN)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Chat Demo</title>
</head>
<body>
    <!-- Import the UMD build -->
    <script src="https://unpkg.com/derin-chat-ui/dist/index.umd.js"></script>
    <script>
      window.DerinChat.init({
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

#### Vue.js
```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'
import DerinChat from 'derin-chat-ui'

onMounted(() => {
  DerinChat.init({
    apiUrl: 'https://api.example.com/chat'
  })
})

onUnmounted(() => {
  DerinChat.destroy()
})
</script>

<template>
  <div>Your App Layout</div>
</template>
```

---

## 🛠 Complete Configuration API (Props)

The `DerinChat.init(config)` method accepts a highly customizable configuration object:

### `apiUrl` & `connection` (Networking)
Define how the chat talks to your backend.
```javascript
DerinChat.init({
  // Basic HTTP POST setup
  apiUrl: 'https://api.example.com/chat',
  
  // Or Advanced WebSocket / SSE definition
  connection: {
    mode: 'websocket', // 'http' | 'websocket' | 'auto'
    stream: true,      // Enable SSE character streaming
    websocket: {
      url: 'wss://api.example.com/ws',
      reconnect: true,
      headers: { Authorization: `Bearer ${token}` }
    }
  }
});
```

### `ui` (Theming & Texts)
Controls the look, feel, and i18n vocabulary.
```javascript
DerinChat.init({
  ui: {
    theme: 'auto', // 'light' | 'dark' | 'auto'
    position: 'bottom-right',
    layout: 'normal', // 'normal' | 'compact' | 'full-screen'
    colors: {
      primary: '#3B82F6',
      botMessageBg: '#E5E7EB',
      botMessageText: '#1F2937',
      // ...and many more
    },
    texts: {
      title: 'Support AI',
      subtitle: 'Typically replies in seconds',
      placeholder: 'Type your message...',
      // Override default English texts for full i18n support
    }
  }
});
```

### `features` (Capabilities)
Toggle features on or off. By default, everything is customizable.
```javascript
DerinChat.init({
  features: {
    images: true,          // Inline image rendering
    quickReplies: true,    // Guided predefined inputs
    agentMode: true,       // Human handoff indicators
    markdown: true,        // XSS-Safe markdown parsing
    fileUpload: true,      // File/Image upload support
    timestamps: true,      // Message timestamps
    avatars: true,         // Entity identifiers
    messageTools: true,    // Copy & Feedback buttons on messages
    voice: {               // Native voice assistant
      input: true,         
      output: true,        
      language: 'en-US'   
    }
  }
});
```

### `user` (Identity & Auth)
Pass identity data to your backend safely.
```javascript
DerinChat.init({
  user: {
    id: 'user_98765',
    name: 'Alice Smith',
    avatar: 'https://example.com/avatar.png',
    hash: 'hmac_sha256_hash_here', // Use for secure identity verification
    metadata: { tier: 'pro', source: 'landing_page' }
  }
});
```

### `Event Hooks` (Callbacks)
Hook into the conversation lifecycle to trigger analytics, tracking, or side-effects.
```javascript
DerinChat.init({
  onMessageSent: (message) => console.log('User said:', message),
  onMessageReceived: (res) => console.log('Bot replied:', res),
  onChatOpened: () => console.log('Widget opened'),
  onFeedback: (messageId, type) => sendToAnalytics(messageId, type), // type: 'positive' | 'negative'
  onMessageCopy: (messageId, text) => console.log('Copied:', text),
  onError: (err) => console.error('Chat error:', err)
});
```

---

## 💻 Headless Mode (Mock/Testing)

Building a UI but backend isn't ready? Intercept all network traffic locally. This bypasses the API completely:

```javascript
DerinChat.init({
  mock: {
    handler: async (message, context) => {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 1000));
      
      // Return mocked response
      return {
        reply: `You said: ${message}`,
        quickReplies: [{ title: 'Tell me more', payload: 'more' }]
      };
    }
  }
});
```

---

## 🛠 Local Development (Contributing)

Want to contribute or build your own flavor? 

1. **Clone & Install**
   ```bash
   git clone https://github.com/erguden60/derin-chat-ui.git
   cd derin-chat-ui
   npm install
   ```

2. **Start Dev Server**
   ```bash
   npm run dev
   ```
   This spins up the Vite development server with the playground app (`src/demo`).

3. **Build the Package**
   ```bash
   npm run build
   ```

---

## 🗺 Developer Roadmap

We are constantly aiming to evolve Derin Chat into the de-facto open-source chatbot SDK. Here is where the project is heading:

### ✅ **Phase 1: Foundation (v1.0.0 - v1.0.7)**
- Baseline UI widget, Shadow DOM isolation.
- HTTP & WebSocket connectivity mechanisms.
- Essential message tooling: Attachments, Quick Replies, Unread Badges.

### 🎙️ **Phase 2: Experience Augmentation (v1.0.8 - Present)**
- **Voice Capabilities:** Native Speech-to-Text inference and Text-to-Speech readouts.
- **Message Action Layers:** Feedback (Up/Down vote), Copy handling, Clear Context history capabilities.
- **AI Streaming Layer:** Chunked response handling (SSE). 

### 🏗 **Phase 3: The "Enterprise" Update (Upcoming - v1.1.0 / v2.0.0)**
- **Context Viz Engine:** Multi-turn session visualization tools for AI context tracing.
- **Custom Render Hooks:** Ability to pass custom JSX/HTML render functions for deeply custom message bubbles (e.g. rendering interactive charts).
- **Multi-Instance Support:** Render multiple isolated widgets on the same domain effortlessly.
- **Analytics Bridges:** Out-of-the-box hooks for tracking token burn, user drop-offs, and interaction depths.

---

## 👨‍💻 Community & Contributions

Derin Chat thrives on developer feedback. Have a feature request, want to add a new theme, or found a core issue?

- [Drop an Issue](https://github.com/erguden60/derin-chat-ui/issues)
- [Start a Discussion](https://github.com/erguden60/derin-chat-ui/discussions)

**Built for builders.** 
> MIT License © 2026 Emirhan Ergüden
