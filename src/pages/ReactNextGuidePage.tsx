import { useMemo, useState } from 'preact/hooks';

type Snippet = {
  id: string;
  title: string;
  lang: string;
  code: string;
};

const snippets: Snippet[] = [
  {
    id: 'install',
    title: 'Install',
    lang: 'bash',
    code: `npm install derin-chat-ui
yarn add derin-chat-ui
pnpm add derin-chat-ui`,
  },
  {
    id: 'react-component',
    title: 'src/components/DerinChatWidget.tsx',
    lang: 'tsx',
    code: `import { useEffect } from 'react';
import DerinChat from 'derin-chat-ui';

export function DerinChatWidget() {
  useEffect(() => {
    DerinChat.init({
      instanceId: 'support-chat',
      apiUrl: '/api/chat',
      ui: {
        theme: 'light',
        layout: 'normal',
        texts: {
          title: 'Support',
          subtitle: 'Online',
          placeholder: 'Type your message...',
        },
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
      },
      features: {
        markdown: true,
        quickReplies: true,
        messageTools: true,
        timestamps: true,
        fileUpload: true,
        voice: {
          input: true,
          output: true,
          language: 'en-US',
        },
      },
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
            id: 'document',
            label: 'Document',
            accept: '.pdf,.doc,.docx,.txt',
            kind: 'document',
            description: 'PDF or document',
          },
        ],
      },
    });

    return () => DerinChat.destroy('support-chat');
  }, []);

  return null;
}`,
  },
  {
    id: 'react-app',
    title: 'src/App.tsx',
    lang: 'tsx',
    code: `import { DerinChatWidget } from './components/DerinChatWidget';

export default function App() {
  return (
    <>
      <main>{/* your app */}</main>
      <DerinChatWidget />
    </>
  );
}`,
  },
  {
    id: 'next-client',
    title: 'app/components/DerinChatWidget.tsx',
    lang: 'tsx',
    code: `'use client';

import { useEffect } from 'react';
import DerinChat from 'derin-chat-ui';

export default function DerinChatWidget() {
  useEffect(() => {
    DerinChat.init({
      instanceId: 'next-support-chat',
      apiUrl: '/api/chat',
      ui: {
        theme: 'light',
        texts: {
          title: 'Support',
          subtitle: 'Online',
        },
      },
      features: {
        markdown: true,
        quickReplies: true,
        messageTools: true,
        timestamps: true,
      },
    });

    return () => DerinChat.destroy('next-support-chat');
  }, []);

  return null;
}`,
  },
  {
    id: 'next-layout',
    title: 'app/layout.tsx',
    lang: 'tsx',
    code: `import type { Metadata } from 'next';
import DerinChatWidget from './components/DerinChatWidget';

export const metadata: Metadata = {
  title: 'My App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <DerinChatWidget />
      </body>
    </html>
  );
}`,
  },
  {
    id: 'next-api',
    title: 'app/api/chat/route.ts',
    lang: 'ts',
    code: `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const message = String(body.message || '');

  return NextResponse.json({
    reply: \`You said: "\${message}". This response came from a Next.js API route.\`,
    quickReplies: [
      { label: 'Show pricing', value: 'pricing' },
      { label: 'Talk to support', value: 'support' },
    ],
  });
}`,
  },
  {
    id: 'next-streaming',
    title: 'app/api/chat/stream/route.ts',
    lang: 'ts',
    code: `import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const chunks = [
        'Thinking about your message...',
        ' Here is a streamed response for: ',
        String(message || 'empty message'),
      ];

      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(\`data: \${JSON.stringify({ token: chunk })}\\n\\n\`));
        await new Promise((resolve) => setTimeout(resolve, 240));
      }

      controller.enqueue(encoder.encode('data: [DONE]\\n\\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}`,
  },
  {
    id: 'stream-config',
    title: 'Streaming widget config',
    lang: 'tsx',
    code: `DerinChat.init({
  instanceId: 'streaming-chat',
  apiUrl: '/api/chat/stream',
  connection: {
    mode: 'sse',
    stream: true,
  },
  ui: {
    theme: 'light',
    texts: {
      title: 'AI Assistant',
      loading: 'Thinking...',
    },
  },
  features: {
    markdown: true,
    messageTools: true,
  },
});`,
  },
];

const toc = [
  ['overview', 'Overview'],
  ['react', 'React setup'],
  ['nextjs', 'Next.js setup'],
  ['api', 'API route'],
  ['streaming', 'Streaming'],
  ['quality', 'Quality checklist'],
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function GuideCodeBlock({ snippet }: { snippet: Snippet }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(snippet.code).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div class="guide-code-block">
      <div class="guide-code-header">
        <span>{snippet.title}</span>
        <div class="guide-code-actions">
          <small>{snippet.lang}</small>
          <button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
        </div>
      </div>
      <pre><code>{snippet.code}</code></pre>
    </div>
  );
}

export function ReactNextGuidePage() {
  const snippetMap = useMemo(
    () => Object.fromEntries(snippets.map((snippet) => [snippet.id, snippet])),
    []
  ) as Record<string, Snippet>;

  return (
    <main class="next-doc-page">
      <aside class="next-doc-sidebar" aria-label="Framework guide navigation">
        <div class="next-doc-sidebar-title">Framework guides</div>
        <button type="button" class="is-active" onClick={() => scrollToSection('overview')}>
          React / Next.js
        </button>
        <button type="button" onClick={() => scrollToSection('react')}>React</button>
        <button type="button" onClick={() => scrollToSection('nextjs')}>Next.js App Router</button>
        <button type="button" onClick={() => scrollToSection('api')}>API route</button>
        <button type="button" onClick={() => scrollToSection('streaming')}>Streaming</button>
        <button type="button" onClick={() => scrollToSection('quality')}>Checklist</button>
      </aside>

      <article class="next-doc-content">
        <header class="next-doc-header" id="overview">
          <div class="next-doc-breadcrumb">Docs / Framework guides</div>
          <h1>React and Next.js</h1>
          <p>
            Learn how to install Derin Chat UI, mount the widget in React, use it safely with
            Next.js App Router, connect a route handler, and enable streaming.
          </p>
        </header>

        <section class="next-doc-section" id="install">
          <h2>Installation</h2>
          <p>Install the package in your React or Next.js project.</p>
          <GuideCodeBlock snippet={snippetMap.install} />
        </section>

        <section class="next-doc-section" id="react">
          <h2>Use with React</h2>
          <p>
            Create a small widget component. Initialize the SDK inside `useEffect`, and clean up
            the same instance when the component unmounts.
          </p>
          <div class="next-doc-callout">
            The widget should be mounted once near your application shell, not inside frequently
            re-rendered feature components.
          </div>
          <GuideCodeBlock snippet={snippetMap['react-component']} />
          <GuideCodeBlock snippet={snippetMap['react-app']} />
        </section>

        <section class="next-doc-section" id="nextjs">
          <h2>Use with Next.js App Router</h2>
          <p>
            In App Router, components are Server Components by default. Because Derin Chat UI uses
            browser APIs, create a Client Component wrapper with `'use client'`.
          </p>
          <GuideCodeBlock snippet={snippetMap['next-client']} />
          <GuideCodeBlock snippet={snippetMap['next-layout']} />
        </section>

        <section class="next-doc-section" id="api">
          <h2>Create an API route</h2>
          <p>
            Start with a normal POST route. Return a `reply` string first, then add quick replies,
            tool calls, provider-specific metadata, or persistence later.
          </p>
          <GuideCodeBlock snippet={snippetMap['next-api']} />
        </section>

        <section class="next-doc-section" id="streaming">
          <h2>Add streaming</h2>
          <p>
            Once the normal API route works, move to SSE streaming. The stream should send `data:`
            chunks and finish with `[DONE]`.
          </p>
          <GuideCodeBlock snippet={snippetMap['next-streaming']} />
          <GuideCodeBlock snippet={snippetMap['stream-config']} />
        </section>

        <section class="next-doc-section" id="quality">
          <h2>Production checklist</h2>
          <div class="next-doc-checks">
            <div>
              <strong>Runtime</strong>
              <ul>
                <li>Initialize on the client only.</li>
                <li>Use a stable `instanceId`.</li>
                <li>Call `DerinChat.destroy(instanceId)` on unmount.</li>
              </ul>
            </div>
            <div>
              <strong>API</strong>
              <ul>
                <li>Return a predictable `reply` shape.</li>
                <li>Handle errors with user-safe messages.</li>
                <li>End streams with `[DONE]`.</li>
              </ul>
            </div>
            <div>
              <strong>UI</strong>
              <ul>
                <li>Test light and dark contrast.</li>
                <li>Review loading, error, and reconnect states.</li>
                <li>Prefer the newer `attachments` config.</li>
              </ul>
            </div>
          </div>
        </section>
      </article>

      <aside class="next-doc-toc" aria-label="On this page">
        <div>On this page</div>
        {toc.map(([id, label]) => (
          <button type="button" onClick={() => scrollToSection(id)} key={id}>{label}</button>
        ))}
        <button type="button" onClick={() => scrollToSection('install')}>Installation</button>
      </aside>
    </main>
  );
}
