// useMessageSender Hook Tests - transport selection and message delivery

import { act, renderHook } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatConfig, Message } from '../types';
import type { FileAttachment } from '../components/FileUpload';
import { sendMessage } from '../utils/api';
import { useMessageSender } from './useMessageSender';

vi.mock('../utils/api', () => ({
  sendMessage: vi.fn(),
}));

const createMessage = (id: string, sender: Message['sender'] = 'user'): Message => ({
  id,
  text: `Message ${id}`,
  sender,
  timestamp: `2026-01-01T00:00:0${id}.000Z`,
});

const createConfig = (overrides: Partial<ChatConfig> = {}) =>
  ({
    apiUrl: 'https://api.example.com/chat',
    apiKey: 'test-key',
    mock: false,
    connection: {
      mode: 'http',
      ...overrides.connection,
    },
    user: {
      id: 'user-1',
      name: 'Emirhan',
      hash: 'user-hash',
      ...overrides.user,
    },
    ui: {
      position: 'bottom-right',
      zIndex: 99999,
      fontFamily: 'system-ui',
      colors: {},
      texts: {
        errorMessage: 'Custom connection error.',
        rateLimitError: 'Slow down.',
      },
      ...overrides.ui,
    },
    features: {
      images: true,
      quickReplies: true,
      agentMode: true,
      markdown: true,
      fileUpload: true,
      timestamps: true,
      avatars: true,
      ...overrides.features,
    },
    behavior: {
      openOnLoad: false,
      closeOnOutsideClick: true,
      persistSession: true,
      maxMessages: 100,
      ...overrides.behavior,
    },
    messageFormat: {
      textField: 'reply',
      imageField: 'image',
      quickRepliesField: 'quickReplies',
      actionsField: 'actions',
      agentField: 'agent',
      typeField: 'type',
      ...overrides.messageFormat,
    },
    ...overrides,
  }) as Required<ChatConfig>;

const setupHook = (
  options: Partial<Parameters<typeof useMessageSender>[0]> = {},
  config: Required<ChatConfig> = createConfig()
) => {
  const onSuccess = vi.fn();
  const onError = vi.fn();
  const updateMessage = vi.fn();

  const result = renderHook(() =>
    useMessageSender({
      config,
      messages: [createMessage('1'), createMessage('2', 'bot')],
      sessionId: 'session-1',
      onSuccess,
      onError,
      updateMessage,
      ...options,
    })
  );

  return {
    ...result,
    onSuccess,
    onError,
    updateMessage,
  };
};

const flushTimersAndPromise = async (promise: Promise<void>) => {
  await vi.runAllTimersAsync();
  await promise;
};

describe('useMessageSender Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:10.000Z'));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('sends through WebSocket when websocket mode has an available sender', async () => {
    const wsSend = vi.fn();
    const onWsSend = vi.fn();
    const { result } = setupHook(
      {
        wsSend,
        onWsSend,
        connectionStatus: 'connected',
      },
      createConfig({
        connection: {
          mode: 'websocket',
        },
      })
    );

    await act(async () => {
      await result.current.sendUserMessage('Hello socket');
    });

    expect(wsSend).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'message',
        data: expect.objectContaining({
          text: 'Hello socket',
          user: expect.objectContaining({ id: 'user-1' }),
          sessionId: 'session-1',
          timestamp: expect.any(String),
        }),
      })
    );
    expect(onWsSend).toHaveBeenCalledTimes(1);
  });

  it('includes file data in WebSocket payloads', async () => {
    const wsSend = vi.fn();
    const attachment: FileAttachment = {
      file: new File(['pdf-content'], 'terms.pdf', { type: 'application/pdf' }),
      preview: 'data:application/pdf;base64,test',
      type: 'pdf',
    };
    const { result } = setupHook(
      {
        wsSend,
      },
      createConfig({
        connection: {
          mode: 'websocket',
        },
      })
    );

    await act(async () => {
      await result.current.sendUserMessage('With file', attachment);
    });

    expect(wsSend).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          file: {
            name: 'terms.pdf',
            type: 'application/pdf',
            size: attachment.file.size,
            data: 'data:application/pdf;base64,test',
          },
        }),
      })
    );
  });

  it('reports an error when websocket mode has no sender', async () => {
    const { result, onError } = setupHook(
      {
        connectionStatus: 'reconnecting',
      },
      createConfig({
        connection: {
          mode: 'websocket',
        },
      })
    );

    await act(async () => {
      await result.current.sendUserMessage('Hello');
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        sender: 'system',
        text: 'Connection is still being established. Please wait a moment and try again.',
      }),
      expect.objectContaining({
        message: 'WebSocket unavailable',
      })
    );
  });

  it('reports an error when auto mode has neither WebSocket nor HTTP fallback', async () => {
    const { result, onError } = setupHook(
      {},
      createConfig({
        apiUrl: undefined,
        connection: {
          mode: 'auto',
        },
      })
    );

    await act(async () => {
      await result.current.sendUserMessage('Hello');
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        sender: 'system',
        text: 'Automatic fallback is unavailable because no HTTP apiUrl is configured.',
      }),
      expect.objectContaining({
        message: 'Auto mode fallback unavailable',
      })
    );
  });

  it('returns a UI-only response when apiUrl and mock are missing', async () => {
    const { result, onSuccess } = setupHook(
      {},
      createConfig({
        apiUrl: undefined,
        mock: false,
      })
    );

    await act(async () => {
      const promise = result.current.sendUserMessage('Hello');
      await flushTimersAndPromise(promise);
    });

    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        sender: 'bot',
        text: 'Widget is in UI-only mode. Configure apiUrl or mock to enable responses.',
      })
    );
  });

  it('uses custom mock handler responses', async () => {
    const handler = vi.fn().mockResolvedValue('Mock reply');
    const { result, onSuccess } = setupHook(
      {},
      createConfig({
        mock: {
          handler,
        },
      })
    );

    await act(async () => {
      const promise = result.current.sendUserMessage('Hello mock');
      await flushTimersAndPromise(promise);
    });

    expect(handler).toHaveBeenCalledWith(
      'Hello mock',
      expect.objectContaining({
        user: expect.objectContaining({ id: 'user-1' }),
        history: [createMessage('1'), createMessage('2', 'bot')],
      })
    );
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        sender: 'bot',
        text: 'Mock reply',
      })
    );
  });

  it('normalizes message-like mock handler responses', async () => {
    const mockMessage: Message = {
      id: 'mock-message',
      text: 'Already shaped',
      sender: 'agent',
      timestamp: '2026-01-01T00:00:00.000Z',
      agent: {
        name: 'Agent Ada',
      },
    };
    const { result, onSuccess } = setupHook(
      {},
      createConfig({
        mock: {
          handler: vi.fn().mockResolvedValue(mockMessage),
        },
      })
    );

    await act(async () => {
      const promise = result.current.sendUserMessage('Hello mock');
      await flushTimersAndPromise(promise);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockMessage);
  });

  it('calls HTTP API and parses the response', async () => {
    const onMessageReceived = vi.fn();
    vi.mocked(sendMessage).mockResolvedValue({
      reply: 'API reply',
      quickReplies: [{ label: 'Yes', value: 'yes' }],
    });
    const { result, onSuccess } = setupHook(
      {},
      createConfig({
        onMessageReceived,
      })
    );

    await act(async () => {
      await result.current.sendUserMessage('Hello API');
    });

    expect(sendMessage).toHaveBeenCalledWith(
      'https://api.example.com/chat',
      {
        message: 'Hello API',
        sessionId: 'session-1',
        user: {
          id: 'user-1',
          name: 'Emirhan',
          hash: 'user-hash',
        },
        history: [
          { text: 'Message 1', sender: 'user', timestamp: '2026-01-01T00:00:01.000Z' },
          { text: 'Message 2', sender: 'bot', timestamp: '2026-01-01T00:00:02.000Z' },
        ],
      },
      'test-key',
      expect.any(AbortSignal)
    );
    expect(onMessageReceived).toHaveBeenCalledWith({
      reply: 'API reply',
      quickReplies: [{ label: 'Yes', value: 'yes' }],
    });
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        sender: 'bot',
        text: 'API reply',
        quickReplies: [{ label: 'Yes', value: 'yes' }],
      })
    );
  });

  it('falls back to HTTP in auto mode when WebSocket sender is unavailable', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(sendMessage).mockResolvedValue({
      reply: 'Fallback reply',
    });
    const { result, onSuccess } = setupHook(
      {
        connectionStatus: 'failed',
      },
      createConfig({
        connection: {
          mode: 'auto',
        },
      })
    );

    await act(async () => {
      await result.current.sendUserMessage('Hello fallback');
    });

    expect(consoleWarn).toHaveBeenCalledWith('Auto mode: Falling back to HTTP (WebSocket unavailable)');
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Fallback reply',
      })
    );
  });

  it('reports HTTP failures through onError and config.onError', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Network failed');
    const onConfigError = vi.fn();
    vi.mocked(sendMessage).mockRejectedValue(error);
    const { result, onError } = setupHook(
      {
        connectionStatus: 'connected',
      },
      createConfig({
        onError: onConfigError,
      })
    );

    await act(async () => {
      await result.current.sendUserMessage('Hello API');
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        sender: 'system',
        text: 'Custom connection error.',
      }),
      error
    );
    expect(onConfigError).toHaveBeenCalledWith(error);
    consoleError.mockRestore();
  });

  it('enforces the cooldown rate limit', async () => {
    const wsSend = vi.fn();
    const { result, onError } = setupHook(
      {
        wsSend,
      },
      createConfig({
        connection: {
          mode: 'websocket',
        },
      })
    );

    await act(async () => {
      await result.current.sendUserMessage('First');
      await result.current.sendUserMessage('Second');
    });

    expect(wsSend).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        sender: 'system',
        text: 'Slow down.',
      }),
      expect.objectContaining({
        message: 'Rate limit exceeded',
      })
    );
  });

  it('streams mock responses through updateMessage', async () => {
    const { result, onSuccess, updateMessage } = setupHook(
      {},
      createConfig({
        mock: {
          handler: vi.fn().mockResolvedValue('one two'),
        },
        connection: {
          mode: 'http',
          stream: true,
        },
      })
    );

    await act(async () => {
      const promise = result.current.sendUserMessage('Stream please');
      await flushTimersAndPromise(promise);
    });

    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        text: '',
        isStreaming: true,
      })
    );
    const streamedMessageId = onSuccess.mock.calls[0][0].id;
    expect(updateMessage).toHaveBeenCalledWith(streamedMessageId, {
      text: 'one',
      isStreaming: true,
    });
    expect(updateMessage).toHaveBeenCalledWith(streamedMessageId, {
      text: 'one two',
      isStreaming: true,
    });
    expect(updateMessage).toHaveBeenCalledWith(streamedMessageId, {
      isStreaming: false,
    });
  });

  it('streams SSE responses split across network chunks', async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"Hel'));
        controller.enqueue(encoder.encode('lo"}}]}\n'));
        controller.enqueue(encoder.encode('data: {"text":" world"}\n'));
        controller.enqueue(encoder.encode('data: [DONE]\n'));
        controller.close();
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        body,
      })
    );
    const { result, onSuccess, updateMessage } = setupHook(
      {},
      createConfig({
        connection: {
          mode: 'http',
          stream: true,
        },
      })
    );

    await act(async () => {
      await result.current.sendUserMessage('Stream from SSE');
    });

    const streamedMessageId = onSuccess.mock.calls[0][0].id;
    expect(updateMessage).toHaveBeenCalledWith(streamedMessageId, {
      text: 'Hello',
      isStreaming: true,
    });
    expect(updateMessage).toHaveBeenCalledWith(streamedMessageId, {
      text: 'Hello world',
      isStreaming: true,
    });
    expect(updateMessage).toHaveBeenLastCalledWith(streamedMessageId, {
      isStreaming: false,
    });
  });

  it('streams non-SSE raw text chunks when endpoint does not use event framing', async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('plain '));
        controller.enqueue(encoder.encode('text'));
        controller.close();
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        body,
      })
    );
    const { result, onSuccess, updateMessage } = setupHook(
      {},
      createConfig({
        connection: {
          mode: 'http',
          stream: true,
        },
      })
    );

    await act(async () => {
      await result.current.sendUserMessage('Stream raw text');
    });

    const streamedMessageId = onSuccess.mock.calls[0][0].id;
    expect(updateMessage).toHaveBeenCalledWith(streamedMessageId, {
      text: 'plain ',
      isStreaming: true,
    });
    expect(updateMessage).toHaveBeenCalledWith(streamedMessageId, {
      text: 'plain text',
      isStreaming: true,
    });
    expect(updateMessage).toHaveBeenLastCalledWith(streamedMessageId, {
      isStreaming: false,
    });
  });

  it('aborts an in-flight HTTP request when stopGenerating is called', async () => {
    vi.mocked(sendMessage).mockReturnValue(new Promise(() => {}));
    const { result } = setupHook();

    act(() => {
      void result.current.sendUserMessage('Long request');
    });

    expect(result.current.isLoading).toBe(true);
    const signal = vi.mocked(sendMessage).mock.calls[0][3] as AbortSignal;
    expect(signal.aborted).toBe(false);

    act(() => {
      result.current.stopGenerating();
    });

    expect(signal.aborted).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });
});
