// Chat Input Component

import { SendIcon } from '../icons';
import { FileUpload, type FileAttachment } from './FileUpload';
import { FilePreview } from './FilePreview';
import { VoiceInput } from './VoiceInput';

interface ChatInputProps {
  value: string;
  placeholder: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  fileAttachment?: FileAttachment;
  onFileSelect?: (file: FileAttachment) => void;
  onFileRemove?: () => void;
  onError?: (message: string) => void;
  enableFileUpload?: boolean;
  maxFileSize?: number;
  acceptFileTypes?: string;
  enableVoiceInput?: boolean;
  voiceLanguage?: string;
}

export function ChatInput({
  value,
  placeholder,
  disabled,
  onChange,
  onSend,
  fileAttachment,
  onFileSelect,
  onFileRemove,
  onError,
  enableFileUpload = true,
  maxFileSize,
  acceptFileTypes,
  enableVoiceInput = false,
  voiceLanguage = 'tr-TR',
}: ChatInputProps) {
  const handleKeyPress = (e: KeyboardEvent) => {
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

  const canSend = (value.trim() || fileAttachment) && !disabled;

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
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onInput={(e) => onChange(e.currentTarget.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          aria-label="Type your message"
        />

        {/* Send Button */}
        <button onClick={onSend} disabled={!canSend} aria-label="Send message" class="send-btn">
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
