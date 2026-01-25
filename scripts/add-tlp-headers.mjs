#!/usr/bin/env node

/**
 * Add TLP:AMBER headers to all private documentation files
 * and analyze content for governance documentation
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const TLP_HEADER = `{/* TLP:AMBER - Internal Use Only */}\n\n`;

// Content analysis patterns
const patterns = {
  security:
    /security|vulnerability|codeql|audit|csp|csrf|xss|ssrf|api.?key|secret|auth|exploit|attack/i,
  strategy:
    /strategy|roadmap|plan|editorial|calendar|content.?plan|business|competitive|growth|roi/i,
  implementation: /implementation|summary|complete|status|report|findings|analysis|validation/i,
  operations: /operations|cleanup|health|metrics|performance|monitoring|inngest|deployment/i,
  ai: /claude|copilot|mcp|agent|ai|opencode|instructions|prompt/i,
  architecture: /architecture|refactor|migration|design|pattern|structure/i,
  testing: /test|coverage|failure|e2e|playwright|vitest/i,
  performance: /performance|optimization|bundle|lighthouse|core.?web.?vitals/i,
  content: /blog|content|mdx|post|article|writing/i,
  automation: /automation|ci.?cd|dependabot|workflow|github.?actions/i,
};

// Category keywords for governance documentation
const categoryKeywords = {
  'Security Findings': [
    'security findings',
    'vulnerability',
    'codeql',
    'code scanning',
    'exploit',
    'attack vector',
    'penetration test',
  ],
  'Security Audits': [
    'security audit',
    'security review',
    'security assessment',
    'api security',
    'authentication audit',
  ],
  'Security Implementation': [
    'security fix',
    'security patch',
    'security hardening',
    'security lockdown',
    'rate limiting',
  ],
  'Strategy & Planning': [
    'content strategy',
    'editorial calendar',
    'roadmap',
    'business plan',
    'growth strategy',
  ],
  'Implementation Summaries': [
    'implementation complete',
    'implementation summary',
    'implementation status',
    'implementation report',
  ],
  'Status Reports': [
    'status report',
    'completion summary',
    'progress report',
    'health check',
    'audit results',
  ],
  'AI Configuration': [
    'claude code',
    'copilot config',
    'mcp setup',
    'ai integration',
    'agent config',
  ],
  'Performance Analysis': [
    'performance metrics',
    'performance audit',
    'lighthouse',
    'core web vitals',
    'bundle analysis',
  ],
  'Architecture Decisions': [
    'architecture decision',
    'migration plan',
    'refactoring plan',
    'design decision',
  ],
  'Operations Logs': ['cleanup summary', 'deployment log', 'incident report', 'error analysis'],
  'Content Planning': ['content calendar', 'editorial plan', 'content audit', 'seo strategy'],
  'Testing Analysis': ['test failure', 'test coverage', 'test analysis', 'test metrics'],
  'CI/CD Configuration': [
    'workflow optimization',
    'dependabot',
    'github actions',
    'automation setup',
  ],
};

function analyzeContent(content) {
  const keywords = [];
  const categories = [];

  // Detect patterns
  for (const [category, pattern] of Object.entries(patterns)) {
    if (pattern.test(content)) {
      categories.push(category);
    }
  }

  // Detect specific keywords
  for (const [categoryName, keywordList] of Object.entries(categoryKeywords)) {
    for (const keyword of keywordList) {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        keywords.push(keyword);
        if (!categories.includes(categoryName)) {
          categories.push(categoryName);
        }
        break; // One keyword per category is enough
      }
    }
  }

  return { categories: [...new Set(categories)], keywords: [...new Set(keywords)] };
}

function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');

    // Skip if already has TLP header
    if (content.trim().startsWith('{/* TLP:')) {
      return { skipped: true, reason: 'Already has TLP header' };
    }

    // Add TLP:AMBER header
    const newContent = TLP_HEADER + content;
    writeFileSync(filePath, newContent, 'utf-8');

    // Analyze content
    const analysis = analyzeContent(content);

    return {
      processed: true,
      categories: analysis.categories,
      keywords: analysis.keywords,
    };
  } catch (error) {
    return { error: error.message };
  }
}

function findPrivateFiles(dir, results = []) {
  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (entry === 'private') {
          // Found a private directory, scan for .md files
          const privateEntries = readdirSync(fullPath);
          for (const privateEntry of privateEntries) {
            const privatePath = join(fullPath, privateEntry);
            const privateStat = statSync(privatePath);

            if (privateStat.isDirectory()) {
              // Recursively scan subdirectories
              findPrivateFiles(privatePath, results);
            } else if (privateEntry.endsWith('.md')) {
              results.push(privatePath);
            }
          }
        } else {
          // Continue searching for private directories
          findPrivateFiles(fullPath, results);
        }
      }
    }
  } catch (error) {
    // Silently skip directories we can't read
  }

  return results;
}

// Main execution
const docsDir = join(projectRoot, 'docs');
const privateFiles = findPrivateFiles(docsDir);

console.log(`Found ${privateFiles.length} private files\n`);

const results = {
  processed: 0,
  skipped: 0,
  errors: 0,
  allCategories: new Set(),
  allKeywords: new Set(),
  filesByCategory: {},
};

for (const file of privateFiles) {
  const result = processFile(file);
  const relativePath = file.replace(projectRoot + '/', '');

  if (result.processed) {
    results.processed++;
    console.log(`✅ Processed: ${relativePath}`);

    // Track categories and keywords
    if (result.categories) {
      result.categories.forEach((cat) => {
        results.allCategories.add(cat);
        if (!results.filesByCategory[cat]) {
          results.filesByCategory[cat] = [];
        }
        results.filesByCategory[cat].push(relativePath);
      });
    }
    if (result.keywords) {
      result.keywords.forEach((kw) => results.allKeywords.add(kw));
    }
  } else if (result.skipped) {
    results.skipped++;
    console.log(`⏭️  Skipped: ${relativePath} (${result.reason})`);
  } else if (result.error) {
    results.errors++;
    console.log(`❌ Error: ${relativePath} - ${result.error}`);
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Total files: ${privateFiles.length}`);
console.log(`Processed: ${results.processed}`);
console.log(`Skipped: ${results.skipped}`);
console.log(`Errors: ${results.errors}`);

console.log('\n=== CONTENT CATEGORIES ===');
const sortedCategories = Array.from(results.allCategories).sort();
sortedCategories.forEach((cat) => {
  const count = results.filesByCategory[cat]?.length || 0;
  console.log(`- ${cat}: ${count} files`);
});

console.log('\n=== KEYWORDS FOR GOVERNANCE ===');
const sortedKeywords = Array.from(results.allKeywords).sort();
sortedKeywords.forEach((kw) => {
  console.log(`- ${kw}`);
});

// Output JSON for documentation
const governanceData = {
  summary: {
    totalFiles: privateFiles.length,
    processed: results.processed,
    categories: sortedCategories,
    keywordCount: sortedKeywords.length,
  },
  categories: Object.fromEntries(
    sortedCategories.map((cat) => [cat, results.filesByCategory[cat] || []])
  ),
  keywords: sortedKeywords,
};

writeFileSync(
  join(projectRoot, 'docs/governance/private/tlp-amber-analysis.json'),
  JSON.stringify(governanceData, null, 2),
  'utf-8'
);

console.log('\n✅ Analysis saved to docs/governance/private/tlp-amber-analysis.json');
