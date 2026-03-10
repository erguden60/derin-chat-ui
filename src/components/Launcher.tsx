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
}

export function Launcher({
  isOpen,
  onClick,
  ariaLabel,
  unreadCount = 0,
  unreadBadgeConfig,
}: LauncherProps) {
  return (
    <button
      class={`chat-launcher ${isOpen ? 'is-open' : ''}`}
      onClick={onClick}
      aria-label={ariaLabel || (isOpen ? 'Close chat' : 'Open chat')}
      style={{ position: 'relative' }}
    >
      {!isOpen && <UnreadBadge count={unreadCount} config={unreadBadgeConfig} />}
      {isOpen ? <CloseIcon /> : <ChatIcon />}
    </button>
  );
}
