/**
 * Design Tokens Validation Module
 *
 * Consolidated from: validate-design-tokens.mjs
 * Part of the unified validation framework
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Valid design tokens (consolidated from original script)
const VALID_TOKENS = {
  CONTAINER_WIDTHS: ['prose', 'narrow', 'thread', 'standard', 'content', 'archive', 'dashboard'],
  CONTAINER_PADDING: true,
  NAVIGATION_HEIGHT: true,
  ARCHIVE_CONTAINER_PADDING: true,
  BASE_FONT_SIZE: true,
  FONT_SCALE_RATIO: true,
  SPACING: {
    xs: true,
    sm: true,
    md: true,
    lg: true,
    xl: true,
    '2xl': true,
    component: true,
    section: true,
    navigation: true,
    archive: true,
  },
  TYPOGRAPHY: {
    h1: { standard: true, compact: true, hero: true },
    h2: { standard: true, compact: true },
    h3: { standard: true, compact: true, subheading: true },
    h4: { standard: true, compact: true },
    body: { default: true, small: true, large: true },
    caption: { default: true, small: true },
    metadata: { default: true, small: true },
  },
  SEMANTIC_COLORS: {
    foreground: { default: true, muted: true, emphasis: true },
    background: { default: true, subtle: true, emphasis: true },
    accent: { default: true, subtle: true, emphasis: true },
    success: { default: true, subtle: true, emphasis: true },
    warning: { default: true, subtle: true, emphasis: true },
    danger: { default: true, subtle: true, emphasis: true },
  },
};

async function scanDirectory(dir, extensions = ['.ts', '.tsx']) {
  const files = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...(await scanDirectory(fullPath, extensions)));
      } else if (entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch {
    // Skip directories we can't read
  }

  return files;
}

function validateTokenAccess(tokenPath) {
  const parts = tokenPath.split('.');
  let current = VALID_TOKENS;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (current === true) {
      return true; // Terminal valid token
    }

    if (Array.isArray(current)) {
      return current.includes(part);
    }

    if (typeof current === 'object' && current !== null) {
      if (current.hasOwnProperty(part)) {
        current = current[part];
        continue;
      }
    }

    return false;
  }

  return current === true || (typeof current === 'object' && current !== null);
}

function extractTokenUsage(content) {
  const tokenPattern =
    /(?:SPACING|TYPOGRAPHY|SEMANTIC_COLORS|CONTAINER_WIDTHS|CONTAINER_PADDING|NAVIGATION_HEIGHT|ARCHIVE_CONTAINER_PADDING|BASE_FONT_SIZE|FONT_SCALE_RATIO)(?:\.[a-zA-Z0-9_]+)*(?:\[['""][a-zA-Z0-9_-]+['""]?\])?/g;

  return content.match(tokenPattern) || [];
}

export default async function validateDesignTokens(options = {}) {
  const { verbose = false, threshold = 95 } = options;

  try {
    // Get project root (two levels up from validation-modules/)
    const projectRoot = path.resolve(__dirname, '..', '..');
    const srcDir = path.join(projectRoot, 'src');

    if (!fs.existsSync(srcDir)) {
      return {
        success: false,
        message: 'Source directory not found',
        details: [`Expected src directory at: ${srcDir}`],
      };
    }

    // Scan all TypeScript/TSX files
    const files = await scanDirectory(srcDir);

    let totalUsages = 0;
    let validUsages = 0;
    const violations = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const tokens = extractTokenUsage(content);

        for (const token of tokens) {
          totalUsages++;

          // Clean up token for validation
          const cleanToken = token
            .replace(/\[['"]([^'"]+)['"]\]/g, '.$1') // Convert array access to dot notation
            .split('.')
            .slice(1) // Remove the base token name (SPACING, TYPOGRAPHY, etc.)
            .join('.');

          const baseToken = token.split('.')[0];

          if (validateTokenAccess(cleanToken) || validateTokenAccess(baseToken)) {
            validUsages++;
          } else {
            violations.push({
              file: path.relative(projectRoot, file),
              token,
              line: content.split('\n').findIndex((line) => line.includes(token)) + 1,
            });
          }
        }
      } catch (error) {
        if (verbose) {
          console.warn(`Could not read file ${file}: ${error.message}`);
        }
      }
    }

    const compliancePercentage = totalUsages > 0 ? (validUsages / totalUsages) * 100 : 100;
    const isCompliant = compliancePercentage >= threshold;

    const details = [];
    if (verbose || !isCompliant) {
      details.push(`Files scanned: ${files.length}`);
      details.push(`Token usages found: ${totalUsages}`);
      details.push(`Valid usages: ${validUsages}`);
      details.push(`Compliance: ${compliancePercentage.toFixed(1)}%`);

      if (violations.length > 0) {
        details.push('Violations:');
        violations.slice(0, 10).forEach((v) => {
          details.push(`  ${v.file}:${v.line} - ${v.token}`);
        });

        if (violations.length > 10) {
          details.push(`  ... and ${violations.length - 10} more`);
        }
      }
    }

    return {
      success: isCompliant,
      message: isCompliant
        ? `${compliancePercentage.toFixed(1)}% compliance (${validUsages}/${totalUsages} tokens)`
        : `Below threshold: ${compliancePercentage.toFixed(1)}% < ${threshold}%`,
      details,
      data: {
        totalUsages,
        validUsages,
        compliancePercentage,
        violations: violations.length,
        threshold,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Validation error: ${error.message}`,
      details: verbose ? [error.stack] : [],
    };
  }
}
