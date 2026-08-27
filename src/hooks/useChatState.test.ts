// useChatState Hook Tests - main chat orchestration

import { act, renderHook } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatConfig, Message } from '../types';
import type { FileAttachment } from '../components/FileUpload';
import { useChatState } from './useChatState';
import { usePersistence } from './usePersistence';
import { useWebSocket } from './useWebSocket';
import {
  loadIsOpen,
  loadMessages,
  loadSessionId,
  loadUnreadCount,
  saveSessionId,
} from '../utils/storage';

const chatStateMocks = vi.hoisted(() => ({
  messageSenderOptions: [] as Array<Record<string, unknown>>,
  webSocketOptions: [] as Array<Record<string, unknown>>,
  persistenceOptions: [] as Array<Record<string, unknown>>,
  sendUserMessage: vi.fn().mockResolvedValue(undefined),
  stopGenerating: vi.fn(),
  wsSend: vi.fn(),
  reconnect: vi.fn(),
  connectionStatus: 'idle',
  senderIsLoading: false,
}));

vi.mock('./useMessageSender', () => ({
  useMessageSender: vi.fn((options) => {
    chatStateMocks.messageSenderOptions.push(options);
    return {
      isLoading: chatStateMocks.senderIsLoading,
      sendUserMessage: chatStateMocks.sendUserMessage,
      stopGenerating: chatStateMocks.stopGenerating,
    };
  }),
}));

vi.mock('./usePersistence', () => ({
  usePersistence: vi.fn((options) => {
    chatStateMocks.persistenceOptions.push(options);
  }),
}));

vi.mock('./useWebSocket', () => ({
  useWebSocket: vi.fn((options) => {
    chatStateMocks.webSocketOptions.push(options);
    return {
      status: chatStateMocks.connectionStatus,
      send: chatStateMocks.wsSend,
      reconnect: chatStateMocks.reconnect,
    };
  }),
}));

vi.mock('../utils/storage', () => ({
  loadMessages: vi.fn(),
  loadIsOpen: vi.fn(),
  loadUnreadCount: vi.fn(),
  loadSessionId: vi.fn(),
  saveSessionId: vi.fn(),
}));

const createMessage = (
  id: string,
  sender: Message['sender'] = 'bot',
  text = `Message ${id}`
): Message => ({
  id,
  text,
  sender,
  timestamp: `2026-01-01T00:00:0${id}.000Z`,
});

const createConfig = (overrides: Partial<ChatConfig> = {}) =>
  ({
    instanceId: 'chat-1',
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
      ...overrides.user,
    },
    ui: {
      position: 'bottom-right',
      zIndex: 99999,
      fontFamily: 'system-ui',
      colors: {},
      texts: {},
      ...overrides.ui,
    },
    features: {
      history: false,
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
      persistSessionId: true,
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

const latestMessageSenderOptions = () =>
  chatStateMocks.messageSenderOptions[chatStateMocks.messageSenderOptions.length - 1];

const latestWebSocketOptions = () =>
  chatStateMocks.webSocketOptions[chatStateMocks.webSocketOptions.length - 1];

const setupChatState = (overrides: Partial<ChatConfig> = {}) => {
  const config = createConfig(overrides);
  const hook = renderHook(() => useChatState(config));

  return {
    config,
    ...hook,
  };
};

describe('useChatState Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chatStateMocks.messageSenderOptions.length = 0;
    chatStateMocks.webSocketOptions.length = 0;
    chatStateMocks.persistenceOptions.length = 0;
    chatStateMocks.connectionStatus = 'idle';
    chatStateMocks.senderIsLoading = false;

    vi.mocked(loadMessages).mockReturnValue(null);
    vi.mocked(loadIsOpen).mockReturnValue(false);
    vi.mocked(loadUnreadCount).mockReturnValue(0);
    vi.mocked(loadSessionId).mockReturnValue('session-1');
    chatStateMocks.sendUserMessage.mockResolvedValue(undefined);
  });

  it('initializes from persisted chat state when persistence is enabled', () => {
    const persistedMessages = [createMessage('p1', 'bot'), createMessage('p2', 'user')];
    vi.mocked(loadMessages).mockReturnValue(persistedMessages);
    vi.mocked(loadIsOpen).mockReturnValue(false);
    vi.mocked(loadUnreadCount).mockReturnValue(3);

    const { result } = setupChatState();

    expect(result.current.messages).toEqual(persistedMessages);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.unreadCount).toBe(3);
    expect(latestMessageSenderOptions()).toMatchObject({
      sessionId: 'session-1',
      messages: persistedMessages,
    });
    expect(usePersistence).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        instanceId: 'chat-1',
      })
    );
  });

  it('creates an intro message and saves a new session id when none exists', () => {
    vi.mocked(loadSessionId).mockReturnValue(null);

    const { result } = setupChatState();

    expect(result.current.messages).toEqual([
      expect.objectContaining({
        id: 'intro',
        text: 'Hello Emirhan!',
        sender: 'bot',
      }),
    ]);
    expect(saveSessionId).toHaveBeenCalledWith(expect.any(String), 'chat-1');
  });

  it('creates a runtime session id without storage when persistSessionId is false', () => {
    setupChatState({
      behavior: {
        persistSessionId: false,
      },
    });

    expect(loadSessionId).not.toHaveBeenCalled();
    expect(saveSessionId).not.toHaveBeenCalled();
    expect(latestMessageSenderOptions()).toMatchObject({
      sessionId: expect.any(String),
    });
  });

  it('can disable session id persistence while keeping message history persistence enabled', () => {
    const persistedMessages = [createMessage('p1', 'bot')];
    vi.mocked(loadMessages).mockReturnValue(persistedMessages);

    const { result } = setupChatState({
      features: {
        history: true,
      },
      behavior: {
        persistSession: false,
        persistSessionId: false,
      },
    });

    expect(result.current.messages).toEqual(persistedMessages);
    expect(loadSessionId).not.toHaveBeenCalled();
    expect(saveSessionId).not.toHaveBeenCalled();
    expect(usePersistence).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
      })
    );
  });

  it('sends trimmed input through the message sender and resets input state', async () => {
    const onBeforeMessageSend = vi.fn().mockResolvedValue('Transformed text');
    const onMessageSent = vi.fn();
    const { result } = setupChatState({
      onBeforeMessageSend,
      onMessageSent,
    });

    act(() => {
      result.current.setInputValue('  Hello  ');
    });

    await act(async () => {
      await result.current.handleSend();
    });

    expect(onBeforeMessageSend).toHaveBeenCalledWith('  Hello  ');
    expect(onMessageSent).toHaveBeenCalledWith('Transformed text');
    expect(chatStateMocks.sendUserMessage).toHaveBeenCalledWith('Transformed text', undefined);
    expect(result.current.inputValue).toBe('');
    expect(result.current.messages).toContainEqual(
      expect.objectContaining({
        text: 'Transformed text',
        sender: 'user',
      })
    );
  });

  it('does not send empty messages without an attachment', async () => {
    const { result } = setupChatState();

    await act(async () => {
      await result.current.handleSend();
    });

    expect(chatStateMocks.sendUserMessage).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(1);
  });

  it('stops sending when onBeforeMessageSend returns an empty value', async () => {
    const { result } = setupChatState({
      onBeforeMessageSend: vi.fn().mockResolvedValue(''),
    });

    act(() => {
      result.current.setInputValue('Hello');
    });

    await act(async () => {
      await result.current.handleSend();
    });

    expect(chatStateMocks.sendUserMessage).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(1);
  });

  it('creates image user messages from image attachments', async () => {
    const attachment: FileAttachment = {
      file: new File(['image-content'], 'avatar.png', { type: 'image/png' }),
      preview: 'data:image/png;base64,test',
      type: 'image',
      kind: 'image',
    };
    const { result } = setupChatState();

    act(() => {
      result.current.setFileAttachment(attachment);
    });

    await act(async () => {
      await result.current.handleSend();
    });

    expect(result.current.fileAttachment).toBeUndefined();
    expect(chatStateMocks.sendUserMessage).toHaveBeenCalledWith('[File: avatar.png]', attachment);
    expect(result.current.messages).toContainEqual(
      expect.objectContaining({
        text: '[File: avatar.png]',
        sender: 'user',
        image: {
          url: 'data:image/png;base64,test',
          alt: 'avatar.png',
        },
      })
    );
  });

  it('adds successful bot messages and increments unread count when closed', () => {
    const onUnreadCountChange = vi.fn();
    const { result } = setupChatState({
      onUnreadCountChange,
    });
    const botMessage = createMessage('b1', 'bot', 'Bot reply');

    act(() => {
      (latestMessageSenderOptions().onSuccess as (message: Message) => void)(botMessage);
    });

    expect(result.current.messages).toContainEqual(botMessage);
    expect(result.current.unreadCount).toBe(1);
    expect(onUnreadCountChange).toHaveBeenCalledWith(1);
  });

  it('clears unread count when chat is opened', () => {
    vi.mocked(loadUnreadCount).mockReturnValue(2);
    const onUnreadCountChange = vi.fn();
    const { result } = setupChatState({
      onUnreadCountChange,
    });

    act(() => {
      result.current.setIsOpen(true);
    });

    expect(result.current.unreadCount).toBe(0);
    expect(onUnreadCountChange).toHaveBeenCalledWith(0);
  });

  it('handles incoming WebSocket messages through the parser', () => {
    const onMessageReceived = vi.fn();
    const { result } = setupChatState({
      connection: {
        mode: 'websocket',
      },
      onMessageReceived,
    });

    act(() => {
      (latestMessageSenderOptions().onWsSend as () => void)();
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      (latestWebSocketOptions().onMessage as (data: unknown) => void)({
        reply: 'Socket reply',
        type: 'agent',
      });
    });

    expect(result.current.isLoading).toBe(false);
    expect(onMessageReceived).toHaveBeenCalledWith({
      reply: 'Socket reply',
      type: 'agent',
    });
    expect(result.current.messages).toContainEqual(
      expect.objectContaining({
        text: 'Socket reply',
        sender: 'agent',
      })
    );
  });

  it('does not pass wsSend to message sender when auto WebSocket status failed', () => {
    chatStateMocks.connectionStatus = 'failed';

    setupChatState({
      connection: {
        mode: 'auto',
      },
    });

    expect(useWebSocket).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
      })
    );
    expect(latestMessageSenderOptions().wsSend).toBeUndefined();
  });

  it('responds to external load and clear history events for the matching instance', () => {
    const loadedMessages = [createMessage('loaded', 'bot', 'Loaded message')];
    const { result } = setupChatState();

    act(() => {
      window.dispatchEvent(
        new CustomEvent('derin-chat-load-messages', {
          detail: {
            instanceId: 'chat-1',
            messages: loadedMessages,
          },
        })
      );
    });

    expect(result.current.messages).toEqual(loadedMessages);

    act(() => {
      window.dispatchEvent(
        new CustomEvent('derin-chat-clear-history', {
          detail: {
            instanceId: 'chat-1',
          },
        })
      );
    });

    expect(result.current.messages).toEqual([
      expect.objectContaining({
        id: 'intro',
        sender: 'bot',
      }),
    ]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('updates feedback and calls the feedback callback', () => {
    const onFeedback = vi.fn();
    const { result } = setupChatState({
      onFeedback,
    });
    const botMessage = createMessage('bot-1', 'bot', 'Reply');

    act(() => {
      (latestMessageSenderOptions().onSuccess as (message: Message) => void)(botMessage);
    });

    act(() => {
      result.current.handleFeedback('bot-1', 'positive');
    });

    expect(onFeedback).toHaveBeenCalledWith('bot-1', 'positive');
    expect(result.current.messages).toContainEqual(
      expect.objectContaining({
        id: 'bot-1',
        feedback: 'positive',
      })
    );
  });

  it('edits a message, truncates later history, and resends the edited content', async () => {
    const onMessageEdit = vi.fn();
    const { result } = setupChatState({
      onMessageEdit,
    });

    act(() => {
      (latestMessageSenderOptions().onSuccess as (message: Message) => void)(
        createMessage('bot-1', 'bot', 'First reply')
      );
    });
    act(() => {
      result.current.setInputValue('Original user');
    });
    await act(async () => {
      await result.current.handleSend();
    });
    act(() => {
      (latestMessageSenderOptions().onSuccess as (message: Message) => void)(
        createMessage('bot-2', 'bot', 'Second reply')
      );
    });

    const userMessage = result.current.messages.find((message) => message.sender === 'user')!;

    await act(async () => {
      await result.current.handleEdit(userMessage.id, 'Edited user');
    });

    expect(onMessageEdit).toHaveBeenCalledWith(userMessage.id, 'Edited user');
    expect(chatStateMocks.sendUserMessage).toHaveBeenLastCalledWith(
      'Edited user',
      undefined,
      true
    );
    expect(result.current.messages).toEqual([
      expect.objectContaining({ id: 'intro' }),
      expect.objectContaining({ id: 'bot-1' }),
      expect.objectContaining({
        id: userMessage.id,
        text: 'Edited user',
        isEdited: true,
      }),
    ]);
  });

  it('regenerates from the previous user message', async () => {
    const onRegenerate = vi.fn();
    const { result } = setupChatState({
      onRegenerate,
    });

    act(() => {
      result.current.setInputValue('Please answer');
    });
    await act(async () => {
      await result.current.handleSend();
    });
    act(() => {
      (latestMessageSenderOptions().onSuccess as (message: Message) => void)(
        createMessage('bot-1', 'bot', 'Answer')
      );
    });

    await act(async () => {
      await result.current.handleRegenerate('bot-1');
    });

    expect(onRegenerate).toHaveBeenCalledWith('bot-1');
    expect(chatStateMocks.sendUserMessage).toHaveBeenLastCalledWith('Please answer');
  });

  it('clears chat to a fresh intro message and calls onChatClear', () => {
    const onChatClear = vi.fn();
    const { result } = setupChatState({
      onChatClear,
    });

    act(() => {
      (latestMessageSenderOptions().onSuccess as (message: Message) => void)(
        createMessage('bot-1', 'bot', 'Reply')
      );
    });

    act(() => {
      result.current.handleClearChat();
    });

    expect(onChatClear).toHaveBeenCalledTimes(1);
    expect(result.current.messages).toEqual([
      expect.objectContaining({
        id: 'intro',
        text: 'Hello Emirhan!',
      }),
    ]);
  });

  it('delegates reconnect and stopGenerating actions', () => {
    const { result } = setupChatState();

    act(() => {
      result.current.reconnectConnection();
      result.current.handleStopGenerating();
    });

    expect(chatStateMocks.reconnect).toHaveBeenCalledTimes(1);
    expect(chatStateMocks.stopGenerating).toHaveBeenCalledTimes(1);
  });
});
