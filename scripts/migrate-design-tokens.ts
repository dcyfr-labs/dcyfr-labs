#!/usr/bin/env tsx
/**
 * Design Token Migration Tool
 *
 * Automatically migrates hardcoded Tailwind classes to design tokens.
 *
 * Usage:
 *   npm run migrate:tokens                    # Dry run (preview)
 *   npm run migrate:tokens -- --apply         # Apply changes
 *   npm run migrate:tokens src/components/ui  # Specific directory
 */

import { Project, SyntaxKind, Node, JsxAttribute } from 'ts-morph';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Change {
  line: number;
  column: number;
  from: string;
  to: string;
  type: 'spacing' | 'color' | 'typography' | 'mixed';
}

interface MigrationResult {
  filePath: string;
  changes: Change[];
}

class DesignTokenMigrator {
  private project: Project;
  private results: MigrationResult[] = [];

  // Spacing mappings (hardcoded → token)
  // CRITICAL: Only use tokens that ACTUALLY EXIST in design-tokens.ts
  // Verified against: src/lib/design-tokens.ts SPACING export (line 811)
  private spacingMappings: Record<string, string> = {
    // ✅ Vertical spacing patterns
    'space-y-8': 'SPACING.section', // md: space-y-10, lg: space-y-14
    'space-y-10': 'SPACING.section',
    'space-y-14': 'SPACING.section',
    'space-y-5': 'SPACING.subsection', // md: space-y-6, lg: space-y-8
    'space-y-6': 'SPACING.subsection',
    'space-y-3': 'SPACING.content', // md: space-y-4, lg: space-y-5
    'space-y-4': 'SPACING.content',
    'space-y-2': 'SPACING.compact',

    // ✅ Gap patterns (SPACING.contentGrid = 'gap-6', SPACING.blogLayout = 'gap-8')
    'gap-6': 'SPACING.contentGrid',
    'gap-8': 'SPACING.blogLayout',

    // ❌ SKIPPED: No design tokens exist yet for:
    // - gap-{1,2,3,4} (needs design token creation)
    // - px-{4,6} (horizontal padding - needs design token)
    // - my-{4,6}, mb-{0,4,6} (margins - needs design token)
  };

  // Color mappings (hardcoded → token)
  // DISABLED: These semantic color tokens don't exist in design-tokens.ts yet
  private colorMappings: Record<string, string> = {};

  // Typography mappings (partial - detecting complex patterns)
  // ❌ TYPOGRAPHY.caption does NOT exist - no individual typography migrations
  private typographyPatterns = [
    // Disabled - these tokens don't exist in design-tokens.ts
    // { match: /text-xs/g, token: 'TYPOGRAPHY.caption' }, // ❌ caption doesn't exist
    { match: /font-semibold/g, token: null }, // Part of TYPOGRAPHY.h* patterns
    { match: /font-bold/g, token: null }, // Part of TYPOGRAPHY.h* patterns
  ];

  constructor(private dryRun: boolean = true) {
    this.project = new Project({
      tsConfigFilePath: path.resolve(__dirname, '../tsconfig.json'),
      skipAddingFilesFromTsConfig: true,
    });
  }

  async migrateFiles(pattern: string): Promise<void> {
    console.log(`📂 Scanning files matching: ${pattern}\n`);

    const fullPattern = pattern.startsWith('/')
      ? pattern
      : path.resolve(__dirname, '..', pattern);

    const sourceFiles = this.project.addSourceFilesAtPaths(fullPattern);
    console.log(`Found ${sourceFiles.length} files\n`);

    for (const file of sourceFiles) {
      await this.migrateFile(file);
    }

    if (!this.dryRun) {
      console.log('💾 Saving changes...');
      await this.project.save();
    }
  }

  private collectElementChanges(element: any): Change[] {
    const changes: Change[] = [];
    for (const attr of element.getAttributes()) {
      if (Node.isJsxAttribute(attr) && attr.getNameNode().getText() === 'className') {
        const result = this.processClassNameAttribute(attr);
        if (result) changes.push(result);
      }
    }
    return changes;
  }

  private async migrateFile(file: any): Promise<void> {
    const changes: Change[] = [];
    const filePath = file.getFilePath();

    // Find all JSX opening elements and self-closing elements
    const jsxOpenings = file.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
    const jsxSelfClosing = file.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);

    const allElements = [...jsxOpenings, ...jsxSelfClosing];

    for (const element of allElements) {
      changes.push(...this.collectElementChanges(element));
    }

    if (changes.length > 0) {
      this.results.push({
        filePath: path.relative(process.cwd(), filePath),
        changes,
      });

      if (!this.dryRun) {
        this.ensureImports(file);
      }
    }
  }

  private processClassNameAttribute(attr: JsxAttribute): Change | null {
    const initializer = attr.getInitializer();
    if (!initializer) return null;

    // Handle string literal: className="space-y-8"
    if (Node.isStringLiteral(initializer)) {
      const originalValue = initializer.getLiteralText();
      const migratedValue = this.migrateClassName(originalValue);

      if (migratedValue !== originalValue) {
        if (!this.dryRun) {
          // Convert to JSX expression if using tokens (contains . or backticks)
          if (migratedValue.includes('.') || migratedValue.includes('`')) {
            attr.setInitializer(`{${migratedValue}}`);
          } else {
            initializer.setLiteralValue(migratedValue);
          }
        }

        return {
          line: attr.getStartLineNumber(),
          column: attr.getStart() - attr.getStartLinePos(),
          from: originalValue,
          to: migratedValue,
          type: this.detectChangeType(originalValue),
        };
      }
    }

    // Handle JSX expression: className={`gap-${size}`}
    // For now, skip these - they're more complex

    return null;
  }

  private migrateClass(cls: string): { migr: string; hasToken: boolean } {
    if (this.spacingMappings[cls]) return { migr: this.spacingMappings[cls], hasToken: true };
    if (this.colorMappings[cls]) return { migr: this.colorMappings[cls], hasToken: true };
    for (const pattern of this.typographyPatterns) {
      if (pattern.token && pattern.match.test(cls)) return { migr: pattern.token, hasToken: true };
    }
    return { migr: cls, hasToken: false };
  }

  private formatTokenClasses(migratedClasses: string[]): string {
    const isDesignToken = (cls: string) => /^[A-Z_]+\./.test(cls);
    const tokens = migratedClasses.filter(isDesignToken);
    const regular = migratedClasses.filter(cls => !isDesignToken(cls));

    if (tokens.length > 0 && regular.length === 0) {
      return tokens.join(' ');
    }
    if (tokens.length > 0 && regular.length > 0) {
      return `\`${migratedClasses.map(cls => isDesignToken(cls) ? `\${${cls}}` : cls).join(' ')}\``;
    }
    return migratedClasses.join(' ');
  }

  private migrateClassName(className: string): string {
    const classes = className.split(/\s+/).filter(Boolean);
    let hasTokens = false;
    const migratedClasses: string[] = [];

    for (const cls of classes) {
      const { migr, hasToken } = this.migrateClass(cls);
      migratedClasses.push(migr);
      if (hasToken) hasTokens = true;
    }

    if (hasTokens) {
      return this.formatTokenClasses(migratedClasses);
    }

    return className;
  }

  private detectChangeType(className: string): Change['type'] {
    const hasSpacing = Object.keys(this.spacingMappings).some(k => className.includes(k));
    const hasColor = Object.keys(this.colorMappings).some(k => className.includes(k));
    const hasTypography = this.typographyPatterns.some(p => p.match.test(className));

    const matches = [hasSpacing, hasColor, hasTypography].filter(Boolean).length;

    if (matches > 1) return 'mixed';
    if (hasSpacing) return 'spacing';
    if (hasColor) return 'color';
    if (hasTypography) return 'typography';

    return 'spacing';
  }

  private ensureImports(file: any): void {
    // Determine what tokens are used in the file
    const fileText = file.getFullText();
    const neededImports: Set<string> = new Set();

    if (fileText.includes('SPACING.')) neededImports.add('SPACING');
    if (fileText.includes('SEMANTIC_COLORS.')) neededImports.add('SEMANTIC_COLORS');
    if (fileText.includes('TYPOGRAPHY.')) neededImports.add('TYPOGRAPHY');

    if (neededImports.size === 0) return;

    // Find existing design-tokens import
    const imports = file.getImportDeclarations();
    const existingImport = imports.find((imp: any) =>
      imp.getModuleSpecifierValue() === '@/lib/design-tokens'
    );

    if (existingImport) {
      // Update existing import to include missing tokens
      const currentImports = new Set(
        existingImport.getNamedImports().map((ni: any) => ni.getName())
      );

      const missingImports = Array.from(neededImports).filter(
        token => !currentImports.has(token)
      );

      if (missingImports.length > 0) {
        // Add missing imports to existing declaration
        existingImport.addNamedImports(missingImports);
      }
    } else {
      // Create new import declaration
      file.addImportDeclaration({
        moduleSpecifier: '@/lib/design-tokens',
        namedImports: Array.from(neededImports),
      });
    }
  }

  generateReport(): string {
    if (this.results.length === 0) {
      return '✅ No migrations needed - all files already use design tokens!';
    }

    const totalChanges = this.results.reduce((sum, r) => sum + r.changes.length, 0);
    const byType = {
      spacing: 0,
      color: 0,
      typography: 0,
      mixed: 0,
    };

    this.results.forEach(result => {
      result.changes.forEach(change => {
        byType[change.type]++;
      });
    });

    let report = `# 🎨 Design Token Migration Report\n\n`;
    report += `**Mode:** ${this.dryRun ? '🔍 DRY RUN (preview only)' : '✅ APPLY (changes saved)'}\n`;
    report += `**Total Files:** ${this.results.length}\n`;
    report += `**Total Changes:** ${totalChanges}\n\n`;
    report += `**Changes by Type:**\n`;
    report += `- Spacing: ${byType.spacing}\n`;
    report += `- Colors: ${byType.color}\n`;
    report += `- Typography: ${byType.typography}\n`;
    report += `- Mixed: ${byType.mixed}\n\n`;
    report += `---\n\n`;

    this.results.forEach(result => {
      report += `## 📄 ${result.filePath}\n\n`;
      report += `**Changes:** ${result.changes.length}\n\n`;

      result.changes.forEach(change => {
        const icon = {
          spacing: '📏',
          color: '🎨',
          typography: '📝',
          mixed: '🔀',
        }[change.type];

        report += `${icon} **Line ${change.line}** (${change.type})\n`;
        report += `  - Before: \`${change.from}\`\n`;
        report += `  - After: \`${change.to}\`\n\n`;
      });

      report += `---\n\n`;
    });

    return report;
  }

  getResults(): MigrationResult[] {
    return this.results;
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--apply');
  const patternArg = args.find(a => !a.startsWith('--'));
  const pattern = patternArg || 'src/**/*.{ts,tsx}';

  console.log(`🔄 Design Token Migration Tool\n`);
  console.log(`📋 Mode: ${dryRun ? '🔍 DRY RUN (preview)' : '✅ APPLY (will save changes)'}`);
  console.log(`📁 Pattern: ${pattern}\n`);
  console.log(`${'='.repeat(60)}\n`);

  const migrator = new DesignTokenMigrator(dryRun);

  try {
    await migrator.migrateFiles(pattern);

    const report = migrator.generateReport();
    console.log(report);

    if (dryRun && migrator.getResults().length > 0) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`\n💡 To apply these changes, run with --apply flag:`);
      console.log(`   npm run migrate:tokens -- --apply\n`);
    } else if (!dryRun && migrator.getResults().length > 0) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`\n✅ Migration complete! Next steps:\n`);
      console.log(`   1. Review changes: git diff`);
      console.log(`   2. Verify: npm run lint`);
      console.log(`   3. Test: npm run dev && visit affected pages`);
      console.log(`   4. Commit: git add . && git commit -m "chore: migrate to design tokens"\n`);
    }
  } catch (error) {
    console.error(`\n❌ Migration failed:`);
    console.error(error);
    process.exit(1);
  }
}

main().catch(console.error);
