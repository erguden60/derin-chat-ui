// WebSocket Connection Types

export type ConnectionMode = 'http' | 'websocket' | 'auto';

export type ConnectionStatus =
    | 'idle'
    | 'connecting'
    | 'connected'
    | 'disconnected'
    | 'reconnecting'
    | 'failed';

export interface WebSocketConfig {
    /** WebSocket server URL (wss://...) */
    url: string;

    /** WebSocket protocols */
    protocols?: string | string[];

    /** Enable auto-reconnection */
    reconnect?: boolean;

    /** Reconnection interval in milliseconds */
    reconnectInterval?: number;

    /** Maximum reconnection attempts (0 = infinite) */
    maxReconnectAttempts?: number;

    /** Heartbeat/ping interval in milliseconds */
    heartbeatInterval?: number;

    /** Custom headers for WebSocket handshake */
    headers?: Record<string, string>;
}

export interface ConnectionConfig {
    /** Connection mode */
    mode?: ConnectionMode;

    /** WebSocket configuration (required if mode is 'websocket' or 'auto') */
    websocket?: WebSocketConfig;
    
    /** Enable SSE streaming text generation (Supported by most LLM endpoints) */
    stream?: boolean;
}

// WebSocket Message Protocol

export type WebSocketMessageType =
    | 'message' // User/bot message
    | 'ping' // Heartbeat ping
    | 'pong' // Heartbeat pong
    | 'typing' // Typing indicator
    | 'status' // Status update
    | 'error'; // Error message

export interface WebSocketMessage {
    type: WebSocketMessageType;
    data?: any;
    timestamp?: string;
}

// Connection Events

export interface ConnectionEventMap {
    statusChange: ConnectionStatus;
    message: any;
    error: Error;
    reconnecting: number; // attempt number
    reconnected: void;
}
