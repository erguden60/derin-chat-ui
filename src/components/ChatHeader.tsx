// Chat Header Component

import { CloseIcon } from '../icons';
import type { ChatConfig, ConnectionStatus } from '../types';
import { ConnectionStatusIndicator } from './ConnectionStatus';

interface ChatHeaderProps {
  config: Required<ChatConfig>;
  isLoading: boolean;
  onClose: () => void;
  agentName?: string;
  agentAvatar?: string;
  connectionStatus?: ConnectionStatus; // WebSocket connection status
  onClearChat?: () => void; // Triggered when user wants to clear history
}

export function ChatHeader({
  config,
  isLoading,
  onClose,
  agentName,
  agentAvatar,
  connectionStatus,
  onClearChat,
}: ChatHeaderProps) {
  const texts = config.ui?.texts || config.ui.texts;
  const logo = agentAvatar || config.ui.logo;
  const title = agentName || texts?.title || '';
  // Show connection status only if WebSocket is enabled
  const showConnectionStatus = config.connection?.mode === 'websocket' || config.connection?.mode === 'auto';
  const baseSubtitle = texts?.subtitle || 'Online';
  const subtitle = isLoading
    ? texts?.loading || 'Typing...'
    : connectionStatus === 'reconnecting'
      ? 'Reconnecting...'
      : connectionStatus === 'connecting'
        ? 'Connecting...'
        : connectionStatus === 'failed'
          ? 'Connection issue'
          : connectionStatus === 'disconnected'
            ? 'Offline'
            : baseSubtitle;

  return (
    <div class="chat-header">
      <div class="chat-header-main">
        {logo && <img src={logo} class="header-logo" alt={title} />}
        <div class="chat-header-copy">
          <h3>{title}</h3>
          <div class="chat-header-meta">
            <span class="status-indicator">{subtitle}</span>
            {showConnectionStatus && connectionStatus && (
              <ConnectionStatusIndicator status={connectionStatus} />
            )}
          </div>
        </div>
      </div>
      
      <div class="chat-header-actions">
        {onClearChat && (
          <button class="close-btn secondary" onClick={onClearChat} aria-label="Clear chat" title="Clear chat History" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        )}
        <button class="close-btn" onClick={onClose} aria-label={texts?.closeChat || 'Close chat'} type="button">
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
