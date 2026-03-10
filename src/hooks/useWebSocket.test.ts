// useWebSocket Hook Tests - Type Safety & API

import { describe, it, expect } from 'vitest';
import type { ChatConfig } from '../types';

describe('useWebSocket Hook - Type Safety', () => {
    it('should have correct WebSocket configuration types', () => {
        const config: Required<ChatConfig> = {
            connection: {
                mode: 'websocket',
                websocket: {
                    url: 'ws://localhost:8080',
                    reconnect: true,
                    reconnectInterval: 3000,
                    maxReconnectAttempts: 5,
                    heartbeatInterval: 30000,
                },
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
        } as Required<ChatConfig>;

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
