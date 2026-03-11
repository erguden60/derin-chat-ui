// Simple Markdown Parser (no external dependencies)

export function parseMarkdown(text: string): string {
  if (!text) return '';

  let html = text;

  // Escape HTML to prevent XSS
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Headers (# ## ###)
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic *text* or _text_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Inline code `code`
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // Links [text](url) - with protocol validation
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
    // Only allow safe protocols
    const safeProtocols = /^(https?:\/\/|mailto:)/i;
    if (typeof url === 'string' && safeProtocols.test(url.trim())) {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    // If protocol is not safe, render as plain text
    return `${text} (${url})`;
  });

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  return html;
}
