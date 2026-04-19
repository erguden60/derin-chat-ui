// Chat Launcher Button

import { ChatIcon, CloseIcon } from '../icons';
import { UnreadBadge } from './UnreadBadge';
import type { UnreadBadgeConfig } from '../types';

interface LauncherProps {
  isOpen: boolean;
  onClick: () => void;
  ariaLabel?: string;
  unreadCount?: number;
  unreadBadgeConfig?: UnreadBadgeConfig;
  title?: string;
  subtitle?: string;
}

export function Launcher({
  isOpen,
  onClick,
  ariaLabel,
  unreadCount = 0,
  unreadBadgeConfig,
  title,
  subtitle,
}: LauncherProps) {
  return (
    <div class="chat-launcher-shell">
      {!isOpen && (title || subtitle) && (
        <button class="chat-launcher-label" onClick={onClick} type="button">
          {title && <strong>{title}</strong>}
          {subtitle && <span>{subtitle}</span>}
        </button>
      )}

      <button
        class={`chat-launcher ${isOpen ? 'is-open' : ''}`}
        onClick={onClick}
        aria-label={ariaLabel || (isOpen ? 'Close chat' : 'Open chat')}
        style={{ position: 'relative' }}
        type="button"
      >
        <span class="chat-launcher-glow" aria-hidden="true" />
        <span class="chat-launcher-ring" aria-hidden="true" />
        {!isOpen && <UnreadBadge count={unreadCount} config={unreadBadgeConfig} />}
        <span class="chat-launcher-icon" aria-hidden="true">
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </span>
      </button>
    </div>
  );
}
