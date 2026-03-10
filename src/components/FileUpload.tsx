// File Upload Component

import { useRef, useState, useEffect } from 'preact/hooks';

export interface FileAttachment {
  file: File;
  preview?: string;
  type: 'image' | 'pdf' | 'other';
}

interface FileUploadProps {
  onFileSelect: (file: FileAttachment) => void;
  onError?: (message: string) => void;
  accept?: string;
  maxSize?: number; // MB
}

export function FileUpload({ onFileSelect, onError, maxSize = 10 }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [currentAccept, setCurrentAccept] = useState('');

  const handleClick = () => {
    setShowMenu(!showMenu);
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

    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const selectFileType = (type: 'image' | 'document' | 'pdf') => {
    let accept = '';

    switch (type) {
      case 'image':
        accept = 'image/*';
        break;
      case 'pdf':
        accept = '.pdf';
        break;
      case 'document':
        accept = '.doc,.docx,.txt,.xls,.xlsx';
        break;
    }

    setCurrentAccept(accept);
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

    // Determine file type
    let type: 'image' | 'pdf' | 'other' = 'other';
    if (file.type.startsWith('image/')) {
      type = 'image';
    } else if (file.type === 'application/pdf') {
      type = 'pdf';
    }

    // Create preview for images
    let preview: string | undefined;
    if (type === 'image') {
      try {
        preview = await readFileAsDataURL(file);
      } catch (error) {
        onError?.('Error loading image.');
        return;
      }
    }

    onFileSelect({ file, preview, type });

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
        accept={currentAccept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label="Select file"
      />
      <button
        type="button"
        className="file-upload-btn"
        onClick={handleClick}
        aria-label="Add file"
        aria-expanded={showMenu}
        aria-haspopup="menu"
        title="Add image, PDF or document"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      </button>

      {showMenu && (
        <div className="file-type-menu">
          <button className="file-type-option" onClick={() => selectFileType('image')}>
            <span className="file-type-icon">🖼️</span>
            <span className="file-type-label">Image</span>
          </button>
          <button className="file-type-option" onClick={() => selectFileType('pdf')}>
            <span className="file-type-icon">📄</span>
            <span className="file-type-label">PDF</span>
          </button>
          <button className="file-type-option" onClick={() => selectFileType('document')}>
            <span className="file-type-icon">📎</span>
            <span className="file-type-label">Document</span>
          </button>
        </div>
      )}
    </div>
  );
}
