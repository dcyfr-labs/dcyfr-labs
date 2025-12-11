#!/usr/bin/env node

/**
 * Generate Monthly Learning Report
 *
 * Creates markdown report of learnings, metrics, and patterns for the month
 *
 * Usage: npm run learning:report --month YYYY-MM
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../.github/agents/learning-data');

async function generateReport(month) {
  console.log(`📊 Generating Learning Report for ${month}...\n`);

  const metrics = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'metrics.json'), 'utf8'));
  const learnings = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'learnings.json'), 'utf8'));
  const kb = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'knowledge-base.json'), 'utf8'));

  const report = `# Learning Report: ${month}

**Generated:** ${new Date().toISOString()}
**Sessions:** ${metrics.aggregates.totalSessions}
**New Learnings:** ${learnings.learnings.length}
**Knowledge Base:** ${kb.metadata.totalPatterns} patterns, ${kb.metadata.totalMistakes} mistakes, ${kb.metadata.totalOptimizations} optimizations

## 📊 Performance Metrics

- **Avg Tokens/Session:** ${metrics.aggregates.avgTokensPerSession.toLocaleString()}
- **Success Rate:** ${(metrics.aggregates.successRate * 100).toFixed(1)}%
- **Total Sessions:** ${metrics.aggregates.totalSessions}

## 🎓 Recent Learnings

${learnings.learnings.slice(0, 5).map(l => `### ${l.title}\n- **Category:** ${l.category}\n- **Impact:** ${l.impact}\n- **Description:** ${l.description}\n`).join('\n')}

## 🔄 Knowledge Base Summary

**Design Patterns:** ${kb.metadata.totalPatterns}
**Common Mistakes:** ${kb.metadata.totalMistakes}
**Optimizations:** ${kb.metadata.totalOptimizations}
**Avg Confidence:** ${(kb.metadata.averageConfidence * 100).toFixed(0)}%

---

**Next Steps:**
1. Review and integrate high-impact learnings
2. Update agent instructions with new patterns
3. Monitor adoption of optimizations
`;

  const reportPath = path.join(DATA_DIR, 'monthly-reports', `${month}.md`);
  await fs.writeFile(reportPath, report);

  console.log('✅ Report generated successfully');
  console.log(`   Location: ${reportPath}`);
}

const month = process.argv.find(arg => arg.startsWith('--month'))?.split('=')[1] ||
              new Date().toISOString().slice(0, 7);

generateReport(month).catch(err => {
  console.error('❌ Failed to generate report:', err.message);
  process.exit(1);
});
