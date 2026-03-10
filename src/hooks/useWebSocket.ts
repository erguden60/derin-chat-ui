// WebSocket State Management Hook

import { useState, useEffect, useRef } from 'preact/hooks';
import type { ChatConfig, ConnectionStatus, WebSocketMessage } from '../types';
import { WebSocketManager } from '../utils/websocket';

interface UseWebSocketOptions {
    config: Required<ChatConfig>;
    onMessage?: (data: any) => void;
    enabled: boolean; // Only create WebSocket if enabled
}

export function useWebSocket({ config, onMessage, enabled }: UseWebSocketOptions) {
    const [status, setStatus] = useState<ConnectionStatus>('idle');
    const wsManagerRef = useRef<WebSocketManager | null>(null);

    useEffect(() => {
        // Only initialize if WebSocket mode is enabled
        if (!enabled || !config.connection?.websocket?.url) {
            return;
        }

        const wsConfig = config.connection.websocket;
        const manager = new WebSocketManager(wsConfig);
        wsManagerRef.current = manager;

        // --- Event Listeners ---

        manager.on('statusChange', (newStatus) => {
            setStatus(newStatus);
            config.onConnectionChange?.(newStatus);
        });

        manager.on('message', (data) => {
            onMessage?.(data);
        });

        manager.on('error', (error) => {
            console.error('WebSocket error:', error);
            config.onError?.(error);
        });

        manager.on('reconnecting', (attempt) => {
            config.onReconnecting?.(attempt);
        });

        manager.on('reconnected', () => {
            config.onReconnected?.();
        });

        // --- Connect ---
        manager.connect().catch((error) => {
            console.error('Failed to connect WebSocket:', error);
            config.onError?.(error);
        });

        // --- Cleanup ---
        return () => {
            manager.destroy();
            wsManagerRef.current = null;
        };
    }, [enabled, config.connection?.websocket?.url]);

    // --- Public API ---

    const send = (message: WebSocketMessage) => {
        wsManagerRef.current?.send(message);
    };

    const reconnect = () => {
        wsManagerRef.current?.connect().catch((error) => {
            console.error('Manual reconnect failed:', error);
        });
    };

    const disconnect = () => {
        wsManagerRef.current?.disconnect();
    };

    const isConnected = wsManagerRef.current?.isConnected() ?? false;

    return {
        status,
        isConnected,
        send,
        reconnect,
        disconnect,
    };
}
