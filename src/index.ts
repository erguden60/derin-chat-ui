import { render, h } from 'preact';
import { ChatWidget, ErrorBoundary } from './components';
import { validateConfig } from './utils/validators';
import { mergeConfig } from './utils/helpers';
import type { ChatConfig, Message } from './types';
import styles from './styles/main.scss?inline';

// Re-export public SDK types
export type {
  AgentInfo,
  ApiMessageFormat,
  ApiRequest,
  ApiResponse,
  AttachmentKind,
  AttachmentTypeConfig,
  ChatConfig,
  ConnectionConfig,
  ConnectionMode,
  ConnectionStatus,
  DerinChatRenderable,
  FileAttachment,
  Message,
  MessageAction,
  MessageFile,
  MessageImage,
  MessageSender,
  MockHandlerContext,
  MockHandlerResult,
  QuickReply,
  UnreadBadgeConfig,
  WebSocketConfig,
  WebSocketMessage,
  WebSocketMessageType,
} from './types';

import { clearMessages } from './utils/storage';

const STYLE_MARKER = 'data-derin-chat-style';
let sharedStyleSheet: CSSStyleSheet | null = null;

function supportsAdoptedStyleSheets(shadow: ShadowRoot): boolean {
  return (
    'adoptedStyleSheets' in shadow &&
    typeof CSSStyleSheet !== 'undefined' &&
    typeof CSSStyleSheet.prototype.replaceSync === 'function'
  );
}

function getSharedStyleSheet(): CSSStyleSheet {
  if (!sharedStyleSheet) {
    sharedStyleSheet = new CSSStyleSheet();
    sharedStyleSheet.replaceSync(styles);
  }

  return sharedStyleSheet;
}

function applyShadowStyles(shadow: ShadowRoot, nonce?: string) {
  const existingStyle = shadow.querySelector<HTMLStyleElement>(`style[${STYLE_MARKER}]`);

  if (supportsAdoptedStyleSheets(shadow)) {
    existingStyle?.remove();

    const sheet = getSharedStyleSheet();
    if (!shadow.adoptedStyleSheets.includes(sheet)) {
      shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, sheet];
    }
    return;
  }

  const styleTag = existingStyle || document.createElement('style');
  styleTag.setAttribute(STYLE_MARKER, '');
  if (nonce) {
    styleTag.nonce = nonce;
  } else {
    styleTag.removeAttribute('nonce');
  }
  styleTag.textContent = styles;

  if (!existingStyle) {
    shadow.appendChild(styleTag);
  }
}

/**
 * DerinChat - Embeddable AI Chat Widget SDK

 * 
 * Multi-instance support: each instance is scoped by instanceId.
 * Calling init() again with the same instanceId replaces that instance.
 * 
 * @example
 * ```typescript
 * // Initialize widget
 * DerinChat.init({
 *   apiUrl: 'https://api.example.com/chat',
 *   user: { id: 'user-123' }
 * });
 * 
 * // Clean up before unmounting
 * DerinChat.destroy();
 * ```
 */
class DerinChat {
  private static instances = new Map<string, HTMLElement>();

  private static resolveInstanceId(config?: ChatConfig): string {
    return config?.instanceId?.trim() || 'default';
  }

  private static createHostId(instanceId: string): string {
    return instanceId === 'default' ? 'derin-chat-host' : `derin-chat-host-${instanceId}`;
  }

  private static resolveMountTarget(target?: ChatConfig['target']): HTMLElement {
    if (typeof document === 'undefined') {
      throw new Error('Document is not available');
    }

    if (!target || target === 'body') {
      return document.body;
    }

    if (typeof target === 'string') {
      const element = document.querySelector(target);
      if (!element || !(element instanceof HTMLElement)) {
        throw new Error(`DerinChat target not found for selector: ${target}`);
      }
      return element;
    }

    if (target instanceof HTMLElement) {
      return target;
    }

    throw new Error('DerinChat target must be a CSS selector string or an HTMLElement');
  }
  
  /**
   * Initialize the chat widget
   * @param config - Chat configuration
   * @throws {ConfigError} If configuration is invalid
   */
  static init(config: ChatConfig) {
    // SSR Guard: Only run in browser
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn('⚠️ DerinChat: Not running in browser environment. Skipping initialization.');
      return;
    }

    try {
      // Validate configuration
      validateConfig(config);

      // Merge with defaults
      const fullConfig = mergeConfig(config);
      const instanceId = DerinChat.resolveInstanceId(fullConfig);
      const hostId = DerinChat.createHostId(instanceId);
      const mountTarget = DerinChat.resolveMountTarget(fullConfig.target);

      if (DerinChat.instances.has(instanceId)) {
        console.warn(
          `⚠️ DerinChat: Instance '${instanceId}' already initialized. Replacing existing instance.`
        );
        DerinChat.destroy(instanceId);
      }

      // Create or get host element
      let host = document.getElementById(hostId);

      if (!host) {
        host = document.createElement('div');
        host.id = hostId;
        host.dataset.derinChatInstance = instanceId;
        mountTarget.appendChild(host);
      }

      // Create or get shadow root
      let shadow = host.shadowRoot;
      if (!shadow) {
        shadow = host.attachShadow({ mode: 'open' });
      }

      // Use constructable stylesheets when available; fallback keeps CSP nonce support.
      applyShadowStyles(shadow, fullConfig.nonce);

      // Render widget using h() instead of JSX
      render(
        h(ErrorBoundary, { onError: config.onError, children: h(ChatWidget, { config: fullConfig }) }),
        shadow as unknown as Element
      );
      
      DerinChat.instances.set(instanceId, host);
    } catch (error) {
      console.error('DerinChat initialization failed:', error);
      throw error;
    }
  }

  /**
   * Destroy the chat widget instance
   * Cleans up DOM elements and unmounts React components
   * Note: localStorage data is preserved
   */
  static destroy(instanceId = 'default') {
    // SSR Guard
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const hostId = DerinChat.createHostId(instanceId);
    const host = document.getElementById(hostId);

    if (host && host.shadowRoot) {
      // Unmount Preact app
      render(null, host.shadowRoot as unknown as Element);

      // Remove host element
      host.remove();
    }

    DerinChat.instances.delete(instanceId);
  }
  
  /**
   * Clear the persisted chat history for the given instance
   * @param instanceId - The ID of the instance to clear history for
   */
  static clearHistory(instanceId = 'default') {
    if (typeof window !== 'undefined') {
      clearMessages(instanceId);
      // Dispatch an event so the active React tree can reload its state if currently open
      window.dispatchEvent(new CustomEvent('derin-chat-clear-history', { detail: { instanceId } }));
    }
  }

  /**
   * Load external history messages into the active chat widget (Hydration)
   * @param messages - Array of Message objects retrieved from a database
   * @param instanceId - The ID of the instance to load messages into
   */
  static loadMessages(messages: Message[], instanceId = 'default') {
    if (typeof window !== 'undefined') {
      // Dispatch an event so the active React tree can inject the new messages into its state
      window.dispatchEvent(
        new CustomEvent('derin-chat-load-messages', {
          detail: { instanceId, messages },
        })
      );
    }
  }

  /**
   * Check if widget is currently active
   * @returns {boolean} True if widget is initialized
   */
  static isActive(instanceId = 'default'): boolean {
    return DerinChat.instances.has(instanceId);
  }
}

// Make it globally available
if (typeof window !== 'undefined') {
  (window as unknown as Window & { DerinChat: typeof DerinChat }).DerinChat = DerinChat;
}

export default DerinChat;
