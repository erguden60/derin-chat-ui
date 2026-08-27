const navLinks = [
  { label: 'UI Lab', hash: '#/ui-lab' },
  { label: 'Home', hash: '#/home' },
  { label: 'Docs', hash: '#/docs' },
];

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

function NpmIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z"/>
    </svg>
  );
}

interface NavbarProps {
  currentHash: string;
}

export function Navbar({ currentHash }: NavbarProps) {
  const currentPath = currentHash === '#/' || !currentHash ? '#/home' : currentHash;

  return (
    <nav class="navbar">
      <a href="#/home" class="navbar-brand">
        <img src="/logo.jpg" alt="" class="navbar-logo" />
        <span>derin-chat<span class="brand-dot">.</span>ui</span>
      </a>

      <ul class="navbar-links">
        {navLinks.map(link => (
          <li key={link.hash}>
            <a
              href={link.hash}
              class={currentPath === link.hash ? 'active' : ''}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <div class="navbar-external">
        <a href="https://github.com/erguden60/derin-chat-ui" target="_blank" rel="noopener noreferrer">
          <GitHubIcon /> GitHub
        </a>
        <a href="https://www.npmjs.com/package/derin-chat-ui" target="_blank" rel="noopener noreferrer">
          <NpmIcon /> npm
        </a>
      </div>
    </nav>
  );
}
