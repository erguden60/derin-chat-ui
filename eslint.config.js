import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import preact from 'eslint-plugin-preact';
import prettier from 'eslint-config-prettier';
import tsParser from '@typescript-eslint/parser';

export default tseslint.config(
    { ignores: ['dist/**', 'dist-demo/**', 'node_modules/**', 'coverage/**'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parser: tsParser,
        },
        plugins: {
            preact,
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
    },
    prettier,
);
