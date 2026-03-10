// Quick Replies Component (Predefined Answer Buttons)

import type { QuickReply } from '../types';

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
}

export function QuickReplies({ replies, onSelect }: QuickRepliesProps) {
  if (!replies || replies.length === 0) return null;

  return (
    <div class="quick-replies">
      {replies.map((reply, index) => (
        <button key={index} class="quick-reply-btn" onClick={() => onSelect(reply)}>
          {reply.icon && <span class="quick-reply-icon">{reply.icon}</span>}
          <span>{reply.label}</span>
        </button>
      ))}
    </div>
  );
}
