// Persistence logic for localStorage

import { useEffect } from 'preact/hooks';
import type { Message } from '../types';
import { saveMessages, saveIsOpen, saveUnreadCount } from '../utils/storage';

interface UsePersistenceOptions {
  enabled: boolean;
  messages: Message[];
  isOpen: boolean;
  unreadCount?: number;
}

export function usePersistence({ enabled, messages, isOpen, unreadCount }: UsePersistenceOptions) {
  // Persist messages
  useEffect(() => {
    if (enabled && messages.length > 1) {
      saveMessages(messages);
    }
  }, [messages, enabled]);

  // Persist isOpen state
  useEffect(() => {
    if (enabled) {
      saveIsOpen(Boolean(isOpen));
    }
  }, [isOpen, enabled]);

  // Persist unread count
  useEffect(() => {
    if (enabled && unreadCount !== undefined) {
      saveUnreadCount(unreadCount);
    }
  }, [unreadCount, enabled]);
}
