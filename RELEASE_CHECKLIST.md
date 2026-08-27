# Release Checklist

Use this checklist before publishing `derin-chat-ui` to npm.

## 1. Version Decision

- [ ] Decide release type: patch, minor, or major.
- [ ] Update `package.json` version.
- [ ] Update CDN examples in `README.md`, `README.github.md`, and `devdocs.md`.
- [ ] Update `CHANGELOG.md` with the final release date and version.

Current package version: `1.0.13`

Recommended next version for the current work:

- `1.1.0` if publishing the UI Lab, docs split, public type exports, attachment API documentation, and widget UI polish together.
- `1.0.14` only if treating the current work as bug fixes and documentation refresh without positioning it as a feature release.

## 2. Automated Checks

Run:

```bash
npm run test
npm run build
npm --cache /tmp/derin-npm-cache pack --dry-run --ignore-scripts
```

Expected current status:

- [x] Test suite passes: `142` tests.
- [x] Production build passes.
- [x] Pack dry-run passes.
- [x] Type declarations are generated in `dist`.
- [x] Clean external TypeScript install passes without installing Preact.
- [x] ESM import smoke test passes.
- [x] CJS require smoke test passes.
- [x] UMD browser smoke test passes.

## 3. Manual UI Lab QA

Run:

```bash
npm run dev
```

Open the Vite URL, usually:

```text
http://localhost:3000/#/ui-lab
```

If port `3000` is busy, use the port Vite prints, commonly `3001`.

Check all combinations:

- [ ] Scenario: Welcome
- [ ] Scenario: Conversation
- [ ] Scenario: Long
- [ ] Scenario: Markdown
- [ ] Theme: Light
- [ ] Theme: Dark
- [ ] Layout: Normal
- [ ] Layout: Compact
- [ ] Layout: Full screen
- [ ] Host surface: SaaS dashboard
- [ ] Host surface: Docs page
- [ ] Host surface: Marketing page
- [ ] Host surface: Hostile CSS page

Must-pass visual checks:

- [ ] Launcher feels native and does not overlap page controls.
- [ ] Chat window opens/closes cleanly.
- [ ] Header text and action icons are readable in light and dark themes.
- [ ] Welcome badge does not glow or wash out in dark/full-screen.
- [ ] Quick replies wrap or scroll correctly.
- [ ] Bot, user, and agent bubbles are visually distinct and readable.
- [ ] Message tools stay as compact circular buttons.
- [ ] User edit mode is readable and wide enough in normal, compact, and full-screen layouts.
- [ ] Markdown code blocks render as real code blocks.
- [ ] No `CODE_BLOCK` placeholder text appears.
- [ ] Typing indicator, error toast, and connection banner are readable in both themes.
- [ ] File upload menu and preview do not overflow.

## 4. Package Contents

Confirm dry-run includes:

- [ ] `dist/index.js`
- [ ] `dist/index.cjs`
- [ ] `dist/index.umd.js`
- [ ] `dist/index.d.ts`
- [ ] `README.md`
- [ ] `README.github.md`
- [ ] `devdocs.md`
- [ ] `CHANGELOG.md`
- [ ] `RELEASE_CHECKLIST.md`
- [ ] `LICENSE`
- [ ] `package.json`

Current dry-run summary:

- Package files: `47`
- Package size: about `139.2 KB`
- Unpacked size: about `519.0 KB`

## 5. Documentation Checks

- [ ] `README.md` is npm-first and concise.
- [ ] `README.github.md` contains the long-form documentation.
- [ ] `devdocs.md` matches the current public API.
- [ ] Bundle size numbers match the latest `npm run build` output.
- [ ] CDN examples use the release version.
- [ ] Type import examples match exported types from `dist/index.d.ts`.
- [ ] Public type declarations do not require consumer projects to install `preact`.

Current bundle numbers:

| Format | File | Raw | Gzip |
|---|---|---:|---:|
| ESM | `dist/index.js` | 153.29 KB | 37.54 KB |
| CJS | `dist/index.cjs` | 121.09 KB | 33.23 KB |
| UMD | `dist/index.umd.js` | 121.26 KB | 33.30 KB |

## 6. Breaking Change Review

Current known risk level: low to medium.

Potentially user-visible changes:

- Widget UI has changed substantially.
- Default `messageTools` is now explicitly `true`.
- Default voice config is now explicit with input/output disabled.
- Public type exports were expanded.
- README is shorter on npm, with long docs moved to `README.github.md`.

Before publishing:

- [ ] Confirm no existing public method was removed.
- [ ] Confirm existing config paths still work.
- [ ] Confirm `features.fileUpload` still works.
- [ ] Confirm new `attachments` API works.
- [ ] Confirm `DerinChat.destroy()` still preserves localStorage by design.

## 7. Publish

Only after all checks pass:

```bash
npm login
npm publish --access public
```

After publishing:

- [ ] Verify npm package page renders the short README.
- [ ] Install the published package in a clean test app.
- [ ] Verify CDN UMD URL resolves for the published version.
- [ ] Create a GitHub release with changelog highlights.
