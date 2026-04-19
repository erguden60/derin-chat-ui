// Single Message Component

import type { Message, ChatConfig } from '../types';
import { QuickReplies } from './QuickReplies';
import { parseMarkdown } from '../utils/markdown';
import { useState, useEffect, useRef } from 'preact/hooks';
import { SpeakerIcon } from '../icons';

interface MessageProps {
  message: Message;
  config: Required<ChatConfig>;
  onQuickReplySelect?: (value: string) => void;
  onCopy?: (messageId: string, text: string) => void;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
  onEdit?: (messageId: string, newText: string) => void;
}

export function MessageComponent({
  message,
  config,
  onQuickReplySelect,
  onCopy,
  onRegenerate,
  onFeedback,
  onEdit
}: MessageProps) {
  const isUser = message.sender === 'user';
  const isAgent = message.sender === 'agent';
  const showAvatar = config.features.avatars && (isAgent || message.agent);
  const showTimestamp = config.features.timestamps;

  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.text);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleQuickReply = (reply: unknown) => {
    if (
      onQuickReplySelect &&
      typeof reply === 'object' &&
      reply !== null &&
      typeof (reply as { value?: unknown }).value === 'string'
    ) {
      onQuickReplySelect((reply as { value: string }).value);
    }
  };

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = message.text || '';
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      // Fallback: HTTP ortamları ve eski tarayıcılar için
      const el = document.createElement('textarea');
      el.value = textToCopy;
      el.style.position = 'fixed';
      el.style.top = '0';
      el.style.left = '0';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    if (onCopy) onCopy(message.id, textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const contentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const buttons = contentRef.current.querySelectorAll('.code-copy-btn');
    const handleCopy = async (e: Event) => {
      const btn = e.currentTarget as HTMLButtonElement;
      const rawCodeEncoded = btn.getAttribute('data-raw');
      if (rawCodeEncoded) {
        const rawCode = decodeURIComponent(rawCodeEncoded);
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(rawCode);
          } else {
            const el = document.createElement('textarea');
            el.value = rawCode;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
          }
          
          const textSpan = btn.querySelector('.copy-text');
          const originalText = textSpan?.textContent || '';
          if (textSpan) textSpan.textContent = config.ui?.texts?.copied || 'Copied!';
          btn.classList.add('copied');
          btn.setAttribute('data-tooltip', config.ui?.texts?.copied || 'Copied!');
          setTimeout(() => {
            if (textSpan) textSpan.textContent = originalText;
            btn.classList.remove('copied');
            btn.setAttribute('data-tooltip', config.ui?.texts?.copy || 'Copy');
          }, 2000);
        } catch (err) {
          console.error('Copy failed:', err);
        }
      }
    };

    buttons.forEach((btn) => btn.addEventListener('click', handleCopy));
    return () => {
      buttons.forEach((btn) => btn.removeEventListener('click', handleCopy));
    };
  }, [message.text, config.ui?.texts]);

  // Render message text with or without markdown
  const renderMessageText = () => {
    if (config.features.markdown) {
      return <span ref={contentRef} dangerouslySetInnerHTML={{ __html: parseMarkdown(message.text, config.ui?.texts) }} />;
    }
    return <span ref={contentRef}>{message.text}</span>;
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

      // Debug: mevcut sesleri konsola yaz
      const langPrefix = targetLang.split('-')[0].toLowerCase();
      const availableTrVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));
      if (availableTrVoices.length === 0 && voices.length > 0) {
        console.warn(
          `⚠️ DerinChat TTS: "${targetLang}" dili için ses bulunamadı. ` +
          `Tarayıcı varsayılan sesini kullanacak.\n` +
          `Mevcut sesler: ${voices.map(v => `${v.name} (${v.lang})`).join(', ')}`
        );
      }

      // Önce voiceName ile tam eşleşme dene
      if (config.features.voice?.voiceName && voices.length > 0) {
        const targetName = config.features.voice.voiceName.toLowerCase();
        selectedVoice = voices.find(v => v.name.toLowerCase().includes(targetName));
      }

      if (!selectedVoice && voices.length > 0) {
        // Önce tam dil kodu eşleşmesi (tr-TR), sonra prefix (tr)
        const exactMatch = voices.find(v => v.lang.toLowerCase() === targetLang.toLowerCase());
        if (exactMatch) {
          selectedVoice = exactMatch;
        } else {
          const matchingVoices = voices.filter(v =>
            v.lang.toLowerCase().startsWith(langPrefix)
          );

          if (matchingVoices.length > 0) {
            // Google/Microsoft/Apple sesleri önce, sonra localService, sonra ilk eşleşen
            const premiumVoice = matchingVoices.find(v =>
              v.name.includes('Google') ||
              v.name.includes('Microsoft') ||
              v.name.includes('Apple')
            ) || matchingVoices.find(v => v.localService) || matchingVoices[0];
            selectedVoice = premiumVoice;
          }
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        (config.onVoiceStart ?? config.events?.onVoiceStart)?.();
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        (config.onVoiceEnd ?? config.events?.onVoiceEnd)?.();
      };
      
      utterance.onerror = (e) => {
        console.error('Text-to-Speech error', e);
        setIsPlaying(false);
        (config.onVoiceEnd ?? config.events?.onVoiceEnd)?.();
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

  const handleEditSubmit = () => {
    if (onEdit && editValue.trim() !== '' && editValue !== message.text) {
      onEdit(message.id, editValue);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditValue(message.text);
    setIsEditing(false);
  };

  return (
    <div class={`message-wrapper ${message.sender} ${isEditing ? 'is-editing' : ''}`}>
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
        
        {isEditing ? (
          <div class={`message ${message.sender} editing-mode`}>
            <textarea
              class="edit-textarea"
              value={editValue}
              onChange={(e) => setEditValue((e.target as HTMLTextAreaElement).value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  handleEditCancel();
                } else if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleEditSubmit();
                }
              }}
            />
            <div class="edit-actions">
              <button class="edit-btn-cancel" onClick={handleEditCancel}>{config.ui?.texts?.cancel || 'Cancel'}</button>
              <button class="edit-btn-save" onClick={handleEditSubmit}>{config.ui?.texts?.save || 'Save'}</button>
            </div>
          </div>
        ) : (
          <div class={`message ${message.sender}`}>
            {(() => {
              if (config.renderCustomMessage) {
                const custom = config.renderCustomMessage(message);
                if (custom) {
                  if (typeof custom === 'object' && custom !== null && 'html' in custom) {
                    return <div dangerouslySetInnerHTML={{ __html: custom.html }} />;
                  }
                  return custom;
                }
              }
              return renderMessageText();
            })()}

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
        )}

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
            {message.isEdited && <span class="message-edited-badge"> (düzenlendi)</span>}
          </div>
        )}

        {/* Advanced Message Tools (Bot & User edit) */}
        {!message.isStreaming && (
          <div class={`message-tools${isUser ? ' user-tools' : ''}`}>
            
            {/* User Edit Button */}
            {isUser && onEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                class="tool-btn"
                data-tooltip="Düzenle"
                type="button"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
            )}

            {/* Copy Button (Bot) */}
            {!isUser && config.features.messageTools !== false && (
              <button
                onClick={handleCopy}
                class="tool-btn"
                data-tooltip={isCopied 
                  ? (config.ui?.texts?.copied || 'Copied!') 
                  : (config.ui?.texts?.copy || 'Copy message')}
                type="button"
              >
                {isCopied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                )}
              </button>
            )}

            {/* Regenerate Button (Bot) */}
            {!isUser && config.features.messageTools !== false && onRegenerate && (
              <button
                onClick={() => onRegenerate(message.id)}
                class="tool-btn"
                data-tooltip={config.ui?.texts?.regenerate || 'Regenerate'}
                type="button"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m0 0a9 9 0 0 1 9-9m-9 9a9 9 0 0 0 9 9m-9-9h18" strokeDasharray="4 4" /></svg>
              </button>
            )}

            {/* Text-to-Speech Button */}
            {config.features.voice?.output && (
              <button
                onClick={handleTextToSpeech}
                class={`tool-btn ${isPlaying ? 'active' : ''}`}
                data-tooltip={isPlaying 
                  ? (config.ui?.texts?.stopSpeaking || 'Stop') 
                  : (config.ui?.texts?.readAloud || 'Read aloud')}
                type="button"
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
                  data-tooltip={config.ui?.texts?.helpful || 'Helpful'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: message.feedback === 'positive' ? '#22c55e' : 'inherit' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={message.feedback === 'positive' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                </button>
                <button
                  onClick={() => onFeedback(message.id, 'negative')}
                  class={`tool-btn ${message.feedback === 'negative' ? 'active' : ''}`}
                  data-tooltip={config.ui?.texts?.notHelpful || 'Not helpful'}
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
