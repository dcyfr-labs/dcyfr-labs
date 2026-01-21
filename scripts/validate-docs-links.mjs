#!/usr/bin/env node

/**
 * Documentation Link Validator
 *
 * Scans all .md files in /docs/ for internal links and verifies target files exist.
 * Exits with error if broken links are found (for CI integration).
 *
 * Usage:
 *   node scripts/validate-docs-links.mjs
 *   npm run lint:docs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const docsDir = path.join(rootDir, 'docs');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
};

// Link validation statistics
const stats = {
  totalFiles: 0,
  totalLinks: 0,
  brokenLinks: [],
  validLinks: 0,
};

/**
 * Get all .md files in a directory recursively
 */
function getMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extract internal markdown links from file content
 * Matches: [text](path.md) or [text](path.md#section)
 */
function extractLinks(content) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const [fullMatch, text, url] = match;

    // Skip external links (http://, https://, mailto:)
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
      continue;
    }

    // Skip anchors only (e.g., #section-name)
    if (url.startsWith('#')) {
      continue;
    }

    links.push({
      text,
      url,
      line: content.substring(0, match.index).split('\n').length,
    });
  }

  return links;
}

/**
 * Resolve a relative link to an absolute path
 */
function resolveLinkPath(sourceFile, linkUrl) {
  // Remove anchor fragment (e.g., #section-name)
  const urlWithoutAnchor = linkUrl.split('#')[0];

  const sourceDir = path.dirname(sourceFile);
  const absolutePath = path.resolve(sourceDir, urlWithoutAnchor);

  return absolutePath;
}

/**
 * Validate a single markdown file
 */
function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const links = extractLinks(content);
  const relativePath = path.relative(rootDir, filePath);

  stats.totalFiles++;
  stats.totalLinks += links.length;

  links.forEach((link) => {
    const targetPath = resolveLinkPath(filePath, link.url);

    if (!fs.existsSync(targetPath)) {
      stats.brokenLinks.push({
        sourceFile: relativePath,
        line: link.line,
        text: link.text,
        url: link.url,
        resolvedPath: path.relative(rootDir, targetPath),
      });
    } else {
      stats.validLinks++;
    }
  });
}

/**
 * Main validation function
 */
function validateDocLinks() {
  console.log(`${colors.blue}📖 Documentation Link Validator${colors.reset}\n`);
  console.log(`${colors.dim}Scanning ${docsDir}...${colors.reset}\n`);

  const files = getMarkdownFiles(docsDir);

  files.forEach((file) => {
    try {
      validateFile(file);
    } catch (error) {
      console.error(`${colors.red}Error validating ${file}:${colors.reset}`, error.message);
    }
  });

  // Report results
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`📊 Summary:`);
  console.log(`  Files scanned: ${stats.totalFiles}`);
  console.log(`  Links checked: ${stats.totalLinks}`);
  console.log(`  Valid links: ${colors.green}${stats.validLinks}${colors.reset}`);
  console.log(
    `  Broken links: ${stats.brokenLinks.length > 0 ? colors.red : colors.green}${stats.brokenLinks.length}${colors.reset}\n`
  );

  if (stats.brokenLinks.length > 0) {
    console.log(`${colors.red}❌ Broken Links Found:${colors.reset}\n`);

    stats.brokenLinks.forEach((broken, index) => {
      console.log(
        `${index + 1}. ${colors.yellow}${broken.sourceFile}:${broken.line}${colors.reset}`
      );
      console.log(`   Link text: "${broken.text}"`);
      console.log(`   URL: ${broken.url}`);
      console.log(`   Resolved to: ${broken.resolvedPath}`);
      console.log(`   ${colors.red}File not found!${colors.reset}\n`);
    });

    console.log(`${colors.red}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(
      `${colors.red}✗ Validation failed: ${stats.brokenLinks.length} broken link(s) found${colors.reset}\n`
    );

    process.exit(1);
  } else {
    console.log(`${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.green}✓ All links are valid!${colors.reset}\n`);

    process.exit(0);
  }
}

// Run validation
validateDocLinks();
