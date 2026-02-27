/**
 * Script to split design-tokens.ts into modular files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFile = path.join(__dirname, '../src/lib/design-tokens.ts');
const targetDir = path.join(__dirname, '../src/lib/design-tokens');

const content = fs.readFileSync(sourceFile, 'utf8');
const lines = content.split('\n');

// Module definitions with line ranges
const modules = {
  'layout.ts': {
    description: 'Layout & container tokens',
    ranges: [
      [123, 291], // CONTAINER_WIDTHS to ACTIVITY_IMAGE
      [2273, 2558], // PAGE_LAYOUT to COMPONENT_PATTERNS end
    ],
    imports: [],
  },
  'typography.ts': {
    description: 'Typography & text tokens',
    ranges: [
      [83, 122], // FLUID TYPOGRAPHY UTILITIES
      [324, 730], // TYPOGRAPHY to CONTENT_HIERARCHY/PROGRESSIVE_TEXT/FONT_CONTRAST
      [2420, 2474], // WORD_SPACING
    ],
    imports: [],
  },
  'spacing.ts': {
    description: 'Spacing scale & patterns',
    ranges: [
      [730, 980], // SPACING to SPACING_SCALE end
    ],
    imports: [],
  },
  'colors.ts': {
    description: 'Color tokens & gradients',
    ranges: [
      [980, 1502], // SEMANTIC_COLORS to SERIES_COLORS end
      [2589, 2748], // GRADIENTS
    ],
    imports: [],
  },
  'effects.ts': {
    description: 'Visual effects & animations',
    ranges: [
      [1502, 2021], // HOVER_EFFECTS to BORDERS/SHADOWS end
      [2370, 2420], // SCROLL_BEHAVIOR
    ],
    imports: ['ANIMATION_CONSTANTS'],
  },
  'interaction.ts': {
    description: 'Interactive components & breakpoints',
    ranges: [
      [2021, 2272], // BREAKPOINTS to SCROLL_OFFSET
    ],
    imports: [],
  },
  'app.ts': {
    description: 'Application-specific tokens',
    ranges: [
      [2748, 3050], // IMAGE_PLACEHOLDER to end (VIEW_MODES)
    ],
    imports: [],
  },
  'types.ts': {
    description: 'TypeScript type exports',
    ranges: [
      [2558, 2588], // All type exports
    ],
    imports: [
      'CONTAINER_WIDTHS',
      'TYPOGRAPHY',
      'HOVER_EFFECTS',
      'ANIMATION_CONSTANTS',
      'WORD_SPACING',
      'SEMANTIC_COLORS',
      'GRID_PATTERNS',
    ],
  },
};

// Extract lines for each module
for (const [filename, config] of Object.entries(modules)) {
  console.log(`Creating ${filename}...`);

  let moduleContent = `/**\n * Design Tokens: ${config.description}\n * \n * @module design-tokens/${filename.replace('.ts', '')}\n */\n\n`;

  // Add imports if needed
  if (config.imports.length > 0) {
    const imports = config.imports.map((imp) => `  ${imp},`).join('\n');
    moduleContent += `import {\n${imports}\n} from './index';\n\n`;
  }

  // Extract content from ranges
  for (const [start, end] of config.ranges) {
    const rangeLines = lines.slice(start, end + 1);
    moduleContent += rangeLines.join('\n') + '\n\n';
  }

  // Write module file
  const targetPath = path.join(targetDir, filename);
  fs.writeFileSync(targetPath, moduleContent.trim() + '\n');
  console.log(
    `✓ Created ${filename} (${config.ranges.reduce((total, [s, e]) => total + (e - s + 1), 0)} lines)`
  );
}

// Create barrel index.ts
console.log('Creating index.ts barrel export...');
const indexContent = `/**
 * Design Tokens - Central Export
 *
 * All design tokens are re-exported from their respective modules.
 * This preserves the original import patterns: \`import { TOKEN } from '@/lib/design-tokens'\`
 */

// Layout & Container Tokens
export * from './layout';

// Typography Tokens
export * from './typography';

// Spacing Tokens
export * from './spacing';

// Color Tokens
export * from './colors';

// Effect Tokens
export * from './effects';

// Interaction Tokens
export * from './interaction';

// Application Tokens
export * from './app';

//TypeScript Types
export * from './types';
`;

fs.writeFileSync(path.join(targetDir, 'index.ts'), indexContent);
console.log('✓ Created index.ts barrel export');

console.log('\n✅ Design token modules created successfully!');
console.log(
  `\nNext step: Update imports from '@/lib/design-tokens' (they should continue to work via barrel export)`
);
