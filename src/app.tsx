import { useState, useRef, useEffect } from 'preact/hooks';
import type { JSX } from 'preact';
import type { ChatConfig } from './main';
import { ChatIcon, CloseIcon, SendIcon } from './icons';

interface AppProps {
  config: ChatConfig;
}

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

export function App({ config }: AppProps) {
  // --- DEFAULT SETTINGS (DX: Looks good even if nothing is configured) ---
  const colors = {
    primary: config.ui?.colors?.primary || '#4F46E5',
    headerText: config.ui?.colors?.headerText || '#ffffff',
    userBg: config.ui?.colors?.userMessageBg || '#4F46E5',
    userText: config.ui?.colors?.userMessageText || '#ffffff',
    botBg: config.ui?.colors?.botMessageBg || '#ffffff',
    botText: config.ui?.colors?.botMessageText || '#1f2937',
    bg: config.ui?.colors?.background || '#ffffff',
  };

  const texts = {
    title: config.ui?.texts?.title || 'Support',
    subtitle: config.ui?.texts?.subtitle || 'Online',
    placeholder: config.ui?.texts?.placeholder || 'Type your message...',
    loading: config.ui?.texts?.loading || 'Typing...',
  };

  const fontFamily =
    config.ui?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const position = config.ui?.position || 'bottom-right';

  // --- STATE ---
  const [isOpen, setIsOpen] = useState(config.behavior?.openOnLoad || false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'intro',
      text: `Hello${config.user?.name ? ' ' + config.user.name : ''}!`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleClearChat = () => {
    setMessages([
      {
        id: 'intro',
        text: `Hello${config.user?.name ? ' ' + config.user.name : ''}!`,
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  // --- SEND LOGIC (MOCK vs REAL) ---
  const handleSend = async () => {
    if (!(inputValue || '').trim() || isLoading) return;

    // 1. Add user message
    const userText = inputValue;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: userText,
        sender: 'user',
        timestamp: new Date(),
      },
    ]);
    setInputValue('');
    setIsLoading(true);

    // --- SENARYO A: MOCK MODE (Backend Yok) ---
    if (config.mock) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: `Received: "${userText}"`,
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
      }, 800);
      return;
    }

    // --- SENARYO B: REAL API MODE ---
    try {
      if (!config.apiUrl) throw new Error('URL Yok');

      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          message: userText,
          user: config.user,
          history: messages,
        }),
      });

      if (!response.ok) throw new Error('API Error');
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: data.reply || 'Response received.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err',
          text: 'Connection error.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  // --- CREATE CSS VARIABLES ---
  const dynamicStyles = {
    '--primary': colors.primary,
    '--header-text': colors.headerText,
    '--user-bg': colors.userBg,
    '--user-text': colors.userText,
    '--bot-bg': colors.botBg,
    '--bot-text': colors.botText,
    '--bg-color': colors.bg,
    '--font-family': fontFamily,
    zIndex: config.ui?.zIndex || 99999,
    ...(position === 'bottom-left'
      ? { left: '20px', right: 'auto', alignItems: 'flex-start' }
      : { right: '20px', left: 'auto', alignItems: 'flex-end' }),
  } as JSX.CSSProperties;

  return (
    <div class="derin-widget-container" style={dynamicStyles}>
      <div class={`chat-window ${isOpen ? 'is-open' : ''}`}>
        {/* Header */}
        <div class="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {config.ui?.logo && <img src={config.ui.logo} class="header-logo" />}
            <div>
              <h3>{texts.title}</h3>
              <span class="status-indicator">{isLoading ? texts.loading : texts.subtitle}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button class="close-btn" onClick={handleClearChat} aria-label="Clear chat" title="Clear chat History" style={{ opacity: 0.7 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
            <button class="close-btn" onClick={toggleChat}>
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Mesajlar */}
        <div class="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} class={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {isLoading && <div class="message bot typing">...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div class="chat-input-area">
          <input
            type="text"
            placeholder={texts.placeholder}
            value={inputValue}
            onInput={(e) => setInputValue(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSend} disabled={!(inputValue || '').trim()}>
            <SendIcon />
          </button>
        </div>
      </div>

      <button class={`chat-launcher ${isOpen ? 'is-open' : ''}`} onClick={toggleChat}>
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
}
