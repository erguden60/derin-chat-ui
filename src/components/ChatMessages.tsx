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
  onEdit?: (messageId: string, newText: string) => void;
}

export function ChatMessages({
  messages,
  config,
  isLoading,
  onQuickReplySelect,
  onCopy,
  onRegenerate,
  onFeedback,
  onEdit
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasOnlyIntroMessage =
    messages.length === 1 && messages[0]?.id === 'intro' && messages[0]?.sender === 'bot';
  const title = config.ui?.texts?.title || 'Support';
  const introMessage = config.ui?.texts?.welcomeMessage || messages[0]?.text || '';
  const renderedMessages = hasOnlyIntroMessage ? [] : messages;
  const showWelcomeScreen = config.ui?.showWelcomeScreen !== false;

  const defaultHints = ['Ask a question', 'Get instant answers', 'Keep the conversation flowing'];
  const hints = config.ui?.texts?.welcomeHints || defaultHints;
  const welcomeBadgeText = config.ui?.texts?.welcomeBadge || 'AI assistant';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div class="chat-messages">
      {hasOnlyIntroMessage && showWelcomeScreen && (
        <div class="chat-empty-state">
          {welcomeBadgeText && <div class="chat-empty-badge">{welcomeBadgeText}</div>}
          <h4>{title}</h4>
          <p>{introMessage}</p>
          {hints.length > 0 && (
            <div class="chat-empty-hints">
              {hints.map((hint, i) => (
                <span key={i}>{hint}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {renderedMessages.map((msg, index) => (
        <MessageComponent
          key={msg.id}
          message={msg}
          config={config}
          onQuickReplySelect={onQuickReplySelect}
          onCopy={onCopy}
          onRegenerate={index === renderedMessages.length - 1 ? onRegenerate : undefined}
          onFeedback={onFeedback}
          onEdit={onEdit}
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
