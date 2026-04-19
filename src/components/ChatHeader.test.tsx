import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { ChatHeader } from './ChatHeader';
import type { ChatConfig } from '../types';
import { mergeConfig } from '../utils/helpers';

describe('ChatHeader Component', () => {
    const mockConfig = mergeConfig({
        mock: false,
        ui: {
            texts: {
                title: 'Test Title',
                subtitle: 'Test Subtitle',
                closeChat: 'Close Test'
            },
            colors: {},
            position: 'bottom-right',
            zIndex: 9999,
            fontFamily: '',
            logo: '',
            fileUpload: {}
        }
    });

    it('renders title and subtitle correctly', () => {
        render(
            <ChatHeader
                config={mockConfig}
                isLoading={false}
                onClose={() => { }}
            />
        );

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('shows loading state text', () => {
        const loadingConfig: Required<ChatConfig> = {
            ...mockConfig,
            ui: {
                ...mockConfig.ui,
                texts: { ...mockConfig.ui.texts, loading: 'Loading...' }
            }
        };

        render(
            <ChatHeader
                config={loadingConfig}
                isLoading={true}
                onClose={() => { }}
            />
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows connection-aware subtitle when reconnecting', () => {
        render(
            <ChatHeader
                config={mockConfig}
                isLoading={false}
                onClose={() => { }}
                connectionStatus="reconnecting"
            />
        );

        expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
    });

    it('uses configured close label', () => {
        render(
            <ChatHeader
                config={mockConfig}
                isLoading={false}
                onClose={() => { }}
            />
        );

        const closeBtn = screen.getByLabelText('Close Test');
        expect(closeBtn).toBeInTheDocument();
    });

    it('calls onClose when button clicked', () => {
        const handleClose = vi.fn();
        render(
            <ChatHeader
                config={mockConfig}
                isLoading={false}
                onClose={handleClose}
            />
        );

        fireEvent.click(screen.getByRole('button'));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});
