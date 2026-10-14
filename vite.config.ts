import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'web',
  base: './',
  plugins: [react()],
  build: {
    outDir: '../.build',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 1000000,
    rollupOptions: { output: { codeSplitting: false } },
  },
});

