// Voice Input Component

import { useState, useEffect, useRef } from 'preact/hooks';
import { MicIcon } from '../icons';

type SpeechRecognitionResultEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

// Add TypeScript support for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface VoiceInputProps {
  onResult: (text: string) => void;
  onError?: (error: string) => void;
  language?: string;
  disabled?: boolean;
}

export function VoiceInput({
  onResult,
  onError,
  language = 'tr-TR', // Default to Turkish as requested earlier in context
  disabled = false,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        setIsRecording(false);
        if (event.error !== 'aborted' && onError) {
          onError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      setIsSupported(false);
      console.error('Speech recognition initialization failed', e);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, onResult, onError]);

  const toggleRecording = () => {
    if (!recognitionRef.current || disabled) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start speech recognition', e);
        setIsRecording(false);
      }
    }
  };

  if (!isSupported) {
    return null; // Don't render anything if not supported
  }

  return (
    <button
      class={`voice-input-btn ${isRecording ? 'recording' : ''}`}
      onClick={toggleRecording}
      disabled={disabled}
      title={isRecording ? 'Click to stop recording' : 'Click to speak'}
      aria-label="Voice Input"
      type="button"
    >
      <MicIcon />
      {isRecording && <span class="recording-indicator" />}
    </button>
  );
}
