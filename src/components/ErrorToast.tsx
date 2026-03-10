// Error Toast Component - In-chat error messages

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

export function ErrorToast({ message, onClose }: ErrorToastProps) {
  return (
    <div className="error-toast">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <span className="error-text">{message}</span>
      </div>
      <button className="error-close" onClick={onClose} aria-label="Close error">
        ✕
      </button>
    </div>
  );
}
