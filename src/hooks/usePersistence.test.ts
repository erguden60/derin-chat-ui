// usePersistence Hook Tests - localStorage persistence orchestration

import { renderHook } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Message } from '../types';
import { usePersistence } from './usePersistence';
import { saveIsOpen, saveMessages, saveUnreadCount } from '../utils/storage';

vi.mock('../utils/storage', () => ({
  saveMessages: vi.fn(),
  saveIsOpen: vi.fn(),
  saveUnreadCount: vi.fn(),
}));

const createMessage = (id: string): Message => ({
  id,
  text: `Message ${id}`,
  sender: 'bot',
  timestamp: `2026-01-01T00:00:0${id}.000Z`,
});

describe('usePersistence Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not persist anything when disabled', () => {
    renderHook(() =>
      usePersistence({
        enabled: false,
        messages: [createMessage('1'), createMessage('2')],
        isOpen: true,
        unreadCount: 3,
        instanceId: 'disabled-instance',
      })
    );

    expect(saveMessages).not.toHaveBeenCalled();
    expect(saveIsOpen).not.toHaveBeenCalled();
    expect(saveUnreadCount).not.toHaveBeenCalled();
  });

  it('persists isOpen and unreadCount when enabled', () => {
    renderHook(() =>
      usePersistence({
        enabled: true,
        messages: [createMessage('intro')],
        isOpen: true,
        unreadCount: 5,
        instanceId: 'chat-1',
      })
    );

    expect(saveIsOpen).toHaveBeenCalledWith(true, 'chat-1');
    expect(saveUnreadCount).toHaveBeenCalledWith(5, 'chat-1');
  });

  it('does not persist messages when there is only one message', () => {
    renderHook(() =>
      usePersistence({
        enabled: true,
        messages: [createMessage('intro')],
        isOpen: false,
        unreadCount: 0,
        instanceId: 'chat-1',
      })
    );

    expect(saveMessages).not.toHaveBeenCalled();
  });

  it('persists messages when there is more than one message', () => {
    const messages = [createMessage('intro'), createMessage('2')];

    renderHook(() =>
      usePersistence({
        enabled: true,
        messages,
        isOpen: false,
        unreadCount: 0,
        instanceId: 'chat-1',
      })
    );

    expect(saveMessages).toHaveBeenCalledWith(messages, 'chat-1');
  });

  it('does not persist unreadCount when it is undefined', () => {
    renderHook(() =>
      usePersistence({
        enabled: true,
        messages: [createMessage('intro')],
        isOpen: false,
        instanceId: 'chat-1',
      })
    );

    expect(saveUnreadCount).not.toHaveBeenCalled();
  });

  it('uses the default instance id when none is provided', () => {
    const messages = [createMessage('intro'), createMessage('2')];

    renderHook(() =>
      usePersistence({
        enabled: true,
        messages,
        isOpen: false,
        unreadCount: 2,
      })
    );

    expect(saveMessages).toHaveBeenCalledWith(messages, 'default');
    expect(saveIsOpen).toHaveBeenCalledWith(false, 'default');
    expect(saveUnreadCount).toHaveBeenCalledWith(2, 'default');
  });

  it('persists updated values after rerender', () => {
    const initialMessages = [createMessage('intro')];
    const nextMessages = [createMessage('intro'), createMessage('2')];

    const { rerender } = renderHook(
      ({ messages, isOpen, unreadCount }) =>
        usePersistence({
          enabled: true,
          messages,
          isOpen,
          unreadCount,
          instanceId: 'chat-1',
        }),
      {
        initialProps: {
          messages: initialMessages,
          isOpen: false,
          unreadCount: 0,
        },
      }
    );

    vi.clearAllMocks();

    rerender({
      messages: nextMessages,
      isOpen: true,
      unreadCount: 4,
    });

    expect(saveMessages).toHaveBeenCalledWith(nextMessages, 'chat-1');
    expect(saveIsOpen).toHaveBeenCalledWith(true, 'chat-1');
    expect(saveUnreadCount).toHaveBeenCalledWith(4, 'chat-1');
  });
});
