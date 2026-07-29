/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8')) as {
  version: string;
};

export default defineConfig({
  plugins: [react()],
  // Relative paths so the built UI loads over file:// inside Electron.
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@renderer': resolve(__dirname, 'src/renderer'),
    },
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    target: 'chrome120',
  },
  server: {
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/shared/**'],
    },
  },
});
