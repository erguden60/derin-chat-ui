import { render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { MessageComponent } from './Message';
import { mergeConfig } from '../utils/helpers';

describe('MessageComponent', () => {
  it('uses configured labels for edited state and message tools', () => {
    const config = mergeConfig({
      mock: true,
      ui: {
        locale: 'en-US',
        texts: {
          edit: 'Edit message',
          edited: 'edited by user',
          copy: 'Copy answer',
          regenerate: 'Retry answer',
          helpful: 'Mark helpful',
          notHelpful: 'Mark not helpful',
        },
      },
      features: {
        messageTools: true,
        timestamps: true,
        avatars: false,
      },
    });

    render(
      <MessageComponent
        config={config}
        message={{
          id: 'bot-1',
          sender: 'bot',
          text: 'Answer',
          timestamp: '2026-07-28T10:00:00.000Z',
          isEdited: true,
        }}
        onCopy={vi.fn()}
        onRegenerate={vi.fn()}
        onFeedback={vi.fn()}
      />
    );

    expect(screen.getByText('(edited by user)')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy answer')).toBeInTheDocument();
    expect(screen.getByLabelText('Retry answer')).toBeInTheDocument();
    expect(screen.getByLabelText('Mark helpful')).toBeInTheDocument();
    expect(screen.getByLabelText('Mark not helpful')).toBeInTheDocument();
  });

  it('adds an aria label to the user edit action', () => {
    const config = mergeConfig({
      mock: true,
      ui: {
        texts: {
          edit: 'Edit message',
        },
      },
      features: {
        messageTools: true,
        timestamps: false,
        avatars: false,
      },
    });

    render(
      <MessageComponent
        config={config}
        message={{
          id: 'user-1',
          sender: 'user',
          text: 'Question',
          timestamp: '2026-07-28T10:00:00.000Z',
        }}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Edit message')).toBeInTheDocument();
  });
});
