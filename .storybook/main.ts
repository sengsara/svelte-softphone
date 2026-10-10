import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  stories: ['../src/stories/*.stories.ts'],
  addons: [
    '@storybook/addon-svelte-csf',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/svelte-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  // Allow hosting the static build under a sub-path (e.g. GitHub Pages).
  async viteFinal(viteConfig) {
    if (process.env.STORYBOOK_BASE) {
      viteConfig.base = process.env.STORYBOOK_BASE;
    }
    return viteConfig;
  },
};

export default config;
