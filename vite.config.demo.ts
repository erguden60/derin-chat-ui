import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';

// Config specific for Vercel Demo Deployment
export default defineConfig({
  plugins: [preact()],
  build: {
    outDir: 'dist-demo', // Separate output directory for demo
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'), // Explicitly build index.html
      },
    },
  },
  // Ensure base path is relative for static deployment
  base: './',
});
