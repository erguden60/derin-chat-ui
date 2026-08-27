import { fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VoiceInput } from './VoiceInput';

describe('VoiceInput', () => {
  afterEach(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
    vi.restoreAllMocks();
  });

  it('reports start failures through onError', () => {
    const onError = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const startMock = vi.fn(() => {
      throw new Error('blocked');
    });

    class MockSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = 'en-US';
      onstart = null;
      onresult = null;
      onerror = null;
      onend = null;
      start = startMock;
      stop = vi.fn();
      abort = vi.fn();
    }

    window.SpeechRecognition = MockSpeechRecognition;

    render(
      <VoiceInput
        onResult={vi.fn()}
        onError={onError}
        ariaLabel="Voice input"
        startTitle="Start voice input"
        stopTitle="Stop voice input"
      />
    );

    fireEvent.click(screen.getByLabelText('Voice input'));

    expect(onError).toHaveBeenCalledWith('Failed to start speech recognition.');
  });
});
