// File Upload Component

import { useRef, useState, useEffect } from 'preact/hooks';
import type { ComponentChild } from 'preact';
import type { AttachmentKind, AttachmentTypeConfig, FileAttachment } from '../types';
import { FileTextIcon, ImageIcon, PaperclipIcon, PlusIcon } from '../icons';

export type { FileAttachment } from '../types';

interface FileUploadProps {
  onFileSelect: (file: FileAttachment) => void;
  onError?: (message: string) => void;
  accept?: string;
  maxSize?: number; // MB
  attachmentTypes?: AttachmentTypeConfig[];
  renderTrigger?: (props: { open: boolean; disabled?: boolean }) => ComponentChild;
  renderMenuItem?: (type: AttachmentTypeConfig) => ComponentChild;
  labels?: {
    addFile?: string;
    selectFile?: string;
    attachmentType?: string;
  };
}

const FALLBACK_ATTACHMENT_TYPES: AttachmentTypeConfig[] = [
  {
    id: 'image',
    label: 'Image',
    accept: 'image/*',
    kind: 'image',
    description: 'PNG, JPG, GIF',
  },
  {
    id: 'pdf',
    label: 'PDF',
    accept: '.pdf,application/pdf',
    kind: 'pdf',
    description: 'PDF documents',
  },
  {
    id: 'document',
    label: 'Document',
    accept: '.doc,.docx,.txt,.xls,.xlsx,.csv',
    kind: 'document',
    description: 'Docs, sheets, text',
  },
];

function getAttachmentKind(file: File, selectedType?: AttachmentTypeConfig): AttachmentKind {
  if (selectedType?.kind) return selectedType.kind;
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) return 'pdf';
  return 'other';
}

function AttachmentTypeIcon({ kind }: { kind?: AttachmentKind }) {
  if (kind === 'image') return <ImageIcon />;
  if (kind === 'pdf' || kind === 'document') return <FileTextIcon />;
  return <PaperclipIcon />;
}

export function FileUpload({
  onFileSelect,
  onError,
  accept,
  maxSize = 10,
  attachmentTypes,
  renderTrigger,
  renderMenuItem,
  labels,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedType, setSelectedType] = useState<AttachmentTypeConfig | undefined>();
  const typeOptions = attachmentTypes?.length ? attachmentTypes : FALLBACK_ATTACHMENT_TYPES;

  const handleClick = () => {
    if (typeOptions.length <= 1) {
      setSelectedType(typeOptions[0]);
      setTimeout(() => inputRef.current?.click(), 100);
      return;
    }

    setShowMenu((value) => !value);
  };

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      // Use composedPath() for Shadow DOM compatibility
      const path = e.composedPath();
      const clickedInsideMenu = path.some((el) => el === menuRef.current);

      if (!clickedInsideMenu) {
        setShowMenu(false);
      }
    };

    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const selectFileType = (type: AttachmentTypeConfig) => {
    setSelectedType(type);
    setShowMenu(false);

    // Trigger file input
    setTimeout(() => inputRef.current?.click(), 100);
  };

  const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    // Size check - use onError instead of alert
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      onError?.(`File size must be less than ${maxSize}MB.`);
      return;
    }

    const kind = getAttachmentKind(file, selectedType);
    const type = selectedType?.id || kind;

    // Create preview for images
    let preview: string | undefined;
    if (kind === 'image') {
      try {
        preview = await readFileAsDataURL(file);
      } catch {
        onError?.('Error loading image.');
        return;
      }
    }

    onFileSelect({
      file,
      preview,
      type,
      kind,
      label: selectedType?.label,
    });

    // Reset input
    if (target) target.value = '';
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="file-upload-wrapper" ref={menuRef}>
      <input
        ref={inputRef}
        type="file"
        accept={selectedType?.accept || accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label={labels?.selectFile || 'Select file'}
      />
      <button
        type="button"
        className="file-upload-btn"
        onClick={handleClick}
        aria-label={labels?.addFile || 'Add file'}
        aria-expanded={showMenu}
        aria-haspopup="menu"
        title={labels?.addFile || 'Add file'}
      >
        {renderTrigger ? renderTrigger({ open: showMenu }) : <PlusIcon />}
      </button>

      {showMenu && (
        <div className="file-type-menu" role="menu" aria-label={labels?.attachmentType || 'Attachment type'}>
          {typeOptions.map((type) => (
            <button
              key={type.id}
              className="file-type-option"
              onClick={() => selectFileType(type)}
              type="button"
              role="menuitem"
            >
              {renderMenuItem ? (
                renderMenuItem(type)
              ) : (
                <>
                  <span className="file-type-icon" aria-hidden="true">
                    <AttachmentTypeIcon kind={type.kind} />
                  </span>
                  <span className="file-type-copy">
                    <span className="file-type-label">{type.label}</span>
                    {type.description && (
                      <span className="file-type-description">{type.description}</span>
                    )}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
