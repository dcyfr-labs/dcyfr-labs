#!/usr/bin/env node

/**
 * Design System Validation Script
 *
 * Scans TypeScript/TSX files for design system violations:
 * - Prohibited spacing patterns (space-y-[5-9], gap-[5-9], p-[67])
 * - Inline typography (text-* font-* combinations)
 * - Hardcoded container widths (max-w-* without CONTAINER_WIDTHS)
 * - Hardcoded colors (future enhancement)
 *
 * Usage:
 *   node scripts/validate-design-tokens.mjs              # Scan all files
 *   node scripts/validate-design-tokens.mjs --staged     # Scan only staged files
 *   node scripts/validate-design-tokens.mjs --files src/components/ui/card.tsx
 *   node scripts/validate-design-tokens.mjs --fix        # Auto-fix common patterns (future)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  staged: args.includes('--staged'),
  fix: args.includes('--fix'),
  files: args.includes('--files') ? args.slice(args.indexOf('--files') + 1) : null,
  warnOnly: args.includes('--warn-only'), // Don't fail on violations, just warn
};

// Violation patterns
const PATTERNS = {
  spacing: {
    regex: /\b(space-y-[5-9]|gap-[5-9]|p-[67]|px-[67]|py-[67])\b/g,
    description: 'Prohibited spacing pattern',
    suggestions: {
      'space-y-8': 'SPACING.subsection',
      'space-y-6': 'SPACING.subsection or SPACING.content',
      'space-y-7': 'SPACING.subsection',
      'space-y-9': 'SPACING.section',
      'gap-6': 'gap-4',
      'gap-7': 'gap-4',
      'gap-8': 'gap-4',
      'gap-9': 'gap-4',
      'p-6': 'p-4 or p-8',
      'p-7': 'p-4 or p-8',
      'px-6': 'px-4 or px-8',
      'px-7': 'px-4 or px-8',
      'py-6': 'py-4 or py-8',
      'py-7': 'py-4 or py-8',
    },
  },
  typography: {
    regex: /\btext-(2xl|3xl|4xl|5xl)\s+(font-(bold|semibold|medium))/g,
    description: 'Inline typography (use TYPOGRAPHY tokens)',
    suggestions: {
      'text-3xl font-bold': 'TYPOGRAPHY.h1.standard or TYPOGRAPHY.display.stat',
      'text-3xl font-semibold': 'TYPOGRAPHY.h1.standard',
      'text-2xl font-bold': 'TYPOGRAPHY.h2.standard or TYPOGRAPHY.display.stat',
      'text-2xl font-semibold': 'TYPOGRAPHY.h2.standard',
      'text-xl font-medium': 'TYPOGRAPHY.h3.standard',
    },
  },
  containerWidth: {
    // Match max-w-{number}xl or max-w-[{number}px] but exclude acceptable patterns
    // Acceptable: max-w-full (images), max-w-2xl (modals), max-w-3xl (typography)
    // Violations: max-w-4xl, max-w-5xl, max-w-6xl, max-w-7xl (should use CONTAINER_WIDTHS)
    regex: /\b(max-w-(4xl|5xl|6xl|7xl)|max-w-\[1[0-9]{3,}px\])\b/g,
    description: 'Hardcoded container width (use CONTAINER_WIDTHS)',
    suggestions: {
      'max-w-4xl': 'CONTAINER_WIDTHS.narrow',
      'max-w-5xl': 'CONTAINER_WIDTHS.standard',
      'max-w-6xl': 'CONTAINER_WIDTHS.content',
      'max-w-7xl': 'CONTAINER_WIDTHS.archive',
      'max-w-[1280px]': 'CONTAINER_WIDTHS.archive',
      'max-w-[1536px]': 'CONTAINER_WIDTHS.dashboard',
    },
  },
};

// Files to exclude from validation (matched as path segments or suffixes)
const EXCLUDED_PATHS = [
  '/node_modules/',
  '/.next/',
  '/coverage/',
  '/dist/',
  '/build/',
  '/out/',
  '/src/components/ui/', // shadcn/ui components
  '/src/lib/design-tokens.ts', // design token definitions
];

// Files to exclude by pattern
const EXCLUDED_PATTERNS = [
  /loading\.tsx$/,
  /skeleton\.tsx$/,
  /\.test\.tsx?$/,
  /\.spec\.tsx?$/,
];

/**
 * Check if file should be excluded from validation
 */
function shouldExclude(filePath) {
  // Normalize path for consistent matching
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Check excluded paths (match as path segments)
  if (EXCLUDED_PATHS.some(excluded => normalizedPath.includes(excluded))) {
    return true;
  }

  // Check excluded patterns
  if (EXCLUDED_PATTERNS.some(pattern => pattern.test(normalizedPath))) {
    return true;
  }

  return false;
}

/**
 * Get list of files to validate
 */
function getFilesToValidate() {
  if (flags.files) {
    // Specific files provided - filter by extension and exclusions
    return flags.files
      .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
      .filter(f => !shouldExclude(f));
  }

  if (flags.staged) {
    // Only staged files
    try {
      const staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf-8' });
      return staged
        .split('\n')
        .filter(f => f && (f.endsWith('.tsx') || f.endsWith('.ts')))
        .filter(f => !shouldExclude(f));
    } catch (error) {
      console.error('Error getting staged files:', error.message);
      return [];
    }
  }

  // All files in src/
  const files = [];
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(projectRoot, fullPath);

      if (shouldExclude(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        files.push(relativePath);
      }
    }
  }

  walkDir(path.join(projectRoot, 'src'));
  return files;
}

/**
 * Validate a single file
 */
function validateFile(filePath) {
  // Handle both absolute and relative paths
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');
  const violations = [];

  // Check each pattern
  for (const [patternName, pattern] of Object.entries(PATTERNS)) {
    // Skip containerWidth validation for design-tokens.ts (those are the definitions)
    if (patternName === 'containerWidth' && filePath.includes('design-tokens.ts')) {
      continue;
    }
    
    lines.forEach((line, lineNumber) => {
      const matches = line.matchAll(pattern.regex);

      for (const match of matches) {
        const matchedText = match[0];
        const suggestion = pattern.suggestions[matchedText] || pattern.suggestions[match[1]];

        violations.push({
          file: filePath,
          line: lineNumber + 1,
          column: match.index + 1,
          type: patternName,
          violation: matchedText,
          suggestion: suggestion || 'See design tokens',
          description: pattern.description,
        });
      }
    });
  }

  return violations;
}

/**
 * Format violations for console output
 */
function formatViolations(violations) {
  if (violations.length === 0) {
    return '\n✅ No design system violations found!\n';
  }

  const groupedByType = violations.reduce((acc, v) => {
    if (!acc[v.type]) acc[v.type] = [];
    acc[v.type].push(v);
    return acc;
  }, {});

  let output = '\n' + '='.repeat(60) + '\n';
  output += 'Design System Validation Report\n';
  output += '='.repeat(60) + '\n\n';

  for (const [type, items] of Object.entries(groupedByType)) {
    output += `\n${type.toUpperCase()} VIOLATIONS (${items.length}):\n`;
    output += '-'.repeat(60) + '\n';

    items.forEach(v => {
      output += `\n  ${v.file}:${v.line}:${v.column}\n`;
      output += `    ❌ ${v.violation}\n`;
      output += `    ✅ Use: ${v.suggestion}\n`;
    });
  }

  output += '\n' + '='.repeat(60) + '\n';
  output += `Total Violations: ${violations.length}\n`;
  output += 'Status: FAILED ❌\n';
  output += '='.repeat(60) + '\n\n';

  output += 'Fix these violations by:\n';
  output += '  1. Import design tokens: import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens"\n';
  output += '  2. Replace hardcoded values with token constants\n';
  output += '  3. Run ESLint for auto-fixable issues: npm run lint --fix\n';
  output += '  4. See docs/ai/DESIGN_SYSTEM.md for details\n\n';

  return output;
}

/**
 * Main validation function
 */
async function main() {
  console.log('🔍 Scanning for design system violations...\n');

  const files = getFilesToValidate();

  if (files.length === 0) {
    console.log('No files to validate.');
    process.exit(0);
  }

  console.log(`Validating ${files.length} files...\n`);

  const allViolations = [];

  for (const file of files) {
    const violations = validateFile(file);
    allViolations.push(...violations);
  }

  const report = formatViolations(allViolations);
  console.log(report);

  // Ensure reports directory exists
  const reportsDir = path.join(projectRoot, 'reports/design-system');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Write text report for CI/CD and human readability
  fs.writeFileSync(
    path.join(reportsDir, 'design-system-report.txt'),
    report,
    'utf-8'
  );

  // Write JSON report for dev tools consumption
  const jsonReport = {
    generatedAt: new Date().toISOString(),
    totalViolations: allViolations.length,
    filesScanned: files.length,
    violations: allViolations,
    summary: {
      spacing: allViolations.filter(v => v.type === 'spacing').length,
      typography: allViolations.filter(v => v.type === 'typography').length,
      containerWidth: allViolations.filter(v => v.type === 'containerWidth').length,
    },
  };
  fs.writeFileSync(
    path.join(reportsDir, 'design-system-report.json'),
    JSON.stringify(jsonReport, null, 2),
    'utf-8'
  );

  // Exit with error code if violations found (unless --warn-only)
  if (flags.warnOnly) {
    process.exit(0);
  }
  process.exit(allViolations.length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Error running validation:', error);
  process.exit(1);
});
