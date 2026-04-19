// Message state management

import { useState } from 'preact/hooks';
import type { Message } from '../types';
import { generateId } from '../utils/helpers';

interface UseMessagesOptions {
  initialMessages: Message[];
  maxMessages?: number;
}

export function useMessages({ initialMessages, maxMessages = 100 }: UseMessagesOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const addMessage = (message: Message) => {
    setMessages((prev) => {
      const newMessages = [...prev, message];
      return newMessages.length > maxMessages ? newMessages.slice(-maxMessages) : newMessages;
    });
  };

  const updateMessage = (id: string, partialData: Partial<Message>) => {
    setMessages((prev) => 
      prev.map(msg => msg.id === id ? { ...msg, ...partialData } : msg)
    );
  };

  const removeMessagesAfter = (id: string, inclusive = false) => {
    setMessages((prev) => {
      const idx = prev.findIndex(msg => msg.id === id);
      if (idx === -1) return prev;
      return inclusive ? prev.slice(0, idx) : prev.slice(0, idx + 1);
    });
  };

  const clearMessages = (fallback?: Message[]) => {
    setMessages(fallback || initialMessages);
  };

  const setMessagesList = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  const createUserMessage = (
    text: string,
    extras?: Partial<Omit<Message, 'id' | 'text' | 'sender' | 'timestamp'>>
  ): Message => ({
    id: generateId(),
    text,
    sender: 'user',
    timestamp: new Date().toISOString(),
    ...extras,
  });

  const createErrorMessage = (text: string): Message => ({
    id: generateId(),
    text,
    sender: 'system',
    timestamp: new Date().toISOString(),
  });

  return {
    messages,
    addMessage,
    updateMessage,
    removeMessagesAfter,
    clearMessages,
    setMessagesList,
    createUserMessage,
    createErrorMessage,
  };
}
