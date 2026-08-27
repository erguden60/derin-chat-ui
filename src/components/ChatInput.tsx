// Chat Input Component

import { useEffect, useRef } from 'preact/hooks';
import { SendIcon, StopIcon } from '../icons';
import { FileUpload } from './FileUpload';
import { FilePreview } from './FilePreview';
import { VoiceInput } from './VoiceInput';
import type { ChatConfig, FileAttachment } from '../types';

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
  attachmentConfig?: Required<ChatConfig>['attachments'];
  enableVoiceInput?: boolean;
  voiceLanguage?: string;
  texts?: Required<ChatConfig>['ui']['texts'];
  onVoiceError?: (error: string) => void;
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
  attachmentConfig,
  enableVoiceInput = false,
  voiceLanguage = 'en-US',
  texts,
  onVoiceError,
  onUserTyping,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = Boolean(((value || '').trim() || fileAttachment) && !disabled);

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
      if (canSend) onSend();
    }
  };

  const handleVoiceResult = (text: string) => {
    // Append the voice text to the current value, adding a space if not empty
    const newValue = value ? `${value} ${text}` : text;
    onChange(newValue);
  };

  const handleVoiceError = (message: string) => {
    onVoiceError?.(message);
    onError?.(message);
  };

  return (
    <div class="chat-input-wrapper">
      {/* File Preview */}
      {fileAttachment && onFileRemove && (
        <FilePreview
          attachment={fileAttachment}
          onRemove={onFileRemove}
          renderPreview={attachmentConfig?.renderPreview}
        />
      )}

      {/* Input Area */}
      <div class="chat-input-area">
        {/* Left Actions */}
        {enableFileUpload && onFileSelect && (
          <div class="chat-input-actions">
            <FileUpload
              onFileSelect={onFileSelect}
              onError={onError}
              maxSize={attachmentConfig?.maxSize || maxFileSize}
              accept={acceptFileTypes}
              attachmentTypes={attachmentConfig?.types}
              renderTrigger={attachmentConfig?.renderTrigger}
              renderMenuItem={attachmentConfig?.renderMenuItem}
              labels={{
                addFile: texts?.addFile,
                selectFile: texts?.selectFile,
                attachmentType: texts?.attachmentType,
              }}
            />
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

          <div class="chat-input-inline-actions">
            {enableVoiceInput && (
              <VoiceInput
                onResult={handleVoiceResult}
                onError={handleVoiceError}
                language={voiceLanguage}
                disabled={disabled}
                ariaLabel={texts?.voiceInput}
                startTitle={texts?.startVoiceInput}
                stopTitle={texts?.stopVoiceInput}
              />
            )}

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
      </div>
    </div>
  );
}
