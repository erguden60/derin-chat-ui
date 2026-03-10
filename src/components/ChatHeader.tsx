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
  const subtitle = isLoading ? texts?.loading || 'Yazıyor...' : texts?.subtitle || 'Çevrimiçi';

  // Show connection status only if WebSocket is enabled
  const showConnectionStatus = config.connection?.mode === 'websocket' || config.connection?.mode === 'auto';

  return (
    <div class="chat-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {logo && <img src={logo} class="header-logo" alt={title} />}
        <div>
          <h3>{title}</h3>
          <span class="status-indicator">{subtitle}</span>
        </div>
        {showConnectionStatus && connectionStatus && (
          <ConnectionStatusIndicator status={connectionStatus} />
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {onClearChat && (
          <button class="close-btn" onClick={onClearChat} aria-label="Clear chat" title="Clear chat History" style={{ opacity: 0.7 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        )}
        <button class="close-btn" onClick={onClose} aria-label={texts?.closeChat || 'Close chat'}>
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
