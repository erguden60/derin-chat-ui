import { render } from 'preact';
import { ChatWidget } from './components';
import { validateConfig } from './utils/validators';
import { mergeConfig } from './utils/helpers';
import type { ChatConfig } from './types';
import styles from './styles/main.scss?inline';

// Re-export types
export type { ChatConfig, Message, ApiResponse } from './types';

class DerinChat {
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

      // Render widget
      render(<ChatWidget config={fullConfig} />, shadow as any);
    } catch (error) {
      console.error('DerinChat initialization failed:', error);
      throw error;
    }
  }

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
    }
  }
}

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).DerinChat = DerinChat;
}

export default DerinChat;
