#!/usr/bin/env node
/**
 * DCYFR Pattern Validation Script
 *
 * DEPRECATED: This script now delegates to @dcyfr/agents package.
 * The validation logic has been migrated to the @dcyfr/agents package
 * for reusability and better maintainability.
 *
 * Migration path:
 * - Validation logic: @dcyfr/agents/cli/validate-patterns
 * - This file: Thin wrapper for backward compatibility
 *
 * Usage:
 *   node scripts/validate-dcyfr-patterns.mjs \
 *     --file=src/components/Card.tsx \
 *     --content="..." \
 *     --mode=strict \
 *     --agent=claude-code
 *
 * Exit Codes:
 *   0 - All validations passed
 *   1 - Validation failed (blocks file write in agent hooks)
 *
 * @see @dcyfr/agents package for core validation logic
 * @see docs/ai/agent-compliance-remediation-plan.md
 * @see .claude/settings.json PreToolUse hooks
 */

import fs from 'fs';
import path from 'path';

// TEMPORARY: Comment out @dcyfr/agents import until ES module issues resolved
// import { cli } from '@dcyfr/agents';
// cli(process.argv.slice(2));

// Parse CLI args
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, val] = arg.replace(/^--/, '').split('=');
  acc[key] = val || true;
  return acc;
}, {});

const file = args.file || '';
const content = args.content || (file && fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : '');
const mode = args.mode || 'strict';
const agent = args.agent || 'unknown';
const jsonOutput = args.json === 'true' || args.json === true;

// Validate required args
if (!file) {
  console.error(
    '❌ Usage: --file=<path> [--content=<content>] [--mode=strict|flexible] [--agent=<name>] [--json]'
  );
  process.exit(1);
}

if (!content) {
  if (!jsonOutput) console.error(`❌ No content provided and file not found: ${file}`);
  process.exit(1);
}

// Validation rules
const STRICT_RULES = [
  {
    name: 'Design Tokens',
    priority: 'P0',
    check: (content, file) => {
      // Only check component files
      if (!file.match(/src\/components\/.*\.(tsx|jsx)$/)) return { pass: true };
      if (file.includes('.test.') || file.includes('_templates') || file.includes('index.ts'))
        return { pass: true };

      const violations = [];

      // Check for hardcoded spacing values
      const spacingMatches = content.match(
        /className="[^"]*\b(gap|space|p|m|py|px|pt|pb|pl|pr|my|mx|mt|mb|ml|mr)-[0-9]+[^"]*"/g
      );
      if (spacingMatches) {
        violations.push(
          ...spacingMatches.map((v) => ({
            type: 'hardcoded-spacing',
            value: v,
            suggestion: 'Use SPACING tokens from @/lib/design-tokens',
          }))
        );
      }

      // Check for hardcoded typography
      const typographyMatches = content.match(
        /className="[^"]*\b(text-(xs|sm|base|lg|xl|[2-9]xl)|font-(thin|light|normal|medium|semibold|bold))[^"]*"/g
      );
      if (typographyMatches) {
        violations.push(
          ...typographyMatches.map((v) => ({
            type: 'hardcoded-typography',
            value: v,
            suggestion: 'Use TYPOGRAPHY tokens from @/lib/design-tokens',
          }))
        );
      }

      // Check for design token imports
      const hasTokenImport =
        content.includes('from "@/lib/design-tokens"') ||
        content.includes("from '@/lib/design-tokens'");

      if (violations.length > 0 && !hasTokenImport) {
        return { pass: false, violations: violations.slice(0, 5) };
      }

      return { pass: true };
    },
  },
  {
    name: 'Barrel Exports',
    priority: 'P0',
    check: (content, file) => {
      if (!file.match(/\.(ts|tsx)$/)) return { pass: true };
      if (file.includes('index.ts')) return { pass: true };

      // Check for direct component imports
      const directImports = content.match(/from ["']@\/components\/[^"']+\/[^"']+["']/g);
      if (directImports) {
        return {
          pass: false,
          violations: directImports.slice(0, 3).map((imp) => ({
            type: 'direct-import',
            value: imp,
            suggestion: "Use barrel exports: import { Component } from '@/components/category'",
          })),
        };
      }

      return { pass: true };
    },
  },
  {
    name: 'PageLayout Default',
    priority: 'P0',
    check: (content, file) => {
      // Only check page files
      if (!file.match(/src\/app\/.*\/page\.tsx$/)) return { pass: true };

      // Exceptions
      if (file.includes('/blog/[slug]/')) return { pass: true }; // ArticleLayout OK
      if (file.includes('/work') || file.includes('/blog')) return { pass: true }; // ArchiveLayout OK

      // Check if uses PageLayout
      const hasPageLayout = content.includes('PageLayout') || content.includes('<PageLayout');
      const hasOtherLayout = content.includes('ArticleLayout') || content.includes('ArchiveLayout');

      if (!hasPageLayout && !hasOtherLayout) {
        return {
          pass: false,
          violations: [
            {
              type: 'missing-layout',
              value: file,
              suggestion:
                "Use PageLayout by default (90% rule): import { PageLayout } from '@/components/layouts'",
            },
          ],
        };
      }

      return { pass: true };
    },
  },
  {
    name: 'Test Data Guards',
    priority: 'P0',
    check: (content, file) => {
      // Skip non-script files and test files
      if (file.includes('.test.') || file.includes('.spec.')) return { pass: true };
      if (!file.match(/\.(ts|tsx|js|jsx|mjs)$/)) return { pass: true };

      // Look for fabricated/test data keywords
      const testDataKeywords = [
        'fabricated',
        'demo data',
        'test data',
        'populate analytics',
        'mock data',
        'sample content',
      ];

      const hasTestDataKeyword = testDataKeywords.some((keyword) =>
        content.toLowerCase().includes(keyword)
      );

      if (hasTestDataKeyword) {
        // Check for proper environment guards
        const hasNodeEnvCheck = content.includes('process.env.NODE_ENV');
        const hasVercelEnvCheck = content.includes('process.env.VERCEL_ENV');
        const hasProductionCheck = content.includes('production');

        if (!hasNodeEnvCheck || !hasVercelEnvCheck || !hasProductionCheck) {
          return {
            pass: false,
            violations: [
              {
                type: 'missing-env-guard',
                value: 'Test data without environment checks',
                suggestion:
                  'Add guards: process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production"',
              },
            ],
          };
        }
      }

      return { pass: true };
    },
  },
  {
    name: 'No Emojis in Public Content',
    priority: 'P1',
    check: (content, file) => {
      // Skip test files, internal docs, and scripts
      if (file.includes('.test.') || file.includes('.spec.')) return { pass: true };
      if (file.includes('/docs/') || file.includes('/scripts/')) return { pass: true };
      if (file.includes('console.log') || file.includes('console.error')) return { pass: true };

      // Only check MDX content and public components
      if (!file.match(/\.(mdx|tsx)$/)) return { pass: true };
      if (!file.includes('/content/') && !file.includes('/components/')) return { pass: true };

      // Detect emojis (basic Unicode emoji range)
      const emojiRegex =
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      const hasEmoji = emojiRegex.test(content);

      if (hasEmoji) {
        return {
          pass: false,
          violations: [
            {
              type: 'emoji-in-public-content',
              value: 'Emojis detected',
              suggestion: 'Use React icons from lucide-react instead of emojis in public content',
            },
          ],
        };
      }

      return { pass: true };
    },
  },
  {
    name: 'Documentation Location',
    priority: 'P1',
    check: (content, file) => {
      // Only check markdown files in root
      if (!file.match(/^[A-Z_-]+\.md$/)) return { pass: true };

      // Allowed root docs
      const allowedRoot = [
        'README.md',
        'CHANGELOG.md',
        'CONTRIBUTING.md',
        'LICENSE.md',
        'SECURITY.md',
        'SUPPORT.md',
        'CODE_OF_CONDUCT.md',
        'CLAUDE.md',
        'AGENTS.md',
      ];

      const filename = path.basename(file);
      if (!allowedRoot.includes(filename)) {
        return {
          pass: false,
          violations: [
            {
              type: 'doc-location-violation',
              value: file,
              suggestion: `Move to docs/[category]/ directory (e.g., docs/analysis/${filename})`,
            },
          ],
        };
      }

      return { pass: true };
    },
  },
];

// Run validations
const results = STRICT_RULES.map((rule) => {
  const result = rule.check(content, file);
  return {
    name: rule.name,
    priority: rule.priority,
    ...result,
  };
});

const failures = results.filter((r) => !r.pass);
const totalViolations = failures.reduce((sum, f) => sum + (f.violations?.length || 0), 0);

// Output results
if (jsonOutput) {
  console.log(
    JSON.stringify(
      {
        file,
        agent,
        mode,
        passed: failures.length === 0,
        totalRules: STRICT_RULES.length,
        failedRules: failures.length,
        totalViolations,
        failures: failures.map((f) => ({
          name: f.name,
          priority: f.priority,
          violations: f.violations,
        })),
      },
      null,
      2
    )
  );
} else {
  console.log(`🔍 DCYFR Pattern Validation for ${file}`);
  console.log(`   Agent: ${agent}`);
  console.log(`   Mode: ${mode}`);
  console.log(
    `   Rules: ${STRICT_RULES.length} | Failed: ${failures.length} | Violations: ${totalViolations}`
  );

  if (failures.length > 0) {
    console.log('\n❌ Validation FAILED:\n');
    failures.forEach((failure) => {
      console.log(`  [${failure.priority}] ${failure.name}:`);
      failure.violations?.forEach((v) => {
        console.log(`    ❌ ${v.type}: ${v.value}`);
        console.log(`       💡 ${v.suggestion}`);
      });
      console.log('');
    });
  } else {
    console.log('\n✅ All validations passed');
  }
}

process.exit(failures.length > 0 ? 1 : 0);
