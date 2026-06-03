# ESLint Setup for Svelte 5 + TypeScript

## Configuration

ESLint is configured with:
- **@eslint/js**: Base JavaScript rules
- **typescript-eslint**: TypeScript support and rules
- **eslint-plugin-svelte**: Svelte-specific rules
- **globals**: Browser and Node.js globals

## Installed Dependencies

```json
{
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "eslint": "^10.4.1",
    "eslint-plugin-svelte": "^3.19.0",
    "globals": "^17.6.0",
    "svelte-eslint-parser": "^1.7.1",
    "typescript-eslint": "^8.60.1",
    "jiti": "^*"
  }
}
```

## Available Scripts

```bash
npm run lint       # Run ESLint (fails on first error)
npm run lint:fix   # Run ESLint and auto-fix issues
```

## ESLint Rules Enabled

### TypeScript Rules
- `@typescript-eslint/no-unused-vars`: No unused variables
- `@typescript-eslint/no-undef`: No undefined variables
- And other TypeScript best practices

### Svelte Rules
- `svelte/require-each-key`: Each blocks must have a key
- `svelte/prefer-writable-derived`: Prefer $derived over $state + $effect
- Other Svelte-specific linting rules

### JavaScript Rules
- Base ESLint recommended rules
- Import organization rules

## Configuration File

`eslint.config.ts` - Flat config format for modern ESLint

### Key Features

1. **TypeScript Integration**: Uses `ts.parser` for Svelte components
2. **Project Service**: Automatically discovers TypeScript projects
3. **Svelte 5 Support**: Targets `.svelte`, `.svelte.ts`, `.svelte.js` files
4. **Browser/Node Globals**: Includes both browser and Node.js globals
5. **Ignores**: Excludes build directories and node_modules

## Running ESLint

### Check for Errors
```bash
npm run lint
```

### Auto-fix Issues
```bash
npm run lint:fix
```

### Check Specific File
```bash
npx eslint src/Component.svelte
```

## Notes

- ESLint will report errors for placeholder code (undefined handlers)
- This is expected during development
- Run `npm run lint:fix` to auto-fix most issues
- Some errors require manual code updates

## Build Verification

✅ ESLint configuration loads correctly  
✅ TypeScript parsing works  
✅ Svelte component parsing works  
✅ No configuration errors  
