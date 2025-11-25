import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const repoBase = process.env.DEPLOY_TARGET === 'gh-pages' ? '/tpml-seat-tracker/' : '/';

// https://vite.dev/config/
export default defineConfig({
  base: repoBase,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
