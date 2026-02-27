#!/usr/bin/env node

/**
 * Unified Validation Framework for DCYFR Labs
 *
 * Consolidates all validation scripts into a single, modular system.
 * Reduces operational overhead from 20+ scripts to 1 framework with modules.
 *
 * Usage:
 *   npm run validate                   # Run all validations
 *   npm run validate:design            # Design tokens only
 *   npm run validate:docs              # Documentation validations
 *   npm run validate:code              # Code quality validations
 *   npm run validate:content           # Content validations
 *   npm run validate:infrastructure    # Infrastructure validations
 *
 * Advanced Usage:
 *   node scripts/validate.mjs --help
 *   node scripts/validate.mjs --list
 *   node scripts/validate.mjs --module design-tokens
 *   node scripts/validate.mjs --module docs --verbose
 *   node scripts/validate.mjs --all --fail-fast
 *
 * Exit codes:
 *   0 - All validations passed
 *   1 - Some validations failed
 *   2 - Configuration/usage error
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color utilities for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`${colors.bold}${colors.blue}${msg}${colors.reset}`),
  separator: () => console.log(`${colors.gray}${'─'.repeat(60)}${colors.reset}`),
};

// Validation module registry
const VALIDATION_MODULES = {
  'design-tokens': {
    name: 'Design Tokens',
    description: 'Validate design token usage and compliance',
    category: 'design',
    module: './validation-modules/design-tokens.mjs',
    legacy: ['validate-design-tokens.mjs'],
  },
  'voice-compliance': {
    name: 'Voice Compliance',
    description: 'Brand voice consistency across agent definitions',
    category: 'content',
    module: './validation-modules/voice-compliance.mjs',
    legacy: ['validate-voice-compliance.mjs'],
  },
  'docs-links': {
    name: 'Documentation Links',
    description: 'Validate internal and external documentation links',
    category: 'docs',
    module: './validation-modules/docs-links.mjs',
    legacy: ['validate-docs-links.mjs', 'verify-links.mjs'],
  },
  frontmatter: {
    name: 'Frontmatter',
    description: 'Validate markdown frontmatter schemas',
    category: 'content',
    module: './validation-modules/frontmatter.mjs',
    legacy: ['validate-frontmatter.mjs'],
  },
  'tlp-compliance': {
    name: 'TLP Compliance',
    description: 'Traffic Light Protocol classification compliance',
    category: 'docs',
    module: './validation-modules/tlp-compliance.mjs',
    legacy: ['validate-tlp-compliance.mjs'],
  },
  'redis-connectivity': {
    name: 'Redis Connectivity',
    description: 'Validate Redis connection and key patterns',
    category: 'infrastructure',
    module: './validation-modules/redis-connectivity.mjs',
    legacy: ['validate-redis-connectivity.mjs', 'test-redis-connection.mjs'],
  },
  'color-contrast': {
    name: 'Color Contrast',
    description: 'WCAG color contrast compliance',
    category: 'design',
    module: './validation-modules/color-contrast.mjs',
    legacy: ['validate-color-contrast.mjs'],
  },
  emojis: {
    name: 'Emoji Usage',
    description: 'Validate emoji usage patterns',
    category: 'content',
    module: './validation-modules/emojis.mjs',
    legacy: ['validate-emojis.mjs'],
  },
  governance: {
    name: 'Governance',
    description: 'Organizational governance compliance',
    category: 'docs',
    module: './validation-modules/governance.mjs',
    legacy: ['validate-governance.mjs'],
  },
  'production-views': {
    name: 'Production Views',
    description: 'Production view tracking and safety',
    category: 'infrastructure',
    module: './validation-modules/production-views.mjs',
    legacy: ['verify-production-views.mjs'],
  },
};

// Category mappings for grouped execution
const CATEGORIES = {
  design: ['design-tokens', 'color-contrast'],
  docs: ['docs-links', 'tlp-compliance', 'governance'],
  content: ['voice-compliance', 'frontmatter', 'emojis'],
  code: ['frontmatter'], // Add code-specific validations here
  infrastructure: ['redis-connectivity', 'production-views'],
  all: Object.keys(VALIDATION_MODULES),
};

class ValidationFramework {
  constructor() {
    this.results = [];
    this.verbose = false;
    this.failFast = false;
    this.startTime = Date.now();
  }

  async runModule(moduleId, options = {}) {
    const module = VALIDATION_MODULES[moduleId];
    if (!module) {
      throw new Error(`Unknown validation module: ${moduleId}`);
    }

    const modulePath = path.resolve(__dirname, module.module);
    if (!fs.existsSync(modulePath)) {
      log.warn(`Module not found: ${modulePath} (using legacy fallback)`);
      return await this.runLegacyModule(module, options);
    }

    try {
      const { default: validator } = await import(modulePath);

      if (this.verbose) {
        log.info(`Running ${module.name}...`);
      }

      const result = await validator(options);
      this.results.push({
        module: moduleId,
        name: module.name,
        ...result,
      });

      if (result.success) {
        log.success(`${module.name}: ${result.message || 'Passed'}`);
      } else {
        log.error(`${module.name}: ${result.message || 'Failed'}`);

        if (result.details && this.verbose) {
          result.details.forEach((detail) => {
            log.info(`  ${detail}`);
          });
        }

        if (this.failFast) {
          throw new Error(`Validation failed: ${module.name}`);
        }
      }

      return result;
    } catch (error) {
      log.error(`${module.name}: Error - ${error.message}`);
      const result = { success: false, message: error.message };
      this.results.push({
        module: moduleId,
        name: module.name,
        ...result,
      });

      if (this.failFast) {
        throw error;
      }

      return result;
    }
  }

  async runLegacyModule(module, _options = {}) {
    // Fallback to legacy scripts if modular version not yet available
    log.warn(`Using legacy validation: ${module.legacy[0]}`);

    const { execSync } = await import('child_process');
    try {
      execSync(`node scripts/${module.legacy[0]}`, {
        stdio: this.verbose ? 'inherit' : 'pipe',
        cwd: path.dirname(__dirname),
      });

      const result = { success: true, message: 'Passed (legacy)' };
      this.results.push({
        module: module.name.toLowerCase().replace(/\s+/g, '-'),
        name: module.name,
        ...result,
      });

      return result;
    } catch {
      const result = { success: false, message: 'Failed (legacy)' };
      this.results.push({
        module: module.name.toLowerCase().replace(/\s+/g, '-'),
        name: module.name,
        ...result,
      });

      return result;
    }
  }

  async runCategory(category) {
    const modules = CATEGORIES[category];
    if (!modules) {
      throw new Error(`Unknown category: ${category}`);
    }

    log.header(`Running ${category} validations...`);

    const results = [];
    for (const moduleId of modules) {
      const result = await this.runModule(moduleId);
      results.push(result);
    }

    return results;
  }

  async runAll() {
    log.header('Running all validations...');
    return await this.runCategory('all');
  }

  printSummary() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    log.separator();

    const passed = this.results.filter((r) => r.success).length;
    const failed = this.results.length - passed;

    if (failed === 0) {
      log.success(`All ${passed} validations passed in ${duration}s`);
    } else {
      log.error(`${failed} of ${this.results.length} validations failed in ${duration}s`);

      if (this.verbose) {
        log.header('\nFailed validations:');
        this.results
          .filter((r) => !r.success)
          .forEach((r) => log.error(`  • ${r.name}: ${r.message}`));
      }
    }

    return failed === 0;
  }

  static usage() {
    console.log(`
${colors.bold}DCYFR Labs Unified Validation Framework${colors.reset}

${colors.bold}Usage:${colors.reset}
  validate.mjs [options] [category|module]

${colors.bold}Categories:${colors.reset}
  design          Design tokens, color contrast
  docs           Documentation links, TLP compliance, governance
  content        Voice compliance, frontmatter, emoji usage
  code           Code quality validations
  infrastructure Redis connectivity, production views
  all            Run all validations (default)

${colors.bold}Individual Modules:${colors.reset}`);

    Object.entries(VALIDATION_MODULES).forEach(([id, module]) => {
      console.log(`  ${colors.blue}${id.padEnd(18)}${colors.reset} ${module.description}`);
    });

    console.log(`
${colors.bold}Options:${colors.reset}
  --help          Show this help
  --list          List all available modules
  --verbose, -v   Detailed output
  --fail-fast     Stop on first failure
  --module, -m    Run specific module

${colors.bold}Examples:${colors.reset}
  validate.mjs                           # All validations
  validate.mjs design                    # Design validations only
  validate.mjs --module design-tokens    # Specific module
  validate.mjs content --verbose         # Content validations with details
  validate.mjs --all --fail-fast        # Stop on first failure
`);
  }

  static listModules() {
    console.log(`${colors.bold}Available Validation Modules:${colors.reset}\n`);

    Object.entries(CATEGORIES).forEach(([category, modules]) => {
      if (category === 'all') return;

      console.log(`${colors.blue}${colors.bold}${category.toUpperCase()}:${colors.reset}`);
      modules.forEach((moduleId) => {
        const module = VALIDATION_MODULES[moduleId];
        const status = fs.existsSync(path.resolve(__dirname, module.module))
          ? `${colors.green}●${colors.reset}`
          : `${colors.yellow}○${colors.reset}`;
        console.log(`  ${status} ${colors.blue}${moduleId}${colors.reset} - ${module.description}`);
      });
      console.log();
    });

    console.log(`${colors.green}●${colors.reset} Modular implementation available`);
    console.log(`${colors.yellow}○${colors.reset} Uses legacy script fallback`);
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    ValidationFramework.usage();
    process.exit(0);
  }

  if (args.includes('--list')) {
    ValidationFramework.listModules();
    process.exit(0);
  }

  const framework = new ValidationFramework();
  framework.verbose = args.includes('--verbose') || args.includes('-v');
  framework.failFast = args.includes('--fail-fast');

  try {
    let target = 'all';

    // Check for --module flag
    const moduleIndex = args.findIndex((arg) => arg === '--module' || arg === '-m');
    if (moduleIndex !== -1 && args[moduleIndex + 1]) {
      const moduleId = args[moduleIndex + 1];
      await framework.runModule(moduleId);
    }
    // Check for category/module argument
    else if (args.length > 0 && !args[0].startsWith('--')) {
      target = args[0];

      if (CATEGORIES[target]) {
        await framework.runCategory(target);
      } else if (VALIDATION_MODULES[target]) {
        await framework.runModule(target);
      } else {
        log.error(`Unknown category or module: ${target}`);
        ValidationFramework.usage();
        process.exit(2);
      }
    }
    // Default: run all
    else {
      await framework.runAll();
    }

    const success = framework.printSummary();
    process.exit(success ? 0 : 1);
  } catch (error) {
    log.error(`Validation framework error: ${error.message}`);
    if (framework.verbose) {
      console.error(error.stack);
    }
    process.exit(2);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(2);
  });
}

export default ValidationFramework;
