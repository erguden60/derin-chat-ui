// File Preview Component

import type { FileAttachment } from './FileUpload';

interface FilePreviewProps {
  attachment: FileAttachment;
  onRemove: () => void;
}

export function FilePreview({ attachment, onRemove }: FilePreviewProps) {
  const { file, preview, type } = attachment;

  return (
    <div class="file-preview">
      <div class="file-preview-content">
        {/* Image Preview */}
        {type === 'image' && preview && (
          <img src={preview} alt={file.name} class="file-preview-image" />
        )}

        {/* PDF Icon */}
        {type === 'pdf' && (
          <div class="file-preview-icon pdf">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <text x="12" y="17" text-anchor="middle" font-size="6" fill="white">
                PDF
              </text>
            </svg>
          </div>
        )}

        {/* Other Files */}
        {type === 'other' && (
          <div class="file-preview-icon other">
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
          </div>
        )}

        {/* File Info */}
        <div class="file-preview-info">
          <span class="file-name">{file.name}</span>
          <span class="file-size">{formatFileSize(file.size)}</span>
        </div>
      </div>

      {/* Remove Button */}
      <button type="button" class="file-preview-remove" onClick={onRemove} aria-label="Remove file">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
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
