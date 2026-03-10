// Chat Messages Container

import { useRef, useEffect } from 'preact/hooks';
import type { Message, ChatConfig } from '../types';
import { MessageComponent } from './Message';
import { TypingIndicator } from './TypingIndicator';

interface ChatMessagesProps {
  messages: Message[];
  config: Required<ChatConfig>;
  isLoading: boolean;
  onQuickReplySelect?: (value: string) => void;
  onCopy?: (messageId: string, text: string) => void;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
}

export function ChatMessages({
  messages,
  config,
  isLoading,
  onQuickReplySelect,
  onCopy,
  onRegenerate,
  onFeedback,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div class="chat-messages">
      {messages.map((msg) => (
        <MessageComponent
          key={msg.id}
          message={msg}
          config={config}
          onQuickReplySelect={onQuickReplySelect}
          onCopy={onCopy}
          onRegenerate={onRegenerate}
          onFeedback={onFeedback}
        />
      ))}

      {isLoading && (
        <div class="message-wrapper bot">
          <div class="message-content">
            <div class="message bot loading">
              <TypingIndicator />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
