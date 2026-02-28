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
      'dcyfr-local/no-deprecated-design-tokens': 'error',

      // Relax TypeScript rules for Next.js
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },
];

