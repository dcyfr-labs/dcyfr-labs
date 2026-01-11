#!/usr/bin/env node

/**
 * Check for Test Data in Production
 * 
 * Validates that test/demo data patterns don't reach production.
 * Checks for environment guards before using demo data.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '../src');

// Patterns that suggest test/demo data
const testDataPatterns = [
  {
    name: 'Obvious test analytics',
    regex: /stars:\s*(0|1|5|10|15|100)(?=\s*[},;])/,
    level: 'warning',
  },
  {
    name: 'Zero forks (usually test data)',
    regex: /forks:\s*0(?=\s*[},;])/,
    level: 'warning',
  },
  {
    name: 'Test database URLs',
    regex: /(mongodb|postgres|mysql):\/\/(localhost|127\.0\.0\.1|test)/,
    level: 'error',
  },
];

// Patterns that indicate environment checks
const environmentGuardPatterns = [
  /process\.env\.NODE_ENV\s*===\s*['"]production['"]/,
  /process\.env\.VERCEL_ENV\s*===\s*['"]production['"]/,
  /isDevelopment\s*&&/,
  /isProduction\s*\|\|/,
];

function hasEnvironmentGuard(content) {
  return environmentGuardPatterns.some(pattern => pattern.test(content));
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];
    const lines = content.split('\n');

    testDataPatterns.forEach(({ name, regex, level }) => {
      lines.forEach((line, lineNum) => {
        const match = regex.exec(line);
        if (match) {
          // Check if this line is guarded by an environment check
          const context = content.substring(
            Math.max(0, content.indexOf(line) - 500),
            content.indexOf(line) + 500
          );

          const hasGuard = hasEnvironmentGuard(context);

          violations.push({
            line: lineNum + 1,
            type: name,
            level: hasGuard ? 'info' : level,
            message: hasGuard
              ? `${name} (environment-guarded ✓)`
              : `${name} (no environment guard!)`,
            match: match[0].substring(0, 60),
          });
        }
      });
    });

    return violations;
  } catch (err) {
    console.warn(`⚠️  Could not scan ${filePath}: ${err.message}`);
    return [];
  }
}

function main() {
  console.log('🚨 Checking for test data in production...\n');

  const files = globSync('**/*.{ts,tsx}', {
    cwd: srcDir,
    ignore: [
      'node_modules/**',
      '.next/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
    ],
  });

  let totalErrors = 0;
  let totalWarnings = 0;
  const fileViolations = new Map();

  files.forEach((file) => {
    const fullPath = path.join(srcDir, file);
    const violations = scanFile(fullPath);

    violations.forEach(({ level }) => {
      if (level === 'error') totalErrors++;
      if (level === 'warning') totalWarnings++;
    });

    if (violations.some(v => v.level === 'error')) {
      fileViolations.set(file, violations.filter(v => v.level === 'error'));
    }
  });

  if (totalErrors === 0) {
    console.log('✅ No test data patterns detected in production code!\n');
    if (totalWarnings > 0) {
      console.log(`⚠️  ${totalWarnings} warnings (environment-guarded test data patterns found)\n`);
    }
    process.exit(0);
  }

  // Output errors
  fileViolations.forEach((violations, file) => {
    violations.forEach(({ line, message, match }) => {
      console.log(`❌ ${file}:${line} - ${message}`);
      console.log(`   ${match}\n`);
    });
  });

  console.log(`\n📊 Summary: ${totalErrors} errors, ${totalWarnings} warnings\n`);

  if (totalErrors > 0) {
    console.log('💡 Fix: Add environment guard before using test data');
    console.log('   if (process.env.NODE_ENV === "production") return null;\n');
    process.exit(1);
  }

  process.exit(0);
}

main();
