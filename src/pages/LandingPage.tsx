import { useEffect, useMemo, useState } from 'preact/hooks';
import { ChatWidget } from '../components/ChatWidget';
import { mergeConfig } from '../utils/helpers';
import '../styles/main.scss';

const features = [
  {
    icon: 'SD',
    title: 'Shadow DOM Isolation',
    desc: 'Zero CSS bleed. Your app styles won\'t break the widget, and the widget won\'t break your app.',
  },
  {
    icon: 'API',
    title: 'HTTP · WebSocket · SSE',
    desc: 'Ship with REST, full-duplex WebSocket with auto-reconnect, or real-time SSE streaming out of the box.',
  },
  {
    icon: 'MO',
    title: 'Mock / Headless Mode',
    desc: 'Prototype and test your chat UI without needing a live backend. Custom mock handlers supported.',
  },
  {
    icon: 'VO',
    title: 'Voice Assistant',
    desc: 'Native Speech-to-Text & Text-to-Speech — no external dependencies. Works with 40+ languages.',
  },
  {
    icon: 'MI',
    title: 'Multi-Instance Ready',
    desc: 'Mount multiple isolated widgets simultaneously using instanceId + target selectors.',
  },
  {
    icon: 'TS',
    title: 'Lightweight & Typed',
    desc: '~30-35 KB gzipped with full TypeScript support. Preact is bundled into the SDK output.',
  },
];

const chatCapabilities = [
  {
    label: 'Streaming',
    title: 'Token-by-token AI responses',
    desc: 'Render SSE streams with a real typing state, disabled input, and final markdown formatting.',
  },
  {
    label: 'Markdown',
    title: 'Readable answers with code blocks',
    desc: 'Safe markdown rendering, copyable code blocks, links, inline code, and stable bubble spacing.',
  },
  {
    label: 'Actions',
    title: 'Quick replies and message tools',
    desc: 'Suggested replies, copy, regenerate, feedback, edit mode, timestamps, and agent labels.',
  },
  {
    label: 'Files',
    title: 'Configurable attachment menu',
    desc: 'Images, PDFs, documents, custom attachment types, previews, and max-size validation.',
  },
  {
    label: 'Voice',
    title: 'Speech input and read aloud',
    desc: 'Browser-native speech recognition and text-to-speech with language and voice selection.',
  },
  {
    label: 'Recovery',
    title: 'Connection and error states',
    desc: 'WebSocket reconnect banners, system errors, loading states, and UI-only fallback behavior.',
  },
];

const codeExamples = {
  react: {
    title: 'app/components/ChatWidget.tsx',
    code: `<span class="tok-str">'use client'</span>;

<span class="tok-kw">import</span> { useEffect } <span class="tok-kw">from</span> <span class="tok-str">'react'</span>;
<span class="tok-kw">import</span> DerinChat <span class="tok-kw">from</span> <span class="tok-str">'derin-chat-ui'</span>;

<span class="tok-kw">export default function</span> <span class="tok-fn">ChatWidget</span>() {
  <span class="tok-fn">useEffect</span>(() => {
    DerinChat.<span class="tok-fn">init</span>({
      <span class="tok-attr">apiUrl</span>: <span class="tok-str">'/api/chat'</span>,
      <span class="tok-attr">connection</span>: { <span class="tok-attr">stream</span>: <span class="tok-val">true</span> },
      <span class="tok-attr">ui</span>: {
        <span class="tok-attr">theme</span>: <span class="tok-str">'auto'</span>,
        <span class="tok-attr">colors</span>: { <span class="tok-attr">primary</span>: <span class="tok-str">'#4F46E5'</span> },
        <span class="tok-attr">texts</span>: { <span class="tok-attr">title</span>: <span class="tok-str">'Support'</span> }
      }
    });

    <span class="tok-kw">return</span> () => DerinChat.<span class="tok-fn">destroy</span>();
  }, []);

  <span class="tok-kw">return</span> <span class="tok-val">null</span>;
}`,
  },
  html: {
    title: 'index.html',
    code: `<span class="tok-tag">&lt;script</span> <span class="tok-attr">src</span>=<span class="tok-str">"https://unpkg.com/derin-chat-ui/dist/index.umd.js"</span><span class="tok-tag">&gt;&lt;/script&gt;</span>
<span class="tok-tag">&lt;script&gt;</span>
  window.DerinChat.<span class="tok-fn">init</span>({
    <span class="tok-attr">mock</span>: <span class="tok-val">true</span>,
    <span class="tok-attr">ui</span>: {
      <span class="tok-attr">theme</span>: <span class="tok-str">'dark'</span>,
      <span class="tok-attr">texts</span>: { <span class="tok-attr">title</span>: <span class="tok-str">'AI Assistant'</span> }
    }
  });
<span class="tok-tag">&lt;/script&gt;</span>`,
  },
  vue: {
    title: 'ChatWidget.vue',
    code: `<span class="tok-tag">&lt;script setup&gt;</span>
<span class="tok-kw">import</span> { onMounted, onUnmounted } <span class="tok-kw">from</span> <span class="tok-str">'vue'</span>
<span class="tok-kw">import</span> DerinChat <span class="tok-kw">from</span> <span class="tok-str">'derin-chat-ui'</span>

<span class="tok-fn">onMounted</span>(() => {
  DerinChat.<span class="tok-fn">init</span>({
    <span class="tok-attr">apiUrl</span>: <span class="tok-str">'/api/chat'</span>,
    <span class="tok-attr">ui</span>: { <span class="tok-attr">theme</span>: <span class="tok-str">'auto'</span> }
  })
})

<span class="tok-fn">onUnmounted</span>(() => DerinChat.<span class="tok-fn">destroy</span>())
<span class="tok-tag">&lt;/script&gt;</span>`,
  },
  angular: {
    title: 'derin-chat-widget.component.ts',
    code: `<span class="tok-kw">import</span> { AfterViewInit, Component, OnDestroy } <span class="tok-kw">from</span> <span class="tok-str">'@angular/core'</span>;
<span class="tok-kw">import</span> DerinChat <span class="tok-kw">from</span> <span class="tok-str">'derin-chat-ui'</span>;

<span class="tok-attr">@Component</span>({
  <span class="tok-attr">selector</span>: <span class="tok-str">'app-derin-chat'</span>,
  <span class="tok-attr">standalone</span>: <span class="tok-val">true</span>,
  <span class="tok-attr">template</span>: <span class="tok-str">''</span>,
})
<span class="tok-kw">export class</span> <span class="tok-type">DerinChatWidgetComponent</span>
  <span class="tok-kw">implements</span> <span class="tok-type">AfterViewInit</span>, <span class="tok-type">OnDestroy</span> {
  <span class="tok-kw">private</span> instanceId = <span class="tok-str">'angular-support'</span>;

  <span class="tok-fn">ngAfterViewInit</span>() {
    DerinChat.<span class="tok-fn">init</span>({
      <span class="tok-attr">instanceId</span>: <span class="tok-kw">this</span>.instanceId,
      <span class="tok-attr">apiUrl</span>: <span class="tok-str">'/api/chat'</span>,
      <span class="tok-attr">ui</span>: { <span class="tok-attr">theme</span>: <span class="tok-str">'auto'</span> }
    });
  }

  <span class="tok-fn">ngOnDestroy</span>() {
    DerinChat.<span class="tok-fn">destroy</span>(<span class="tok-kw">this</span>.instanceId);
  }
}`,
  },
};

type TabKey = keyof typeof codeExamples;

const installCommands = [
  { manager: 'npm', command: 'npm install derin-chat-ui' },
  { manager: 'yarn', command: 'yarn add derin-chat-ui' },
  { manager: 'pnpm', command: 'pnpm add derin-chat-ui' },
];

export function LandingPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('react');
  const [copiedCommand, setCopiedCommand] = useState('');

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const heroConfig = useMemo(() => mergeConfig({
      instanceId: 'landing-hero-widget',
      mock: {
        handler: async (message) => ({
          reply: `Received: "${message}". This is a mock response for UI review.`,
          quickReplies: [
            { label: 'Looks good', value: 'looks-good' },
            { label: 'Try another state', value: 'try-another-state' },
          ],
        }),
      },
      attachments: {
        enabled: true,
      },
      ui: {
        theme: 'light',
        layout: 'normal',
        position: 'bottom-right',
        showWelcomeScreen: true,
        colors: {
          primary: '#2563eb',
          headerBg: '#ffffff',
          headerText: '#111827',
          background: '#ffffff',
          botMessageBg: '#f8fafc',
          botMessageText: '#1f2937',
          userMessageBg: '#2563eb',
          userMessageText: '#ffffff',
          inputBg: '#f8fafc',
          inputText: '#111827',
        },
        texts: {
          title: 'Derin Chat',
          subtitle: 'Online support',
          placeholder: 'Type your message...',
          welcomeBadge: 'AI assistant',
          welcomeMessage: 'How can I help you today?',
          welcomeHints: ['Order status', 'Track package', 'Return policy'],
        },
      },
      features: {
        fileUpload: true,
        quickReplies: true,
        agentMode: true,
        markdown: true,
        timestamps: true,
        avatars: true,
        messageTools: true,
        voice: {
          input: true,
          output: true,
          language: 'en-US',
        },
      },
      behavior: {
        openOnLoad: true,
        closeOnOutsideClick: false,
        persistSession: false,
        persistSessionId: false,
      },
    }), []);

  const copyInstall = (command: string) => {
    navigator.clipboard.writeText(command).then(() => {
      setCopiedCommand(command);
      setTimeout(() => setCopiedCommand(''), 2000);
    });
  };

  return (
    <main>
      {/* Hero */}
      <section class="landing-hero product-hero">
        <div class="product-hero-copy hero-reveal">
          <h1 class="hero-title">Embed production AI chat in minutes</h1>
          <p class="hero-subtitle">
            A framework-agnostic chat SDK for modern web apps. Test the real widget,
            tune themes, and ship a polished support experience without fighting host CSS.
          </p>
          <div class="hero-action-panel">
            <div class="hero-actions">
              <a href="#/docs" class="btn btn-primary">
                Documentation
              </a>
            </div>
            <div class="hero-proof-row" aria-label="Package qualities">
              <span class="quality-pill">ESM / CJS / UMD</span>
              <span class="quality-pill">Typed API</span>
              <span class="quality-pill">Style isolated</span>
            </div>
          </div>
        </div>

        <div class="landing-widget-demo hero-reveal" aria-label="Interactive Derin Chat UI demo">
          <div class="landing-widget-shell">
            <ChatWidget config={heroConfig} />
          </div>
          <a class="landing-widget-cta" href="#/ui-lab">
            Launch the Live UI Lab
          </a>
        </div>
      </section>

      {/* Install Bar */}
      <div class="install-bar" data-reveal>
        {installCommands.map(({ manager, command }) => (
          <div class="install-command" key={manager}>
            <span class="install-manager">{manager}</span>
            <code>{command}</code>
            <button onClick={() => copyInstall(command)}>
              {copiedCommand === command ? 'Copied' : 'Copy'}
            </button>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div class="stats-bar stagger-list" data-reveal>
        <div class="stat-card reveal-card">
          <div class="stat-label">Package</div>
          <div class="stat-value">derin-chat-ui</div>
        </div>
        <div class="stat-card reveal-card">
          <div class="stat-label">Engine</div>
          <div class="stat-value">Preact 10+</div>
        </div>
        <div class="stat-card reveal-card">
          <div class="stat-label">Size</div>
          <div class="stat-value">~30-35 KB gzip</div>
        </div>
        <div class="stat-card reveal-card">
          <div class="stat-label">Isolation</div>
          <div class="stat-value">Shadow DOM</div>
        </div>
      </div>

      {/* Features */}
      <section class="capabilities-section reveal-section" data-reveal>
        <div class="section-eyebrow">Chat capabilities</div>
        <h2 class="section-title">The states teams actually need to test</h2>
        <p class="section-desc">
          The local UI Lab mounts the real package and lets you review these states across themes,
          layouts, host surfaces, and contrast palettes.
        </p>
        <div class="capabilities-grid stagger-list">
          {chatCapabilities.map((capability) => (
            <article class="capability-card reveal-card" key={capability.title}>
              <span>{capability.label}</span>
              <h3>{capability.title}</h3>
              <p>{capability.desc}</p>
            </article>
          ))}
        </div>
        <div class="state-strip">
          <strong>UI Lab presets</strong>
          <span>Idle</span>
          <span>Loading</span>
          <span>Error</span>
          <span>Connection</span>
          <span>Streaming</span>
        </div>
      </section>

      <section class="features-section reveal-section" data-reveal>
        <div class="section-eyebrow">Capabilities</div>
        <h2 class="section-title">SDK features behind the widget</h2>
        <p class="section-desc">
          Derin Chat UI ships as a complete chat engine — not just a UI widget. Plug it into any
          backend infrastructure natively.
        </p>
        <div class="features-grid stagger-list">
          {features.map(f => (
            <div class="feature-card reveal-card" key={f.title}>
              <div class="feature-icon">{f.icon}</div>
              <div class="feature-title">{f.title}</div>
              <div class="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section class="quickstart-section reveal-section" data-reveal>
        <div class="section-eyebrow">Quick Start</div>
        <h2 class="section-title">Three lines to launch</h2>
        <p class="section-desc">
          Works with React, Next.js, Vue, Angular, Svelte, or plain HTML — no CSS imports needed.
        </p>

        <div class="quickstart-tabs">
          {(Object.keys(codeExamples) as TabKey[]).map(tab => (
            <button
              key={tab}
              class={`qs-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'react'
                ? 'React / Next.js'
                : tab === 'html'
                  ? 'HTML (CDN)'
                  : tab === 'vue'
                    ? 'Vue.js'
                    : 'Angular'}
            </button>
          ))}
        </div>

        <div class="code-window">
          <div class="code-window-header">
            <div class="window-dots">
              <div class="dot dot-red" />
              <div class="dot dot-yellow" />
              <div class="dot dot-green" />
            </div>
            <span class="code-window-title">{codeExamples[activeTab].title}</span>
          </div>
          <pre dangerouslySetInnerHTML={{ __html: codeExamples[activeTab].code }} />
        </div>
      </section>

      {/* Footer */}
      <footer class="page-footer">
        <p>
          Made by <strong>Emirhan Ergüden</strong> ·{' '}
          <a href="https://github.com/erguden60/derin-chat-ui" target="_blank" rel="noopener noreferrer">GitHub</a>{' · '}
          <a href="https://www.npmjs.com/package/derin-chat-ui" target="_blank" rel="noopener noreferrer">npm</a>{' · '}
          MIT License
        </p>
      </footer>
    </main>
  );
}
