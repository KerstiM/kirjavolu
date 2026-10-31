/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // GitHub Pages serves the site from /kirjavolu/; locally it stays at the root.
  base: process.env.GITHUB_PAGES ? '/kirjavolu/' : '/',
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.spec.ts'],
    // Previews of 72-letter family series render slowly in jsdom while other files run in parallel.
    testTimeout: 15_000,
  },
})
