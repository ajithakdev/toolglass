import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/password-generator-v1/',
  plugins: [react()],
  build: { target: 'es2022', sourcemap: false },
});
