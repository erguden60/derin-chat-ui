// Chat Window Container

import { useState, useCallback } from 'preact/hooks';
import type { Message, ChatConfig, ConnectionStatus } from '../types';
import type { FileAttachment } from './FileUpload';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

interface ChatWindowProps {
  isOpen: boolean;
  config: Required<ChatConfig>;
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  fileAttachment?: FileAttachment;
  connectionStatus?: ConnectionStatus; // WebSocket connection status
  onClose: () => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onQuickReplySelect?: (value: string) => void;
  onCopy?: (messageId: string, text: string) => void;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
  onEdit?: (messageId: string, newText: string) => void;
  onFileSelect?: (file: FileAttachment) => void;
  onFileRemove?: () => void;
  onError?: (message: string) => void;
  onClearChat?: () => void;
  onStopGenerating?: () => void;
  onReconnect?: () => void;
}

export function ChatWindow({
  isOpen,
  config,
  messages,
  inputValue,
  isLoading,
  fileAttachment,
  connectionStatus,
  onClose,
  onInputChange,
  onSend,
  onQuickReplySelect,
  onCopy,
  onRegenerate,
  onFeedback,
  onEdit,
  onFileSelect,
  onFileRemove,
  onError,
  onClearChat,
  onStopGenerating,
  onReconnect,
}: ChatWindowProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (config.features?.fileUpload && !isDragging) {
      setIsDragging(true);
    }
  }, [config.features?.fileUpload, isDragging]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget || !(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!config.features?.fileUpload) return;
    
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;

    const maxSize = config.ui?.fileUpload?.maxSize || 10;
    
    if (file.size > maxSize * 1024 * 1024) {
      const msg = (config.ui?.texts?.fileSizeError || 'File must be smaller than {maxSize}MB.')
        .replace('{maxSize}', String(maxSize));
      onError?.(msg);
      return;
    }

    let type: 'image' | 'pdf' | 'other' = 'other';
    if (file.type.startsWith('image/')) {
       type = 'image';
    } else if (file.type === 'application/pdf') {
       type = 'pdf';
    }

    let preview: string | undefined;
    if (type === 'image') {
       try {
         preview = await new Promise((resolve, reject) => {
           const reader = new FileReader();
           reader.onload = () => resolve(reader.result as string);
           reader.onerror = reject;
           reader.readAsDataURL(file);
         });
       } catch {
         onError?.(config.ui?.texts?.imageLoadError || 'Failed to load image.');
         return;
       }
    }

    onFileSelect?.({ file, preview, type });
  }, [config.features?.fileUpload, config.ui?.fileUpload?.maxSize, onError, onFileSelect]);

  // Agent mode check - Get info from last agent message
  const lastAgentMessage = messages
    .slice()
    .reverse()
    .find((m) => m.sender === 'agent' && m.agent);
  const showConnectionBanner =
    connectionStatus === 'reconnecting' ||
    connectionStatus === 'connecting' ||
    connectionStatus === 'failed' ||
    connectionStatus === 'disconnected';

  return (
    <div 
      class={`chat-window ${isOpen ? 'is-open' : ''} ${isDragging ? 'is-dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div class="chat-drag-overlay">
          <div class="chat-drag-content">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p>{config.ui?.texts?.dropFile || 'Drop file here'}</p>
          </div>
        </div>
      )}
      <ChatHeader
        config={config}
        isLoading={isLoading}
        onClose={onClose}
        agentName={lastAgentMessage?.agent?.name}
        agentAvatar={lastAgentMessage?.agent?.avatar}
        connectionStatus={connectionStatus}
        onClearChat={onClearChat}
      />

      {showConnectionBanner && (
        <div class={`chat-connection-banner is-${connectionStatus}`}>
          <div class="chat-connection-copy">
            <strong>
              {connectionStatus === 'reconnecting'
                ? 'Reconnecting to live chat'
                : connectionStatus === 'connecting'
                  ? 'Connecting to assistant'
                  : connectionStatus === 'failed'
                    ? 'Connection failed'
                    : 'Currently offline'}
            </strong>
            <span>
              {connectionStatus === 'reconnecting'
                ? 'We are trying to restore the session.'
                : connectionStatus === 'connecting'
                  ? 'Your assistant will be ready in a moment.'
                  : connectionStatus === 'failed'
                    ? 'A manual reconnect may help.'
                    : 'Messages may not send until the connection returns.'}
            </span>
          </div>
          {(connectionStatus === 'failed' || connectionStatus === 'disconnected') && onReconnect && (
            <button type="button" class="chat-connection-action" onClick={onReconnect}>
              Reconnect
            </button>
          )}
        </div>
      )}

      <ChatMessages
        messages={messages}
        config={config}
        isLoading={isLoading}
        onQuickReplySelect={onQuickReplySelect}
        onCopy={onCopy}
        onRegenerate={onRegenerate}
        onFeedback={onFeedback}
        onEdit={onEdit}
      />

      <ChatInput
        value={inputValue}
        placeholder={config.ui?.texts?.placeholder || 'Type your message...'}
        fileAttachment={fileAttachment}
        onFileSelect={onFileSelect}
        onFileRemove={onFileRemove}
        onError={onError}
        enableFileUpload={config.features?.fileUpload}
        maxFileSize={config.ui?.fileUpload?.maxSize}
        acceptFileTypes={config.ui?.fileUpload?.accept}
        enableVoiceInput={config.features?.voice?.input}
        voiceLanguage={config.features?.voice?.language}
        onUserTyping={config.onUserTyping ?? config.events?.onUserTyping}
        disabled={isLoading}
        onChange={onInputChange}
        onSend={onSend}
        onStopGenerating={onStopGenerating}
      />
    </div>
  );
}
