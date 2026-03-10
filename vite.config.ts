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
        '**/*.config.ts',
        '**/*.config.tsx',
        '**/vite.config.*',
        'vite.config.*',
        'vite.config.demo.ts',
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
