import { render, screen, fireEvent, act } from '@testing-library/preact';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { FileUpload } from './FileUpload';

describe('FileUpload Component', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders professional default attachment options without emoji labels', () => {
    const { container } = render(<FileUpload onFileSelect={() => {}} />);

    fireEvent.click(screen.getByLabelText('Add file'));

    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Document')).toBeInTheDocument();
    expect(screen.getByText('PNG, JPG, GIF')).toBeInTheDocument();
    expect(container.querySelectorAll('.file-type-icon svg')).toHaveLength(3);
  });

  it('returns selected attachment metadata for custom attachment types', async () => {
    vi.useFakeTimers();
    const onFileSelect = vi.fn();
    render(
      <FileUpload
        onFileSelect={onFileSelect}
        attachmentTypes={[
          {
            id: 'spreadsheet',
            label: 'Spreadsheet',
            accept: '.csv,.xlsx',
            kind: 'document',
            description: 'CSV or Excel',
          },
        ]}
      />
    );

    fireEvent.click(screen.getByLabelText('Add file'));

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const input = screen.getByLabelText('Select file') as HTMLInputElement;
    const file = new File(['a,b'], 'report.csv', { type: 'text/csv' });

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    expect(onFileSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        file,
        type: 'spreadsheet',
        kind: 'document',
        label: 'Spreadsheet',
      })
    );
  });
});
