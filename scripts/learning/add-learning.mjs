#!/usr/bin/env node

/**
 * Add Learning to Knowledge Base
 *
 * Interactive script to capture learnings
 *
 * Usage: npm run learning:add
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEARNINGS_PATH = path.join(__dirname, '../../.github/agents/learning-data/learnings.json');

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function addLearning() {
  console.log('📚 Add New Learning\n');

  const category = await prompt('Category (pattern/mistake/improvement/discovery): ');
  const title = await prompt('Title: ');
  const description = await prompt('Description: ');
  const agent = await prompt('Agent (optional): ');
  const impact = await prompt('Impact (high/medium/low): ');

  const learning = {
    id: `learning-${category}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    category,
    title,
    description,
    impact: impact || 'medium',
    applied: false
  };

  if (agent) learning.agent = agent;

  const learnings = JSON.parse(await fs.readFile(LEARNINGS_PATH, 'utf8'));
  learnings.learnings.push(learning);

  await fs.writeFile(LEARNINGS_PATH, JSON.stringify(learnings, null, 2));

  console.log('\n✅ Learning added successfully');
  console.log(`   ID: ${learning.id}`);
  console.log(`   Category: ${category}`);
  console.log(`   Title: ${title}`);
}

addLearning().catch(err => {
  console.error('❌ Failed to add learning:', err.message);
  process.exit(1);
});
