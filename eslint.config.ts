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
    // Targets your Svelte 5 reactive script files and components
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'], 
    languageOptions: {
      parser: svelte.parse,
      parserOptions: {
        // Essential: hooks into typescript-eslint parser for component types
        parser: ts.parser,
        projectService: true,
        extraFileExtensions: ['.svelte']
      }
    }
  },
  {
    ignores: ['build/', '.svelte-kit/', 'dist/', 'node_modules/']
  }
);
