#!/usr/bin/env node

/**
 * Fix MDX compilation errors caused by < character before numbers
 * 
 * MDX interprets `<` as the start of a JSX tag, so patterns like "<5" or "<100ms"
 * cause "Unexpected character" errors. This script escapes them to `&lt;`.
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Finding markdown files with < followed by numbers...\n');

// Find all markdown files in docs/
const files = glob.sync('docs/**/*.md', { cwd: rootDir });

let totalFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  const filePath = join(rootDir, file);
  const content = readFileSync(filePath, 'utf-8');
  
  // Pattern: space or start of line, then <, then digit
  // Replace with &lt; to prevent MDX from treating it as JSX tag
  const fixedContent = content.replace(/(\s|^)(<)(\d)/gm, '$1&lt;$3');
  
  if (content !== fixedContent) {
    const replacements = (content.match(/(\s|^)<\d/gm) || []).length;
    totalReplacements += replacements;
    totalFiles++;
    
    writeFileSync(filePath, fixedContent, 'utf-8');
    console.log(`✅ Fixed ${replacements} instances in ${file}`);
  }
}

console.log(`\n✨ Complete!`);
console.log(`📊 Fixed ${totalReplacements} instances across ${totalFiles} files`);
console.log(`\n💡 Tip: Run 'npm run dev' to verify MDX compilation works`);
