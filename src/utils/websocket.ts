// WebSocket Connection Manager

import type {
    WebSocketConfig,
    ConnectionStatus,
    WebSocketMessage,
    ConnectionEventMap,
} from '../types/connection';

type EventCallback<T = unknown> = (data: T) => void;

export class WebSocketManager {
    private ws: WebSocket | null = null;
    private config: Required<WebSocketConfig>;
    private status: ConnectionStatus = 'idle';
    private reconnectAttempts = 0;
    private reconnectTimer: number | null = null;
    private heartbeatTimer: number | null = null;
    private eventListeners: Map<keyof ConnectionEventMap, Set<EventCallback>> = new Map();
    private messageQueue: WebSocketMessage[] = [];
    private isIntentionallyClosed = false;

    constructor(config: WebSocketConfig) {
        // Merge with defaults
        this.config = {
            url: config.url,
            protocols: config.protocols || [],
            reconnect: config.reconnect ?? true,
            reconnectInterval: config.reconnectInterval ?? 3000,
            maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
            heartbeatInterval: config.heartbeatInterval ?? 30000,
            headers: config.headers || {},
        };
    }

    // --- PUBLIC API ---

    public async connect(): Promise<void> {
        if (this.ws?.readyState === WebSocket.OPEN) {
            console.warn('WebSocket already connected');
            return;
        }

        this.isIntentionallyClosed = false;
        this.setStatus('connecting');

        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.config.url, this.config.protocols);

                this.ws.onopen = () => {
                    this.handleOpen();
                    resolve();
                };

                this.ws.onmessage = (event) => this.handleMessage(event);
                this.ws.onerror = (event) => this.handleError(event);
                this.ws.onclose = (event) => this.handleClose(event);

                // Connection timeout
                setTimeout(() => {
                    if (this.ws?.readyState === WebSocket.CONNECTING) {
                        this.ws?.close();
                        reject(new Error('WebSocket connection timeout'));
                    }
                }, 10000);
            } catch (error) {
                this.handleError(error);
                reject(error);
            }
        });
    }

    public disconnect(): void {
        this.isIntentionallyClosed = true;
        this.clearTimers();
        this.ws?.close(1000, 'Client disconnect');
        this.ws = null;
        this.setStatus('disconnected');
    }

    public send(message: WebSocketMessage): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            // Queue message if offline
            this.messageQueue.push(message);
            console.warn('WebSocket not connected. Message queued.');
        }
    }

    public getStatus(): ConnectionStatus {
        return this.status;
    }

    public isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    // --- EVENT EMITTER ---

    public on<K extends keyof ConnectionEventMap>(
        event: K,
        callback: EventCallback<ConnectionEventMap[K]>
    ): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)!.add(callback as EventCallback);
    }

    public off<K extends keyof ConnectionEventMap>(
        event: K,
        callback: EventCallback<ConnectionEventMap[K]>
    ): void {
        this.eventListeners.get(event)?.delete(callback as EventCallback);
    }

    private emit<K extends keyof ConnectionEventMap>(event: K, data: ConnectionEventMap[K]): void {
        this.eventListeners.get(event)?.forEach((callback) => callback(data));
    }

    // --- PRIVATE HANDLERS ---

    private handleOpen(): void {
        const wasReconnecting = this.reconnectAttempts > 0;

        this.setStatus('connected');
        this.reconnectAttempts = 0;

        // Start heartbeat
        this.startHeartbeat();

        // Send queued messages
        this.flushMessageQueue();

        // Emit reconnected event if this was a reconnection
        if (wasReconnecting) {
            this.emit('reconnected', undefined);
        }
    }

    private handleMessage(event: MessageEvent): void {
        try {
            const message: WebSocketMessage = JSON.parse(event.data);

            // Handle pong response
            if (message.type === 'pong') {
                return; // Heartbeat acknowledged
            }

            // Emit message event
            this.emit('message', message.data);
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    }

    private handleError(error: unknown): void {
        console.error('WebSocket error:', error);
        this.emit('error', error instanceof Error ? error : new Error('WebSocket error'));
    }

    private handleClose(_event: CloseEvent): void {
        this.clearTimers();

        // Don't reconnect if intentionally closed
        if (this.isIntentionallyClosed) {
            this.setStatus('disconnected');
            return;
        }

        // Attempt reconnection
        if (this.config.reconnect) {
            this.attemptReconnect();
        } else {
            this.setStatus('disconnected');
        }
    }

    // --- RECONNECTION LOGIC ---

    private attemptReconnect(): void {
        const maxAttempts = this.config.maxReconnectAttempts;

        // Check if max attempts reached (0 = infinite)
        if (maxAttempts > 0 && this.reconnectAttempts >= maxAttempts) {
            console.error('Max reconnection attempts reached');
            this.setStatus('failed');
            return;
        }

        this.reconnectAttempts++;
        this.setStatus('reconnecting');
        this.emit('reconnecting', this.reconnectAttempts);

        // Exponential backoff
        const delay = Math.min(
            this.config.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1),
            30000 // Max 30 seconds
        );

        this.reconnectTimer = window.setTimeout(() => {
            this.connect().catch((error) => {
                console.error('Reconnection failed:', error);
            });
        }, delay);
    }

    // --- HEARTBEAT ---

    private startHeartbeat(): void {
        this.clearHeartbeat();

        this.heartbeatTimer = window.setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.send({ type: 'ping' });
            }
        }, this.config.heartbeatInterval);
    }

    private clearHeartbeat(): void {
        if (this.heartbeatTimer !== null) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    // --- MESSAGE QUEUE ---

    private flushMessageQueue(): void {
        if (this.messageQueue.length === 0) return;

        this.messageQueue.forEach((msg) => this.send(msg));
        this.messageQueue = [];
    }

    // --- HELPERS ---

    private setStatus(status: ConnectionStatus): void {
        if (this.status !== status) {
            this.status = status;
            this.emit('statusChange', status);
        }
    }

    private clearTimers(): void {
        if (this.reconnectTimer !== null) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.clearHeartbeat();
    }

    // --- CLEANUP ---

    public destroy(): void {
        this.disconnect();
        this.eventListeners.clear();
        this.messageQueue = [];
    }
}
