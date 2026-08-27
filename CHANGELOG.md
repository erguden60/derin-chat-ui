# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [1.0.13] - 2026-08-09

### Added
- **Multi-Instance Support** - `instanceId` and `target` let multiple widgets mount on the same page without colliding
- **Instance-Scoped Persistence** - localStorage keys are now namespaced per widget instance
- **Mount Target Support** - Widgets can mount into `document.body`, a selector, or an `HTMLElement`
- **Connection Recovery UX** - reconnecting, connecting, offline, and failed states now surface directly in the UI
- **UI Lab** - Added a real local embed test bench for widget configuration, contrast, layout, attachment, and host-surface checks
- **Framework Docs** - Added integration examples for Next.js, React/Vite, Vue, Angular, and vanilla HTML
- **npm-first README** - Split concise npm usage docs from the long GitHub/developer documentation
- **Release Checklist** - Added a dedicated checklist for publish readiness and manual QA

### Improved
- **Runtime Config Validation** - `instanceId`, `target`, `ui.theme`, `ui.layout`, `connection.mode`, WebSocket URL, attachment types, file size limits, and message limits now receive clearer validation
- **Connection Messaging** - WebSocket-only and auto-fallback edge cases now produce clearer system messages
- **Header Status UX** - Loading and connection states are reflected more accurately in the header
- **Docs Alignment** - README and developer docs updated to describe modern SDK capabilities
- **Widget UI Polish** - Improved launcher, chat window, input, quick replies, file upload, error toast, typing indicator, message tools, and edit mode
- **Dark Theme Quality** - Fixed dark/full-screen contrast issues across welcome badge, message surfaces, input, tool icons, and agent messages
- **Markdown Rendering** - Fixed fenced code block placeholder leakage and refreshed inline/code block styling
- **Public Type Exports** - Re-exported commonly needed SDK types such as attachment, connection, message, unread badge, and API types from the package entry point
- **Consumer Type Safety** - Removed public declaration dependency on Preact types so clean TypeScript consumers can install only `derin-chat-ui`
- **Defaults Alignment** - Added missing default text and feature values so runtime defaults match documented behavior
- **Package Docs Accuracy** - Updated bundle size numbers and clarified the bundled Preact distribution model
- **Attachment API Docs** - Documented the newer `attachments` configuration, default attachment types, and custom attachment render hooks.
- **Public API Coverage** - Added missing references for `nonce`, welcome screen text options, advanced message callbacks, custom message rendering, `clearHistory`, and `loadMessages`.
- **Shadow DOM Notes** - Refreshed the Shadow DOM isolation notes to reflect the current `applyShadowStyles` production flow.

### Testing
- Added multi-instance initialization/destroy tests
- Added runtime validation coverage for UI options, connection modes, WebSocket URLs, attachments, behavior limits, color warnings, contrast warnings, API key warnings, and browser WebSocket header warnings
- Added connection-aware header state test
- Added markdown regression coverage for fenced code blocks
- Verified production build, full test suite, npm pack dry-run, clean TypeScript install, ESM import, CJS require, and UMD browser smoke test

---

## [1.0.12] - 2026-06-15

### Improved
- **Documentation Accuracy** - Aligned README, developer docs, demo copy, and CDN examples with the published v1.0.12 release.
- **Security Positioning** - Clarified that `user.hash` is forwarded for backend HMAC verification rather than verified inside the browser SDK.
- **Bundle Metadata** - Updated published bundle size references for the current v1.0.12 build.
- **Developer Clarity** - Clarified multi-instance SDK behavior and browser WebSocket header limitations.

### Fixed
- **Session ID Stability** - Kept generated non-persisted session IDs stable across component re-renders.

---

## [1.0.11] - 2026-04-19

### Added
- **Release Refresh** - Published the current v1.0.11 package metadata and docs references.
- **Developer Docs** - Added a dedicated developer documentation file for SDK integration details.

### Improved
- **Package Metadata Alignment** - README, dev docs, and demo copy now reference v1.0.11 consistently.
- **Developer Guidance** - Expanded integration notes for HTTP streaming and WebSocket setup paths.

---

## [1.0.10] - 2026-03-11

### Added
- **SSE Streaming Mode** - HTTP connections can render incremental streamed responses with `connection.stream`.
- **OpenAI-Compatible Parsing** - Streaming responses support `choices[0].delta.content` alongside custom `reply` and `text` payloads.

### Improved
- **Typewriter Experience** - Bot messages can mount immediately and fill in as stream chunks arrive.
- **Transport Documentation** - README and dev docs describe HTTP, SSE, WebSocket, auto, and mock connection modes.

---

## [1.0.9] - 2026-03-11

### Added
- **Voice and Experience Controls** - Added voice input/output surfaces and richer demo configuration controls.
- **Modern Widget UX** - Refined header, launcher, empty state, and connection-aware copy for production embedding.

### Improved
- **Persistence and Instance Docs** - Documented namespaced storage keys and legacy localStorage migration behavior.
- **Connection Recovery Messaging** - Improved user-facing feedback around reconnecting and unavailable live connections.

---

## [1.0.8] - 2025-03-10

### 🎯 Latest Stable Release

**Status:** Published to npm

### ✨ What's New
- Minor bug fixes and improvements
- Documentation updates
- Performance optimizations

---

## [1.0.7] - Unreleased

### 🎯 Production-Ready Release (Code Complete, Pending Publish)

**Positioning:** Officially positioned as **AI Chat Embed SDK** - optimized for chatbot builders and developers.

**⚠️ Status:** Implementation complete, awaiting final testing and npm publish.

### 🚀 Major Features

#### Auto-Fallback Mode (FIXED & ENHANCED)
- **TRUE Auto-Fallback** - WebSocket failures now automatically fall back to HTTP
- **Seamless Recovery** - Automatically switches back to WebSocket when connection restored
- **Smart Detection** - Uses connection status (`failed`, `disconnected`) for fallback logic
- **Developer Logging** - Console messages show current mode for debugging

#### localStorage Version Management
- **Versioned Keys** - All storage keys now include version prefix (`derin-chat-v1-*`)
- **Automatic Migration** - Legacy data migrated seamlessly on load
- **Future-Proof** - Breaking schema changes won't crash existing users
- **Safe Upgrades** - Version bump = clean slate without user data corruption

#### Singleton Pattern Enforcement
- **Explicit Instance Management** - `DerinChat.instance` tracks active state
- **Auto-Replace Warning** - Warns when calling `init()` twice
- **Public API** - `DerinChat.isActive()` method added
- **Clean Destroy** - Properly marks instance as inactive

### 📚 Documentation Overhaul

#### Product Positioning
- **Clear Target Audience** - AI chatbot builders, indie developers, custom chat apps
- **"Built Different"** - Emphasizes infrastructure-grade quality
- **Production-Grade** - Highlights reliability over "lightweight widget"

#### Security Best Practices Section
- ⚠️ Client-side rate limiting disclaimer
- 🔒 Backend HMAC verification guide
- 🛡️ CSP configuration
- 📋 GDPR compliance notes
- 🚨 XSS protection documentation

#### Public Roadmap
- **v1.1.0** - AI streaming support (SSE, token-based rendering)
- **v1.2.0** - Enhanced UX (retry, editing, voice input)
- **v2.0.0** - Enterprise features (multi-instance, analytics, multi-tenant)

### 🐛 Critical Bug Fixes

- **Fixed:** AUTO mode not actually falling back to HTTP ([Critical Issue #1](https://github.com/erguden60/derin-chat-ui/issues))
- **Fixed:** localStorage parse crashes on schema changes
- **Fixed:** Singleton behavior undocumented (developer confusion)

### ⚡ Technical Improvements

- **useMessageSender**: Added `connectionStatus` parameter for smart routing
- **useChatState**: Conditional WebSocket usage based on connection health
- **storage.ts**: Migration helpers for all localStorage functions
- **index.ts**: JSDoc comments and explicit singleton pattern

### 📦 Package Updates

- **Version:** 1.0.6 → 1.0.7
- **Description:** Now emphasizes "production-grade" and "AI chat SDK"
- **Keywords:** Added `ai-chat`, `chatbot-sdk`, `conversational-ai`, `llm-interface`

### 🧪 Testing

- ✅ All 42 existing tests passing
- ✅ No breaking changes to public API
- ✅ Backward compatible (migration handles legacy storage)

### 📊 Impact

- **Bundle Size:** No change (~20KB gzipped)
- **Performance:** Improved (smarter connection routing)
- **Developer Experience:** Significantly improved (better docs, warnings, API)

---

## [1.0.3] - 2026-02-03

### 🎉 Major Features

#### WebSocket Support (Real-Time Communication)
- **Connection Modes** - HTTP, WebSocket, or Auto-fallback
- **Auto-Reconnection** - Exponential backoff with configurable retry attempts
- **Heartbeat Mechanism** - Ping-pong keep-alive for stable connections
- **Connection Status Indicator** - Visual feedback (idle, connecting, connected, disconnected, reconnecting, failed)
- **Offline Message Queue** - Messages queued when disconnected, sent on reconnection
- **Event Callbacks** - `onConnectionChange`, `onReconnecting`, `onReconnected`

#### Unread Badge
- **Visual Indicator** - Red badge with unread message count on launcher
- **Auto-Increment** - Increases when new bot/agent message arrives (chat closed)
- **Auto-Clear** - Resets to zero when chat is opened
- **Persistence** - Count saved to localStorage across page reloads
- **Customizable** - Position, color, max count (e.g., "99+"), animation
- **Event Callback** - `onUnreadCountChange` for custom integrations

### ✨ Enhancements

#### Developer Experience
- **TypeScript Improvements** - Enhanced type definitions for WebSocket and connection config
- **Better Error Handling** - Improved error messages and graceful fallbacks
- **Event System** - Comprehensive event callbacks for all connection states

#### Performance
- **Optimized Bundle** - Maintained ~20KB gzipped despite new features
- **Tree-Shakeable** - WebSocket code only included when used
- **Efficient State Management** - Minimal re-renders with optimized hooks

### 🔧 Technical Changes

#### New Files
- `src/utils/websocket.ts` - WebSocket manager with reconnection logic
- `src/hooks/useWebSocket.ts` - React hook for WebSocket integration
- `src/components/ConnectionStatus.tsx` - Connection status indicator component
- `src/components/UnreadBadge.tsx` - Unread message badge component
- `src/types/connection.ts` - WebSocket and connection type definitions
- `src/styles/components/connection-status.scss` - Connection indicator styles
- `src/styles/components/unread-badge.scss` - Badge styles with animations

#### Modified Files
- `src/hooks/useChatState.ts` - Integrated WebSocket and unread count logic
- `src/hooks/useMessageSender.ts` - Added dual-mode (HTTP/WebSocket) sending
- `src/hooks/usePersistence.ts` - Added unread count persistence
- `src/components/Launcher.tsx` - Added unread badge display
- `src/components/ChatWidget.tsx` - Integrated connection status and unread count
- `src/components/ChatWindow.tsx` - Pass connection status to header
- `src/components/ChatHeader.tsx` - Display connection status indicator
- `src/utils/storage.ts` - Added unread count storage functions
- `src/constants/defaults.ts` - Added WebSocket and badge default configs

### 🧪 Testing

- **42 Tests Passing** - All existing tests maintained
- **New Test Coverage** - WebSocket manager and useWebSocket hook tests
- **Type Safety Tests** - Configuration and API surface validation

### 📚 Documentation

- **Comprehensive README** - 750+ lines with WebSocket integration guide
- **Server Examples** - Node.js (ws) and Python (websockets) implementations
- **Configuration Guide** - Detailed WebSocket and unread badge options
- **Security Best Practices** - CSP configuration and authentication guidance
- **FAQ Section** - Common questions and answers

### 🔒 Security

- **No Breaking Changes** - Fully backward compatible with v1.0.0
- **Secure WebSocket** - Support for WSS (WebSocket Secure)
- **Input Validation** - All WebSocket messages validated
- **Error Boundaries** - Graceful handling of connection failures

### 📦 Bundle Size

- **ESM**: ~72KB (~20KB gzipped)
- **CJS**: ~54KB (~18KB gzipped)
- **UMD**: ~54KB (~18KB gzipped)
- **Impact**: +2.5KB gzipped (+3.5%) for significant new features

---

## [1.0.0] - 2026-01-18

### Initial Release

First stable release of Derin Chat Widget - a modern, lightweight, and fully customizable chat widget library.

### Features

#### Core Features

- **Ultra Lightweight** - Only ~58KB (gzip: ~17KB) bundle size
- **Framework Agnostic** - Works with React, Vue, Angular, WordPress, and static HTML
- **Shadow DOM** - Complete CSS isolation, zero style conflicts
- **TypeScript Support** - Full type safety with comprehensive type declarations
- **Fully Responsive** - Optimized for mobile, tablet, and desktop

#### Chat Features

- **Mock Mode** - Development and testing without backend
- **Bot & Agent Mode** - Support for automated responses and live customer support
- **File Upload** - Configurable file upload with size limits and MIME type validation
- **Quick Replies** - Fast response buttons for common actions
- **Markdown Support** - Rich text formatting with **bold**, _italic_, [links](url)
- **Timestamps** - Optional message timestamps
- **Session Persistence** - Automatic message history via LocalStorage
- **Rich Media** - Images, avatars, and file attachments

#### Developer Features

- **API Mapping** - Support for different backend response formats
- **Event Callbacks** - Hooks for analytics and custom logic (onMessageSent, onMessageReceived, onError, etc.)
- **Keyboard Shortcuts** - ESC to close, Ctrl/Cmd+K to toggle
- **Rate Limiting** - Built-in protection (10 messages/minute, 1-second cooldown)
- **Configurable** - Extensive customization options for colors, texts, behavior

### Security

- **XSS Protection** - Automatic HTML escaping and dangerous protocol blocking
- **Prototype Pollution Prevention** - Safe object merging operations
- **URL Validation** - Protocol whitelisting (http/https only)
- **Input Sanitization** - Markdown parser with security-first approach
- **Rate Limiting** - Protection against message spam

### Testing

- **26 Unit Tests** - Comprehensive test coverage for critical functions
- **Vitest** - Fast and modern test runner
- **Security Tests** - XSS protection, URL validation, and config validation tests

### Package

- **Multiple Formats** - ESM, CommonJS, and UMD builds
- **TypeScript Declarations** - Full `.d.ts` files generated
- **Tree-shakeable** - ES modules for optimal bundle size
- **NPM Ready** - Optimized for distribution

### Documentation

- **Comprehensive README** - English and Turkish versions
- **API Reference** - Complete configuration options documented
- **Code Examples** - Framework integrations and use cases
- **Security Guide** - Best practices and security checklist

### Technical Stack

- **Preact 10.27.2** - Lightweight React alternative (3KB)
- **Vite 7.2.4** - Ultra-fast build tool
- **TypeScript 5.9.3** - Type safety and IntelliSense
- **SCSS** - Modern styling with component isolation
- **Vitest** - Fast unit testing


### Planned Features (v2.0)

- Dark mode support
- Multi-language (i18n) support
- Voice messages
- Message status indicators (sent/delivered/read)
- Emoji picker
- Analytics dashboard
- Desktop notifications
- React Native SDK

---

[1.0.3]: https://github.com/erguden60/derin-chat-ui/releases/tag/v1.0.3
[1.0.0]: https://github.com/erguden60/derin-chat-ui/releases/tag/v1.0.0
