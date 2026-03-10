// WebSocket Manager Tests - Type Safety & API

import { describe, it, expect, vi } from 'vitest';
import { WebSocketManager } from './websocket';
import type { WebSocketConfig, ConnectionStatus } from '../types/connection';

describe('WebSocketManager - Type Safety', () => {
    it('should accept valid WebSocket configuration', () => {
        const config: WebSocketConfig = {
            url: 'ws://localhost:8080',
            reconnect: true,
            reconnectInterval: 3000,
            maxReconnectAttempts: 5,
            heartbeatInterval: 30000,
        };

        expect(() => new WebSocketManager(config)).not.toThrow();
    });

    it('should have correct API methods', () => {
        const config: WebSocketConfig = {
            url: 'ws://localhost:8080',
        };

        const manager = new WebSocketManager(config);

        // Check API exists
        expect(typeof manager.connect).toBe('function');
        expect(typeof manager.disconnect).toBe('function');
        expect(typeof manager.send).toBe('function');
        expect(typeof manager.on).toBe('function');
        expect(typeof manager.off).toBe('function');
        expect(typeof manager.getStatus).toBe('function');
        expect(typeof manager.isConnected).toBe('function');
        expect(typeof manager.destroy).toBe('function');

        manager.destroy();
    });

    it('should return valid connection status', () => {
        const config: WebSocketConfig = {
            url: 'ws://localhost:8080',
        };

        const manager = new WebSocketManager(config);
        const status = manager.getStatus();

        const validStatuses: ConnectionStatus[] = [
            'idle',
            'connecting',
            'connected',
            'disconnected',
            'reconnecting',
            'failed',
        ];

        expect(validStatuses).toContain(status);
        manager.destroy();
    });

    it('should handle event registration', () => {
        const config: WebSocketConfig = {
            url: 'ws://localhost:8080',
        };

        const manager = new WebSocketManager(config);
        const callback = vi.fn();

        expect(() => manager.on('statusChange', callback)).not.toThrow();
        expect(() => manager.off('statusChange', callback)).not.toThrow();

        manager.destroy();
    });

    it('should cleanup resources on destroy', () => {
        const config: WebSocketConfig = {
            url: 'ws://localhost:8080',
        };

        const manager = new WebSocketManager(config);
        expect(() => manager.destroy()).not.toThrow();
    });
});
