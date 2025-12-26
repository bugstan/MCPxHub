
// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            // Relax some rules for this specific project type (CLI utility)
            // Allowing 'any' is pragmatic here as we proxy unknown MCP tool arguments
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-undef': 'off' // Handled by TS
        },
        ignores: ["dist/**", "node_modules/**", "coverage/**"]
    },
);
