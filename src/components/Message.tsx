// Single Message Component

import type { Message, ChatConfig } from '../types';
import { QuickReplies } from './QuickReplies';
import { parseMarkdown } from '../utils/markdown';
import { useState, useEffect } from 'preact/hooks';
import { SpeakerIcon } from '../icons';

interface MessageProps {
  message: Message;
  config: Required<ChatConfig>;
  onQuickReplySelect?: (value: string) => void;
  onCopy?: (messageId: string, text: string) => void;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
}

export function MessageComponent({ 
  message, 
  config, 
  onQuickReplySelect,
  onCopy,
  onRegenerate,
  onFeedback
}: MessageProps) {
  const isUser = message.sender === 'user';
  const isAgent = message.sender === 'agent';
  const showAvatar = config.features.avatars && (isAgent || message.agent);
  const showTimestamp = config.features.timestamps;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleQuickReply = (reply: any) => {
    if (onQuickReplySelect && reply?.value) {
      onQuickReplySelect(reply.value);
    }
  };

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) onCopy(message.id, message.text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Render message text with or without markdown
  const renderMessageText = () => {
    if (config.features.markdown) {
      return <span dangerouslySetInnerHTML={{ __html: parseMarkdown(message.text) }} />;
    }
    return message.text;
  };

  const [isPlaying, setIsPlaying] = useState(false);

  const handleTextToSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const speak = () => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.text);
      
      const targetLang = config.features.voice?.language || 'en-US';
      utterance.lang = targetLang;

      const voices = window.speechSynthesis.getVoices();
      let selectedVoice: SpeechSynthesisVoice | undefined;

      if (config.features.voice?.voiceName && voices.length > 0) {
        const targetName = config.features.voice.voiceName.toLowerCase();
        selectedVoice = voices.find(v => v.name.toLowerCase().includes(targetName));
      }

      if (!selectedVoice && voices.length > 0) {
        const langPrefix = targetLang.split('-')[0].toLowerCase();
        const matchingVoices = voices.filter(v => 
          v.lang.toLowerCase().startsWith(langPrefix)
        );

        if (matchingVoices.length > 0) {
          const premiumVoice = matchingVoices.find(v => 
            v.name.includes('Google') || 
            v.name.includes('Microsoft') || 
            v.name.includes('Apple') || 
            v.localService
          );
          selectedVoice = premiumVoice || matchingVoices[0];
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (e) => {
        console.error('Text-to-Speech error', e);
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    // Chrome/Linux bug: getVoices() might be empty initially
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        speak();
        // Remove listener to prevent multiple triggers
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      speak();
    }
  };

  return (
    <div class={`message-wrapper ${message.sender}`}>
      {showAvatar && !isUser && (
        <div class="message-avatar">
          {message.agent?.avatar ? (
            <img src={message.agent.avatar} alt={message.agent.name} />
          ) : (
            <div class="avatar-placeholder">🤖</div>
          )}
        </div>
      )}

      <div class="message-content">
        {isAgent && message.agent && <div class="agent-name">{message.agent.name}</div>}

        <div class={`message ${message.sender}`}>
          {renderMessageText()}

          {config.features.images && message.image && (
            <div class="message-image">
              <img
                src={message.image.url}
                alt={message.image.alt || ''}
                style={{
                  maxWidth: message.image.width ? `${message.image.width}px` : '100%',
                  maxHeight: message.image.height ? `${message.image.height}px` : 'auto',
                }}
              />
            </div>
          )}

          {/* File display */}
          {message.file && (
            <div class="message-file">
              <div class="message-file-icon">{message.file.type === 'pdf' ? '📄' : '📎'}</div>
              <div class="message-file-info">
                <span class="message-file-name">{message.file.name}</span>
                {message.file.size && (
                  <span class="message-file-size">{formatFileSize(message.file.size)}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Replies */}
        {config.features.quickReplies && message.quickReplies && (
          <QuickReplies replies={message.quickReplies} onSelect={handleQuickReply} />
        )}

        {showTimestamp && (
          <div class="message-timestamp">
            {mounted ? new Date(message.timestamp).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
            }) : ''}
          </div>
        )}

        {/* Advanced Message Tools (Bot only) */}
        {!isUser && config.features.messageTools !== false && !message.isStreaming && (
            <div class="message-tools" style={{ display: 'flex', gap: '8px', marginTop: '6px', marginLeft: '4px', opacity: 0.8 }}>
              {/* Copy Button */}
              <button 
                onClick={handleCopy} 
                class="tool-btn" 
                title="Copy message"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
              >
                {isCopied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                )}
              </button>

              {/* Regenerate Button */}
              {onRegenerate && (
                <button 
                  onClick={() => onRegenerate(message.id)} 
                  class="tool-btn" 
                  title="Regenerate message"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m0 0a9 9 0 0 1 9-9m-9 9a9 9 0 0 0 9 9m-9-9h18" strokeDasharray="4 4"/></svg>
                </button>
              )}

              {/* Text-to-Speech Button */}
              {config.features.voice?.output && (
                <button
                  onClick={handleTextToSpeech}
                  class={`tool-btn ${isPlaying ? 'active' : ''}`}
                  title={isPlaying ? 'Stop speaking' : 'Read aloud'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: isPlaying ? '#22c55e' : 'inherit' }}
                >
                  <SpeakerIcon />
                </button>
              )}

              {/* Feedback Buttons */}
              {onFeedback && (
                <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto', marginRight: '4px' }}>
                  <button 
                    onClick={() => onFeedback(message.id, 'positive')} 
                    class={`tool-btn ${message.feedback === 'positive' ? 'active' : ''}`}
                    title="Helpful"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: message.feedback === 'positive' ? '#22c55e' : 'inherit' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={message.feedback === 'positive' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                  </button>
                  <button 
                    onClick={() => onFeedback(message.id, 'negative')} 
                    class={`tool-btn ${message.feedback === 'negative' ? 'active' : ''}`}
                    title="Not helpful"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: message.feedback === 'negative' ? '#ef4444' : 'inherit' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={message.feedback === 'negative' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
                  </button>
                </div>
              )}
            </div>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
