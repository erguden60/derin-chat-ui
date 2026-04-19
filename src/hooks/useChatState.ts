// Chat State Management Hook - Main Orchestrator

import { useState, useEffect } from 'preact/hooks';
import type { ChatConfig, Message } from '../types';
import type { ApiResponse } from '../types/api';
import type { FileAttachment } from '../components/FileUpload';
import { loadMessages, loadIsOpen, loadUnreadCount, loadSessionId, saveSessionId } from '../utils/storage';
import { useMessages } from './useMessages';
import { usePersistence } from './usePersistence';
import { useMessageSender } from './useMessageSender';
import { useWebSocket } from './useWebSocket';
import { parseApiResponse } from '../utils/messageParser';

export function useChatState(config: Required<ChatConfig>) {
  const instanceId = config.instanceId || 'default';

  const shouldPersist = config.features.history || config.behavior.persistSession;

  // Load persisted state
  const persistedMessages = shouldPersist ? loadMessages(instanceId) : null;
  const persistedIsOpen =
    shouldPersist && !config.behavior.openOnLoad
      ? loadIsOpen(instanceId)
      : config.behavior.openOnLoad;
  const persistedUnreadCount = shouldPersist ? loadUnreadCount(instanceId) : 0;

  // Initialize messages with intro or persisted data
  const initialMessages = persistedMessages || [
    {
      id: 'intro',
      text: `Hello${config.user?.name ? ' ' + config.user.name : ''}!`,
      sender: 'bot' as const,
      timestamp: new Date().toISOString(),
    },
  ];

  // State
  const [isOpen, setIsOpen] = useState<boolean>(persistedIsOpen || false);
  const [inputValue, setInputValue] = useState('');
  const [fileAttachment, setFileAttachment] = useState<FileAttachment | undefined>();
  const [unreadCount, setUnreadCount] = useState<number>(persistedUnreadCount);
  const [isWsLoading, setIsWsLoading] = useState(false);

  // Session ID — load from storage or generate a new one
  const sessionId = (() => {
    const existing = loadSessionId(instanceId);
    if (existing) return existing;
    const newId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    saveSessionId(newId, instanceId);
    return newId;
  })();

  // Message management
  const { messages, addMessage, updateMessage, clearMessages, setMessagesList, createUserMessage } = useMessages({
    initialMessages,
    maxMessages: config.behavior.maxMessages,
  });

  const generateIntroMessage = () => [{
    id: 'intro',
    text: `Hello${config.user?.name ? ' ' + config.user.name : ''}!`,
    sender: 'bot' as const,
    timestamp: new Date().toISOString(),
  }];

  // Persistence
  usePersistence({
    enabled: Boolean(shouldPersist),
    messages,
    isOpen,
    unreadCount,
    instanceId,
  });

  // Listen for external clear history commands
  useEffect(() => {
    const handleClearHistory = (e: Event) => {
      const customEvent = e as CustomEvent<{ instanceId: string }>;
      if (customEvent.detail?.instanceId === instanceId) {
        clearMessages();
        setUnreadCount(0);
      }
    };
    
    const handleLoadMessages = (e: Event) => {
      const customEvent = e as CustomEvent<{ instanceId: string, messages: Message[] }>;
      if (customEvent.detail?.instanceId === instanceId && Array.isArray(customEvent.detail?.messages)) {
        setMessagesList(customEvent.detail.messages);
        setUnreadCount(0);
      }
    };

    window.addEventListener('derin-chat-clear-history', handleClearHistory);
    window.addEventListener('derin-chat-load-messages', handleLoadMessages);
    return () => {
      window.removeEventListener('derin-chat-clear-history', handleClearHistory);
      window.removeEventListener('derin-chat-load-messages', handleLoadMessages);
    };
  }, [instanceId, clearMessages, setMessagesList]);

  // WebSocket connection (if enabled)
  const isWebSocketEnabled =
    config.connection?.mode === 'websocket' || config.connection?.mode === 'auto';

  const { status: connectionStatus, send: wsSend, reconnect } = useWebSocket({
    config,
    enabled: isWebSocketEnabled,
    onMessage: (data) => {
      // Handle incoming WebSocket message — clear WS loading indicator
      setIsWsLoading(false);
      try {
        const botMessage = parseApiResponse(data as ApiResponse, config);
        addMessage(botMessage);
        config.onMessageReceived?.(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    },
  });

  // AUTO mode: Fallback to HTTP if WebSocket fails
  const shouldUseWebSocket = 
    isWebSocketEnabled && 
    connectionStatus !== 'failed' && 
    connectionStatus !== 'disconnected';

  // Message sender
  const { isLoading: isHttpLoading, sendUserMessage, stopGenerating } = useMessageSender({
    config,
    messages,
    sessionId,
    onSuccess: (botMessage) => addMessage(botMessage),
    onError: (errorMessage) => addMessage(errorMessage),
    updateMessage,
    wsSend: shouldUseWebSocket ? wsSend : undefined,
    connectionStatus,
    onWsSend: () => setIsWsLoading(true), // Set loading when WS message dispatched
  });

  // Combined loading: HTTP loading OR waiting for WS bot response
  const isLoading = isHttpLoading || isWsLoading;

  // Unread Count Logic
  useEffect(() => {
    // Increment unread count when new bot message arrives and chat is closed
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Only count bot/agent messages, not user messages or intro
      if (
        (lastMessage.sender === 'bot' || lastMessage.sender === 'agent') &&
        lastMessage.id !== 'intro'
      ) {
        setUnreadCount((prev) => {
          const newCount = prev + 1;
          config.onUnreadCountChange?.(newCount);
          return newCount;
        });
      }
    }
  }, [messages, isOpen, config]);

  // Clear unread count when chat opens
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      setUnreadCount(0);
      config.onUnreadCountChange?.(0);
    }
  }, [isOpen]); // Only depend on isOpen, not unreadCount or config

  // Send message handler
  const handleSend = async () => {
    if (!(inputValue || '').trim() && !fileAttachment || isLoading) return;

    let currentInput = inputValue || (fileAttachment ? `[File: ${fileAttachment.file.name}]` : '');
    
    if (config.onBeforeMessageSend) {
      try {
        currentInput = await config.onBeforeMessageSend(currentInput);
        // If developer returns empty string or falsy, halt execution
        if (!currentInput && !fileAttachment) return;
      } catch (error) {
        console.error('DerinChat Error in onBeforeMessageSend hook:', error);
        return; // Halt sending if error occurs
      }
    }

    const userMessage = createUserMessage(currentInput, {
      ...(fileAttachment?.type === 'image' && fileAttachment.preview
        ? { image: { url: fileAttachment.preview, alt: fileAttachment.file.name } }
        : {}),
      ...(fileAttachment && fileAttachment.type !== 'image'
        ? {
            file: {
              url: fileAttachment.preview || '',
              name: fileAttachment.file.name,
              size: fileAttachment.file.size,
              type: fileAttachment.type,
            },
          }
        : {}),
    });

    addMessage(userMessage);
    setInputValue('');
    setFileAttachment(undefined); // Clear file after sending

    config.onMessageSent?.(currentInput);
    await sendUserMessage(currentInput, fileAttachment);
  };

  const handleQuickReply = (reply: unknown) => {
    if (!reply || typeof reply !== 'string') return;
    setInputValue(reply);
    setTimeout(() => handleSend(), 100);
  };

  const handleCopy = (messageId: string, text: string) => {
    let copied = false;

    // 1. Try modern clipboard API
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (!copied) {
          copied = true;
          config.onMessageCopy?.(messageId, text);
        }
      }).catch((error) => {
        console.error('Clipboard API failed: ', error);
      });
    }

    // 2. Synchronous fallback (essential for some environments to catch the original click event)
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      
      if (success && !copied) {
        copied = true;
        config.onMessageCopy?.(messageId, text);
      }
    } catch (error) {
      console.warn('Fallback copy failed: ', error);
    }
  };

  const handleFeedback = (messageId: string, type: 'positive' | 'negative') => {
    updateMessage(messageId, { feedback: type });
    config.onFeedback?.(messageId, type);
  };

  const handleRegenerate = async (messageId: string) => {
    if (isLoading) return;
    
    const targetIdx = messages.findIndex((m) => m.id === messageId);
    if (targetIdx === -1) return;

    let userMessageText = '';
    for (let i = targetIdx - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        userMessageText = messages[i].text;
        break;
      }
    }

    if (!userMessageText) {
      console.warn('DerinChat: User message not found to regenerate.');
      return;
    }

    config.onRegenerate?.(messageId);
    await sendUserMessage(userMessageText);
  };

  const handleClearChat = () => {
    clearMessages(generateIntroMessage());
    config.onChatClear?.();
  };

  const handleEdit = async (messageId: string, newContent: string) => {
    // Bulunan mesajı güncelle ve sonrasında gelenleri sil
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    // Geçmişi sadece düzenlenen mesaja kadar kırp
    const newMessages = messages.slice(0, messageIndex + 1);
    // Düzenlenmiş mesaja güncel bilgiyi ekle
    newMessages[messageIndex] = {
      ...newMessages[messageIndex],
      text: newContent,
      isEdited: true
    };
    
    setMessagesList(newMessages);
    
    if (config.onMessageEdit) {
      config.onMessageEdit(messageId, newContent);
    }
    
    // API/Bot akışını yeniden tetikle
    await sendUserMessage(newContent, undefined, true);
  };

  return {
    isOpen,
    messages,
    inputValue,
    isLoading,
    fileAttachment,
    connectionStatus, // WebSocket connection status
    unreadCount, // Unread message count
    reconnectConnection: reconnect,
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
    handleStopGenerating: stopGenerating,
  };
}
