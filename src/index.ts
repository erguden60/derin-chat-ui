import { render, h } from 'preact';
import { ChatWidget, ErrorBoundary } from './components';
import { validateConfig } from './utils/validators';
import { mergeConfig } from './utils/helpers';
import type { ChatConfig } from './types';
import styles from './styles/main.scss?inline';

// Re-export types
export type { ChatConfig, Message, ApiResponse } from './types';

/**
 * DerinChat - Embeddable AI Chat Widget SDK
 * 
 * Singleton Pattern: Only one instance per page is supported.
 * Calling init() multiple times will replace the existing instance.
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
  private static instance: boolean = false;
  
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
      // Singleton warning
      if (DerinChat.instance) {
        console.warn('⚠️ DerinChat: Widget already initialized. Replacing existing instance.');
        DerinChat.destroy();
      }
      
      // Validate configuration
      validateConfig(config);

      // Merge with defaults
      const fullConfig = mergeConfig(config);

      // Create or get host element
      const hostId = 'derin-chat-host';
      let host = document.getElementById(hostId);

      if (!host) {
        host = document.createElement('div');
        host.id = hostId;
        document.body.appendChild(host);
      }

      // Create or get shadow root
      let shadow = host.shadowRoot;
      if (!shadow) {
        shadow = host.attachShadow({ mode: 'open' });
      }

      // Update styles
      const oldStyle = shadow.querySelector('style');
      if (oldStyle) oldStyle.remove();

      const styleTag = document.createElement('style');
      styleTag.textContent = styles;
      shadow.appendChild(styleTag);

      // Render widget using h() instead of JSX
      render(
        h(ErrorBoundary, { onError: config.onError, children: h(ChatWidget, { config: fullConfig }) }),
        shadow as any
      );
      
      // Mark instance as active
      DerinChat.instance = true;
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
  static destroy() {
    // SSR Guard
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const hostId = 'derin-chat-host';
    const host = document.getElementById(hostId);

    if (host && host.shadowRoot) {
      // Unmount Preact app
      render(null, host.shadowRoot as any);

      // Remove host element
      host.remove();
      
      // Mark instance as inactive
      DerinChat.instance = false;
    }
  }
  
  /**
   * Check if widget is currently active
   * @returns {boolean} True if widget is initialized
   */
  static isActive(): boolean {
    return DerinChat.instance;
  }
}

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).DerinChat = DerinChat;
}

export default DerinChat;
