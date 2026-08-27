// File Preview Component

import type { ComponentChild } from 'preact';
import type { FileAttachment } from '../types';
import { CloseIcon, FileTextIcon, ImageIcon, PaperclipIcon } from '../icons';

interface FilePreviewProps {
  attachment: FileAttachment;
  onRemove: () => void;
  renderPreview?: (attachment: FileAttachment, onRemove: () => void) => ComponentChild;
}

function PreviewIcon({ attachment }: { attachment: FileAttachment }) {
  if (attachment.kind === 'image') return <ImageIcon />;
  if (attachment.kind === 'pdf' || attachment.kind === 'document') return <FileTextIcon />;
  return <PaperclipIcon />;
}

export function FilePreview({ attachment, onRemove, renderPreview }: FilePreviewProps) {
  const { file, preview, kind } = attachment;

  if (renderPreview) {
    return <>{renderPreview(attachment, onRemove)}</>;
  }

  return (
    <div class="file-preview">
      <div class="file-preview-content">
        {/* Image Preview */}
        {kind === 'image' && preview && (
          <img src={preview} alt={file.name} class="file-preview-image" />
        )}

        {!(kind === 'image' && preview) && (
          <div class={`file-preview-icon ${kind}`}>
            <PreviewIcon attachment={attachment} />
          </div>
        )}

        {/* File Info */}
        <div class="file-preview-info">
          <span class="file-name">{file.name}</span>
          <span class="file-size">
            {attachment.label ? `${attachment.label} · ` : ''}
            {formatFileSize(file.size)}
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <button type="button" class="file-preview-remove" onClick={onRemove} aria-label="Remove file">
        <CloseIcon />
      </button>
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
