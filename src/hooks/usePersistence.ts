// Persistence logic for localStorage

import { useEffect } from 'preact/hooks';
import type { Message } from '../types';
import { saveMessages, saveIsOpen, saveUnreadCount } from '../utils/storage';

interface UsePersistenceOptions {
  enabled: boolean;
  messages: Message[];
  isOpen: boolean;
  unreadCount?: number;
  instanceId?: string;
}

export function usePersistence({
  enabled,
  messages,
  isOpen,
  unreadCount,
  instanceId = 'default',
}: UsePersistenceOptions) {
  // Persist messages
  useEffect(() => {
    if (enabled && messages.length > 1) {
      saveMessages(messages, instanceId);
    }
  }, [messages, enabled, instanceId]);

  // Persist isOpen state
  useEffect(() => {
    if (enabled) {
      saveIsOpen(Boolean(isOpen), instanceId);
    }
  }, [isOpen, enabled, instanceId]);

  // Persist unread count
  useEffect(() => {
    if (enabled && unreadCount !== undefined) {
      saveUnreadCount(unreadCount, instanceId);
    }
  }, [unreadCount, enabled, instanceId]);
}
