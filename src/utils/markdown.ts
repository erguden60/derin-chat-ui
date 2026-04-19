export function parseMarkdown(text: string, textsConfig?: { copy?: string }): string {
  if (!text) return '';

  let html = text;

  // Extract code blocks first to protect them from inline formatting
  const codeBlocks: string[] = [];
  
  html = html.replace(/```([\w-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    // 1. Basic structural escape for the code content
    let escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
       
    // 2. Micro Syntax Highlighting (Basic JS/TS/CSS/JSON regexes)
    // Strings (handle "", '', and ``) - this needs to handle HTML escaped quotes too since we just escaped them above
    escapedCode = escapedCode.replace(/(&quot;.*?&quot;)/g, '<span class="tok-string">$1</span>');
    escapedCode = escapedCode.replace(/(&#039;.*?&#039;)/g, '<span class="tok-string">$1</span>');
    // `backticks` cannot be trivially replaced if they act as template strings, but we can try
    
    // Keywords
    const keywords = [
      'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 
      'import', 'export', 'from', 'class', 'extends', 'true', 'false', 'null', 
      'undefined', 'await', 'async', 'interface', 'type', 'switch', 'case'
    ];
    // Regex matches the keyword at word boundaries
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    
    escapedCode = escapedCode.replace(keywordRegex, '<span class="tok-keyword">$1</span>');
    
    // Numbers
    escapedCode = escapedCode.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="tok-number">$1</span>');
    
    // Single line comments
    // Matches //... but we handle the fact that it might have escaped chars
    escapedCode = escapedCode.replace(/(\/\/.*?)(?=\n|$)/g, '<span class="tok-comment">$1</span>');
    
    // Properties/Methods like .map or object keys key:
    escapedCode = escapedCode.replace(/(\.\w+)/g, '<span class="tok-method">$1</span>');
    
    // 3. Assemble the block
    const copyText = textsConfig?.copy || 'Kopyala';
    const langLabel = lang ? lang.toLowerCase() : 'code';

    // We store raw unescaped code in a data attribute to make pure copying easy, 
    // encoding it fully to prevent breaking the DOM attribute
    const rawCodeEncoded = encodeURIComponent(code);

    const blockHtml = `
      <div class="derin-code-block" data-lang="${langLabel}">
        <div class="code-header">
          <span class="code-lang">${langLabel}</span>
          <button class="code-copy-btn" data-raw="${rawCodeEncoded}" data-tooltip="${copyText}">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-copy"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
             <span class="copy-text">${copyText}</span>
          </button>
        </div>
        <pre><code class="language-${langLabel}">${escapedCode}</code></pre>
      </div>
    `;
    codeBlocks.push(blockHtml);
    return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
  });

  // Now escape HTML for the rest of the text to prevent XSS
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

  // Inline code `code` (we must escape the backticks matching)
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // Links [text](url) - with protocol validation
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
    // Only allow safe protocols
    const safeProtocols = /^(https?:\/\/|mailto:)/i;
    // URL may contain escaped characters, decode for test, encode for attribute
    if (typeof url === 'string' && safeProtocols.test(url.trim())) {
      return `<a href="${url.trim()}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    // If protocol is not safe, render as plain text
    return `${text} (${url})`;
  });

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  // Re-inject code blocks
  codeBlocks.forEach((block, index) => {
    html = html.replace(`___CODE_BLOCK_${index}___`, block);
  });

  return html;
}
