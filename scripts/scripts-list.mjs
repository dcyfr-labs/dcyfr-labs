#!/usr/bin/env node
/**
 * @file scripts-list.mjs
 * @description List all available npm scripts with descriptions
 * @usage npm run scripts:list [filter]
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const filter = process.argv[2] || '';
const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'));
const scripts = packageJson.scripts;

// Categorize scripts by prefix
const categories = {};
Object.keys(scripts).forEach(key => {
  const prefix = key.split(':')[0];
  if (!categories[prefix]) {
    categories[prefix] = [];
  }
  categories[prefix].push(key);
});

console.log('\n📋 Available npm Scripts\n');

// Sort categories
const sortedCategories = Object.keys(categories).sort();

sortedCategories.forEach(category => {
  const filteredScripts = categories[category].filter(script =>
    !filter || script.toLowerCase().includes(filter.toLowerCase())
  );

  if (filteredScripts.length > 0) {
    console.log(`\n${category.toUpperCase()}:`);
    filteredScripts.forEach(script => {
      console.log(`  ${script.padEnd(35)} → ${scripts[script]}`);
    });
  }
});

console.log(`\n💡 Total scripts: ${Object.keys(scripts).length}`);
if (filter) {
  console.log(`   Filtered: ${filter}\n`);
} else {
  console.log('   Filter: npm run scripts:list <keyword>\n');
}

console.log('📚 See docs/operations/SCRIPTS_INDEX.md for detailed documentation\n');
