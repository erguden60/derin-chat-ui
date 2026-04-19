// Message sending logic (API + Mock + WebSocket + Auto Fallback)

import { useState, useRef } from 'preact/hooks';
import type {
  Message,
  ChatConfig,
  WebSocketMessage,
  MockHandlerResult,
  MockHandlerContext,
  ConnectionStatus,
  ApiResponse,
} from '../types';
import type { FileAttachment } from '../components/FileUpload';
import { sendMessage } from '../utils/api';
import { parseApiResponse, generateMockResponse } from '../utils/messageParser';
import { RATE_LIMIT } from '../constants/defaults';

interface UseMessageSenderOptions {
  config: Required<ChatConfig>;
  messages: Message[];
  sessionId?: string;          // Persisted session identifier
  onSuccess: (message: Message) => void;
  onError: (message: Message, error: Error) => void;
  updateMessage: (id: string, partial: Partial<Message>) => void;
  wsSend?: (message: WebSocketMessage) => void;
  connectionStatus?: ConnectionStatus;
  onWsSend?: () => void;       // Called when a WS message is dispatched (for loading state)
}

export function useMessageSender({
  config,
  messages,
  sessionId,
  onSuccess,
  onError,
  updateMessage,
  wsSend,
  connectionStatus,
  onWsSend,
}: UseMessageSenderOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const messageTimestamps = useRef<number[]>([]);
  const lastMessageTime = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  // Determine connection mode with AUTO fallback
  const isAutoMode = config.connection?.mode === 'auto';
  const isWebSocketMode = config.connection?.mode === 'websocket';

  const createSystemMessage = (text: string): Message => ({
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    text,
    sender: 'system',
    timestamp: new Date().toISOString(),
  });

  // Rate limiting check
  const checkRateLimit = (): boolean => {
    const now = Date.now();

    // Remove timestamps older than 1 minute
    messageTimestamps.current = messageTimestamps.current.filter(
      (timestamp) => now - timestamp < 60000
    );

    // Check max messages per minute
    if (messageTimestamps.current.length >= RATE_LIMIT.maxMessagesPerMinute) {
      return false;
    }

    // Check cooldown period
    if (now - lastMessageTime.current < RATE_LIMIT.cooldownPeriod) {
      return false;
    }

    return true;
  };

  const sendUserMessage = async (text: string, fileAttachment?: FileAttachment, isEdit?: boolean): Promise<void> => {
    // Drop existing request if a new one is forced OR prevent if loading
    if (isLoading && !isEdit) return;
    if (isEdit) {
      stopGenerating();
    }
    
    // Rate limiting
    if (!checkRateLimit()) {
      const errorMessage: Message = {
        id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        text: config.ui?.texts?.rateLimitError || 'You are sending messages too fast. Please wait.',
        sender: 'system',
        timestamp: new Date().toISOString(),
      };
      onError(errorMessage, new Error('Rate limit exceeded'));
      return;
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    const now = Date.now();
    messageTimestamps.current.push(now);
    lastMessageTime.current = now;

    try {
      let botMessage: Message;

      if (isWebSocketMode && !wsSend) {
        const connectionError = createSystemMessage(
          connectionStatus === 'reconnecting' || connectionStatus === 'connecting'
            ? 'Connection is still being established. Please wait a moment and try again.'
            : 'Live connection is unavailable right now. Please reconnect and try again.'
        );
        onError(connectionError, new Error('WebSocket unavailable'));
        return;
      }

      if (isAutoMode && !wsSend && !config.apiUrl) {
        const fallbackError = createSystemMessage(
          'Automatic fallback is unavailable because no HTTP apiUrl is configured.'
        );
        onError(fallbackError, new Error('Auto mode fallback unavailable'));
        return;
      }

      // --- MODE 1: MOCK MODE ---
      if (config.mock) {
        const mockConfig = typeof config.mock === 'object' ? config.mock : undefined;

        if (mockConfig?.handler) {
          const handlerResult = await mockConfig.handler(text, buildMockContext({
            config,
            messages,
            fileAttachment,
          }));
          botMessage = normalizeMockResult(handlerResult, text, config);
        } else {
          botMessage = generateMockResponse(text);
        }

        if (config.connection?.stream) {
          // Simulate Streaming
          botMessage.isStreaming = true;
          const fullText = botMessage.text;
          botMessage.text = ''; // Start empty
          
          onSuccess(botMessage); // Mount the empty message bubble first

          const words = fullText.split(' ');
          let currentText = '';
          
          for (let i = 0; i < words.length; i++) {
            await new Promise(r => setTimeout(r, 40)); // Artificial stream delay
            currentText += (i === 0 ? '' : ' ') + words[i];
            updateMessage(botMessage.id, { text: currentText, isStreaming: true });
          }
          
          // Finish stream
          updateMessage(botMessage.id, { isStreaming: false });
          return; // Skip normal onSuccess since we streamed it
        } else {
          await new Promise((resolve) => setTimeout(resolve, 800)); // Normal delay
          onSuccess(botMessage); // Actually mount the message!
        }
      }
      // --- MODE 1.5: UI-ONLY MODE (no apiUrl, no mock) ---
      else if (!config.apiUrl && !config.mock) {
        // Silent mode: just echo the message back
        await new Promise((resolve) => setTimeout(resolve, 500));
        botMessage = {
          id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          text: 'Widget is in UI-only mode. Configure apiUrl or mock to enable responses.',
        };
        onSuccess(botMessage);
        return;
      }
      // --- MODE 2: WEBSOCKET MODE (or AUTO with WebSocket available) ---
      else if ((isWebSocketMode || isAutoMode) && wsSend) {
        // Send via WebSocket
        const wsMessage: WebSocketMessage = {
          type: 'message',
          data: {
            text,
            user: config.user,
            sessionId,                    // ← inject session ID
            timestamp: new Date().toISOString(),
            ...(fileAttachment
              ? {
                file: {
                  name: fileAttachment.file.name,
                  type: fileAttachment.file.type,
                  size: fileAttachment.file.size,
                  data: fileAttachment.preview || (await readFileAsBase64(fileAttachment.file)),
                },
              }
              : {}),
          },
        };

        wsSend(wsMessage);
        onWsSend?.();                     // ← signal loading start to caller
        // In WS mode the response arrives via the onMessage callback,
        // so we do NOT set isLoading=false here — it's cleared there.
        return;
      }
      // --- MODE 3: HTTP API MODE (or AUTO fallback) ---
      else {
        if (!config.apiUrl) {
          throw new Error('API URL not configured');
        }
        
        // Log auto-fallback to HTTP
        if (isAutoMode) {
          console.warn('Auto mode: Falling back to HTTP (WebSocket unavailable)');
        }

        // Prepare file data if exists
        let fileData: { name: string; type: string; size: number; data: string } | undefined;
        if (fileAttachment) {
          const base64 = fileAttachment.preview || (await readFileAsBase64(fileAttachment.file));
          fileData = {
            name: fileAttachment.file.name,
            type: fileAttachment.file.type,
            size: fileAttachment.file.size,
            data: base64,
          };
        }

        if (config.connection?.stream) {
          // --- MODE 3A: SSE STREAMING ---
          
          botMessage = {
            id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
            sender: 'bot',
            text: '',
            isStreaming: true,
            timestamp: new Date().toISOString()
          };
          
          onSuccess(botMessage); // Mount empty bubble

          let accumulatedText = '';
          try {
            const streamResponse = await fetch(config.apiUrl, {
              method: 'POST',
              signal: abortControllerRef.current?.signal,
              headers: {
                'Content-Type': 'application/json',
                ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
              },
              body: JSON.stringify({
                message: text,
                stream: true,
                sessionId,                 // ← inject session ID
                user: { ...config.user, hash: config.user?.hash },
                history: messages.map((m) => ({ text: m.text, sender: m.sender, timestamp: m.timestamp })),
                ...(fileData ? { file: fileData } : {}),
              }),
            });

            if (!streamResponse.ok) {
               throw new Error(`API stream error: ${streamResponse.status}`);
            }

            if (!streamResponse.body) {
               throw new Error('ReadableStream not supported by this browser/endpoint.');
            }

            const reader = streamResponse.body.getReader();
            const decoder = new TextDecoder('utf-8');

            let done = false;
            while (!done) {
              const { value, done: readerDone } = await reader.read();
              done = readerDone;
              
              if (value) {
                const chunk = decoder.decode(value, { stream: !done });
                
                // Parse SSE "data: ..." format
                const lines = chunk.split('\n');
                for (const line of lines) {
                  if ((line || '').trim() === 'data: [DONE]') continue;
                  if (line.startsWith('data: ')) {
                     try {
                        const jsonStr = line.replace('data: ', '');
                        if (!(jsonStr || '').trim()) continue;
                        const parsed = JSON.parse(jsonStr);
                        // Extract text (support OpenAI standard delta.content or our custom reply)
                        const token = parsed.choices?.[0]?.delta?.content || parsed.reply || parsed.text || '';
                        accumulatedText += token;
                     } catch { /* ignore parse errors for partial chunks */ }
                  } else {
                     // If it's not SSE format, maybe it's just raw text chunks being flushed
                     if ((chunk || '').trim() && !chunk.includes('data:')) {
                        // Assuming raw text flush
                        // We do a safer assignment here to prevent duplicate appends on same chunk
                     }
                  }
                }
                
                if (!chunk.includes('data:')) {
                   accumulatedText += chunk;
                }

                updateMessage(botMessage.id, { text: accumulatedText, isStreaming: true });
              }
            }

            // Stream complete
            updateMessage(botMessage.id, { isStreaming: false });
            return; // Exit normal flow

          } catch (streamError) {
             console.error('Streaming failed, falling back to final error:', streamError);
             updateMessage(botMessage.id, { 
                text: accumulatedText ? accumulatedText + '\\n\\n[Connection Interrupted]' : 'Stream connection failed.',
                isStreaming: false
             });
             throw streamError;
          }

        } else {
          // --- MODE 3B: STANDARD HTTP CALL (Non-streaming) ---
          const response = await sendMessage(
            config.apiUrl,
            {
              message: text,
              sessionId,                   // ← inject session ID
              user: {
                ...config.user,
                hash: config.user?.hash,
              },
              history: messages.map((m) => ({
                text: m.text,
                sender: m.sender,
                timestamp: m.timestamp,
              })),
              ...(fileData ? { file: fileData } : {}),
            },
            config.apiKey,
            abortControllerRef.current?.signal
          );

          botMessage = parseApiResponse(response, config);

          // Call event hook
          config.onMessageReceived?.(response);
          onSuccess(botMessage);
        }
      }
    } catch (error) {
      console.error('Message send error:', error);

      const errorMessage: Message = {
        ...createSystemMessage(
          connectionStatus === 'reconnecting'
            ? 'Connection is recovering. Please try again in a moment.'
            : config.ui?.texts?.errorMessage || 'Connection error. Please try again.'
        ),
      };

      onError(errorMessage, error instanceof Error ? error : new Error('Unknown error'));

      // Call error hook
      if (error instanceof Error) {
        config.onError?.(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    sendUserMessage,
    stopGenerating,
  };
}

function buildMockContext({
  config,
  messages,
  fileAttachment,
}: {
  config: Required<ChatConfig>;
  messages: Message[];
  fileAttachment?: FileAttachment;
}): MockHandlerContext {
  const file = fileAttachment
    ? {
        name: fileAttachment.file.name,
        type: fileAttachment.file.type,
        size: fileAttachment.file.size,
        data: fileAttachment.preview,
      }
    : undefined;

  return {
    user: config.user,
    history: messages,
    ...(file ? { file } : {}),
  };
}

function normalizeMockResult(
  result: MockHandlerResult,
  fallbackText: string,
  config: Required<ChatConfig>
): Message {
  if (result == null) {
    return generateMockResponse(fallbackText);
  }

  if (typeof result === 'string') {
    return parseApiResponse({ reply: result }, config);
  }

  if (isMessageLike(result)) {
    return {
      id: result.id || crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      text: result.text,
      sender: result.sender,
      timestamp: result.timestamp || new Date().toISOString(),
      ...(result.image ? { image: result.image } : {}),
      ...(result.file ? { file: result.file } : {}),
      ...(result.quickReplies ? { quickReplies: result.quickReplies } : {}),
      ...(result.actions ? { actions: result.actions } : {}),
      ...(result.agent ? { agent: result.agent } : {}),
    };
  }

  const responseLike = result as unknown as Record<string, unknown>;
  const reply =
    typeof responseLike.reply === 'string'
      ? responseLike.reply
      : typeof responseLike.text === 'string'
        ? responseLike.text
        : '';

  return parseApiResponse({ ...responseLike, reply } as ApiResponse, config);
}

function isMessageLike(value: MockHandlerResult): value is Message {
  return (
    typeof value === 'object' &&
    value !== null &&
    'text' in value &&
    'sender' in value
  );
}

// Helper: Read file as base64
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
