# Attachment System Changes

## Summary

The file attachment UI was revised from a fixed emoji-based picker into a more professional, npm-package-friendly attachment system.

The new system keeps the default upload experience polished, while allowing package consumers to customize attachment types and render parts of the attachment UI.

## What Changed

- Replaced emoji menu icons with reusable SVG icons.
- Added default attachment type definitions for:
  - Image
  - PDF
  - Document
- Added public attachment-related types:
  - `AttachmentKind`
  - `AttachmentTypeConfig`
  - `FileAttachment`
- Added a new `attachments` config section to `ChatConfig`.
- Updated `FileUpload` to render attachment menu options from config.
- Updated `FilePreview` to use the new attachment model and support custom preview rendering.
- Updated drag-and-drop uploads to use the same attachment model.
- Preserved backward compatibility with existing `features.fileUpload` and `ui.fileUpload` behavior.
- Added focused tests for the new attachment picker behavior.

## New Config Shape

```ts
DerinChat.init({
  attachments: {
    enabled: true,
    maxSize: 10,
    types: [
      {
        id: 'image',
        label: 'Image',
        accept: 'image/*',
        kind: 'image',
        description: 'PNG, JPG, GIF',
      },
      {
        id: 'pdf',
        label: 'PDF',
        accept: '.pdf,application/pdf',
        kind: 'pdf',
        description: 'PDF documents',
      },
      {
        id: 'document',
        label: 'Document',
        accept: '.doc,.docx,.txt,.xls,.xlsx,.csv',
        kind: 'document',
        description: 'Docs, sheets, text',
      },
    ],
  },
});
```

## Custom Render Hooks

Consumers can customize the attachment UI with:

```ts
attachments: {
  renderTrigger: ({ open }) => customTrigger,
  renderMenuItem: (type) => customMenuItem,
  renderPreview: (attachment, onRemove) => customPreview,
}
```

## Updated Files

- `src/types/index.ts`
- `src/constants/defaults.ts`
- `src/icons.tsx`
- `src/components/FileUpload.tsx`
- `src/components/FilePreview.tsx`
- `src/components/ChatInput.tsx`
- `src/components/ChatWindow.tsx`
- `src/hooks/useChatState.ts`
- `src/hooks/useMessageSender.ts`
- `src/styles/components/file-upload.scss`
- `src/components/FileUpload.test.tsx`

## Verification

The following commands passed:

```bash
npm run test -- FileUpload
npm run test
npm run build
```

Full test result:

- 13 test files passed
- 122 tests passed
- Production build completed successfully
