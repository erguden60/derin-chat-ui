import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import dts from 'vite-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    preact(),
    dts({
      // Types only from src
      include: ['src'],
      // Emit to dist
      outDir: 'dist',
      // Create dist/index.d.ts entry
      insertTypesEntry: true,
      // Most stable mode (no api-extractor rollup)
      rollupTypes: false,
      // Exclude tests + any root config files to avoid api-extractor absolute path issues
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.tsx',
        'src/**/*.test.tsx',
        'src/setupTests.ts',
        'src/dev-entry.tsx',
        'src/main.tsx',
        'src/app.tsx',
        'src/pages/**',
        '**/*.config.ts',
        '**/*.config.tsx',
        '**/vite.config.*',
        'vite.config.*',
        'tsconfig.*.json',
        'vite-env.d.ts',
        'src/vite-env.d.ts',
      ],
      // IMPORTANT: point to app tsconfig (should include src + vite-env reference safely)
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json'),
    }),
    visualizer({
      filename: 'stats.html',
      gzipSize: true,
      open: false,
    }),
    // Dev-only: redirect / to dev.html so index.html (Vercel deploy) stays untouched
    {
      name: 'dev-html-redirect',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/' || req.url === '/index.html') {
            req.url = '/dev.html';
          }
          next();
        });
      },
    },
  ],

  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },

  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DerinChat',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'index.js';
        if (format === 'cjs') return 'index.cjs';
        return 'index.umd.js';
      },
    },
    rollupOptions: {
      // ✅ Framework-agnostic widget goal:
      // DO NOT mark preact as external. Bundle it inside output.
      external: [],
      output: {
        // no globals needed when bundling everything
      },
    },
  },

  server: {
    port: 3000,
  },
});
