#!/usr/bin/env node

/**
 * Find Design Token Violations
 * 
 * Scans TSX/TS files for hardcoded Tailwind classes that should use design tokens.
 * Outputs violations by file for easy remediation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '../src');

// Patterns that indicate hardcoded values instead of design tokens
const violationPatterns = [
  {
    name: 'Spacing violations',
    patterns: [
      /className[=:]\s*["`].*\b(mb|mt|ml|mr|py|px|p|gap|space-y|space-x)-(\d+)[^`"]*["`]/g,
      /className[=:]\s*\{[^}]*\b(mb|mt|ml|mr|py|px|p|gap|space-y|space-x)-(\d+)[^}]*\}/g,
    ],
    ignore: ['-px', '-16', '-8'], // Common valid values
  },
  {
    name: 'Typography violations',
    patterns: [
      /className[=:]\s*["`].*\b(text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl))\s+(font-(bold|semibold|medium))[^`"]*["`]/g,
    ],
  },
  {
    name: 'Container width violations',
    patterns: [
      /className[=:]\s*["`].*\b(max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|prose))[^`"]*["`]/g,
    ],
  },
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];
    const lines = content.split('\n');

    lines.forEach((line, lineNum) => {
      violationPatterns.forEach(({ name, patterns, ignore = [] }) => {
        patterns.forEach((pattern) => {
          let match;
          while ((match = pattern.exec(line)) !== null) {
            // Skip ignored patterns
            if (!ignore.some(ig => match[0].includes(ig))) {
              violations.push({
                line: lineNum + 1,
                column: match.index,
                type: name,
                match: match[0].substring(0, 80),
              });
            }
          }
        });
      });
    });

    return violations;
  } catch (err) {
    console.warn(`⚠️  Could not scan ${filePath}: ${err.message}`);
    return [];
  }
}

function main() {
  console.log('🔍 Scanning for design token violations...\n');

  // Find all TSX and TS files (exclude node_modules, .next, etc.)
  const files = globSync('**/*.{ts,tsx}', {
    cwd: srcDir,
    ignore: [
      'node_modules/**',
      '.next/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/ui/**', // shadcn/ui components exempt
      '**/design-tokens.ts', // Token definitions exempt
      '**/*loading.tsx',
      '**/*skeleton.tsx',
    ],
  });

  const allViolations = new Map();

  files.forEach((file) => {
    const fullPath = path.join(srcDir, file);
    const violations = scanFile(fullPath);

    if (violations.length > 0) {
      allViolations.set(file, violations);
    }
  });

  if (allViolations.size === 0) {
    console.log('✅ No design token violations found!\n');
    process.exit(0);
  }

  // Output violations grouped by file
  let totalCount = 0;
  allViolations.forEach((violations, file) => {
    console.log(`📄 ${file}`);
    violations.forEach(({ line, column, type, match }) => {
      console.log(`   L${line}:${column} [${type}] ${match.trim()}`);
    });
    totalCount += violations.length;
    console.log();
  });

  console.log(`\n📊 Summary: ${totalCount} violations found in ${allViolations.size} files`);
  console.log('\n💡 To fix violations, replace hardcoded values with design tokens:');
  console.log('   import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS } from "@/lib/design-tokens";\n');

  process.exit(allViolations.size > 0 ? 1 : 0);
}

main();
