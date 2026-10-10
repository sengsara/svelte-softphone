import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Test harness app: always swap the real JsSIP implementation for the mock so
// call flows can be driven from Playwright without a SIP server.
export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  resolve: {
    alias: {
      jssip: path.resolve(dirname, '../mocks/jssip.ts')
    }
  },
  server: {
    port: 4173,
    strictPort: true
  }
});
