import { describe, it, expect, vi, beforeEach } from 'vitest';
import DerinChat from './index';

describe('DerinChat Detailed Event System', () => {
  beforeEach(() => {
    // Clear DOM and instances
    document.body.innerHTML = '';
    // Call internal destroy method of all instances just to be safe
    if(DerinChat.isActive()) {
      DerinChat.destroy();
    }
  });

  it('should trigger onVisibilityChange when document visibility changes', async () => {
    const onVisibilityChangeMock = vi.fn();

    DerinChat.init({
      target: document.body,
      apiUrl: 'https://api.example.com',
      events: {
        onVisibilityChange: onVisibilityChangeMock,
      }
    });

    // the component renders async or mounts need to be flushed.
    // However, vitest happy path works if we trigger simple events or wait for tick
    await new Promise(r => setTimeout(r, 10));
    
    // Simulate tab blur / background
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(onVisibilityChangeMock).toHaveBeenCalledWith(true);

    // Simulate tab focus / foreground
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(onVisibilityChangeMock).toHaveBeenCalledWith(false);
  });

  it('should trigger onUserTyping when text is typed', () => {
    const onUserTypingMock = vi.fn();

    DerinChat.init({
      target: document.body,
      apiUrl: 'https://api.example.com',
      behavior: { openOnLoad: true },
      events: {
        onUserTyping: onUserTypingMock,
      }
    });

    const host = document.getElementById('derin-chat-host');
    const textarea = host?.shadowRoot?.querySelector('textarea');
    
    expect(textarea).not.toBeNull();

    if (textarea) {
      textarea.value = 'M';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      
      expect(onUserTypingMock).toHaveBeenCalled();
    }
  });
});
