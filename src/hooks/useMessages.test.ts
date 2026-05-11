// useMessages Hook Tests - Message state mutations

import { act, renderHook } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import type { Message } from '../types';
import { useMessages } from './useMessages';

const createMessage = (
  id: string,
  overrides: Partial<Omit<Message, 'id' | 'text' | 'sender' | 'timestamp'>> = {}
): Message => ({
  id,
  text: `Message ${id}`,
  sender: 'bot',
  timestamp: `2026-01-01T00:00:0${id}.000Z`,
  ...overrides,
});

describe('useMessages Hook', () => {
  it('initializes with the provided messages', () => {
    const initialMessages = [createMessage('1'), createMessage('2')];

    const { result } = renderHook(() =>
      useMessages({
        initialMessages,
      })
    );

    expect(result.current.messages).toEqual(initialMessages);
  });

  it('adds a message to the end of the list', () => {
    const initialMessages = [createMessage('1')];
    const nextMessage = createMessage('2');

    const { result } = renderHook(() =>
      useMessages({
        initialMessages,
      })
    );

    act(() => {
      result.current.addMessage(nextMessage);
    });

    expect(result.current.messages).toEqual([initialMessages[0], nextMessage]);
  });

  it('keeps only the newest messages when maxMessages is exceeded', () => {
    const { result } = renderHook(() =>
      useMessages({
        initialMessages: [createMessage('1'), createMessage('2')],
        maxMessages: 3,
      })
    );

    act(() => {
      result.current.addMessage(createMessage('3'));
      result.current.addMessage(createMessage('4'));
    });

    expect(result.current.messages.map((message) => message.id)).toEqual(['2', '3', '4']);
  });

  it('updates only the message matching the provided id', () => {
    const { result } = renderHook(() =>
      useMessages({
        initialMessages: [createMessage('1'), createMessage('2')],
      })
    );

    act(() => {
      result.current.updateMessage('2', {
        text: 'Updated message',
        feedback: 'positive',
      });
    });

    expect(result.current.messages).toEqual([
      createMessage('1'),
      {
        ...createMessage('2'),
        text: 'Updated message',
        feedback: 'positive',
      },
    ]);
  });

  it('leaves messages unchanged when update id is not found', () => {
    const initialMessages = [createMessage('1'), createMessage('2')];

    const { result } = renderHook(() =>
      useMessages({
        initialMessages,
      })
    );

    act(() => {
      result.current.updateMessage('missing', {
        text: 'Should not be applied',
      });
    });

    expect(result.current.messages).toEqual(initialMessages);
  });

  it('removes messages after the given id by default', () => {
    const { result } = renderHook(() =>
      useMessages({
        initialMessages: [createMessage('1'), createMessage('2'), createMessage('3')],
      })
    );

    act(() => {
      result.current.removeMessagesAfter('2');
    });

    expect(result.current.messages.map((message) => message.id)).toEqual(['1', '2']);
  });

  it('removes the matching message too when inclusive is true', () => {
    const { result } = renderHook(() =>
      useMessages({
        initialMessages: [createMessage('1'), createMessage('2'), createMessage('3')],
      })
    );

    act(() => {
      result.current.removeMessagesAfter('2', true);
    });

    expect(result.current.messages.map((message) => message.id)).toEqual(['1']);
  });

  it('leaves messages unchanged when removeMessagesAfter id is not found', () => {
    const initialMessages = [createMessage('1'), createMessage('2')];

    const { result } = renderHook(() =>
      useMessages({
        initialMessages,
      })
    );

    act(() => {
      result.current.removeMessagesAfter('missing');
    });

    expect(result.current.messages).toEqual(initialMessages);
  });

  it('clears messages back to initial messages when no fallback is provided', () => {
    const initialMessages = [createMessage('intro')];

    const { result } = renderHook(() =>
      useMessages({
        initialMessages,
      })
    );

    act(() => {
      result.current.addMessage(createMessage('2'));
      result.current.clearMessages();
    });

    expect(result.current.messages).toEqual(initialMessages);
  });

  it('clears messages to the provided fallback list', () => {
    const fallbackMessages = [createMessage('fallback')];

    const { result } = renderHook(() =>
      useMessages({
        initialMessages: [createMessage('intro')],
      })
    );

    act(() => {
      result.current.addMessage(createMessage('2'));
      result.current.clearMessages(fallbackMessages);
    });

    expect(result.current.messages).toEqual(fallbackMessages);
  });

  it('replaces the full message list', () => {
    const replacementMessages = [createMessage('new-1'), createMessage('new-2')];

    const { result } = renderHook(() =>
      useMessages({
        initialMessages: [createMessage('intro')],
      })
    );

    act(() => {
      result.current.setMessagesList(replacementMessages);
    });

    expect(result.current.messages).toEqual(replacementMessages);
  });

  it('creates user messages with generated metadata and extras', () => {
    const { result } = renderHook(() =>
      useMessages({
        initialMessages: [],
      })
    );

    const message = result.current.createUserMessage('Hello', {
      image: {
        url: 'data:image/png;base64,test',
        alt: 'screenshot.png',
      },
    });

    expect(message).toMatchObject({
      text: 'Hello',
      sender: 'user',
      image: {
        url: 'data:image/png;base64,test',
        alt: 'screenshot.png',
      },
    });
    expect(message.id).toEqual(expect.any(String));
    expect(message.timestamp).toEqual(expect.any(String));
  });

  it('creates system error messages with generated metadata', () => {
    const { result } = renderHook(() =>
      useMessages({
        initialMessages: [],
      })
    );

    const message = result.current.createErrorMessage('Something failed');

    expect(message).toMatchObject({
      text: 'Something failed',
      sender: 'system',
    });
    expect(message.id).toEqual(expect.any(String));
    expect(message.timestamp).toEqual(expect.any(String));
  });
});
