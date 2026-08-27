import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { existsSync, renameSync } from 'fs';

export default defineConfig({
  plugins: [
    preact(),
    {
      name: 'demo-index-html',
      closeBundle() {
        const devHtml = resolve(__dirname, 'dist-demo/dev.html');
        const indexHtml = resolve(__dirname, 'dist-demo/index.html');
        if (existsSync(devHtml)) {
          renameSync(devHtml, indexHtml);
        }
      },
    },
  ],
  build: {
    outDir: 'dist-demo',
    emptyOutDir: true,
    copyPublicDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'dev.html'),
      },
    },
  },
  server: {
    port: 3000,
  },
});
