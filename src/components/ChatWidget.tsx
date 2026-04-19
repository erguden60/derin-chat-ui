// Main Chat Widget Component

import { useEffect, useRef, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import type { ChatConfig } from '../types';
import { ChatWindow } from './ChatWindow';
import { Launcher } from './Launcher';
import { ErrorToast } from './ErrorToast';
import { useChatState } from '../hooks';

interface ChatWidgetProps {
  config: Required<ChatConfig>;
}

export function ChatWidget({ config }: ChatWidgetProps) {
  const {
    isOpen,
    messages,
    inputValue,
    isLoading,
    fileAttachment,
    connectionStatus, // WebSocket connection status
    unreadCount, // Unread message count
    reconnectConnection,
    setIsOpen,
    setInputValue,
    setFileAttachment,
    handleSend,
    handleQuickReply,
    handleCopy,
    handleEdit,
    handleFeedback,
    handleRegenerate,
    handleClearChat,
    handleStopGenerating,
  } = useChatState(config);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Derived theme and layout values
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>(
    config.ui?.theme === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    if (config.ui?.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setActiveTheme(mediaQuery.matches ? 'dark' : 'light');
      
      const handler = (e: MediaQueryListEvent) => {
        setActiveTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setActiveTheme(config.ui?.theme === 'dark' ? 'dark' : 'light');
    }
  }, [config.ui?.theme]);

  const activeLayout = config.ui?.layout || 'normal';

  const toggleChat = () => {
    const newState = !isOpen;
    setIsOpen(newState);

    // Focus management
      if (newState) {
        config.onChatOpened?.();
        // Focus input after animation
        setTimeout(() => {
          const input = chatWindowRef.current?.querySelector('textarea, input') as
            | HTMLTextAreaElement
            | HTMLInputElement
            | null;
          input?.focus();
        }, 300);
      } else {
      config.onChatClosed?.();
    }
  };

  // Show error in chat (instead of alert)
  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // Keyboard shortcuts: ESC to close, Ctrl/Cmd+K to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC - Close chat
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        config.onChatClosed?.();
      }

      // Ctrl/Cmd + K - Toggle chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleChat();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Hook for reporting browser tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const cb = config.onVisibilityChange ?? config.events?.onVisibilityChange;
      cb?.(document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [config.onVisibilityChange, config.events]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen || !config.behavior?.closeOnOutsideClick) return;

    const handleClickOutside = (e: MouseEvent) => {
      // Use composedPath() for Shadow DOM compatibility
      const path = e.composedPath();

      // Check if any element in the path is the widget
      const clickedInsideWidget = path.some((el) => el === widgetRef.current);

      if (!clickedInsideWidget) {
        setIsOpen(false);
        config.onChatClosed?.();
      }
    };

    // Delay to avoid immediate close on open
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // CSS Variables
  const texts = config.ui?.texts || config.ui.texts;
  const colors = config.ui?.colors || {};
  
  const dynamicStyles: JSX.CSSProperties & Record<`--${string}`, string | number> = {
    zIndex: config.ui?.zIndex || 99999,
    ...(config.ui?.position === 'bottom-left'
      ? { left: '20px', right: 'auto', alignItems: 'flex-start' }
      : { right: '20px', left: 'auto', alignItems: 'flex-end' }),
  };

  if (colors.primary) dynamicStyles['--primary'] = colors.primary;
  if (colors.headerBg) dynamicStyles['--header-bg'] = colors.headerBg;
  if (colors.headerText) dynamicStyles['--header-text'] = colors.headerText;
  if (colors.userMessageBg) dynamicStyles['--user-bg'] = colors.userMessageBg;
  if (colors.userMessageText) dynamicStyles['--user-text'] = colors.userMessageText;
  if (colors.botMessageBg) dynamicStyles['--bot-bg'] = colors.botMessageBg;
  if (colors.botMessageText) dynamicStyles['--bot-text'] = colors.botMessageText;
  if (colors.background) dynamicStyles['--bg-color'] = colors.background;
  if (colors.inputBg) dynamicStyles['--input-bg'] = colors.inputBg;
  if (colors.inputText) dynamicStyles['--input-text'] = colors.inputText;
  if (config.ui?.fontFamily) dynamicStyles['--font-family'] = config.ui.fontFamily;

  return (
    <div
      ref={widgetRef}
      className={`derin-widget-container derin-theme-${activeTheme} derin-layout-${activeLayout}`}
      style={dynamicStyles}
      role="region"
      aria-label="Chat widget"
    >
      {isOpen && (
        <div ref={chatWindowRef} style={{ position: 'relative' }}>
          {errorMessage && (
            <ErrorToast message={errorMessage} onClose={() => setErrorMessage(null)} />
          )}
          <ChatWindow
            isOpen={isOpen}
            config={config}
            messages={messages}
            inputValue={inputValue}
            isLoading={isLoading}
            fileAttachment={fileAttachment}
            connectionStatus={connectionStatus}
            onClose={toggleChat}
            onInputChange={setInputValue}
            onSend={handleSend}
            onQuickReplySelect={handleQuickReply}
            onCopy={handleCopy}
            onEdit={handleEdit}
            onFeedback={handleFeedback}
            onRegenerate={handleRegenerate}
            onFileSelect={setFileAttachment}
            onFileRemove={() => setFileAttachment(undefined)}
            onError={showError}
            onClearChat={handleClearChat}
            onStopGenerating={handleStopGenerating}
            onReconnect={reconnectConnection}
          />
        </div>
      )}

      <Launcher
        isOpen={isOpen}
        onClick={toggleChat}
        ariaLabel={isOpen ? texts?.closeChat : texts?.openChat}
        unreadCount={unreadCount}
        unreadBadgeConfig={config.unreadBadge}
        title={texts?.title}
        subtitle={texts?.subtitle}
      />
    </div>
  );
}
