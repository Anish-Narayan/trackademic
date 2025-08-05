import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './', // 👈 IMPORTANT: Makes asset paths relative
  plugins: [tailwindcss()],
});
