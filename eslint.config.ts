// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'], 
    languageOptions: {
      parser: svelte.parse,
      parserOptions: {
        parser: ts.parser,
        projectService: true,
        extraFileExtensions: ['.svelte']
      }
    }
  },
  {
    ignores: [
      'build/',
      '.svelte-kit/',
      'dist/',
      'storybook-static/',
      'test-results/',
      'playwright-report/',
      'node_modules/'
    ]
  },
  {
    rules: {
      // Disable unused vars rule for Svelte components (props are passed from parent)
      '@typescript-eslint/no-unused-vars': 'off',
      // Allow switch statements without default in Svelte components
      'no-case-declarations': 'off',
      // Disable no-undef for Svelte components ($state variables are not traditional declarations)
      'no-undef': 'off'
    }
  },
  storybook.configs["flat/recommended"]
);
