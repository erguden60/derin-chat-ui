# derin-chat-ui v1.0.13 Release Manifest

Date: 2026-08-09  
Current published npm version: 1.0.12  
Target release version: 1.0.13

This manifest defines what should be included in the v1.0.13 release, what stays repository-only, and what must be excluded from version control and npm publishing.

## Release Position

v1.0.13 is a patch release with a broad polish and documentation scope. It should be treated as the prepared npm release that follows the currently published v1.0.12 package.

Primary release themes:

- npm-first documentation and package metadata alignment
- bundled Preact consumer model
- Shadow DOM style isolation improvements
- multi-instance and mount-target support
- attachment API and file upload UI refinement
- runtime config validation hardening
- UI Lab and local documentation site updates
- expanded public TypeScript exports
- test coverage refresh

## Must Include In Git

These files should be committed for v1.0.13 because they define the release source, package metadata, documentation, or verification state.

### Package Metadata

- `package.json`
- `package-lock.json`
- `CHANGELOG.md`
- `README.md`
- `README.github.md`
- `devdocs.md`
- `RELEASE_CHECKLIST.md`
- `RELEASE_MANIFEST_1.0.13.md`
- `LICENSE`

### Library Build Configuration

- `vite.config.ts`
- `tsconfig.app.json`
- `tsconfig.types.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `eslint.config.js`

Only include TypeScript/config files above if they are changed or required by the current working tree. Do not add generated build output to git.

### Public SDK Entry And Types

- `src/index.ts`
- `src/types/api.ts`
- `src/types/connection.ts`
- `src/types/index.ts`
- `src/types/message.ts`
- `src/constants/defaults.ts`

Reason: these files define the public package API, exported types, defaults, and runtime behavior documented for v1.0.13.

### Runtime SDK Source

- `src/components/ChatInput.tsx`
- `src/components/ChatMessages.tsx`
- `src/components/ChatWidget.tsx`
- `src/components/ChatWindow.tsx`
- `src/components/ErrorToast.tsx`
- `src/components/FilePreview.tsx`
- `src/components/FileUpload.tsx`
- `src/components/Message.tsx`
- `src/components/QuickReplies.tsx`
- `src/components/TypingIndicator.tsx`
- `src/components/VoiceInput.tsx`
- `src/components/index.ts`
- `src/hooks/useChatState.ts`
- `src/hooks/useMessageSender.ts`
- `src/hooks/useMessages.ts`
- `src/hooks/usePersistence.ts`
- `src/hooks/useWebSocket.ts`
- `src/hooks/index.ts`
- `src/icons.tsx`
- `src/utils/markdown.ts`
- `src/utils/validators.ts`
- `src/utils/api.ts`
- `src/utils/helpers.ts`
- `src/utils/messageParser.ts`
- `src/utils/storage.ts`
- `src/utils/websocket.ts`

Reason: these files form the shipped SDK source used to generate `dist`.

### Tests

- `src/events.test.ts`
- `src/index.test.ts`
- `src/components/ChatHeader.test.tsx`
- `src/components/FileUpload.test.tsx`
- `src/components/Launcher.test.tsx`
- `src/components/Message.test.tsx`
- `src/components/VoiceInput.test.tsx`
- `src/hooks/useChatState.test.ts`
- `src/hooks/useMessageSender.test.ts`
- `src/hooks/useMessages.test.ts`
- `src/hooks/usePersistence.test.ts`
- `src/hooks/useWebSocket.test.ts`
- `src/utils/markdown.test.ts`
- `src/utils/validators.test.ts`
- `src/utils/websocket.test.ts`
- `src/setupTests.ts`

Reason: current verification reports 15 test files and 142 passing tests.

### Styles

- `src/styles/main.scss`
- `src/styles/animations.scss`
- `src/styles/components/connection-status.scss`
- `src/styles/components/error-toast.scss`
- `src/styles/components/file-upload.scss`
- `src/styles/components/message.scss`
- `src/styles/components/quick-replies.scss`
- `src/styles/components/typing-indicator.scss`
- `src/styles/components/unread-badge.scss`

Reason: styles are bundled into the Shadow DOM output through `src/index.ts`.

### Local UI Lab And Documentation Site

- `dev.html`
- `src/dev-entry.tsx`
- `src/app.tsx`
- `src/pages/DocsPage.tsx`
- `src/pages/LandingPage.tsx`
- `src/pages/Navbar.tsx`
- `src/pages/ReactNextGuidePage.tsx`
- `src/pages/UiLabPage.tsx`
- `src/pages/pages.css`

Reason: these files power the local UI Lab and documentation/demo workflow. They should be committed if v1.0.13 intentionally includes the UI Lab refresh.

### Intentional Deletions

- `src/demo/DemoControls.tsx`
- `vite.config.demo.ts`

Reason: the old demo path has been replaced by the new UI Lab/dev entry flow.

## Repository-Only Documentation

These files are useful for maintainers. They should be committed if the project wants to preserve implementation notes, but they do not need to be included in the npm package.

- `ATTACHMENT_SYSTEM_CHANGES.md`
- `SHADOW_DOM_ISOLATION.md`

Recommended status: include in git, exclude from npm package.

Reason: their content is valuable for maintainers, but npm users already get the concise README, long GitHub README, and developer docs.

## Must Exclude From Git

These files should not be committed.

- `derin-chat-ui-1.0.13.tgz`
- `stats.html`
- `coverage/`
- `dist/`
- `node_modules/`
- `*.log`
- `*.tgz`

Status: `*.tgz` is ignored in `.gitignore` so npm pack artifacts do not appear as untracked files.

## npm Package Contents

The npm package is controlled by the `files` array in `package.json`.

Expected npm package entries:

- `dist`
- `README.md`
- `README.github.md`
- `devdocs.md`
- `CHANGELOG.md`
- `RELEASE_CHECKLIST.md`
- `LICENSE`
- `package.json`

Important note: `README.github.md` and `RELEASE_CHECKLIST.md` are included in `npm pack` because they exist in the working tree and are listed in `package.json`. They still must be committed to git so the npm artifact matches the release commit.

Repository-only files that should not be in npm:

- `src/**`
- `public/**`
- `dev.html`
- `index.html`
- `src/pages/**`
- `src/dev-entry.tsx`
- `RELEASE_MANIFEST_1.0.13.md`
- `ATTACHMENT_SYSTEM_CHANGES.md`
- `SHADOW_DOM_ISOLATION.md`
- test files
- config files not needed by consumers

## Final Verification Required Before Publish

Run these checks after the include/exclude list is accepted:

```bash
npm run test
npm run build
npm --cache /tmp/derin-npm-cache pack --dry-run --ignore-scripts
```

Expected current known results:

- Test suite: 15 files passed, 142 tests passed
- Pack dry-run: 47 files
- Package size: about 139.2 KB
- Unpacked size: about 519.0 KB

After `npm run build`, verify that `dist` reflects the current source before publishing.

## Staging Command Set

Use this explicit staging set for the accepted v1.0.13 release files:

```bash
git add .gitignore
git add package.json package-lock.json CHANGELOG.md README.md README.github.md devdocs.md RELEASE_CHECKLIST.md RELEASE_MANIFEST_1.0.13.md LICENSE
git add vite.config.ts tsconfig.app.json tsconfig.types.json tsconfig.json tsconfig.node.json eslint.config.js
git add src/index.ts src/types/api.ts src/types/connection.ts src/types/index.ts src/types/message.ts src/constants/defaults.ts
git add src/components/ChatInput.tsx src/components/ChatMessages.tsx src/components/ChatWidget.tsx src/components/ChatWindow.tsx src/components/ErrorToast.tsx src/components/FilePreview.tsx src/components/FileUpload.tsx src/components/Message.tsx src/components/QuickReplies.tsx src/components/TypingIndicator.tsx src/components/VoiceInput.tsx src/components/index.ts
git add src/hooks/useChatState.ts src/hooks/useMessageSender.ts src/hooks/useMessages.ts src/hooks/usePersistence.ts src/hooks/useWebSocket.ts src/hooks/index.ts
git add src/icons.tsx src/utils/markdown.ts src/utils/validators.ts src/utils/api.ts src/utils/helpers.ts src/utils/messageParser.ts src/utils/storage.ts src/utils/websocket.ts
git add src/events.test.ts src/index.test.ts src/components/ChatHeader.test.tsx src/components/FileUpload.test.tsx src/components/Launcher.test.tsx src/components/Message.test.tsx src/components/VoiceInput.test.tsx src/hooks/useChatState.test.ts src/hooks/useMessageSender.test.ts src/hooks/useMessages.test.ts src/hooks/usePersistence.test.ts src/hooks/useWebSocket.test.ts src/utils/markdown.test.ts src/utils/validators.test.ts src/utils/websocket.test.ts src/setupTests.ts
git add src/styles/main.scss src/styles/animations.scss src/styles/components/connection-status.scss src/styles/components/error-toast.scss src/styles/components/file-upload.scss src/styles/components/message.scss src/styles/components/quick-replies.scss src/styles/components/typing-indicator.scss src/styles/components/unread-badge.scss
git add dev.html src/dev-entry.tsx src/app.tsx src/pages/DocsPage.tsx src/pages/LandingPage.tsx src/pages/Navbar.tsx src/pages/ReactNextGuidePage.tsx src/pages/UiLabPage.tsx src/pages/pages.css
git add ATTACHMENT_SYSTEM_CHANGES.md SHADOW_DOM_ISOLATION.md
git add src/demo/DemoControls.tsx vite.config.demo.ts
```

Do not stage:

- `derin-chat-ui-1.0.13.tgz`
- `dist/`
- `stats.html`
- `coverage/`
- `node_modules/`

## Open Release Decisions

- Confirm whether `index.html` is the intended production/site entry for v1.0.13 before staging it.
- Confirm whether repository-only docs should be committed now or kept out of the release commit.
- Stage only the accepted release set.
- Re-run final verification after staging or immediately before publish.
