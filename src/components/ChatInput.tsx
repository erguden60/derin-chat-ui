// Chat Input Component

import { useEffect, useRef } from 'preact/hooks';
import { SendIcon, StopIcon } from '../icons';
import { FileUpload, type FileAttachment } from './FileUpload';
import { FilePreview } from './FilePreview';
import { VoiceInput } from './VoiceInput';

interface ChatInputProps {
  value: string;
  placeholder: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onStopGenerating?: () => void;
  fileAttachment?: FileAttachment;
  onFileSelect?: (file: FileAttachment) => void;
  onFileRemove?: () => void;
  onError?: (message: string) => void;
  enableFileUpload?: boolean;
  maxFileSize?: number;
  acceptFileTypes?: string;
  enableVoiceInput?: boolean;
  voiceLanguage?: string;
  onUserTyping?: () => void;
}

export function ChatInput({
  value,
  placeholder,
  disabled,
  onChange,
  onSend,
  onStopGenerating,
  fileAttachment,
  onFileSelect,
  onFileRemove,
  onError,
  enableFileUpload = true,
  maxFileSize,
  acceptFileTypes,
  enableVoiceInput = false,
  voiceLanguage = 'tr-TR',
  onUserTyping,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = '22px';
    const nextHeight = Math.min(textarea.scrollHeight, 72);
    textarea.style.height = `${nextHeight}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleVoiceResult = (text: string) => {
    // Append the voice text to the current value, adding a space if not empty
    const newValue = value ? `${value} ${text}` : text;
    onChange(newValue);
  };

  const canSend = ((value || '').trim() || fileAttachment) && !disabled;

  return (
    <div class="chat-input-wrapper">
      {/* File Preview */}
      {fileAttachment && onFileRemove && (
        <FilePreview attachment={fileAttachment} onRemove={onFileRemove} />
      )}

      {/* Input Area */}
      <div class="chat-input-area">
        {/* Left Actions */}
        {(enableFileUpload || enableVoiceInput) && (
          <div class="chat-input-actions">
            {/* File Upload Button */}
            {enableFileUpload && onFileSelect && (
              <FileUpload
                onFileSelect={onFileSelect}
                onError={onError}
                maxSize={maxFileSize}
                accept={acceptFileTypes}
              />
            )}

            {/* Voice Input Button */}
            {enableVoiceInput && (
              <VoiceInput 
                onResult={handleVoiceResult} 
                onError={onError} 
                language={voiceLanguage}
                disabled={disabled}
              />
            )}
          </div>
        )}

        {/* Text Input */}
        <div class="chat-input-field">
          <textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={value}
            onInput={(e) => {
              onChange(e.currentTarget.value);
              onUserTyping?.();
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label="Type your message"
            rows={1}
          />
        </div>

        {/* Send / Stop Button */}
        {disabled && onStopGenerating ? (
          <button onClick={onStopGenerating} aria-label="Stop generating" class="send-btn stop-btn" type="button">
            <StopIcon />
          </button>
        ) : (
          <button onClick={onSend} disabled={!canSend} aria-label="Send message" class="send-btn" type="button">
            <SendIcon />
          </button>
        )}
      </div>
    </div>
  );
}
