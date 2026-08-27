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

function hexToRgbValue(hex?: string) {
  if (!hex) return null;

  const clean = hex.replace('#', '').trim();
  const expanded = clean.length === 3 ? clean.split('').map((char) => char + char).join('') : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null;

  return `${parseInt(expanded.slice(0, 2), 16)}, ${parseInt(expanded.slice(2, 4), 16)}, ${parseInt(expanded.slice(4, 6), 16)}`;
}

function normalizeHex(hex?: string) {
  if (!hex) return null;

  const clean = hex.replace('#', '').trim();
  const expanded = clean.length === 3 ? clean.split('').map((char) => char + char).join('') : clean;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null;
  return `#${expanded}`;
}

function getLuminance(hex: string) {
  const clean = hex.replace('#', '');
  const channels = [clean.slice(0, 2), clean.slice(2, 4), clean.slice(4, 6)].map((part) => {
    const value = parseInt(part, 16) / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function getContrastRatio(foreground: string, background: string) {
  const fg = getLuminance(foreground);
  const bg = getLuminance(background);
  const light = Math.max(fg, bg);
  const dark = Math.min(fg, bg);

  return (light + 0.05) / (dark + 0.05);
}

function getReadableTextColor(text: string, background?: string): string {
  const normalizedText = normalizeHex(text);
  const normalizedBackground = normalizeHex(background);

  if (!normalizedText || !normalizedBackground) return text;
  if (getContrastRatio(normalizedText, normalizedBackground) >= 4.5) return text;

  const blackContrast = getContrastRatio('#111827', normalizedBackground);
  const whiteContrast = getContrastRatio('#ffffff', normalizedBackground);

  return blackContrast >= whiteContrast ? '#111827' : '#ffffff';
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

  if (colors.primary) {
    dynamicStyles['--primary'] = colors.primary;
    const primaryRgb = hexToRgbValue(colors.primary);
    if (primaryRgb) dynamicStyles['--primary-rgb'] = primaryRgb;
  }
  if (colors.headerBg) dynamicStyles['--header-bg'] = colors.headerBg;
  if (colors.headerText) dynamicStyles['--header-text'] = getReadableTextColor(colors.headerText, colors.headerBg);
  if (colors.userMessageBg) dynamicStyles['--user-bg'] = colors.userMessageBg;
  if (colors.userMessageText) dynamicStyles['--user-text'] = getReadableTextColor(colors.userMessageText, colors.userMessageBg);
  if (colors.botMessageBg) dynamicStyles['--bot-bg'] = colors.botMessageBg;
  if (colors.botMessageText) dynamicStyles['--bot-text'] = getReadableTextColor(colors.botMessageText, colors.botMessageBg);
  if (colors.background) {
    dynamicStyles['--bg-color'] = colors.background;
    const bgRgb = hexToRgbValue(colors.background);
    if (bgRgb) dynamicStyles['--bg-color-rgb'] = bgRgb;
  }
  if (colors.inputBg) dynamicStyles['--input-bg'] = colors.inputBg;
  if (colors.inputText) dynamicStyles['--input-text'] = getReadableTextColor(colors.inputText, colors.inputBg);
  if (config.ui?.fontFamily) dynamicStyles['--font-family'] = config.ui.fontFamily;

  return (
    <div
      ref={widgetRef}
      className={`derin-widget-container derin-theme-${activeTheme} derin-layout-${activeLayout}`}
      style={dynamicStyles}
      role="region"
      aria-label={texts?.chatWidget || 'Chat widget'}
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
