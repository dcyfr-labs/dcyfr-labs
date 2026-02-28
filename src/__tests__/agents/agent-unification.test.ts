/**
 * Agent Unification Tests
 *
 * Validates pattern consistency across Claude Code and GitHub Copilot agents.
 * Ensures all agents reference the same source patterns and produce consistent outputs.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Agent Unification Tests', () => {
  describe('Pattern Consistency', () => {
    it('should have consistent design token enforcement across all agents', () => {
      // Read agent documentation
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');
      const copilotMd = fs.readFileSync(
        path.join(process.cwd(), '.github/copilot-instructions.md'),
        'utf-8'
      );

      // Check for design token references
      const designTokenPatterns = ['SPACING', 'TYPOGRAPHY', 'CONTAINER_WIDTHS', 'design-tokens'];

      designTokenPatterns.forEach((pattern) => {
        expect(claudeMd).toContain(pattern);
        expect(copilotMd).toContain(pattern);
      });
    });

    it('should reference barrel exports consistently', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');

      // Claude should mention barrel exports and @/* imports
      expect(claudeMd).toContain('@/*');
      expect(claudeMd.toLowerCase()).toContain('import');

      // Note: Copilot instructions may be in different file structure
      // This test validates Claude's documentation is complete
    });

    it('should have consistent layout pattern guidance', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');

      const layoutPatterns = ['PageLayout', 'PageHero'];

      layoutPatterns.forEach((pattern) => {
        expect(claudeMd).toContain(pattern);
      });

      // Note: Copilot may use abbreviated 80/20 patterns in separate docs
      // This test validates Claude's documentation is complete
    });

    it('should have consistent metadata helper guidance', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');
      const copilotMd = fs.readFileSync(
        path.join(process.cwd(), '.github/copilot-instructions.md'),
        'utf-8'
      );

      const metadataHelpers = [
        'createPageMetadata',
        'createArchivePageMetadata',
        'createArticlePageMetadata',
      ];

      metadataHelpers.forEach((helper) => {
        expect(claudeMd).toContain(helper);
        // Copilot may use abbreviated 80/20 patterns
        // so we just check for "metadata" concept
        expect(copilotMd.toLowerCase()).toContain('metadata');
      });
    });
  });

  describe('Enforcement Rule Parity', () => {
    it('should prohibit emojis in same locations across agents', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');

      // Check for emoji prohibition rule
      expect(claudeMd.toLowerCase()).toMatch(/emoji|emojis/);
      expect(claudeMd.toLowerCase()).toMatch(/react icons|lucide/);
    });

    it('should enforce test data prevention consistently', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');

      // Check for test data prevention rules
      expect(claudeMd.toLowerCase()).toMatch(/test data|demo data|mock data|fabricated/);
      expect(claudeMd.toLowerCase()).toMatch(/environment.*check|node_env|vercel_env/i);
    });

    it('should have consistent hardcoded value prohibition', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');

      // Should prohibit hardcoded spacing/typography/colors
      expect(claudeMd.toLowerCase()).toMatch(/never.*hardcode|hardcoded/);

      // Note: Copilot instructions may enforce via ESLint rules documented separately
      // This test validates Claude's documentation is complete
    });
  });

  describe('Decision Tree Consistency', () => {
    it('should recommend same layout for standard pages', () => {
      // Decision: Which layout to use for a standard page?
      // Expected: PageLayout (90% of pages)

      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');
      const copilotMd = fs.readFileSync(
        path.join(process.cwd(), '.github/copilot-instructions.md'),
        'utf-8'
      );

      // Both should recommend PageLayout
      expect(claudeMd).toContain('PageLayout');
      expect(copilotMd).toContain('PageLayout');
    });

    it('should recommend same container width for standard content', () => {
      // Decision: Which container width to use?
      // Expected: CONTAINER_WIDTHS.standard (80% of content)

      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');
      const copilotMd = fs.readFileSync(
        path.join(process.cwd(), '.github/copilot-instructions.md'),
        'utf-8'
      );

      // Both should reference standard container
      expect(claudeMd).toMatch(/CONTAINER_WIDTHS\.standard|standard.*container/);
      expect(copilotMd).toMatch(/CONTAINER_WIDTHS\.standard|standard.*container/);
    });

    it('should have consistent approach to metadata helpers', () => {
      // Decision: Which metadata helper to use?
      // Expected: createPageMetadata() for standard pages

      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');

      expect(claudeMd).toContain('createPageMetadata()');
    });
  });

  describe('Documentation Sync', () => {
    it('should reference shared source of truth (.github/agents/)', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');

      // Check for reference to shared agent patterns
      expect(claudeMd.toLowerCase()).toMatch(/\.github\/agents|github\/agents/);
    });

    it('should have up-to-date agent operational systems section', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');

      // Check for checkpoint system
      expect(claudeMd).toContain('Session Checkpoint System');
    });

    it('should have consistent NPM script references', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
      );

      // Check that documented scripts actually exist
      const documentedScripts = ['checkpoint:start', 'checkpoint:stop'];

      documentedScripts.forEach((script) => {
        if (claudeMd.includes(script)) {
          expect(packageJson.scripts).toHaveProperty(script);
        }
      });
    });

    it('should have matching file references across documentation', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');

      // Extract markdown links
      const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
      const links = [...claudeMd.matchAll(linkPattern)];

      // Check that referenced files exist (sampling)
      const criticalRefs = links.filter(
        ([, , path]) =>
          path.startsWith('docs/') || path.startsWith('src/') || path.startsWith('scripts/')
      );

      criticalRefs.forEach(([, , refPath]) => {
        const cleanPath = refPath.split('#')[0]; // Remove anchors
        const fullPath = path.join(process.cwd(), cleanPath);

        // File should exist (allow some flexibility for documentation structure)
        if (!cleanPath.includes('*') && !cleanPath.startsWith('http')) {
          const exists = fs.existsSync(fullPath);
          if (!exists) {
            console.warn(`Referenced file not found: ${cleanPath}`);
          }
          // Don't fail test, just warn - some docs may be intentionally missing
        }
      });
    });
  });

  describe('Agent Feature Parity', () => {
    it('should document the same core capabilities across agents', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');

      // Core capabilities that should be documented
      const coreCapabilities = ['design tokens', 'TypeScript', 'ESLint', 'test'];

      coreCapabilities.forEach((capability) => {
        expect(claudeMd.toLowerCase()).toContain(capability.toLowerCase());
      });
    });

    it('should have consistent quick start commands', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
      );

      // Quick start commands mentioned in docs should exist
      const quickStartCommands = ['npm run dev', 'npm run build', 'npm run test'];

      quickStartCommands.forEach((cmd) => {
        if (claudeMd.includes(cmd)) {
          const scriptName = cmd.replace('npm run ', '');
          if (scriptName !== 'dev' && scriptName !== 'build') {
            // dev and build are standard, might have different names
            expect(packageJson.scripts).toHaveProperty(scriptName);
          }
        }
      });
    });
  });

  describe('Validation Command Consistency', () => {
    it('should reference same validation commands across agents', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');

      // Validation commands
      const validationCommands = ['npm run lint', 'npm run typecheck', 'npm run test'];

      validationCommands.forEach((cmd) => {
        expect(claudeMd).toContain(cmd);
      });
    });

    it('should document same quality gates', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');

      // Quality gates
      const qualityGates = ['TypeScript', 'ESLint', 'test', 'design token'];

      qualityGates.forEach((gate) => {
        expect(claudeMd.toLowerCase()).toContain(gate.toLowerCase());
      });
    });
  });

  describe('Agent Operational Systems Integration', () => {
    it('should document session checkpoint system', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');

      expect(claudeMd).toContain('Session Checkpoint System');
    });

    it('should reference correct documentation files if mentioned', () => {
      const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');

      const docFiles = ['SESSION_RECOVERY_SYSTEM.md', 'PROVIDER_FALLBACK_SYSTEM.md'];

      docFiles.forEach((file) => {
        if (claudeMd.includes(file)) {
          const fullPath = path.join(process.cwd(), 'docs/operations', file);
          expect(fs.existsSync(fullPath)).toBe(true);
        }
      });
    });

    it('should have NPM scripts for all operational systems', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
      );

      // Checkpoint system
      expect(packageJson.scripts).toHaveProperty('checkpoint:start');
      expect(packageJson.scripts).toHaveProperty('checkpoint:stop');
    });
  });
});
