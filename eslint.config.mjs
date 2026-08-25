import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

/**
 * Flat ESLint config composed directly from the underlying plugins.
 * `eslint-config-next` is intentionally NOT imported here: it force-loads
 * @rushstack/eslint-patch, which is incompatible with ESLint 9.39+.
 */
export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
  },
  {
    // Server-side surfaces (API routes, server libs, seed scripts) run in Node.
    files: ['app/api/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'scripts/**/*.ts', 'prisma/**/*.ts', 'playwright.config.ts', 'e2e/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  reactHooks.configs['recommended-latest'],
  {
    plugins: { 'jsx-a11y': jsxA11y },
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  },
];
