import { defineConfig } from 'vitest/config';
import { storybook } from '@storybook/addon-vitest';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  plugins: [storybook({
    async getStories() {
      // Use default Storybook vitest adapter
      return await import('@storybook/addon-vitest');
    },
  })],
});
