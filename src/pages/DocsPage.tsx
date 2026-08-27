import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';

type DocSection =
  | 'install'
  | 'quickstart'
  | 'nextjs'
  | 'react'
  | 'vue'
  | 'angular'
  | 'vanilla'
  | 'config'
  | 'mounting'
  | 'network'
  | 'features'
  | 'attachments'
  | 'ui'
  | 'unread'
  | 'behavior'
  | 'user'
  | 'connection'
  | 'backend'
  | 'mock'
  | 'callbacks'
  | 'custom'
  | 'persistence'
  | 'api'
  | 'types'
  | 'security'
  | 'troubleshooting'
  | 'shortcuts';

const sections: { group: string; items: { id: DocSection; label: string }[] }[] = [
  {
    group: 'Getting Started',
    items: [
      { id: 'install', label: 'Installation' },
      { id: 'quickstart', label: 'Quick Start' },
    ],
  },
  {
    group: 'Frameworks',
    items: [
      { id: 'nextjs', label: 'Next.js' },
      { id: 'react', label: 'React / Vite' },
      { id: 'vue', label: 'Vue' },
      { id: 'angular', label: 'Angular' },
      { id: 'vanilla', label: 'Vanilla HTML' },
    ],
  },
  {
    group: 'Configuration',
    items: [
      { id: 'config', label: 'Overview' },
      { id: 'mounting', label: 'Mounting' },
      { id: 'network', label: 'Network' },
      { id: 'features', label: 'Features' },
      { id: 'attachments', label: 'Attachments' },
      { id: 'ui', label: 'UI & Theming' },
      { id: 'unread', label: 'Unread Badge' },
      { id: 'behavior', label: 'Behavior' },
      { id: 'user', label: 'User Identity' },
    ],
  },
  {
    group: 'Connection',
    items: [
      { id: 'connection', label: 'Connection Modes' },
      { id: 'mock', label: 'Mock / Headless' },
      { id: 'backend', label: 'Backend Contracts' },
    ],
  },
  {
    group: 'Advanced',
    items: [
      { id: 'callbacks', label: 'Event Hooks' },
      { id: 'custom', label: 'Custom Rendering' },
      { id: 'persistence', label: 'Session Persistence' },
      { id: 'api', label: 'Public API' },
      { id: 'types', label: 'TypeScript Types' },
      { id: 'security', label: 'Security' },
      { id: 'troubleshooting', label: 'Troubleshooting' },
      { id: 'shortcuts', label: 'Keyboard Shortcuts' },
    ],
  },
];

const tocItems: { id: DocSection; label: string }[] = sections.flatMap((group) => group.items);

const packageCommands = [
  { manager: 'npm', command: 'npm install derin-chat-ui' },
  { manager: 'yarn', command: 'yarn add derin-chat-ui' },
  { manager: 'pnpm', command: 'pnpm add derin-chat-ui' },
];

function CodeBlock({ lang, title, children }: { lang: string; title?: string; children: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    const write = navigator.clipboard?.writeText(children);
    write?.then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div class="docs-code-block">
      <div class="docs-code-header">
        <div class="docs-code-title">
          {title && <span class="docs-code-lang">{title}</span>}
          {!title && <span class="docs-code-lang">{lang}</span>}
        </div>
        <button type="button" class="docs-code-copy" onClick={copyCode}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre><code>{children}</code></pre>
    </div>
  );
}

function PackageInstallBlock() {
  const [copiedCommand, setCopiedCommand] = useState('');

  const copyCommand = (command: string) => {
    const write = navigator.clipboard?.writeText(command);
    write?.then(() => {
      setCopiedCommand(command);
      window.setTimeout(() => setCopiedCommand(''), 1600);
    });
  };

  return (
    <div class="docs-code-block docs-install-block">
      <div class="docs-code-header">
        <div class="docs-code-title">
          <span class="docs-code-lang">Terminal</span>
        </div>
      </div>
      <div class="docs-install-list">
        {packageCommands.map(({ manager, command }) => (
          <div class="docs-install-row" key={manager}>
            <span class="docs-install-manager">{manager}</span>
            <code>{command}</code>
            <button type="button" class="docs-code-copy" onClick={() => copyCommand(command)}>
              {copiedCommand === command ? 'Copied' : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocSection({ id, children }: { id: string; children: ComponentChildren }) {
  return <section id={`doc-${id}`}>{children}</section>;
}

export function DocsPage() {
  const [active, setActive] = useState<DocSection>('install');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const scrollTo = (id: DocSection) => {
    setActive(id);
    const el = document.getElementById(`doc-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div class={`docs-layout ${sidebarOpen ? '' : 'is-sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside class="docs-sidebar">
        <button
          type="button"
          class="docs-sidebar-toggle"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <span class="docs-sidebar-toggle-lines" aria-hidden="true" />
          <span class="docs-sidebar-toggle-text">{sidebarOpen ? 'Collapse' : 'Menu'}</span>
        </button>

        <div class="docs-sidebar-content">
          {sections.map(group => (
            <div class="docs-nav-group" key={group.group}>
              <div class="docs-nav-label">{group.group}</div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  class={`docs-nav-item ${active === item.id ? 'active' : ''}`}
                  onClick={() => scrollTo(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Content */}
      <div class="docs-content">

        {/* Install */}
        <DocSection id="install">
          <h2>Installation</h2>
          <p>Install via your preferred package manager. Preact is bundled into the SDK output, so consumers do not need to install it separately.</p>
          <PackageInstallBlock />

          <p><strong>CDN (no bundler):</strong></p>
          <CodeBlock lang="html" title="HTML">{`<script src="https://unpkg.com/derin-chat-ui@1.0.13/dist/index.umd.js"></script>`}</CodeBlock>

          <div class="docs-alert info">
            The SDK uses Shadow DOM style isolation. You do <strong>not</strong> need to import any CSS file.
          </div>

          <h3>Bundle Sizes</h3>
          <table class="docs-table">
            <thead>
              <tr><th>Format</th><th>File</th><th>Raw</th><th>Gzip</th></tr>
            </thead>
            <tbody>
              <tr><td>ESM</td><td><code>dist/index.js</code></td><td>153.29 KB</td><td>37.54 KB</td></tr>
              <tr><td>CJS</td><td><code>dist/index.cjs</code></td><td>121.09 KB</td><td>33.23 KB</td></tr>
              <tr><td>UMD</td><td><code>dist/index.umd.js</code></td><td>121.26 KB</td><td>33.30 KB</td></tr>
            </tbody>
          </table>
        </DocSection>

        {/* Quick Start */}
        <DocSection id="quickstart">
          <h2>Quick Start</h2>
          <p>
            Install the package, then choose your framework from the sidebar. Every integration
            mounts the same embeddable SDK through <code>DerinChat.init()</code> and cleans up with
            <code>DerinChat.destroy()</code>.
          </p>
          <div class="docs-alert info">
            For local UI testing, use <code>npm run dev</code> and open the UI Lab.
          </div>
        </DocSection>

        <DocSection id="nextjs">
          <h2>Next.js App Router</h2>
          <p>Use a client component. This keeps the widget out of server rendering and gives it access to the browser DOM.</p>
          <CodeBlock lang="tsx" title="app/components/DerinChatWidget.tsx">{`'use client';

import { useEffect } from 'react';
import DerinChat from 'derin-chat-ui';

export default function DerinChatWidget() {
  useEffect(() => {
    DerinChat.init({
      instanceId: 'support-widget',
      apiUrl: '/api/chat',
      connection: { stream: true },
      ui: {
        theme: 'auto',
        colors: { primary: '#2563eb' },
        texts: {
          title: 'Derin Support',
          subtitle: 'Online'
        }
      }
    });

    return () => DerinChat.destroy('support-widget');
  }, []);

  return null;
}`}</CodeBlock>
          <CodeBlock lang="tsx" title="app/layout.tsx">{`import DerinChatWidget from './components/DerinChatWidget';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <DerinChatWidget />
      </body>
    </html>
  );
}`}</CodeBlock>
        </DocSection>

        <DocSection id="react">
          <h2>React / Vite</h2>
          <p>Mount once inside your app shell or root component.</p>
          <CodeBlock lang="tsx" title="src/App.tsx">{`import { useEffect } from 'react';
import DerinChat from 'derin-chat-ui';

export default function App() {
  useEffect(() => {
    DerinChat.init({
      instanceId: 'app-support',
      apiUrl: 'https://api.example.com/chat',
      ui: {
        theme: 'light',
        texts: { title: 'Support', subtitle: 'Typically replies fast' }
      }
    });

    return () => DerinChat.destroy('app-support');
  }, []);

  return <main>Your application</main>;
}`}</CodeBlock>
        </DocSection>

        <DocSection id="vue">
          <h2>Vue 3</h2>
          <p>Initialize in <code>onMounted</code> and destroy in <code>onUnmounted</code>.</p>
          <CodeBlock lang="vue" title="src/components/DerinChatWidget.vue">{`<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import DerinChat from 'derin-chat-ui';

onMounted(() => {
  DerinChat.init({
    instanceId: 'vue-support',
    apiUrl: 'https://api.example.com/chat',
    ui: {
      theme: 'auto',
      texts: { title: 'Vue Support' }
    }
  });
});

onUnmounted(() => {
  DerinChat.destroy('vue-support');
});
</script>

<template>
  <slot />
</template>`}</CodeBlock>
        </DocSection>

        <DocSection id="angular">
          <h2>Angular</h2>
          <p>Use Angular lifecycle hooks so the widget mounts after the browser view is ready.</p>
          <CodeBlock lang="typescript" title="src/app/derin-chat-widget.component.ts">{`import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import DerinChat from 'derin-chat-ui';

@Component({
  selector: 'app-derin-chat-widget',
  standalone: true,
  template: '',
})
export class DerinChatWidgetComponent implements AfterViewInit, OnDestroy {
  private readonly instanceId = 'angular-support';

  ngAfterViewInit() {
    DerinChat.init({
      instanceId: this.instanceId,
      apiUrl: 'https://api.example.com/chat',
      ui: {
        theme: 'auto',
        texts: { title: 'Angular Support' }
      }
    });
  }

  ngOnDestroy() {
    DerinChat.destroy(this.instanceId);
  }
}`}</CodeBlock>
          <CodeBlock lang="typescript" title="src/app/app.component.ts">{`import { Component } from '@angular/core';
import { DerinChatWidgetComponent } from './derin-chat-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DerinChatWidgetComponent],
  template: \`
    <main>Your Angular app</main>
    <app-derin-chat-widget />
  \`,
})
export class AppComponent {}`}</CodeBlock>
        </DocSection>

        <DocSection id="vanilla">
          <h2>Vanilla HTML (CDN)</h2>
          <p>Use the UMD bundle when you do not have a bundler.</p>
          <CodeBlock lang="html" title="index.html">{`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Derin Chat UI</title>
  </head>
  <body>
    <main>Your website</main>

    <script src="https://unpkg.com/derin-chat-ui@1.0.13/dist/index.umd.js"></script>
    <script>
      window.DerinChat.init({
        instanceId: 'html-support',
        apiUrl: 'https://api.example.com/chat',
        ui: {
          theme: 'light',
          texts: { title: 'AI Support', subtitle: 'Online' }
        }
      });
    </script>
  </body>
</html>`}</CodeBlock>
        </DocSection>

        {/* Config Overview */}
        <DocSection id="config">
          <h2>Configuration Overview</h2>
          <p>
            <code>DerinChat.init(config)</code> accepts a <code>ChatConfig</code> object. All fields are optional unless stated otherwise.
          </p>
          <p>The configuration is organized into these sections:</p>
          <ul>
            <li><strong>Network</strong> — <code>apiUrl</code>, <code>apiKey</code>, <code>mock</code>, <code>connection</code>, <code>messageFormat</code></li>
            <li><strong>Mounting</strong> — <code>instanceId</code>, <code>target</code>, <code>nonce</code></li>
            <li><strong>Features</strong> — <code>images</code>, <code>quickReplies</code>, <code>voice</code>, <code>fileUpload</code>, etc.</li>
            <li><strong>Attachments</strong> — custom upload types, trigger/menu renderers, preview renderer</li>
            <li><strong>UI</strong> — <code>theme</code>, <code>colors</code>, <code>texts</code>, <code>position</code>, <code>layout</code></li>
            <li><strong>Behavior</strong> — <code>openOnLoad</code>, <code>persistSession</code>, <code>maxMessages</code></li>
            <li><strong>User</strong> — <code>id</code>, <code>name</code>, <code>avatar</code>, <code>hash</code>, <code>metadata</code></li>
          </ul>
        </DocSection>

        <DocSection id="mounting">
          <h2>Mounting & Multi-instance</h2>
          <p>
            By default the widget mounts into <code>document.body</code> as the <code>default</code> instance.
            Use <code>instanceId</code> and <code>target</code> when a page needs multiple isolated widgets or a custom mount node.
          </p>
          <CodeBlock lang="typescript" title="Mounting config">{`DerinChat.init({
  instanceId: 'support',
  target: '#support-chat-root',
  apiUrl: 'https://api.example.com/support',
});

DerinChat.init({
  instanceId: 'sales',
  target: document.querySelector('#sales-chat-root')!,
  apiUrl: 'https://api.example.com/sales',
});

DerinChat.isActive('support'); // boolean
DerinChat.destroy('support');`}</CodeBlock>
          <table class="docs-table">
            <thead><tr><th>Field</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><code>instanceId</code></td><td><code>default</code></td><td>Scopes DOM host, localStorage keys, and public API operations.</td></tr>
              <tr><td><code>target</code></td><td><code>body</code></td><td>CSS selector, HTMLElement, or body mount target.</td></tr>
              <tr><td><code>nonce</code></td><td>-</td><td>CSP nonce for fallback style tag injection. Constructable stylesheet mode does not need it.</td></tr>
            </tbody>
          </table>
        </DocSection>

        {/* Network */}
        <DocSection id="network">
          <h2>Network Configuration</h2>
          <CodeBlock lang="typescript" title="ChatConfig">{`{
  apiUrl?: string;           // HTTP endpoint URL
  apiKey?: string;           // Sent as: Authorization: Bearer <apiKey>
  mock?: boolean | {
    handler?: (
      message: string,
      context: MockHandlerContext
    ) => MockHandlerResult | Promise<MockHandlerResult>;
  };
  connection?: {
    mode?: 'http' | 'websocket' | 'auto';  // default: 'http'
    stream?: boolean;                       // default: false
    websocket?: {
      url: string;
      protocols?: string | string[];
      reconnect?: boolean;                  // default: true
      reconnectInterval?: number;           // default: 3000
      maxReconnectAttempts?: number;        // default: 5, 0 = infinite
      heartbeatInterval?: number;           // default: 30000
      headers?: Record<string, string>;       // Ignored by browser WebSocket APIs
    };
  };
  messageFormat?: {
    textField?: string;           // default: 'reply'
    imageField?: string;          // default: 'image'
    quickRepliesField?: string;   // default: 'quickReplies'
    actionsField?: string;        // default: 'actions'
    agentField?: string;          // default: 'agent'
    typeField?: string;           // default: 'type'
  };
}`}</CodeBlock>
          <div class="docs-alert info">
            If neither <code>apiUrl</code> nor <code>mock</code> is set, the widget renders in UI-only mode.
          </div>
        </DocSection>

        {/* Features */}
        <DocSection id="features">
          <h2>Features</h2>
          <CodeBlock lang="typescript" title="Features config">{`{
  features?: {
    images?: boolean;          // default: true
    quickReplies?: boolean;    // default: true
    agentMode?: boolean;       // default: true
    markdown?: boolean;        // default: true
    fileUpload?: boolean;      // default: false
    timestamps?: boolean;      // default: true
    avatars?: boolean;         // default: true
    messageTools?: boolean;    // default: true
    voice?: {
      input?: boolean;         // Speech-to-Text
      output?: boolean;        // Text-to-Speech
      language?: string;       // BCP 47 tag, default: 'en-US'
      voiceName?: string;      // Specific voice name
    };
  };
}`}</CodeBlock>
          <table class="docs-table">
            <thead><tr><th>Feature</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><code>images</code></td><td><code>true</code></td><td>Render inline images from bot responses</td></tr>
              <tr><td><code>quickReplies</code></td><td><code>true</code></td><td>Guided predefined reply buttons</td></tr>
              <tr><td><code>markdown</code></td><td><code>true</code></td><td>XSS-safe markdown rendering</td></tr>
              <tr><td><code>fileUpload</code></td><td><code>false</code></td><td>File & image upload support</td></tr>
              <tr><td><code>voice.input</code></td><td><code>false</code></td><td>Speech-to-Text microphone</td></tr>
              <tr><td><code>voice.output</code></td><td><code>false</code></td><td>Text-to-Speech playback</td></tr>
            </tbody>
          </table>
        </DocSection>

        <DocSection id="attachments">
          <h2>Attachments</h2>
          <p>
            Use <code>attachments</code> for new integrations. It owns the configurable upload menu,
            attachment type list, max size, and custom renderers. The older <code>features.fileUpload</code>
            and <code>ui.fileUpload</code> path remains supported only for backward compatibility.
          </p>
          <CodeBlock lang="typescript" title="Attachments config">{`DerinChat.init({
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
    renderTrigger: ({ open, disabled }) => customTrigger,
    renderMenuItem: (type) => customMenuItem,
    renderPreview: (attachment, onRemove) => customPreview,
  },
});`}</CodeBlock>
          <CodeBlock lang="typescript" title="Attachment types">{`type AttachmentKind = 'image' | 'pdf' | 'document' | 'audio' | 'video' | 'other';

interface AttachmentTypeConfig {
  id: string;
  label: string;
  accept: string;
  kind?: AttachmentKind;
  description?: string;
}

interface FileAttachment {
  file: File;
  preview?: string;
  type: string;
  kind: AttachmentKind;
  label?: string;
  metadata?: Record<string, unknown>;
}`}</CodeBlock>
        </DocSection>

        {/* UI */}
        <DocSection id="ui">
          <h2>UI & Theming</h2>
          <CodeBlock lang="typescript" title="UI config">{`{
  ui?: {
    position?: 'bottom-right' | 'bottom-left';  // default: 'bottom-right'
    zIndex?: number;                             // default: 99999
    fontFamily?: string;
    logo?: string;                               // Custom header logo URL
    theme?: 'light' | 'dark' | 'auto';           // default: 'light'
    layout?: 'normal' | 'compact' | 'full-screen';
    showWelcomeScreen?: boolean;                 // default: true
    locale?: string;                             // default: 'en-US'
    colors?: {
      primary?: string;        // Accent color
      headerBg?: string;       // Header background
      headerText?: string;
      userMessageBg?: string;
      userMessageText?: string;
      botMessageBg?: string;
      botMessageText?: string;
      background?: string;     // Chat window background
      inputBg?: string;
      inputText?: string;
    };
    texts?: {
      title?: string;          // default: 'Support'
      subtitle?: string;       // default: 'Online'
      placeholder?: string;    // default: 'Type your message...'
      loading?: string;        // default: 'Typing...'
      errorMessage?: string;
      rateLimitError?: string;
      openChat?: string;
      closeChat?: string;
      welcomeBadge?: string;
      welcomeMessage?: string;
      welcomeHints?: string[];
      cancel?: string;
      save?: string;
      dropFile?: string;
      fileSizeError?: string;
      imageLoadError?: string;
      copy?: string;
      copied?: string;
      regenerate?: string;
      readAloud?: string;
      stopSpeaking?: string;
      helpful?: string;
      notHelpful?: string;
      edit?: string;
      edited?: string;
      voiceInput?: string;
      startVoiceInput?: string;
      stopVoiceInput?: string;
      addFile?: string;
      selectFile?: string;
      attachmentType?: string;
      chatWidget?: string;
    };
  };
}`}</CodeBlock>
        </DocSection>

        <DocSection id="unread">
          <h2>Unread Badge</h2>
          <p>
            The launcher can show unread bot or agent messages while the chat window is closed.
            The count is persisted when session persistence is enabled.
          </p>
          <CodeBlock lang="typescript" title="Unread badge config">{`DerinChat.init({
  unreadBadge: {
    enabled: true,
    maxCount: 99,
    backgroundColor: '#ef4444',
    textColor: '#ffffff',
    position: 'top-right',
    animate: true,
  },
  onUnreadCountChange: (count) => {
    console.log('Unread messages:', count);
  },
});`}</CodeBlock>
        </DocSection>

        {/* Behavior */}
        <DocSection id="behavior">
          <h2>Behavior</h2>
          <CodeBlock lang="typescript" title="Behavior config">{`{
  behavior?: {
    openOnLoad?: boolean;           // default: false
    closeOnOutsideClick?: boolean;  // default: true
    persistSession?: boolean;       // default: true
    persistSessionId?: boolean;     // default: true
    maxMessages?: number;           // default: 100
  };
}`}</CodeBlock>
        </DocSection>

        {/* User */}
        <DocSection id="user">
          <h2>User Identity</h2>
          <p>Pass identity data to your backend. Use <code>hash</code> to forward a server-generated HMAC signature for backend verification.</p>
          <CodeBlock lang="typescript" title="User config">{`{
  user?: {
    id?: string;
    name?: string;
    avatar?: string;
    hash?: string;                           // Server-generated HMAC SHA-256
    metadata?: Record<string, unknown>;
  };
}`}</CodeBlock>
        </DocSection>

        {/* Connection Modes */}
        <DocSection id="connection">
          <h2>Connection Modes</h2>

          <h3>1. HTTP (Default)</h3>
          <p>Simple request-response over POST. 30s timeout, auto-retries with exponential backoff.</p>
          <CodeBlock lang="typescript">{`DerinChat.init({ apiUrl: 'https://api.example.com/chat' });`}</CodeBlock>

          <h3>2. HTTP + Streaming (SSE)</h3>
          <p>Real-time typewriter streaming. Supports <code>data: {`{"reply":"..."}`}</code>, <code>data: {`{"choices":[{"delta":{"content":"..."}}]}`}</code>, and <code>data: [DONE]</code>.</p>
          <CodeBlock lang="typescript">{`DerinChat.init({
  apiUrl: 'https://api.example.com/chat',
  connection: { stream: true }
});`}</CodeBlock>

          <h3>3. WebSocket</h3>
          <p>Full-duplex real-time communication with auto-reconnect, heartbeat, and message queuing.</p>
          <CodeBlock lang="typescript">{`DerinChat.init({
  connection: {
    mode: 'websocket',
    websocket: {
      url: 'wss://api.example.com/ws',
      reconnect: true,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
    }
  }
});`}</CodeBlock>

          <h3>4. Auto Fallback</h3>
          <p>Uses WebSocket while available, falls back to HTTP automatically.</p>
          <CodeBlock lang="typescript">{`DerinChat.init({
  apiUrl: 'https://api.example.com/chat',
  connection: {
    mode: 'auto',
    websocket: { url: 'wss://api.example.com/ws' }
  }
});`}</CodeBlock>
          <div class="docs-alert warn">
            Fallback to HTTP only occurs after WebSocket reaches <code>failed</code> or <code>disconnected</code> status.
          </div>
        </DocSection>

        {/* Mock */}
        <DocSection id="mock">
          <h2>Mock / Headless Mode</h2>
          <p>Build your UI without a live backend. Perfect for prototyping.</p>
          <CodeBlock lang="typescript" title="Simple mock">{`DerinChat.init({ mock: true });`}</CodeBlock>
          <CodeBlock lang="typescript" title="Custom handler">{`DerinChat.init({
  mock: {
    handler: async (message, context) => {
      await new Promise(r => setTimeout(r, 800));

      if (message.toLowerCase().includes('hello')) {
        return 'Hi there! How can I help?';
      }

      return {
        reply: 'Choose an option:',
        quickReplies: [
          { label: 'Sales', value: 'sales' },
          { label: 'Support', value: 'support' }
        ]
      };
    }
  }
});`}</CodeBlock>
          <h3>Mock Handler Context</h3>
          <CodeBlock lang="typescript">{`interface MockHandlerContext {
  user?: ChatConfig['user'];
  history: Message[];
  file?: {
    name: string;
    type: string;
    size: number;
    data?: string;   // Base64
  };
}`}</CodeBlock>
        </DocSection>

        {/* Backend */}
        <DocSection id="backend">
          <h2>Backend Contracts</h2>
          <h3>HTTP Request Body</h3>
          <CodeBlock lang="typescript">{`{
  message: string;
  sessionId?: string;
  stream?: true;
  user?: { id, name, avatar, hash, metadata };
  history?: Array<{ text, sender, timestamp }>;
  file?: { name, type, size, data };
}`}</CodeBlock>
          <h3>Minimal Response</h3>
          <CodeBlock lang="json">{`{ "reply": "Hello!" }`}</CodeBlock>
          <h3>Full Response</h3>
          <CodeBlock lang="json">{`{
  "reply": "Hello! Here's what I found:",
  "type": "bot",
  "image": { "url": "https://example.com/chart.png", "alt": "Chart" },
  "quickReplies": [
    { "label": "Learn More", "value": "more" }
  ],
  "actions": [
    { "text": "Open Docs", "url": "https://docs.example.com" }
  ],
  "agent": {
    "name": "Sarah",
    "avatar": "https://example.com/sarah.png",
    "isOnline": true
  }
}`}</CodeBlock>
          <div class="docs-alert warn">
            <code>actions</code> payloads are parsed and stored on messages, but the current default UI does not render action buttons yet. Use <code>renderCustomMessage</code> if you need custom action UI today.
          </div>
          <h3>Next.js Route Handler</h3>
          <CodeBlock lang="typescript" title="app/api/chat/route.ts">{`import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  return Response.json({
    reply: \`You said: \${body.message}\`,
    quickReplies: [
      { label: 'Pricing', value: 'pricing' },
      { label: 'Talk to sales', value: 'sales' },
    ],
  });
}`}</CodeBlock>
          <h3>Express Endpoint</h3>
          <CodeBlock lang="typescript" title="server.ts">{`import express from 'express';

const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/chat', async (req, res) => {
  const { message, user, sessionId } = req.body;

  res.json({
    reply: \`Received "\${message}" for session \${sessionId ?? 'new'}.\`,
    type: 'bot',
  });
});

app.listen(3001);`}</CodeBlock>
          <h3>SSE Streaming Response</h3>
          <CodeBlock lang="typescript" title="Streaming shape">{`// Response headers
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

// Supported payloads
data: {"reply":"Hello"}
data: {"text":" world"}
data: {"choices":[{"delta":{"content":"!"}}]}
data: [DONE]`}</CodeBlock>
        </DocSection>

        {/* Callbacks */}
        <DocSection id="callbacks">
          <h2>Event Hooks</h2>
          <CodeBlock lang="typescript">{`DerinChat.init({
  onBeforeMessageSend: async (message) => message.trim(),
  onMessageSent:      (message) => {},
  onMessageReceived:  (response) => {},
  onChatOpened:       () => {},
  onChatClosed:       () => {},
  onChatClear:        () => {},
  onError:            (error) => {},
  onUserTyping:       () => {},
  onVisibilityChange: (isHidden) => {},
  onVoiceStart:       () => {},
  onVoiceEnd:         () => {},
  onConnectionChange: (status) => {},
  onReconnecting:     (attempt) => {},
  onReconnected:      () => {},
  onUnreadCountChange:(count) => {},
  onMessageCopy:      (messageId, text) => {},
  onMessageEdit:      (messageId, newContent) => {},
  onRegenerate:       (messageId) => {},
  onFeedback:         (messageId, type) => {},
});`}</CodeBlock>
          <div class="docs-alert warn">
            <code>onVoiceError</code> fires for voice input errors. When the widget can show an error toast, the same message is also routed there.
          </div>
        </DocSection>

        <DocSection id="custom">
          <h2>Custom Rendering</h2>
          <p>
            Use <code>renderCustomMessage</code> when backend payloads need richer UI than the default text bubble.
            The renderer can return a Preact/React-compatible node or <code>{`{ html: string }`}</code> for vanilla use cases.
          </p>
          <CodeBlock lang="typescript" title="Custom message renderer">{`DerinChat.init({
  apiUrl: '/api/chat',
  renderCustomMessage: (message) => {
    if (message.text.includes('[PAYMENT_LINK]')) {
      return {
        html: \`
          <div class="payment-card">
            <strong>Payment request</strong>
            <a href="/checkout">Pay now</a>
          </div>
        \`,
      };
    }

    return null;
  },
});`}</CodeBlock>
          <p>
            Message tools can also be wired into your analytics using <code>onMessageCopy</code>,
            <code>onFeedback</code>, <code>onMessageEdit</code>, and <code>onRegenerate</code>.
          </p>
        </DocSection>

        {/* Persistence */}
        <DocSection id="persistence">
          <h2>Session Persistence</h2>
          <p>
            When <code>behavior.persistSession</code> is <code>true</code> (default), the widget uses <code>localStorage</code> to persist session data.
          </p>
          <table class="docs-table">
            <thead><tr><th>Key</th><th>Content</th></tr></thead>
            <tbody>
              <tr><td><code>derin-chat-v1-messages</code></td><td>Chat message history</td></tr>
              <tr><td><code>derin-chat-v1-is-open</code></td><td>Widget open/closed state</td></tr>
              <tr><td><code>derin-chat-v1-session-id</code></td><td>Backend session ID</td></tr>
              <tr><td><code>derin-chat-v1-unread-count</code></td><td>Unread badge count</td></tr>
            </tbody>
          </table>
          <p>Named instances append <code>-{'<instanceId>'}</code> to each key.</p>
          <CodeBlock lang="typescript" title="Programmatic history control">{`DerinChat.clearHistory('support');

DerinChat.loadMessages([
  {
    id: 'm1',
    sender: 'bot',
    text: 'Welcome back.',
    timestamp: new Date().toISOString(),
  },
], 'support');`}</CodeBlock>
        </DocSection>

        {/* Public API */}
        <DocSection id="api">
          <h2>Public API Methods</h2>
          <CodeBlock lang="typescript">{`// Initialize a widget instance
DerinChat.init(config: ChatConfig): void

// Destroy a widget instance
DerinChat.destroy(instanceId?: string): void

// Check if a widget is active
DerinChat.isActive(instanceId?: string): boolean

// Clear persisted history
DerinChat.clearHistory(instanceId?: string): void

// Hydrate with external messages
DerinChat.loadMessages(messages: Message[], instanceId?: string): void`}</CodeBlock>
        </DocSection>

        {/* Types */}
        <DocSection id="types">
          <h2>TypeScript Types</h2>
          <CodeBlock lang="typescript">{`import DerinChat, {
  type ChatConfig,
  type Message,
  type ApiResponse,
  type AttachmentKind,
  type AttachmentTypeConfig,
  type FileAttachment,
  type ConnectionStatus,
  type ConnectionConfig,
  type UnreadBadgeConfig
} from 'derin-chat-ui';

type ChatConfig = {
  instanceId?: string;
  target?: string | HTMLElement;
  nonce?: string;
  apiUrl?: string;
  apiKey?: string;
  mock?: boolean | { handler?: MockHandler };
  connection?: ConnectionConfig;
  messageFormat?: ApiMessageFormat;
  features?: FeaturesConfig;
  attachments?: AttachmentsConfig;
  ui?: UIConfig;
  behavior?: BehaviorConfig;
  user?: UserConfig;
  unreadBadge?: UnreadBadgeConfig;
  renderCustomMessage?: (message: Message) => ComponentChild | { html: string };
};

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'agent' | 'system';
  timestamp: string;
  isStreaming?: boolean;
  image?: { url: string; alt?: string };
  quickReplies?: QuickReply[];
  agent?: AgentInfo;
};

type ConnectionStatus =
  | 'idle' | 'connecting' | 'connected'
  | 'disconnected' | 'reconnecting' | 'failed';`}</CodeBlock>
        </DocSection>

        <DocSection id="security">
          <h2>Security</h2>
          <ul>
            <li>Markdown output is HTML-escaped and blocks dangerous protocols such as <code>javascript:</code> and <code>data:</code>.</li>
            <li>Markdown links allow <code>http://</code>, <code>https://</code>, and <code>mailto:</code>.</li>
            <li>Widget CSS is isolated in Shadow DOM and does not require a global CSS import.</li>
            <li>Client-side rate limiting is a UX guard only; production apps still need server-side limits.</li>
            <li><code>user.hash</code> is forwarded to your backend for identity verification. It is not verified in the browser.</li>
            <li>Use <code>nonce</code> when your CSP blocks fallback inline style tags.</li>
          </ul>
          <CodeBlock lang="typescript" title="Server-side HMAC example">{`import crypto from 'crypto';

const userHash = crypto
  .createHmac('sha256', process.env.DERIN_SECRET_KEY!)
  .update(userId)
  .digest('hex');

DerinChat.init({
  user: { id: userId, hash: userHash },
});`}</CodeBlock>
        </DocSection>

        <DocSection id="troubleshooting">
          <h2>Troubleshooting</h2>
          <table class="docs-table">
            <thead><tr><th>Problem</th><th>Check</th></tr></thead>
            <tbody>
              <tr><td>Widget does not appear</td><td>Ensure the code runs in the browser and the <code>target</code> selector exists.</td></tr>
              <tr><td>Messages do not send</td><td>Provide <code>apiUrl</code> or enable <code>mock</code>. UI-only mode does not send messages.</td></tr>
              <tr><td>Styles look wrong</td><td>You do not need to import CSS. The widget injects styles into Shadow DOM.</td></tr>
              <tr><td>WebSocket headers missing</td><td>Browser WebSocket APIs ignore custom headers. Use protocols, query params, cookies, or backend auth.</td></tr>
              <tr><td>SSE does not stream</td><td>Return <code>text/event-stream</code> and send <code>data:</code> chunks or OpenAI-style delta payloads.</td></tr>
              <tr><td>History persists unexpectedly</td><td>Set <code>behavior.persistSession</code> or <code>behavior.persistSessionId</code> to <code>false</code>.</td></tr>
              <tr><td>Two widgets collide</td><td>Give each widget a unique <code>instanceId</code>.</td></tr>
            </tbody>
          </table>
        </DocSection>

        {/* Shortcuts */}
        <DocSection id="shortcuts">
          <h2>Keyboard Shortcuts</h2>
          <table class="docs-table">
            <thead><tr><th>Shortcut</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td><code>Escape</code></td><td>Close the chat widget</td></tr>
              <tr><td><code>Ctrl + K</code> / <code>Cmd + K</code></td><td>Toggle the widget</td></tr>
              <tr><td><code>Enter</code></td><td>Send current message</td></tr>
              <tr><td><code>Shift + Enter</code></td><td>Insert newline</td></tr>
            </tbody>
          </table>
        </DocSection>

        <footer class="page-footer" style={{ marginTop: '48px' }}>
          <p>
            Generated from <a href="https://github.com/erguden60/derin-chat-ui" target="_blank" rel="noopener noreferrer">derin-chat-ui</a> source · v1.0.13
          </p>
        </footer>
      </div>

      <aside class="docs-toc" aria-label="On this page">
        <div class="docs-toc-title">On this page</div>
        <nav>
          {tocItems.map((item) => (
            <button
              key={item.id}
              type="button"
              class={`docs-toc-item ${active === item.id ? 'active' : ''}`}
              onClick={() => scrollTo(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </div>
  );
}
