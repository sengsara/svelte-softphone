import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

// Vite is used only for Storybook (dev/build) and .svelte preprocessing.
// The component package itself is built with svelte-package (see
// svelte.config.js); the example and e2e apps have their own Vite configs.
export default defineConfig({
  plugins: [svelte(), tailwindcss()]
});
