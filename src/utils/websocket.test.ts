import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocketManager } from './websocket';
import type { WebSocketConfig, WebSocketMessage } from '../types/connection';

// --- NATIVE WEBSOCKET MOCK'U ---
class MockWebSocket {
    static instances: MockWebSocket[] = [];
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    url: string;
    readyState: number = 0; 
    
    onopen: (() => void) | null = null;
    onclose: ((event: CloseEvent) => void) | null = null;
    onerror: ((error: Event) => void) | null = null;
    onmessage: ((event: MessageEvent) => void) | null = null;
    
    sendMock = vi.fn();
    closeMock = vi.fn();

    constructor(url: string) {
        this.url = url;
        MockWebSocket.instances.push(this);
    }

    send(data: string) { this.sendMock(data); }
    
    close(code?: number, reason?: string) {
        this.readyState = 3;
        this.closeMock(code, reason);
    }

    triggerOpen() {
        this.readyState = 1;
        this.onopen?.();
    }
    
    triggerClose(code = 1000, reason = '') {
        this.readyState = 3;
        this.onclose?.({ code, reason } as CloseEvent);
    }
    
    triggerMessage(data: string) {
        this.onmessage?.({ data } as MessageEvent);
    }
}

describe('WebSocketManager - Behavioral Tests', () => {
    const defaultConfig: WebSocketConfig = {
        url: 'ws://localhost:8080',
        reconnect: true,
        reconnectInterval: 1000,
        maxReconnectAttempts: 3,
        heartbeatInterval: 5000,
    };

    beforeEach(() => {
        vi.stubGlobal('WebSocket', MockWebSocket);
        window.WebSocket = MockWebSocket as unknown as typeof WebSocket;
        MockWebSocket.instances = [];
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    // --- 1. BAĞLANTI (CONNECTION) SENARYOLARI ---
    describe('Connection handling', () => {
        it('should connect successfully and emit status', async () => {
            const manager = new WebSocketManager(defaultConfig);
            const statusCallback = vi.fn();
            manager.on('statusChange', statusCallback);

            const connectPromise = manager.connect();
            
            expect(statusCallback).toHaveBeenCalledWith('connecting');
            expect(MockWebSocket.instances.length).toBe(1);

            MockWebSocket.instances[0].triggerOpen();
            await connectPromise;

            expect(statusCallback).toHaveBeenCalledWith('connected');
            expect(manager.getStatus()).toBe('connected');
            expect(manager.isConnected()).toBe(true);
        });

        it('should reject connection on timeout', async () => {
            const manager = new WebSocketManager(defaultConfig);
            const connectPromise = manager.connect();

            vi.advanceTimersByTime(10000);

            await expect(connectPromise).rejects.toThrow('WebSocket connection timeout');
            expect(MockWebSocket.instances[0].closeMock).toHaveBeenCalled();
        });
    });

    // --- 2. MESAJLAŞMA VE KUYRUK (MESSAGING & QUEUE) ---
    describe('Messaging and Queueing', () => {
        it('should send messages immediately when connected', async () => {
            const manager = new WebSocketManager(defaultConfig);
            manager.connect();
            MockWebSocket.instances[0].triggerOpen();

            // TİP HATASI BURADA ÇÖZÜLDÜ: as WebSocketMessage eklendi
            const testMessage = { type: 'chat', data: 'hello' } as unknown as WebSocketMessage;
            manager.send(testMessage);

            expect(MockWebSocket.instances[0].sendMock).toHaveBeenCalledWith(JSON.stringify(testMessage));
        });

        it('should queue messages when disconnected and flush on connect', async () => {
            const manager = new WebSocketManager(defaultConfig);
            
            // TİP HATASI BURADA ÇÖZÜLDÜ: as WebSocketMessage eklendi
            const testMessage1 = { type: 'chat', data: 'msg1' } as unknown as WebSocketMessage;
            const testMessage2 = { type: 'chat', data: 'msg2' } as unknown as WebSocketMessage;

            manager.send(testMessage1);
            manager.send(testMessage2);

            manager.connect();
            const wsMock = MockWebSocket.instances[0];
            
            expect(wsMock.sendMock).not.toHaveBeenCalled();

            wsMock.triggerOpen();

            expect(wsMock.sendMock).toHaveBeenCalledTimes(2);
            expect(wsMock.sendMock).toHaveBeenNthCalledWith(1, JSON.stringify(testMessage1));
            expect(wsMock.sendMock).toHaveBeenNthCalledWith(2, JSON.stringify(testMessage2));
        });
    });

    // --- 3. YENİDEN BAĞLANMA (RECONNECTION) ---
    describe('Reconnection logic', () => {
        it('should attempt to reconnect automatically on unexpected close', async () => {
            const manager = new WebSocketManager(defaultConfig);
            manager.connect();
            MockWebSocket.instances[0].triggerOpen();

            MockWebSocket.instances[0].triggerClose(1006, 'Abnormal closure');

            expect(manager.getStatus()).toBe('reconnecting');

            vi.advanceTimersByTime(1000);

            expect(MockWebSocket.instances.length).toBe(2);
        });

        it('should emit reconnected after a reconnect succeeds', async () => {
            const manager = new WebSocketManager(defaultConfig);
            const reconnectedCallback = vi.fn();
            manager.on('reconnected', reconnectedCallback);

            manager.connect();
            MockWebSocket.instances[0].triggerOpen();
            MockWebSocket.instances[0].triggerClose(1006, 'Abnormal closure');

            vi.advanceTimersByTime(1000);
            MockWebSocket.instances[1].triggerOpen();

            expect(reconnectedCallback).toHaveBeenCalledTimes(1);
            expect(manager.getStatus()).toBe('connected');
        });

        it('should stop reconnecting after max attempts and set status to failed', async () => {
            const manager = new WebSocketManager({
                ...defaultConfig,
                maxReconnectAttempts: 2, 
                reconnectInterval: 1000
            });
            manager.connect();
            MockWebSocket.instances[0].triggerOpen();
            MockWebSocket.instances[0].triggerClose(1006, 'Error');

            vi.advanceTimersByTime(1000);
            MockWebSocket.instances[1].triggerClose(1006);

            vi.advanceTimersByTime(1500);
            MockWebSocket.instances[2].triggerClose(1006);

            expect(manager.getStatus()).toBe('failed');
            vi.advanceTimersByTime(5000);
            expect(MockWebSocket.instances.length).toBe(3); 
        });

        it('should NOT reconnect if disconnected intentionally', async () => {
            const manager = new WebSocketManager(defaultConfig);
            manager.connect();
            MockWebSocket.instances[0].triggerOpen();

            manager.disconnect();
            
            vi.advanceTimersByTime(5000);
            expect(manager.getStatus()).toBe('disconnected');
            expect(MockWebSocket.instances.length).toBe(1);
        });
    });

    // --- 4. HEARTBEAT (PING/PONG) ---
    describe('Heartbeat interval', () => {
        it('should send ping messages at given intervals', async () => {
            const manager = new WebSocketManager(defaultConfig);
            manager.connect();
            MockWebSocket.instances[0].triggerOpen();

            vi.advanceTimersByTime(5000);

            expect(MockWebSocket.instances[0].sendMock).toHaveBeenCalledWith(
                JSON.stringify({ type: 'ping' })
            );

            vi.advanceTimersByTime(5000);
            expect(MockWebSocket.instances[0].sendMock).toHaveBeenCalledTimes(2);
        });
    });

    // --- 5. EVENT PARSING ---
    describe('Event Handling', () => {
        it('should parse incoming messages and emit data', async () => {
            const manager = new WebSocketManager(defaultConfig);
            const messageCallback = vi.fn();
            manager.on('message', messageCallback);

            manager.connect();
            MockWebSocket.instances[0].triggerOpen();

            // Bu obje sadece stringify edileceği için doğrudan tip ataması yapabiliriz
            const serverPayload = { type: 'message', data: { id: 1, name: 'Test' } };
            MockWebSocket.instances[0].triggerMessage(JSON.stringify(serverPayload));

            expect(messageCallback).toHaveBeenCalledWith({ id: 1, name: 'Test' });
        });
    });
});
