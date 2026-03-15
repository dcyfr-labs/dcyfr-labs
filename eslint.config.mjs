import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';

// Load custom local rules
const localRules = await import('./eslint-local-rules/index.js');

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.vercel/**',
      'out/**',
      'dist/**',
      'build/**',
      'coverage/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx}'],
    plugins: {
      'dcyfr-local': {
        rules: localRules.default,
      },
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
    },
    rules: {
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Next.js rules
      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',

      // Design Token Enforcement Rules (warn mode initially)
      'dcyfr-local/no-hardcoded-spacing': 'warn',
      'dcyfr-local/no-hardcoded-colors': 'warn',
      'dcyfr-local/no-hardcoded-typography': 'warn',
      'dcyfr-local/no-hardcoded-animations': 'warn',
      'dcyfr-local/no-hardcoded-inline-styles': 'warn',
      'dcyfr-local/no-deprecated-design-tokens': 'error',

      // Relax TypeScript rules for Next.js
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Test files: relax rules that don't apply to test/spec code
  {
    files: [
      '**/*.test.{js,jsx,ts,tsx}',
      '**/*.spec.{js,jsx,ts,tsx}',
      'tests/**/*.{js,jsx,ts,tsx,mjs}',
      'src/__tests__/**/*.{js,jsx,ts,tsx}',
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'dcyfr-local/no-hardcoded-spacing': 'off',
      'dcyfr-local/no-hardcoded-colors': 'off',
      'dcyfr-local/no-hardcoded-typography': 'off',
      'dcyfr-local/no-hardcoded-animations': 'off',
      'dcyfr-local/no-hardcoded-inline-styles': 'off',
    },
  },
];
