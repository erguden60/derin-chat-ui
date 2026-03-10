// LocalStorage utilities for session persistence

import type { Message } from '../types';

// Storage version for migration handling
const STORAGE_VERSION = 'v1';

const STORAGE_KEYS = {
  MESSAGES: `derin-chat-${STORAGE_VERSION}-messages`,
  SESSION_ID: `derin-chat-${STORAGE_VERSION}-session-id`,
  IS_OPEN: `derin-chat-${STORAGE_VERSION}-is-open`,
  UNREAD_COUNT: `derin-chat-${STORAGE_VERSION}-unread-count`,
} as const;

// Legacy keys for migration
const LEGACY_KEYS = {
  MESSAGES: 'derin-chat-messages',
  SESSION_ID: 'derin-chat-session-id',
  IS_OPEN: 'derin-chat-is-open',
  UNREAD_COUNT: 'derin-chat-unread-count',
} as const;

export function saveMessages(messages: Message[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (error) {
    console.warn('Failed to save messages to localStorage:', error);
  }
}

export function loadMessages(): Message[] | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    // Try loading from versioned key
    let data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    
    // Migration: Try legacy key if versioned key doesn't exist
    if (!data) {
      data = localStorage.getItem(LEGACY_KEYS.MESSAGES);
      if (data) {
        console.info('📦 Migrating messages from legacy storage to v1');
        // Migrate to new key
        localStorage.setItem(STORAGE_KEYS.MESSAGES, data);
        localStorage.removeItem(LEGACY_KEYS.MESSAGES);
      }
    }
    
    if (!data) return null;

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return null;

    // Basic shape validation
    const messages = parsed.filter((msg: unknown) => {
      if (typeof msg !== 'object' || msg === null) return false;
      const item = msg as Record<string, unknown>;
      return (
        typeof item.id === 'string' &&
        typeof item.text === 'string' &&
        typeof item.sender === 'string' &&
        typeof item.timestamp === 'string'
      );
    });

    return messages as Message[];
  } catch (error) {
    console.warn('Failed to load messages from localStorage:', error);
    return null;
  }
}

export function clearMessages(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  } catch (error) {
    console.warn('Failed to clear messages from localStorage:', error);
  }
}

export function saveSessionId(sessionId: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  } catch (error) {
    console.warn('Failed to save session ID:', error);
  }
}

export function loadSessionId(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    
    // Migration from legacy key
    if (!sessionId) {
      sessionId = localStorage.getItem(LEGACY_KEYS.SESSION_ID);
      if (sessionId) {
        localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
        localStorage.removeItem(LEGACY_KEYS.SESSION_ID);
      }
    }
    
    return sessionId;
  } catch (error) {
    console.warn('Failed to load session ID:', error);
    return null;
  }
}

export function saveIsOpen(isOpen: boolean): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.setItem(STORAGE_KEYS.IS_OPEN, String(isOpen));
  } catch (error) {
    console.warn('Failed to save chat state:', error);
  }
}

export function loadIsOpen(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    let isOpen = localStorage.getItem(STORAGE_KEYS.IS_OPEN);
    
    // Migration from legacy key
    if (!isOpen) {
      isOpen = localStorage.getItem(LEGACY_KEYS.IS_OPEN);
      if (isOpen) {
        localStorage.setItem(STORAGE_KEYS.IS_OPEN, isOpen);
        localStorage.removeItem(LEGACY_KEYS.IS_OPEN);
      }
    }
    
    return isOpen === 'true';
  } catch (error) {
    return false;
  }
}

// Unread Count Storage
export function saveUnreadCount(count: number): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.setItem(STORAGE_KEYS.UNREAD_COUNT, String(count));
  } catch (error) {
    console.warn('Failed to save unread count:', error);
  }
}

export function loadUnreadCount(): number {
  if (typeof window === 'undefined' || !window.localStorage) return 0;

  try {
    let count = localStorage.getItem(STORAGE_KEYS.UNREAD_COUNT);
    
    // Migration from legacy key
    if (!count) {
      count = localStorage.getItem(LEGACY_KEYS.UNREAD_COUNT);
      if (count) {
        localStorage.setItem(STORAGE_KEYS.UNREAD_COUNT, count);
        localStorage.removeItem(LEGACY_KEYS.UNREAD_COUNT);
      }
    }
    
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    return 0;
  }
}
