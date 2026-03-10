import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { ChatHeader } from './ChatHeader';
import type { ChatConfig } from '../types';

describe('ChatHeader Component', () => {
    const mockConfig: Required<ChatConfig> = {
        apiUrl: '',
        mock: false,
        apiKey: '',
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
        },
        features: {},
        behavior: {},
        user: {},
        messageFormat: {}
    } as any; // Partial mock

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
        const loadingConfig = {
            ...mockConfig,
            ui: {
                texts: { ...mockConfig.ui.texts, loading: 'Loading...' }
            }
        } as any;

        render(
            <ChatHeader
                config={loadingConfig}
                isLoading={true}
                onClose={() => { }}
            />
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
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
