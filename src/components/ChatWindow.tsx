// Chat Window Container

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
  onFileSelect?: (file: FileAttachment) => void;
  onFileRemove?: () => void;
  onError?: (message: string) => void;
  onClearChat?: () => void;
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
  onFileSelect,
  onFileRemove,
  onError,
  onClearChat,
}: ChatWindowProps) {
  // Agent mode check - Get info from last agent message
  const lastAgentMessage = messages
    .slice()
    .reverse()
    .find((m) => m.sender === 'agent' && m.agent);

  return (
    <div class={`chat-window ${isOpen ? 'is-open' : ''}`}>
      <ChatHeader
        config={config}
        isLoading={isLoading}
        onClose={onClose}
        agentName={lastAgentMessage?.agent?.name}
        agentAvatar={lastAgentMessage?.agent?.avatar}
        connectionStatus={connectionStatus}
        onClearChat={onClearChat}
      />

      <ChatMessages
        messages={messages}
        config={config}
        isLoading={isLoading}
        onQuickReplySelect={onQuickReplySelect}
      />

      <ChatInput
        value={inputValue}
        placeholder={config.ui?.texts?.placeholder || 'Mesajınızı yazın...'}
        fileAttachment={fileAttachment}
        onFileSelect={onFileSelect}
        onFileRemove={onFileRemove}
        onError={onError}
        enableFileUpload={config.features?.fileUpload}
        maxFileSize={config.ui?.fileUpload?.maxSize}
        acceptFileTypes={config.ui?.fileUpload?.accept}
        enableVoiceInput={config.features?.voice?.input}
        voiceLanguage={config.features?.voice?.language}
        disabled={isLoading}
        onChange={onInputChange}
        onSend={onSend}
      />
    </div>
  );
}
