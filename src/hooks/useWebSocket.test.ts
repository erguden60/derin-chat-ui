// useWebSocket Hook Tests - Type Safety & API

import { act, renderHook } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatConfig, ConnectionEventMap } from '../types';
import { useWebSocket } from './useWebSocket';

type Listener = (data?: unknown) => void;

const mockManagers = vi.hoisted(() => [] as MockWebSocketManager[]);
const MockWebSocketManager = vi.hoisted(() =>
    vi.fn(function (this: MockWebSocketManager, config) {
        const listeners = new Map<keyof ConnectionEventMap, Set<Listener>>();
        Object.assign(this, {
            config,
            connect: vi.fn().mockResolvedValue(undefined),
            destroy: vi.fn(),
            send: vi.fn(),
            disconnect: vi.fn(),
            isConnected: vi.fn().mockReturnValue(false),
            on: vi.fn((event: keyof ConnectionEventMap, callback: Listener) => {
                if (!listeners.has(event)) {
                    listeners.set(event, new Set());
                }
                listeners.get(event)!.add(callback);
            }),
            emit: (event: keyof ConnectionEventMap, data?: unknown) => {
                listeners.get(event)?.forEach((callback) => callback(data));
            },
        });

        mockManagers.push(this);
    })
);

type MockWebSocketManager = {
    config: unknown;
    connect: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    isConnected: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    emit: (event: keyof ConnectionEventMap, data?: unknown) => void;
};

vi.mock('../utils/websocket', () => ({
    WebSocketManager: MockWebSocketManager,
}));

const createConfig = (overrides: Partial<ChatConfig> = {}) =>
    ({
        connection: {
            mode: 'websocket',
            websocket: {
                url: 'ws://localhost:8080',
                reconnect: true,
                reconnectInterval: 3000,
                maxReconnectAttempts: 5,
                heartbeatInterval: 30000,
            },
            ...overrides.connection,
        },
        user: {},
        ui: {
            position: 'bottom-right',
            zIndex: 99999,
            fontFamily: 'system-ui',
            colors: {},
            texts: {},
        },
        features: {
            images: true,
            quickReplies: true,
            agentMode: true,
            markdown: true,
            fileUpload: false,
            timestamps: true,
            avatars: true,
        },
        behavior: {
            openOnLoad: false,
            closeOnOutsideClick: true,
            persistSession: true,
            maxMessages: 100,
        },
        messageFormat: {
            textField: 'reply',
            imageField: 'image',
            quickRepliesField: 'quickReplies',
            actionsField: 'actions',
            agentField: 'agent',
            typeField: 'type',
        },
        ...overrides,
    }) as Required<ChatConfig>;

const latestManager = () => mockManagers[mockManagers.length - 1];

beforeEach(() => {
    mockManagers.length = 0;
    MockWebSocketManager.mockClear();
});

describe('useWebSocket Hook - Type Safety', () => {
    it('should have correct WebSocket configuration types', () => {
        const config = createConfig();

        // Type check passes
        expect(config.connection?.mode).toBe('websocket');
        expect(config.connection?.websocket?.url).toBe('ws://localhost:8080');
    });

    it('should support HTTP mode', () => {
        const config: Partial<ChatConfig> = {
            apiUrl: 'https://api.example.com/chat',
            apiKey: 'test-key',
        };

        expect(config.apiUrl).toBe('https://api.example.com/chat');
    });

    it('should support auto-fallback mode', () => {
        const config: Partial<ChatConfig> = {
            connection: {
                mode: 'auto',
                websocket: {
                    url: 'wss://api.example.com/chat',
                },
            },
            apiUrl: 'https://api.example.com/chat', // Fallback
        };

        expect(config.connection?.mode).toBe('auto');
        expect(config.apiUrl).toBeDefined();
    });
});

describe('useWebSocket Hook - Lifecycle', () => {
    it('does not create a WebSocket manager when disabled', () => {
        renderHook(() =>
            useWebSocket({
                config: createConfig(),
                enabled: false,
            })
        );

        expect(MockWebSocketManager).not.toHaveBeenCalled();
    });

    it('does not create a WebSocket manager without a websocket URL', () => {
        renderHook(() =>
            useWebSocket({
                config: createConfig({
                    connection: {
                        mode: 'websocket',
                        websocket: undefined,
                    },
                }),
                enabled: true,
            })
        );

        expect(MockWebSocketManager).not.toHaveBeenCalled();
    });

    it('creates a manager, subscribes to events, and connects when enabled', () => {
        const config = createConfig();

        renderHook(() =>
            useWebSocket({
                config,
                enabled: true,
            })
        );

        const manager = latestManager();

        expect(MockWebSocketManager).toHaveBeenCalledWith(config.connection.websocket);
        expect(manager.on).toHaveBeenCalledWith('statusChange', expect.any(Function));
        expect(manager.on).toHaveBeenCalledWith('message', expect.any(Function));
        expect(manager.on).toHaveBeenCalledWith('error', expect.any(Function));
        expect(manager.on).toHaveBeenCalledWith('reconnecting', expect.any(Function));
        expect(manager.on).toHaveBeenCalledWith('reconnected', expect.any(Function));
        expect(manager.connect).toHaveBeenCalledTimes(1);
    });

    it('destroys the manager when the hook unmounts', () => {
        const { unmount } = renderHook(() =>
            useWebSocket({
                config: createConfig(),
                enabled: true,
            })
        );

        const manager = latestManager();

        unmount();

        expect(manager.destroy).toHaveBeenCalledTimes(1);
    });

    it('recreates the manager when the websocket URL changes', () => {
        const initialConfig = createConfig();
        const nextConfig = createConfig({
            connection: {
                mode: 'websocket',
                websocket: {
                    url: 'ws://localhost:9090',
                },
            },
        });

        const { rerender } = renderHook(
            ({ config }) =>
                useWebSocket({
                    config,
                    enabled: true,
                }),
            {
                initialProps: { config: initialConfig },
            }
        );

        const firstManager = latestManager();

        rerender({ config: nextConfig });

        expect(firstManager.destroy).toHaveBeenCalledTimes(1);
        expect(MockWebSocketManager).toHaveBeenCalledTimes(2);
        expect(latestManager().config).toBe(nextConfig.connection.websocket);
    });
});

describe('useWebSocket Hook - Events and API', () => {
    it('updates status and notifies config when the manager status changes', () => {
        const onConnectionChange = vi.fn();
        const { result } = renderHook(() =>
            useWebSocket({
                config: createConfig({ onConnectionChange }),
                enabled: true,
            })
        );

        act(() => {
            latestManager().emit('statusChange', 'connected');
        });

        expect(result.current.status).toBe('connected');
        expect(onConnectionChange).toHaveBeenCalledWith('connected');
    });

    it('forwards incoming messages to onMessage', () => {
        const onMessage = vi.fn();
        renderHook(() =>
            useWebSocket({
                config: createConfig(),
                onMessage,
                enabled: true,
            })
        );

        const payload = { reply: 'Merhaba' };

        act(() => {
            latestManager().emit('message', payload);
        });

        expect(onMessage).toHaveBeenCalledWith(payload);
    });

    it('forwards error and reconnection events to config callbacks', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const onError = vi.fn();
        const onReconnecting = vi.fn();
        const onReconnected = vi.fn();

        renderHook(() =>
            useWebSocket({
                config: createConfig({
                    onError,
                    onReconnecting,
                    onReconnected,
                }),
                enabled: true,
            })
        );

        const error = new Error('socket failed');

        act(() => {
            latestManager().emit('error', error);
            latestManager().emit('reconnecting', 2);
            latestManager().emit('reconnected');
        });

        expect(onError).toHaveBeenCalledWith(error);
        expect(onReconnecting).toHaveBeenCalledWith(2);
        expect(onReconnected).toHaveBeenCalledTimes(1);

        consoleError.mockRestore();
    });

    it('exposes send, reconnect, disconnect, and isConnected from the manager', () => {
        const { result, rerender } = renderHook(() =>
            useWebSocket({
                config: createConfig(),
                enabled: true,
            })
        );
        const manager = latestManager();
        const message = { type: 'message' as const, data: { text: 'test' } };

        act(() => {
            result.current.send(message);
            result.current.reconnect();
            result.current.disconnect();
        });

        expect(manager.send).toHaveBeenCalledWith(message);
        expect(manager.connect).toHaveBeenCalledTimes(2);
        expect(manager.disconnect).toHaveBeenCalledTimes(1);

        manager.isConnected.mockReturnValue(true);
        rerender();

        expect(result.current.isConnected).toBe(true);
    });

    it('reports connection failures through onError', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('connect failed');
        const onError = vi.fn();

        MockWebSocketManager.mockImplementationOnce(function (
            this: MockWebSocketManager,
            config
        ) {
            Object.assign(this, {
                config,
                connect: vi.fn().mockRejectedValue(error),
                destroy: vi.fn(),
                send: vi.fn(),
                disconnect: vi.fn(),
                isConnected: vi.fn().mockReturnValue(false),
                on: vi.fn(),
                emit: vi.fn(),
            });
            mockManagers.push(this);
        });

        renderHook(() =>
            useWebSocket({
                config: createConfig({ onError }),
                enabled: true,
            })
        );

        await vi.waitFor(() => {
            expect(onError).toHaveBeenCalledWith(error);
        });

        consoleError.mockRestore();
    });
});
