#!/usr/bin/env node

/**
 * Query Knowledge Base
 *
 * Search the DCYFR knowledge base for patterns, mistakes, or optimizations
 *
 * Usage:
 *   npm run learning:query [options]
 *
 * Options:
 *   --search <term>       Search term (e.g., "design tokens")
 *   --agent <name>        Filter by agent name
 *   --category <type>     pattern | mistake | optimization
 *   --confidence <score>  Minimum confidence (0-100)
 *   --limit <num>         Max results (default: 10)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const KNOWLEDGE_BASE_PATH = path.join(ROOT, '.github/agents/learning-data/knowledge-base.json');

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    search: null,
    agent: null,
    category: null,
    confidence: 0,
    limit: 10
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];

    if (key === 'confidence') {
      options[key] = parseFloat(value) / 100; // Convert to 0-1 scale
    } else if (key === 'limit') {
      options[key] = parseInt(value);
    } else {
      options[key] = value;
    }
  }

  return options;
}

// Load knowledge base
async function loadKnowledgeBase() {
  try {
    const content = await fs.readFile(KNOWLEDGE_BASE_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Error loading knowledge base:', error.message);
    process.exit(1);
  }
}

// Search patterns
function searchPatterns(kb, options) {
  const results = [];
  const { designPatterns } = kb.knowledgeBase;

  for (const [key, pattern] of Object.entries(designPatterns)) {
    // Filter by confidence
    if (pattern.confidence < options.confidence) continue;

    // Filter by search term
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      const matches =
        pattern.rule.toLowerCase().includes(searchLower) ||
        pattern.description.toLowerCase().includes(searchLower) ||
        key.toLowerCase().includes(searchLower);

      if (!matches) continue;
    }

    results.push({
      type: 'pattern',
      id: key,
      ...pattern
    });
  }

  return results;
}

// Search mistakes
function searchMistakes(kb, options) {
  const results = [];
  const { commonMistakes } = kb.knowledgeBase;

  for (const mistake of commonMistakes) {
    // Filter by search term
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      const matches =
        mistake.title.toLowerCase().includes(searchLower) ||
        mistake.description.toLowerCase().includes(searchLower);

      if (!matches) continue;
    }

    results.push({
      type: 'mistake',
      ...mistake
    });
  }

  return results;
}

// Search optimizations
function searchOptimizations(kb, options) {
  const results = [];
  const { optimizations } = kb.knowledgeBase;

  for (const opt of optimizations) {
    // Filter by confidence (using adoption rate as proxy)
    if (opt.adoptionRate < options.confidence) continue;

    // Filter by search term
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      const matches =
        opt.title.toLowerCase().includes(searchLower) ||
        opt.description.toLowerCase().includes(searchLower);

      if (!matches) continue;
    }

    results.push({
      type: 'optimization',
      ...opt
    });
  }

  return results;
}

// Format and display results
/**
 * Print a single result entry
 */
function displayResultEntry(result) {
  if (result.type === 'pattern') {
    console.log(`✅ Pattern: ${result.rule}`);
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`   Description: ${result.description}`);
    if (result.examples) {
      console.log(`   Example: ${result.examples.correct || result.examples[0]}`);
    }
    if (result.enforcedBy) {
      console.log(`   Enforced By: ${result.enforcedBy.join(', ')}`);
    }
    console.log('');
  } else if (result.type === 'mistake') {
    console.log(`❌ Mistake: ${result.title} (${result.severity})`);
    console.log(`   Description: ${result.description}`);
    console.log(`   Wrong: ${result.wrongWay}`);
    console.log(`   Right: ${result.rightWay}`);
    if (result.autoFixable) {
      console.log(`   Auto-fixable: Yes (${result.fixScript})`);
    }
    console.log('');
  } else if (result.type === 'optimization') {
    console.log(`⚡ Optimization: ${result.title}`);
    console.log(`   Speedup: ${result.speedup}`);
    console.log(`   Adoption Rate: ${(result.adoptionRate * 100).toFixed(0)}%`);
    console.log(`   Description: ${result.description}`);
    console.log(`   When to Use: ${result.applicableWhen}`);
    console.log('');
  }
}

function displayResults(results, options) {
  if (results.length === 0) {
    console.log('📭 No results found');
    return;
  }

  console.log(`\n🔍 Found ${results.length} result(s):\n`);

  const limited = results.slice(0, options.limit);
  for (const result of limited) {
    displayResultEntry(result);
  }

  if (results.length > options.limit) {
    console.log(`... and ${results.length - options.limit} more results (use --limit to see more)\n`);
  }
}

// Main execution
async function main() {
  const options = parseArgs();

  console.log('🧠 DCYFR Knowledge Base Query\n');

  if (options.search) {
    console.log(`Searching for: "${options.search}"`);
  }
  if (options.category) {
    console.log(`Category filter: ${options.category}`);
  }
  if (options.confidence > 0) {
    console.log(`Minimum confidence: ${(options.confidence * 100).toFixed(0)}%`);
  }

  const kb = await loadKnowledgeBase();
  let results = [];

  // Search based on category filter
  if (!options.category || options.category === 'pattern') {
    results = results.concat(searchPatterns(kb, options));
  }
  if (!options.category || options.category === 'mistake') {
    results = results.concat(searchMistakes(kb, options));
  }
  if (!options.category || options.category === 'optimization') {
    results = results.concat(searchOptimizations(kb, options));
  }

  // Sort by relevance (confidence/adoption rate)
  results.sort((a, b) => {
    const scoreA = a.confidence || a.adoptionRate || 0;
    const scoreB = b.confidence || b.adoptionRate || 0;
    return scoreB - scoreA;
  });

  displayResults(results, options);
}

main().catch(error => {
  console.error('❌ Query failed:', error.message);
  process.exit(1);
});

export { searchPatterns, searchMistakes, searchOptimizations };
