// Quick Replies Component (Predefined Answer Buttons)

import type { QuickReply } from '../types';

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
}

export function QuickReplies({ replies, onSelect }: QuickRepliesProps) {
  if (!replies || replies.length === 0) return null;

  return (
    <div class="quick-replies" role="list" aria-label="Suggested replies">
      {replies.map((reply, index) => (
        <button
          key={`${reply.value}-${index}`}
          class="quick-reply-btn"
          onClick={() => onSelect(reply)}
          type="button"
          role="listitem"
          title={reply.label}
        >
          {reply.icon && <span class="quick-reply-icon">{reply.icon}</span>}
          <span class="quick-reply-label">{reply.label}</span>
        </button>
      ))}
    </div>
  );
}
