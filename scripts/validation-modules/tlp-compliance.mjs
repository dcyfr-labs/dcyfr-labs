/**
 * TLP Compliance Validation Module
 *
 * Consolidated from: validate-tlp-compliance.mjs
 * Part of the unified validation framework
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Valid TLP classification levels
const VALID_TLP_LEVELS = ['CLEAR', 'GREEN', 'AMBER', 'RED'];

// TLP header patterns
const TLP_PATTERNS = [
  /<!--\s*TLP:(CLEAR|GREEN|AMBER|RED)(?:\s*-[^>]*)?\s*-->/,
  /\*\*Information Classification:\*\*\s*TLP:(CLEAR|GREEN|AMBER|RED)/,
];

function extractTLPClassification(content) {
  for (const pattern of TLP_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

function validateFileRequiresTLP(filePath, content) {
  // Skip certain file types that don't need TLP classification
  const skipPatterns = [
    /\/README\.md$/,
    /\/CHANGELOG\.md$/,
    /\/LICENSE/,
    /\/\.github\//,
    /\/node_modules\//,
    /\/\.git\//,
  ];

  if (skipPatterns.some((pattern) => pattern.test(filePath))) {
    return false;
  }

  // Files in docs/ should have TLP classification
  if (filePath.includes('/docs/')) {
    return true;
  }

  // Markdown files with significant content should have classification
  if (filePath.endsWith('.md')) {
    const lines = content.split('\n').filter((line) => line.trim().length > 0);
    return lines.length > 10; // Files with more than 10 non-empty lines
  }

  return false;
}

async function scanForMarkdownFiles(dir, baseDir) {
  const files = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...(await scanForMarkdownFiles(fullPath, baseDir)));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push({
          path: fullPath,
          relativePath: path.relative(baseDir, fullPath),
        });
      }
    }
  } catch {
    // Skip directories we can't read
  }

  return files;
}

export default async function validateTLPCompliance(options = {}) {
  const { verbose = false, requireAll = false } = options;

  try {
    // Get project root (two levels up from validation-modules/)
    const projectRoot = path.resolve(__dirname, '..', '..');

    // Scan for markdown files in docs/ and other relevant directories
    const scanDirs = [path.join(projectRoot, 'docs'), path.join(projectRoot, 'src')].filter((dir) =>
      fs.existsSync(dir)
    );

    if (scanDirs.length === 0) {
      return {
        success: true,
        message: 'No documentation directories found to validate',
        details: [],
      };
    }

    let allFiles = [];
    for (const dir of scanDirs) {
      const files = await scanForMarkdownFiles(dir, projectRoot);
      allFiles.push(...files);
    }

    const results = {
      total: 0,
      compliant: 0,
      missing: 0,
      invalid: 0,
      violations: [],
    };

    for (const file of allFiles) {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        const requiresTLP = requireAll || validateFileRequiresTLP(file.path, content);

        if (requiresTLP) {
          results.total++;

          const tlpLevel = extractTLPClassification(content);

          if (!tlpLevel) {
            results.missing++;
            results.violations.push({
              file: file.relativePath,
              type: 'missing',
              message: 'No TLP classification header found',
            });
          } else if (!VALID_TLP_LEVELS.includes(tlpLevel)) {
            results.invalid++;
            results.violations.push({
              file: file.relativePath,
              type: 'invalid',
              message: `Invalid TLP level: ${tlpLevel}`,
            });
          } else {
            results.compliant++;
          }
        }
      } catch (error) {
        if (verbose) {
          results.violations.push({
            file: file.relativePath,
            type: 'error',
            message: `Could not read file: ${error.message}`,
          });
        }
      }
    }

    const compliancePercentage =
      results.total > 0 ? (results.compliant / results.total) * 100 : 100;

    const isCompliant = results.missing === 0 && results.invalid === 0;

    const details = [];
    if (verbose || !isCompliant) {
      details.push(`Files requiring TLP classification: ${results.total}`);
      details.push(`Compliant files: ${results.compliant}`);
      details.push(`Missing TLP headers: ${results.missing}`);
      details.push(`Invalid TLP levels: ${results.invalid}`);
      details.push(`Compliance: ${compliancePercentage.toFixed(1)}%`);

      if (results.violations.length > 0) {
        details.push('Violations:');
        results.violations.slice(0, 10).forEach((v) => {
          details.push(`  ${v.file} - ${v.message}`);
        });

        if (results.violations.length > 10) {
          details.push(`  ... and ${results.violations.length - 10} more violations`);
        }
      }
    }

    return {
      success: isCompliant,
      message: isCompliant
        ? `All ${results.total} files have valid TLP classification`
        : `${results.missing + results.invalid} files missing or invalid TLP classification`,
      details,
      data: {
        ...results,
        compliancePercentage,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `TLP validation error: ${error.message}`,
      details: verbose ? [error.stack] : [],
    };
  }
}
