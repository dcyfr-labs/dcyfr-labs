#!/usr/bin/env node
/**
 * Documentation Secret Scanner
 *
 * Scans all .md files for high-risk patterns that might be secrets.
 * Stricter than gitleaks for documentation-specific patterns.
 *
 * Usage:
 *   node scripts/ci/check-docs-secrets.mjs
 *
 * Exit codes:
 *   0 - No secrets detected
 *   1 - Secrets detected (blocks commit)
 */

import { readFileSync } from 'fs';
import { globSync } from 'glob';

const DOCS_PATHS = ['docs/**/*.md', 'src/content/**/*.md', 'README.md'];

const SECRET_PATTERNS = [
  // Webhook secrets (32-byte base64)
  { pattern: /WEBHOOK_SECRET\s*[:=]\s*[A-Za-z0-9+/]{40,}={0,2}/, name: 'Webhook Secret' },

  // API keys with prefixes
  { pattern: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}/, name: 'GitHub Token' },
  { pattern: /sk_live_[A-Za-z0-9]{24,}/, name: 'Stripe Secret Key' },
  { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key' },
  { pattern: /AIza[A-Za-z0-9_-]{35}/, name: 'Google API Key' },

  // Generic high-entropy base64 (>40 chars, not in code blocks or placeholders)
  {
    pattern: /(?<!`|<)(?:secret|key|token|password)[:=]\s*[A-Za-z0-9+/]{43,}={0,2}(?!>)/i,
    name: 'Base64 String (possible secret)'
  },

  // JWT tokens
  { pattern: /eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]{20,}/, name: 'JWT Token' },

  // Database URLs with passwords
  { pattern: /(?:postgres|mysql|mongodb):\/\/[^:]+:[^@]+@/, name: 'Database URL with Password' },

  // Private keys
  { pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/, name: 'Private Key' },
];

const SAFE_PATTERNS = [
  '<your-secret-here>',
  '<your-api-key-here>',
  '<generate-with-openssl-rand>',
  'your-api-key-here',
  'your-secret-here',
  'YOUR_API_KEY',
  'YOUR_SECRET_HERE',
  'process.env.',
  '${WEBHOOK_SECRET}',
  '${API_KEY}',
  '1x0000000000000000000000000000000AA', // Cloudflare Turnstile test key
  'pk_test_',  // Stripe test key prefix
  'sk_test_',  // Stripe test secret prefix
];

let foundSecrets = false;
let inCodeBlock = false;

console.log('🔍 Scanning documentation for secrets...\n');

for (const pattern of DOCS_PATHS) {
  const files = globSync(pattern, {
    ignore: ['**/node_modules/**', '**/private/**', '**/.next/**']
  });

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        // Track code blocks
        if (line.trim().startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          return;
        }

        // Skip lines in code blocks
        if (inCodeBlock) return;

        // Skip safe patterns
        if (SAFE_PATTERNS.some(safe => line.includes(safe))) return;

        // Skip lines that are clearly examples/placeholders
        if (line.includes('example') || line.includes('Example') || line.includes('placeholder')) return;

        for (const { pattern, name } of SECRET_PATTERNS) {
          if (pattern.test(line)) {
            console.error(`❌ ${name} detected in ${file}:${idx + 1}`);
            console.error(`   ${line.trim().substring(0, 100)}...`);
            console.error('');
            foundSecrets = true;
          }
        }
      });
    } catch (error) {
      console.error(`⚠️  Error reading ${file}: ${error.message}`);
    }
  }
}

if (foundSecrets) {
  console.error('❌ SECRETS DETECTED IN DOCUMENTATION!');
  console.error('');
  console.error('📖 Fix by:');
  console.error('   1. Replace with placeholders: <your-secret-here>');
  console.error('   2. Reference environment variables: process.env.SECRET');
  console.error('   3. Move sensitive docs to docs/*/private/ folders');
  console.error('   4. Use official test keys (Stripe: pk_test_, Cloudflare: 1x000...)');
  console.error('');
  console.error('💡 See: docs/security/SAFE_SECRET_PATTERNS.md');
  process.exit(1);
}

console.log('✅ Documentation: No secrets detected');
process.exit(0);
