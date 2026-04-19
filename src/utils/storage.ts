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

function getStorageKeys(instanceId = 'default') {
  const suffix = instanceId === 'default' ? '' : `-${instanceId}`;

  return {
    MESSAGES: `${STORAGE_KEYS.MESSAGES}${suffix}`,
    SESSION_ID: `${STORAGE_KEYS.SESSION_ID}${suffix}`,
    IS_OPEN: `${STORAGE_KEYS.IS_OPEN}${suffix}`,
    UNREAD_COUNT: `${STORAGE_KEYS.UNREAD_COUNT}${suffix}`,
  } as const;
}

export function saveMessages(messages: Message[], instanceId = 'default'): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.setItem(getStorageKeys(instanceId).MESSAGES, JSON.stringify(messages));
  } catch (error) {
    console.warn('Failed to save messages to localStorage:', error);
  }
}

export function loadMessages(instanceId = 'default'): Message[] | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const keys = getStorageKeys(instanceId);
    // Try loading from versioned key
    let data = localStorage.getItem(keys.MESSAGES);
    
    // Migration: Try legacy key if versioned key doesn't exist
    if (!data && instanceId === 'default') {
      data = localStorage.getItem(LEGACY_KEYS.MESSAGES);
      if (data) {
        // Migrate to new key
        localStorage.setItem(keys.MESSAGES, data);
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

export function clearMessages(instanceId = 'default'): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.removeItem(getStorageKeys(instanceId).MESSAGES);
  } catch (error) {
    console.warn('Failed to clear messages from localStorage:', error);
  }
}

export function saveSessionId(sessionId: string, instanceId = 'default'): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.setItem(getStorageKeys(instanceId).SESSION_ID, sessionId);
  } catch (error) {
    console.warn('Failed to save session ID:', error);
  }
}

export function loadSessionId(instanceId = 'default'): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const keys = getStorageKeys(instanceId);
    let sessionId = localStorage.getItem(keys.SESSION_ID);
    
    // Migration from legacy key
    if (!sessionId && instanceId === 'default') {
      sessionId = localStorage.getItem(LEGACY_KEYS.SESSION_ID);
      if (sessionId) {
        localStorage.setItem(keys.SESSION_ID, sessionId);
        localStorage.removeItem(LEGACY_KEYS.SESSION_ID);
      }
    }
    
    return sessionId;
  } catch (error) {
    console.warn('Failed to load session ID:', error);
    return null;
  }
}

export function saveIsOpen(isOpen: boolean, instanceId = 'default'): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.setItem(getStorageKeys(instanceId).IS_OPEN, String(isOpen));
  } catch (error) {
    console.warn('Failed to save chat state:', error);
  }
}

export function loadIsOpen(instanceId = 'default'): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    const keys = getStorageKeys(instanceId);
    let isOpen = localStorage.getItem(keys.IS_OPEN);
    
    // Migration from legacy key
    if (!isOpen && instanceId === 'default') {
      isOpen = localStorage.getItem(LEGACY_KEYS.IS_OPEN);
      if (isOpen) {
        localStorage.setItem(keys.IS_OPEN, isOpen);
        localStorage.removeItem(LEGACY_KEYS.IS_OPEN);
      }
    }
    
    return isOpen === 'true';
  } catch {
    return false;
  }
}

// Unread Count Storage
export function saveUnreadCount(count: number, instanceId = 'default'): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.setItem(getStorageKeys(instanceId).UNREAD_COUNT, String(count));
  } catch (error) {
    console.warn('Failed to save unread count:', error);
  }
}

export function loadUnreadCount(instanceId = 'default'): number {
  if (typeof window === 'undefined' || !window.localStorage) return 0;

  try {
    const keys = getStorageKeys(instanceId);
    let count = localStorage.getItem(keys.UNREAD_COUNT);
    
    // Migration from legacy key
    if (!count && instanceId === 'default') {
      count = localStorage.getItem(LEGACY_KEYS.UNREAD_COUNT);
      if (count) {
        localStorage.setItem(keys.UNREAD_COUNT, count);
        localStorage.removeItem(LEGACY_KEYS.UNREAD_COUNT);
      }
    }
    
    return count ? parseInt(count, 10) : 0;
  } catch {
    return 0;
  }
}
