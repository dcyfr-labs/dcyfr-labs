#!/usr/bin/env node

/**
 * Core Web Vitals Baseline Analysis
 *
 * Extracts and analyzes Core Web Vitals metrics from Lighthouse CI reports.
 * Generates comprehensive baseline documentation with recommendations.
 *
 * Core Web Vitals Targets (2025):
 * - LCP (Largest Contentful Paint): <2.5s (good), 2.5-4s (needs improvement), >4s (poor)
 * - INP (Interaction to Next Paint): <200ms (good), 200-500ms (needs improvement), >500ms (poor)
 * - CLS (Cumulative Layout Shift): <0.1 (good), 0.1-0.25 (needs improvement), >0.25 (poor)
 *
 * @see https://web.dev/vitals/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

// Core Web Vitals thresholds
const THRESHOLDS = {
  lcp: { good: 2500, needsImprovement: 4000 },
  inp: { good: 200, needsImprovement: 500 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1800, needsImprovement: 3000 },
  tti: { good: 3800, needsImprovement: 7300 },
  tbt: { good: 200, needsImprovement: 600 },
  si: { good: 3400, needsImprovement: 5800 },
};

function getRating(value, metric) {
  const threshold = THRESHOLDS[metric];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

function getColorForRating(rating) {
  switch (rating) {
    case 'good':
      return colors.green;
    case 'needs-improvement':
      return colors.yellow;
    case 'poor':
      return colors.red;
    default:
      return colors.reset;
  }
}

function formatMs(ms) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatScore(score) {
  return Math.round(score * 100);
}

function analyzeReport(report) {
  const { requestedUrl, audits, categories } = report;

  // Extract Core Web Vitals
  const metrics = {
    lcp: audits['largest-contentful-paint']?.numericValue || null,
    fcp: audits['first-contentful-paint']?.numericValue || null,
    cls: audits['cumulative-layout-shift']?.numericValue || null,
    tti: audits.interactive?.numericValue || null,
    tbt: audits['total-blocking-time']?.numericValue || null,
    si: audits['speed-index']?.numericValue || null,
  };

  // Extract scores
  const scores = {
    performance: categories.performance?.score || 0,
    accessibility: categories.accessibility?.score || 0,
    bestPractices: categories['best-practices']?.score || 0,
    seo: categories.seo?.score || 0,
  };

  return { url: requestedUrl, metrics, scores };
}

function aggregateMetrics(reports) {
  const byUrl = {};

  reports.forEach((report) => {
    const analysis = analyzeReport(report);
    if (!byUrl[analysis.url]) {
      byUrl[analysis.url] = { runs: [], metrics: {}, scores: {} };
    }
    byUrl[analysis.url].runs.push(analysis);
  });

  // Calculate medians
  Object.keys(byUrl).forEach((url) => {
    const runs = byUrl[url].runs;

    // Median metrics
    ['lcp', 'fcp', 'cls', 'tti', 'tbt', 'si'].forEach((metric) => {
      const values = runs
        .map((r) => r.metrics[metric])
        .filter((v) => v !== null)
        .sort((a, b) => a - b);
      const median = values[Math.floor(values.length / 2)] || null;
      byUrl[url].metrics[metric] = median;
    });

    // Median scores
    ['performance', 'accessibility', 'bestPractices', 'seo'].forEach(
      (category) => {
        const values = runs.map((r) => r.scores[category]).sort((a, b) => a - b);
        const median = values[Math.floor(values.length / 2)] || 0;
        byUrl[url].scores[category] = median;
      }
    );
  });

  return byUrl;
}

function printAnalysis(data) {
  console.log(
    `${colors.bright}${colors.cyan}\n╔══════════════════════════════════════════════╗${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}║  Core Web Vitals Baseline Analysis          ║${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}╚══════════════════════════════════════════════╝${colors.reset}\n`
  );

  Object.entries(data).forEach(([url, { metrics, scores }]) => {
    const urlPath = new URL(url).pathname || '/';
    console.log(`${colors.bright}${colors.blue}Page: ${urlPath}${colors.reset}\n`);

    // Core Web Vitals
    console.log(`${colors.bright}Core Web Vitals:${colors.reset}`);

    const lcpRating = getRating(metrics.lcp, 'lcp');
    const clsRating = getRating(metrics.cls, 'cls');
    const ttiRating = getRating(metrics.tti, 'tti');

    if (metrics.lcp) {
      console.log(
        `  LCP: ${getColorForRating(lcpRating)}${formatMs(metrics.lcp)}${
          colors.reset
        } (${lcpRating}) - Target: <2.5s`
      );
    }
    if (metrics.cls !== null && metrics.cls !== undefined) {
      console.log(
        `  CLS: ${getColorForRating(clsRating)}${metrics.cls.toFixed(3)}${
          colors.reset
        } (${clsRating}) - Target: <0.1`
      );
    }
    if (metrics.tti) {
      console.log(
        `  TTI: ${getColorForRating(ttiRating)}${formatMs(metrics.tti)}${
          colors.reset
        } (${ttiRating}) - Target: <3.8s`
      );
    }

    // Other Performance Metrics
    console.log(`\n${colors.bright}Other Metrics:${colors.reset}`);
    if (metrics.fcp) console.log(`  FCP: ${formatMs(metrics.fcp)} - Target: <1.8s`);
    if (metrics.tbt) console.log(`  TBT: ${formatMs(metrics.tbt)} - Target: <200ms`);
    if (metrics.si) console.log(`  Speed Index: ${formatMs(metrics.si)} - Target: <3.4s`);

    // Scores
    console.log(`\n${colors.bright}Lighthouse Scores:${colors.reset}`);
    console.log(
      `  Performance: ${
        scores.performance >= 0.9 ? colors.green : colors.yellow
      }${formatScore(scores.performance)}%${colors.reset}`
    );
    console.log(
      `  Accessibility: ${
        scores.accessibility >= 0.95 ? colors.green : colors.yellow
      }${formatScore(scores.accessibility)}%${colors.reset}`
    );
    console.log(
      `  Best Practices: ${
        scores.bestPractices >= 0.85 ? colors.green : colors.yellow
      }${formatScore(scores.bestPractices)}%${colors.reset}`
    );
    console.log(
      `  SEO: ${scores.seo >= 0.9 ? colors.green : colors.yellow}${formatScore(
        scores.seo
      )}%${colors.reset}\n`
    );
    console.log('─'.repeat(50) + '\n');
  });
}

function generateMarkdownReport(data) {
  let md = `# Core Web Vitals Baseline Report\n\n`;
  md += `**Generated:** ${new Date().toISOString().split('T')[0]}\n`;
  md += `**Lighthouse Version:** 12.6.1\n\n`;

  md += `## Summary\n\n`;
  md += `This baseline establishes Core Web Vitals targets for dcyfr-labs. All measurements are median values from 3 Lighthouse runs per page.\n\n`;

  md += `### Core Web Vitals Targets (2025)\n\n`;
  md += `- **LCP (Largest Contentful Paint)**: <2.5s (good), 2.5-4s (needs improvement), >4s (poor)\n`;
  md += `- **INP (Interaction to Next Paint)**: <200ms (good), 200-500ms (needs improvement), >500ms (poor)\n`;
  md += `- **CLS (Cumulative Layout Shift)**: <0.1 (good), 0.1-0.25 (needs improvement), >0.25 (poor)\n\n`;

  md += `---\n\n`;

  Object.entries(data).forEach(([url, { metrics, scores }]) => {
    const urlPath = new URL(url).pathname || '/';
    md += `## Page: ${urlPath === '/' ? 'Homepage' : urlPath}\n\n`;

    md += `### Core Web Vitals\n\n`;
    md += `| Metric | Value | Rating | Target |\n`;
    md += `|--------|-------|--------|--------|\n`;
    if (metrics.lcp) {
      md += `| **LCP** | ${formatMs(metrics.lcp)} | ${getRating(
        metrics.lcp,
        'lcp'
      )} | <2.5s |\n`;
    }
    if (metrics.cls !== null && metrics.cls !== undefined) {
      md += `| **CLS** | ${metrics.cls.toFixed(3)} | ${getRating(
        metrics.cls,
        'cls'
      )} | <0.1 |\n`;
    }
    if (metrics.tti) {
      md += `| **TTI** | ${formatMs(metrics.tti)} | ${getRating(
        metrics.tti,
        'tti'
      )} | <3.8s |\n`;
    }
    md += `\n`;

    md += `### Additional Performance Metrics\n\n`;
    md += `| Metric | Value | Target |\n`;
    md += `|--------|-------|--------|\n`;
    if (metrics.fcp) md += `| FCP (First Contentful Paint) | ${formatMs(metrics.fcp)} | <1.8s |\n`;
    if (metrics.tbt) md += `| TBT (Total Blocking Time) | ${formatMs(metrics.tbt)} | <200ms |\n`;
    if (metrics.si) md += `| Speed Index | ${formatMs(metrics.si)} | <3.4s |\n`;
    md += `\n`;

    md += `### Lighthouse Category Scores\n\n`;
    md += `| Category | Score | Target |\n`;
    md += `|----------|-------|--------|\n`;
    md += `| Performance | ${formatScore(scores.performance)}% | ≥90% |\n`;
    md += `| Accessibility | ${formatScore(scores.accessibility)}% | ≥95% |\n`;
    md += `| Best Practices | ${formatScore(scores.bestPractices)}% | ≥85% |\n`;
    md += `| SEO | ${formatScore(scores.seo)}% | ≥90% |\n\n`;

    md += `---\n\n`;
  });

  md += `## Recommendations\n\n`;
  md += `Based on the baseline measurements, focus on:\n\n`;
  md += `1. **LCP Optimization**: Reduce to <2.5s on all pages\n`;
  md += `   - Optimize image delivery (use WebP/AVIF)\n`;
  md += `   - Reduce render-blocking resources\n`;
  md += `   - Implement proper image lazy loading\n\n`;

  md += `2. **JavaScript Optimization**:\n`;
  md += `   - Reduce unused JavaScript\n`;
  md += `   - Code splitting for route-based chunks\n`;
  md += `   - Remove legacy JavaScript polyfills\n\n`;

  md += `3. **Accessibility Improvements**:\n`;
  md += `   - Fix heading order violations\n`;
  md += `   - Ensure label-content name matching\n`;
  md += `   - Add descriptive link text\n\n`;

  md += `4. **Performance Enhancements**:\n`;
  md += `   - Enable back/forward cache\n`;
  md += `   - Fix console errors\n`;
  md += `   - Add source maps for production\n\n`;

  md += `## Monitoring\n\n`;
  md += `Run Lighthouse CI on every deployment:\n\n`;
  md += `\`\`\`bash\n`;
  md += `npm run lighthouse:ci\n`;
  md += `\`\`\`\n\n`;

  md += `**Automated monitoring**: GitHub Actions runs Lighthouse CI on every PR and push to main/preview branches.\n\n`;

  md += `---\n\n`;
  md += `*Generated by Core Web Vitals analysis script*\n`;

  return md;
}

// Main execution
async function main() {
  const lighthouseDir = path.join(process.cwd(), '.lighthouseci');

  if (!fs.existsSync(lighthouseDir)) {
    console.error('Error: .lighthouseci directory not found. Run lhci:collect first.');
    process.exit(1);
  }

  // Find all JSON reports
  const files = fs
    .readdirSync(lighthouseDir)
    .filter((f) => f.startsWith('lhr-') && f.endsWith('.json'));

  if (files.length === 0) {
    console.error('Error: No Lighthouse reports found in .lighthouseci');
    process.exit(1);
  }

  console.log(`Found ${files.length} Lighthouse reports\n`);

  // Parse reports
  const reports = files.map((file) => {
    const content = fs.readFileSync(path.join(lighthouseDir, file), 'utf8');
    return JSON.parse(content);
  });

  // Aggregate and analyze
  const data = aggregateMetrics(reports);

  // Print to console
  printAnalysis(data);

  // Generate markdown report
  const markdown = generateMarkdownReport(data);
  const outputPath = path.join(process.cwd(), 'docs', 'core-web-vitals-baseline.md');

  fs.writeFileSync(outputPath, markdown);

  console.log(
    `${colors.green}✓ Baseline report saved to: ${outputPath}${colors.reset}\n`
  );
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
