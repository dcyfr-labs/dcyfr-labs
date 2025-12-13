#!/usr/bin/env node

/**
 * Mermaid Diagram Linter
 * 
 * Prevents common mermaid mistakes:
 * - Hardcoded colors (fill:, stroke:, color:)
 * - Custom theme variables
 * - Inline style directives
 * 
 * Run: node scripts/lint-mermaid-diagrams.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.join(__dirname, '../src/content/blog');

const ERRORS = {
  HARDCODED_COLOR: 'Hardcoded colors break theme switching',
  CUSTOM_THEME: 'Custom theme config not needed',
  STYLE_DIRECTIVE: 'Avoid style directives, use automatic theming',
  MERMAID_COMPONENT: 'Use markdown code fence, not <Mermaid> component',
};

const patterns = {
  hardcodedColor: /fill:\s*#[a-f0-9]{3,6}|stroke:\s*#[a-f0-9]{3,6}|color:\s*#[a-f0-9]{3,6}/gi,
  styleDirective: /style\s+\w+\s+fill:|style\s+\w+\s+stroke:/gi,
  themeConfig: /%%{?init:.*themeVariables/gi,
  mermaidComponent: /<Mermaid>[\s\S]*?<\/Mermaid>/g,
};

function lintFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);
  const lines = content.split('\n');
  const errors = [];

  // Check for Mermaid component syntax
  if (patterns.mermaidComponent.test(content)) {
    errors.push({
      type: 'MERMAID_COMPONENT',
      line: null,
      message: `${ERRORS.MERMAID_COMPONENT} - Use markdown code fence instead`,
    });
  }

  // Check each mermaid code block
  let inMermaid = false;
  let mermaidStart = 0;

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    if (line.includes('```mermaid')) {
      inMermaid = true;
      mermaidStart = lineNum;
      return;
    }

    if (line.includes('```') && inMermaid) {
      inMermaid = false;
      return;
    }

    if (!inMermaid) return;

    // Check for hardcoded colors
    if (patterns.hardcodedColor.test(line)) {
      const match = line.match(patterns.hardcodedColor);
      errors.push({
        type: 'HARDCODED_COLOR',
        line: lineNum,
        message: `${ERRORS.HARDCODED_COLOR}: "${match?.[0]}"`,
      });
    }

    // Check for style directives
    if (patterns.styleDirective.test(line)) {
      errors.push({
        type: 'STYLE_DIRECTIVE',
        line: lineNum,
        message: ERRORS.STYLE_DIRECTIVE,
      });
    }

    // Check for theme configuration
    if (patterns.themeConfig.test(line)) {
      errors.push({
        type: 'CUSTOM_THEME',
        line: lineNum,
        message: ERRORS.CUSTOM_THEME,
      });
    }
  });

  return errors;
}

function main() {
  console.log('🔍 Linting Mermaid diagrams...\n');

  const mdxFiles = fs.readdirSync(blogDir)
    .filter(f => f.endsWith('.mdx'))
    .map(f => path.join(blogDir, f));

  let totalErrors = 0;

  mdxFiles.forEach(file => {
    const errors = lintFile(file);
    
    if (errors.length > 0) {
      console.log(`📄 ${path.basename(file)}`);
      errors.forEach(err => {
        const lineInfo = err.line ? `:${err.line}` : '';
        console.log(`  ❌ ${err.type}${lineInfo}: ${err.message}`);
      });
      console.log();
      totalErrors += errors.length;
    }
  });

  if (totalErrors === 0) {
    console.log('✅ All mermaid diagrams pass linting!\n');
    process.exit(0);
  } else {
    console.log(`\n⚠️  Found ${totalErrors} issue(s)\n`);
    console.log('Fix: Remove hardcoded colors and use automatic theming');
    console.log('See: docs/content/MERMAID_BEST_PRACTICES.md\n');
    process.exit(1);
  }
}

main();
