import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { Launcher } from './Launcher';

describe('Launcher Component', () => {
    it('renders correctly', () => {
        // Default render (closed state)
        render(<Launcher isOpen={false} onClick={() => { }} />);

        // Check if button exists
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();

        // Check default aria-label (english)
        expect(button).toHaveAttribute('aria-label', 'Open chat');
    });

    it('shows correct label when open', () => {
        render(<Launcher isOpen={true} onClick={() => { }} />);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Close chat');
        expect(button).toHaveClass('is-open'); // Check class toggling
    });

    it('calls onClick handler when clicked', () => {
        const handleClick = vi.fn();
        render(<Launcher isOpen={false} onClick={handleClick} />);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports custom aria-label', () => {
        render(<Launcher isOpen={false} onClick={() => { }} ariaLabel="Sohbeti Aç" />);
        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Sohbeti Aç');
    });
});
