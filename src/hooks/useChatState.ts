// Chat State Management Hook - Main Orchestrator

import { useState, useEffect } from 'preact/hooks';
import type { ChatConfig } from '../types';
import type { FileAttachment } from '../components/FileUpload';
import { loadMessages, loadIsOpen, loadUnreadCount } from '../utils/storage';
import { useMessages } from './useMessages';
import { usePersistence } from './usePersistence';
import { useMessageSender } from './useMessageSender';
import { useWebSocket } from './useWebSocket';
import { parseApiResponse } from '../utils/messageParser';

export function useChatState(config: Required<ChatConfig>) {
  // Load persisted state
  const persistedMessages = config.behavior.persistSession ? loadMessages() : null;
  const persistedIsOpen =
    config.behavior.persistSession && !config.behavior.openOnLoad
      ? loadIsOpen()
      : config.behavior.openOnLoad;
  const persistedUnreadCount = config.behavior.persistSession ? loadUnreadCount() : 0;

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

  // Message management
  const { messages, addMessage, updateMessage, clearMessages, createUserMessage } = useMessages({
    initialMessages,
    maxMessages: config.behavior.maxMessages,
  });

  // Persistence
  usePersistence({
    enabled: Boolean(config.behavior.persistSession),
    messages,
    isOpen,
    unreadCount,
  });

  // WebSocket connection (if enabled)
  const isWebSocketEnabled =
    config.connection?.mode === 'websocket' || config.connection?.mode === 'auto';

  const { status: connectionStatus, send: wsSend } = useWebSocket({
    config,
    enabled: isWebSocketEnabled,
    onMessage: (data) => {
      // Handle incoming WebSocket message
      try {
        const botMessage = parseApiResponse(data, config);
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
  const { isLoading, sendUserMessage } = useMessageSender({
    config,
    messages,
    onSuccess: (botMessage) => addMessage(botMessage),
    onError: (errorMessage) => addMessage(errorMessage),
    updateMessage, // Pass down to allow streaming updates
    wsSend: shouldUseWebSocket ? wsSend : undefined, // Fallback to HTTP if WebSocket unavailable
    connectionStatus, // Pass status for auto-fallback logic
  });

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
    if ((!inputValue.trim() && !fileAttachment) || isLoading) return;

    const userText = inputValue || (fileAttachment ? `[File: ${fileAttachment.file.name}]` : '');

    // Create and add user message
    const userMessage = createUserMessage(userText, {
      ...(fileAttachment?.type === 'image' && fileAttachment.preview
        ? {
          image: { url: fileAttachment.preview, alt: fileAttachment.file.name },
        }
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
    setFileAttachment(undefined);

    // Call event hook
    config.onMessageSent?.(userText);

    // Send to backend
    await sendUserMessage(userText, fileAttachment);
  };

  const handleQuickReply = (value: string) => {
    setInputValue(value);
    setTimeout(() => handleSend(), 100);
  };

  const handleCopy = (messageId: string, text: string) => {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy text: ', err);
    });
    config.onMessageCopy?.(messageId, text);
  };

  const handleFeedback = (messageId: string, type: 'positive' | 'negative') => {
    updateMessage(messageId, { feedback: type });
    config.onFeedback?.(messageId, type);
  };

  const handleClearChat = () => {
    clearMessages();
    config.onChatClear?.();
  };

  return {
    isOpen,
    messages,
    inputValue,
    isLoading,
    fileAttachment,
    connectionStatus, // WebSocket connection status
    unreadCount, // Unread message count
    setIsOpen,
    setInputValue,
    setFileAttachment,
    handleSend,
    handleQuickReply,
    handleCopy,
    handleFeedback,
    handleClearChat,
  };
}
