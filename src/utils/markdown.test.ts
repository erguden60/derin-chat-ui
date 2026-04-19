// Markdown Parser Tests - XSS Protection

import { describe, it, expect } from 'vitest';
import { parseMarkdown } from './markdown.js';

describe('parseMarkdown - XSS Protection', () => {
  it('should escape HTML tags', () => {
    const input = '<script>alert("xss")</script>';
    const output = parseMarkdown(input);

    expect(output).not.toContain('<script>');
    expect(output).toContain('&lt;script&gt;');
  });

  it('should block javascript: protocol in links', () => {
    const input = '[click me](javascript:alert(1))';
    const output = parseMarkdown(input);

    expect(output).not.toContain('href="javascript:');
    expect(output).toContain('click me (javascript:alert(1))');
  });

  it('should block data: protocol in links', () => {
    const input = '[click](data:text/html,<script>alert(1)</script>)';
    const output = parseMarkdown(input);

    expect(output).not.toContain('href="data:');
  });

  it('should allow safe http links', () => {
    const input = '[GitHub](https://github.com)';
    const output = parseMarkdown(input);

    expect(output).toContain('<a href="https://github.com"');
    expect(output).toContain('target="_blank"');
    expect(output).toContain('rel="noopener noreferrer"');
  });

  it('should allow safe https links', () => {
    const input = '[Site](http://example.com)';
    const output = parseMarkdown(input);

    expect(output).toContain('<a href="http://example.com"');
  });

  it('should allow mailto links', () => {
    const input = '[Email](mailto:test@example.com)';
    const output = parseMarkdown(input);

    expect(output).toContain('href="mailto:test@example.com"');
  });

  it('should escape quotes in links', () => {
    const input = 'Click <a href="malicious">here</a>';
    const output = parseMarkdown(input);

    expect(output).not.toContain('<a href=');
    expect(output).toContain('&lt;a');
  });

  it('should handle bold text safely', () => {
    const input = '**Bold <script>alert(1)</script>**';
    const output = parseMarkdown(input);

    expect(output).toContain('<strong>');
    expect(output).not.toContain('<script>');
  });

  it('should handle inline code safely', () => {
    const input = '`<script>alert(1)</script>`';
    const output = parseMarkdown(input);

    expect(output).toContain('<code>');
    expect(output).not.toContain('<script>');
  });

  it('should preserve line breaks', () => {
    const input = 'Line 1\nLine 2';
    const output = parseMarkdown(input);

    expect(output).toContain('<br>');
  });
});

describe('parseMarkdown - Edge Cases', () => {
  it('should handle empty string', () => {
    const output = parseMarkdown('');
    expect(output).toBe('');
  });

  it('should handle null/undefined safely', () => {
    expect(parseMarkdown(null as unknown as string)).toBe('');
    expect(parseMarkdown(undefined as unknown as string)).toBe('');
  });

  it('should handle multiple protocols in text', () => {
    const input = '[link1](javascript:alert(1)) [link2](https://safe.com)';
    const output = parseMarkdown(input);

    // Dangerous protocol in link markup is blocked, but text content may still contain it
    expect(output).not.toMatch(/<a[^>]*href="javascript:/);
    expect(output).toContain('https://safe.com');
  });
});
