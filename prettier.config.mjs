/**
 * Prettier Configuration
 * Aligns with ESLint and project code style standards
 * Used by: VS Code, pre-commit hooks, CI/CD pipelines
 */

export default {
  // Print width matches container constants for readability
  printWidth: 100,

  // Use 2 spaces for consistency with Tailwind and shadcn/ui convention
  tabWidth: 2,

  // Use spaces instead of tabs (TypeScript/Next.js standard)
  useTabs: false,

  // Add semicolons for explicit code boundaries (Next.js/TypeScript standard)
  semi: true,

  // Use single quotes for consistency with ESLint rules
  singleQuote: true,

  // Trailing commas in multiline objects/arrays (ES5 compatible, improves diffs)
  trailingComma: 'es5',

  // Spaces around object/arrow function braces for readability
  bracketSpacing: true,
  arrowParens: 'always',

  // Object properties on separate lines when needed
  bracketSameLine: false,

  // Prose wrap for Markdown - only wrap at word boundaries
  proseWrap: 'preserve',

  // HTML whitespace handling - respect source as-is
  htmlWhitespaceSensitivity: 'css',

  // End files with newline (POSIX standard)
  endOfLine: 'lf',

  // Quote properties only when necessary (modern JavaScript)
  quoteProps: 'as-needed',

  // Vue-specific settings (unused in this project)
  vueIndentScriptAndStyle: false,

  // Embedded content handling
  embeddedLanguageFormatting: 'auto',

  // Overwrites for specific file types
  overrides: [
    {
      // YAML files (GitHub Actions, Nuclei configs)
      files: '*.{yml,yaml}',
      options: {
        // YAML standard uses 2-space indentation
        tabWidth: 2,
        // Preserve quotes in YAML for compatibility
        quoteProps: 'preserve',
      },
    },
    {
      // JSON files (config, package.json)
      files: '*.json',
      options: {
        // JSON standard - no trailing commas, strict formatting
        trailingComma: 'none',
        tabWidth: 2,
      },
    },
    {
      // TypeScript files
      files: '*.{ts,tsx}',
      options: {
        // Standard TypeScript formatting
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
      },
    },
    {
      // Markdown documentation
      files: '*.md',
      options: {
        // Preserve markdown formatting exactly as written
        proseWrap: 'preserve',
        // Markdown should respect intentional spacing
        htmlWhitespaceSensitivity: 'strict',
      },
    },
    {
      // MDX blog posts and content
      files: '*.mdx',
      options: {
        // Same as Markdown but parse as JSX
        proseWrap: 'preserve',
        htmlWhitespaceSensitivity: 'strict',
      },
    },
  ],
};
