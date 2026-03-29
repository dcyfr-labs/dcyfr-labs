#!/usr/bin/env node

/**
 * Cleanup Broken Links Script
 *
 * Scans documentation files for broken internal links and provides options to:
 * - Report broken links
 * - Remove broken links
 * - Fix common link patterns
 *
 * Usage:
 *   npm run cleanup:links              # Report only
 *   npm run cleanup:links -- --fix     # Remove broken links
 *   npm run cleanup:links -- --verbose # Detailed output
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Configuration
const config = {
  // File extensions to scan
  extensions: ['.md', '.mdx'],
  // Directories to exclude
  excludeDirs: ['node_modules', '.git', '.next', 'coverage', '.archive', '.private'],
  // Link patterns to check
  linkPatterns: [
    /\[([^\]]+)\]\(([^)]+)\)/g, // Markdown links [text](url)
    /<a[^>]+href=["']([^"']+)["'][^>]*>/g, // HTML anchor tags
  ],
  // Internal link prefixes to validate
  internalPrefixes: ['./', '../', '/'],
  // External link prefixes to skip validation
  externalPrefixes: ['http://', 'https://', 'mailto:', 'tel:'],
};

/**
 * Check whether a link URL resolves to an existing file (with optional .md/.mdx suffix).
 */
function checkLinkExists(resolvedPath) {
  return (
    existsSync(resolvedPath) ||
    existsSync(resolvedPath + '.md') ||
    existsSync(resolvedPath + '.mdx')
  );
}

/**
 * Resolve and check a link URL against the file system.
 * Returns true if the link target exists.
 */
function resolveLinkExists(filePath, url, projectRootDir, docsDir) {
  if (url.startsWith('./') || url.startsWith('../')) {
    return checkLinkExists(path.resolve(path.dirname(filePath), url));
  }
  if (url.startsWith('/')) {
    return checkLinkExists(path.join(projectRootDir, url.slice(1)));
  }
  return checkLinkExists(path.join(docsDir, url));
}

class LinkChecker {
  constructor(options = {}) {
    this.fix = options.fix || false;
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;

    // Support configurable project root for testing
    this.projectRoot = options.projectRoot || process.env.DCYFR_PROJECT_ROOT || projectRoot;
    this.docsDir = path.join(this.projectRoot, 'docs');

    this.stats = {
      filesScanned: 0,
      linksFound: 0,
      brokenLinks: 0,
      linksRemoved: 0,
      linksFixed: 0,
    };

    this.brokenLinks = [];
    this.fixedLinks = [];
  }

  async scan() {
    console.log('🔍 Scanning documentation for broken links...\n');

    try {
      const files = await this.getAllMarkdownFiles(this.docsDir);

      for (const filePath of files) {
        await this.checkFile(filePath);
      }

      await this.generateReport();
    } catch (error) {
      console.error('❌ Error scanning files:', error.message);
      process.exit(1);
    }
  }

  async getAllMarkdownFiles(dir) {
    const files = [];

    const items = await fs.readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        if (!config.excludeDirs.includes(item)) {
          files.push(...(await this.getAllMarkdownFiles(fullPath)));
        }
      } else if (config.extensions.some((ext) => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }

    return files;
  }

  applyLinkFix(link, filePath, modifiedContent) {
    const fixResult = this.fixBrokenLink(link, filePath);
    let newContent = modifiedContent;
    let fixed = false;
    let removed = false;

    if (fixResult.action === 'remove') {
      newContent = newContent.replace(link.match[0], fixResult.replacement);
      removed = true;
    } else if (fixResult.action === 'fix') {
      newContent = newContent.replace(link.match[0], fixResult.replacement);
      fixed = true;
      this.fixedLinks.push({
        file: path.relative(this.projectRoot, filePath),
        original: link.url,
        fixed: fixResult.newUrl,
      });
    }

    return { content: newContent, fixed, removed };
  }

  applyFixToContent(link, filePath, modifiedContent) {
    const {
      content: newContent,
      fixed,
      removed,
    } = this.applyLinkFix(link, filePath, modifiedContent);
    let changed = false;
    if (removed) {
      changed = true;
      this.stats.linksRemoved++;
    } else if (fixed) {
      changed = true;
      this.stats.linksFixed++;
    }
    return { content: newContent, changed };
  }

  recordBrokenLink(content, filePath, link) {
    this.stats.brokenLinks++;
    this.brokenLinks.push({
      file: path.relative(this.projectRoot, filePath),
      link: link.url,
      text: link.text,
      line: this.getLineNumber(content, link.match.index),
    });
  }

  async checkLinkInFile(filePath, content, modifiedContent, link) {
    if (this.isExternalLink(link.url)) {
      return { content: modifiedContent, changed: false };
    }

    const isValid = await this.validateLink(filePath, link.url);
    if (isValid) {
      return { content: modifiedContent, changed: false };
    }

    this.recordBrokenLink(content, filePath, link);

    if (!this.fix) {
      return { content: modifiedContent, changed: false };
    }

    return this.applyFixToContent(link, filePath, modifiedContent);
  }

  async processLinks(filePath, content, links) {
    let modifiedContent = content;
    let hasChanges = false;

    for (const link of links) {
      const { content: newContent, changed } = await this.checkLinkInFile(
        filePath,
        content,
        modifiedContent,
        link
      );
      modifiedContent = newContent;
      if (changed) {
        hasChanges = true;
      }
    }

    return { modifiedContent, hasChanges };
  }

  async writeUpdatedFile(filePath, modifiedContent) {
    await fs.writeFile(filePath, modifiedContent);
    if (this.verbose) {
      console.log(`✏️  Updated: ${path.relative(this.projectRoot, filePath)}`);
    }
  }

  async checkFile(filePath) {
    this.stats.filesScanned++;

    if (this.verbose) {
      console.log(`📄 Checking: ${path.relative(this.projectRoot, filePath)}`);
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const links = this.extractLinks(content);

    if (links.length === 0) return;

    this.stats.linksFound += links.length;

    const { modifiedContent, hasChanges } = await this.processLinks(filePath, content, links);

    if (hasChanges && !this.dryRun) {
      await this.writeUpdatedFile(filePath, modifiedContent);
    }
  }

  extractLinks(content) {
    const links = [];

    for (const pattern of config.linkPatterns) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);

      while ((match = regex.exec(content)) !== null) {
        if (pattern.source.includes(String.raw`\[`)) {
          // Markdown link pattern
          links.push({
            text: match[1],
            url: match[2],
            match: match,
          });
        } else {
          // HTML anchor pattern
          links.push({
            text: 'HTML anchor',
            url: match[1],
            match: match,
          });
        }
      }
    }

    return links;
  }

  isExternalLink(url) {
    return config.externalPrefixes.some((prefix) => url.startsWith(prefix)) || url.startsWith('#'); // Hash anchors
  }

  async validateLink(filePath, url) {
    try {
      return resolveLinkExists(filePath, url, this.projectRoot, this.docsDir);
    } catch (error) {
      if (this.verbose) console.warn(`⚠️  Error validating link "${url}": ${error.message}`);
      return false;
    }
  }

  fixBrokenLink(link, filePath) {
    // 1. Try adding ./ prefix for same-directory links
    if (!link.url.startsWith('./') && !link.url.startsWith('../') && !link.url.startsWith('/')) {
      const withDotSlash = `./${link.url}`;
      if (this.validateLinkSync(filePath, withDotSlash)) {
        return {
          action: 'fix',
          newUrl: withDotSlash,
          replacement: link.match[0].replace(link.url, withDotSlash),
        };
      }
    }

    // 2. Try adding file extensions and common suffixes
    const variations = [
      `${link.url}.md`,
      `${link.url}.mdx`,
      `${link.url}/README.md`,
      `${link.url}/README`,
      `${link.url}/index.md`,
    ];
    for (const variation of variations) {
      if (this.validateLinkSync(filePath, variation)) {
        return {
          action: 'fix',
          newUrl: variation,
          replacement: link.match[0].replace(link.url, variation),
        };
      }
    }

    // 3. Try converting to docs-relative path
    if (!link.url.startsWith('./') && !link.url.startsWith('/')) {
      const docsRelativePath = `./${link.url}`;
      if (this.validateLinkSync(filePath, docsRelativePath)) {
        return {
          action: 'fix',
          newUrl: docsRelativePath,
          replacement: link.match[0].replace(link.url, docsRelativePath),
        };
      }
    }

    // 4. If no fix found, remove the link but keep the text
    return { action: 'remove', replacement: link.text || link.url };
  }

  validateLinkSync(filePath, url) {
    try {
      return resolveLinkExists(filePath, url, this.projectRoot, this.docsDir);
    } catch {
      return false;
    }
  }

  getLineNumber(content, index) {
    const beforeIndex = content.substring(0, index);
    return beforeIndex.split('\n').length;
  }

  async generateReport() {
    console.log('\n📊 Link Check Report');
    console.log('═'.repeat(50));

    console.log(`📄 Files scanned: ${this.stats.filesScanned}`);
    console.log(`🔗 Links found: ${this.stats.linksFound}`);
    console.log(`❌ Broken links: ${this.stats.brokenLinks}`);

    if (this.fix) {
      console.log(`🔧 Links fixed: ${this.stats.linksFixed}`);
      console.log(`🗑️  Links removed: ${this.stats.linksRemoved}`);
    }

    if (this.brokenLinks.length > 0) {
      console.log('\n🚨 Broken Links Found:');
      console.log('─'.repeat(30));

      for (const broken of this.brokenLinks) {
        console.log(`📍 ${broken.file}:${broken.line}`);
        console.log(`   Text: "${broken.text}"`);
        console.log(`   Link: ${broken.link}\n`);
      }
    }

    if (this.fixedLinks.length > 0) {
      console.log('\n✅ Links Fixed:');
      console.log('─'.repeat(20));

      for (const fixed of this.fixedLinks) {
        console.log(`📍 ${fixed.file}`);
        console.log(`   ${fixed.original} → ${fixed.fixed}\n`);
      }
    }

    if (this.stats.brokenLinks === 0) {
      console.log('\n🎉 No broken links found! Documentation is healthy.');
    } else if (!this.fix) {
      console.log('\n💡 Run with --fix flag to automatically fix or remove broken links.');
    }

    // Save detailed report
    if (this.brokenLinks.length > 0 || this.fixedLinks.length > 0) {
      await this.saveDetailedReport();
    }
  }

  async saveDetailedReport() {
    const reportPath = path.join(this.projectRoot, 'reports', 'broken-links-report.json');

    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      brokenLinks: this.brokenLinks,
      fixedLinks: this.fixedLinks,
    };

    try {
      await fs.mkdir(path.dirname(reportPath), { recursive: true });
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📋 Detailed report saved: ${path.relative(this.projectRoot, reportPath)}`);
    } catch {
      console.warn('⚠️  Could not save detailed report');
    }
  }
}

// CLI interface
async function main() {
  const args = new Set(process.argv.slice(2));

  const options = {
    fix: args.has('--fix'),
    verbose: args.has('--verbose'),
    dryRun: args.has('--dry-run'),
  };

  if (args.has('--help')) {
    console.log(`
🔗 Broken Links Cleanup Tool

Usage:
  node scripts/cleanup-broken-links.mjs [options]

Options:
  --fix         Remove or fix broken links automatically
  --verbose     Show detailed output during scanning
  --dry-run     Show what would be changed without making changes
  --help        Show this help message

Examples:
  npm run cleanup:links                    # Report broken links only
  npm run cleanup:links -- --fix          # Fix broken links automatically
  npm run cleanup:links -- --verbose      # Detailed scanning output
  npm run cleanup:links -- --fix --dry-run # Preview fixes without applying
`);
    process.exit(0);
  }

  const checker = new LinkChecker(options);
  await checker.scan();

  // Exit codes:
  // - If --fix: always exit 0 (successfully fixed all links)
  // - If report only: exit 1 if broken links found (to fail CI), exit 0 if all good
  if (options.fix) {
    process.exit(0);
  } else {
    process.exit(checker.stats.brokenLinks > 0 ? 1 : 0);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export { LinkChecker };
