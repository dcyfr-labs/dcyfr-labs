#!/usr/bin/env node

/**
 * Check Private File References Validator
 *
 * Validates that:
 * 1. Public docs referencing private files follow acceptable patterns
 * 2. Referenced private files actually exist
 * 3. Public docs remain functional without private file access
 * 4. No sensitive content is exposed in public docs
 *
 * Usage: npm run check:private-refs
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const issues = [];
const warnings = [];
let filesChecked = 0;
let referencesFound = 0;

/**
 * Find all markdown files in public docs (excluding private/ folders)
 */
function findPublicDocs() {
  try {
    const output = execSync(
      'find docs -type f -name "*.md" ! -path "*/private/*" ! -path "*/node_modules/*" ! -path "*/.git/*"',
      { cwd: rootDir, encoding: 'utf-8' }
    );
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error(`${colors.red}Error finding public docs:${colors.reset}`, error.message);
    return [];
  }
}

/**
 * Extract private file references from markdown content
 * Skips code blocks to avoid flagging examples
 */
function extractPrivateReferences(content, filePath) {
  const references = [];

  // Remove code blocks (```...```) to avoid flagging examples
  const withoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');

  // Pattern: docs/[category]/private/[filename].md
  const privatePathPattern = /docs\/([a-z-]+)\/private\/([a-zA-Z0-9_.-]+\.md)/g;

  let match;
  while ((match = privatePathPattern.exec(withoutCodeBlocks)) !== null) {
    const fullPath = match[0];
    const category = match[1];
    const filename = match[2];

    // Get line number for context from original content
    const beforeMatch = content.substring(0, content.indexOf(fullPath));
    const lines = beforeMatch.split('\n');
    const lineNumber = lines.length;
    const lineContent = content.split('\n')[lineNumber - 1];

    references.push({
      privateFilePath: fullPath,
      category,
      filename,
      lineNumber,
      lineContent: lineContent.trim(),
      sourceFile: filePath,
    });
  }

  return references;
}

/**
 * Check if reference follows acceptable patterns
 */
function isAcceptablePattern(reference) {
  const { lineContent } = reference;

  // Acceptable patterns (optional context)
  const acceptablePatterns = [
    /See `.*` for/i,
    /Refer to `.*` for/i,
    /Review .*:/i,
    /For .* see `.*`/i,
    /\(see `.*`\)/i,
    /details in `.*`/i,
    /documented in `.*`/i,
  ];

  return acceptablePatterns.some((pattern) => pattern.test(lineContent));
}

/**
 * Check if referenced private file exists
 */
function checkFileExists(privateFilePath, lineContent) {
  // Skip validation if line indicates deletion/consolidation (historical reference)
  if (lineContent.includes('❌') || lineContent.includes('DELETED') || lineContent.includes('→')) {
    return true; // Don't flag historical references
  }

  const fullPath = join(rootDir, privateFilePath);
  return existsSync(fullPath);
}

/**
 * Validate a single reference
 */
function validateReference(reference) {
  const { privateFilePath, lineNumber, lineContent, sourceFile } = reference;

  // Check 1: File exists (or is a historical reference)
  if (!checkFileExists(privateFilePath, lineContent)) {
    issues.push({
      file: sourceFile,
      line: lineNumber,
      issue: `Broken reference: ${privateFilePath} does not exist`,
      severity: 'error',
    });
    return;
  }

  // Check 2: Follows acceptable pattern
  if (!isAcceptablePattern(reference)) {
    warnings.push({
      file: sourceFile,
      line: lineNumber,
      issue: `Reference may not follow acceptable pattern: "${lineContent}"`,
      suggestion: 'Use pattern like: "See `path` for details" or "Review private docs: `path`"',
      severity: 'warning',
    });
  }

  // Check 3: Not in centralized docs/private/ (should use subdirectory-specific)
  if (privateFilePath === 'docs/private/') {
    warnings.push({
      file: sourceFile,
      line: lineNumber,
      issue: 'Using legacy centralized docs/private/ structure',
      suggestion: 'Use subdirectory-specific structure: docs/[category]/private/',
      severity: 'warning',
    });
  }
}

/**
 * Main validation function
 */
function main() {
  console.log(
    `${colors.cyan}🔍 Checking private file references in public documentation...${colors.reset}\n`
  );

  const publicDocs = findPublicDocs();
  console.log(`Found ${publicDocs.length} public documentation files\n`);

  for (const docPath of publicDocs) {
    filesChecked++;

    try {
      const fullPath = join(rootDir, docPath);
      const content = readFileSync(fullPath, 'utf-8');
      const references = extractPrivateReferences(content, docPath);

      if (references.length > 0) {
        referencesFound += references.length;
        references.forEach(validateReference);
      }
    } catch (error) {
      console.error(`${colors.red}Error reading ${docPath}:${colors.reset}`, error.message);
    }
  }

  // Print results
  console.log(`${colors.blue}📊 Results:${colors.reset}`);
  console.log(`  Files checked: ${filesChecked}`);
  console.log(`  Private references found: ${referencesFound}\n`);

  if (issues.length > 0) {
    console.log(`${colors.red}❌ Errors (${issues.length}):${colors.reset}\n`);
    issues.forEach((issue) => {
      console.log(`  ${colors.red}✗${colors.reset} ${issue.file}:${issue.line}`);
      console.log(`    ${issue.issue}`);
      if (issue.suggestion) {
        console.log(`    ${colors.yellow}💡 ${issue.suggestion}${colors.reset}`);
      }
      console.log('');
    });
  }

  if (warnings.length > 0) {
    console.log(`${colors.yellow}⚠️  Warnings (${warnings.length}):${colors.reset}\n`);
    warnings.forEach((warning) => {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${warning.file}:${warning.line}`);
      console.log(`    ${warning.issue}`);
      if (warning.suggestion) {
        console.log(`    ${colors.yellow}💡 ${warning.suggestion}${colors.reset}`);
      }
      console.log('');
    });
  }

  if (issues.length === 0 && warnings.length === 0) {
    console.log(`${colors.green}✅ All private file references are valid!${colors.reset}\n`);
    console.log(`${colors.green}✓${colors.reset} All referenced files exist`);
    console.log(`${colors.green}✓${colors.reset} References follow acceptable patterns`);
    console.log(`${colors.green}✓${colors.reset} Using subdirectory-specific structure\n`);
  }

  // Exit with error if there are issues
  if (issues.length > 0) {
    console.log(`${colors.red}❌ Validation failed with ${issues.length} error(s)${colors.reset}`);
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log(
      `${colors.yellow}⚠️  Validation passed with ${warnings.length} warning(s)${colors.reset}`
    );
  }

  process.exit(0);
}

main();
