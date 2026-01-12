// Import Next.js ESLint configs directly
import nextPlugin from "eslint-config-next";

const eslintConfig = [
  // Apply Next.js recommended rules
  ...nextPlugin,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "next-env.d.ts",
      "src/content/**/*.mdx",
      "src/content/**/*.md",
    ],
  },
  {
    // Design System Enforcement Rules
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      // ERROR on hardcoded design patterns - must use design tokens
      // Excludes single max-w-* values (which are typically in cn() calls after refactoring)
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/^(?!.*\\bmax-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|prose)$).*\\bmax-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|prose)\\b/]",
          message:
            "Use getContainerClasses() from @/lib/design-tokens instead of hardcoded max-w-* classes for page containers. See /docs/design/QUICK_START.md",
        },
        {
          selector:
            "Literal[value=/^(?!.*\\b(text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)|font-(bold|semibold|medium))$).*\\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl).*font-(bold|semibold|medium)\\b/]",
          message:
            "Use TYPOGRAPHY tokens from @/lib/design-tokens instead of hardcoded font classes for headings. See /docs/design/QUICK_START.md",
        },
        {
          selector:
            "Literal[value=/^(?!.*\\[&[^\\]]*\\]).*\\b(text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl))\\s+(font-(bold|semibold|medium|normal))\\b/]",
          message:
            "Use TYPOGRAPHY tokens from @/lib/design-tokens instead of combining text-* and font-* classes. Examples:\n" +
            '  ❌ "text-3xl font-semibold" → ✅ {TYPOGRAPHY.h1.standard}\n' +
            '  ❌ "text-2xl font-semibold" → ✅ {TYPOGRAPHY.h2.standard}\n' +
            '  ❌ "text-sm font-medium" → ✅ {TYPOGRAPHY.label.small}\n' +
            "  EXCLUDES: CSS selectors like [&>strong]:font-semibold (these are valid)\n" +
            "  See /docs/ai/design-system.md#typography-tokens",
        },
        {
          selector:
            "Literal[value=/\\b(duration|transition)-(75|100|150|200|300|500|700|1000)\\b/]",
          message:
            "Use ANIMATION.duration tokens from @/lib/design-tokens instead of hardcoded duration-* classes. Examples:\n" +
            '  ❌ "duration-150" → ✅ {ANIMATION.duration.fast}\n' +
            '  ❌ "duration-300" → ✅ {ANIMATION.duration.normal}\n' +
            '  ❌ "duration-500" → ✅ {ANIMATION.duration.slow}\n' +
            "  Or use transition utilities: .transition-movement, .transition-appearance, .transition-theme\n" +
            "  See /docs/ai/design-system.md#animation-tokens",
        },
        {
          selector:
            "Literal[value=/transition-all.*hover:shadow-(sm|md|lg|xl|2xl)/]",
          message:
            "Use HOVER_EFFECTS tokens from @/lib/design-tokens instead of hardcoded hover effects. See /docs/design/QUICK_START.md",
        },
        {
          selector: "Literal[value=/\\btransition-all\\b/]",
          message:
            "Avoid transition-all (expensive, animates all properties). Use specific transitions from @/lib/design-tokens:\n" +
            "  ✅ .transition-movement (transform only, 150ms - best for hover/interactive)\n" +
            "  ✅ .transition-appearance (opacity + transform, 300ms - best for reveals)\n" +
            "  ✅ .transition-base (opacity + transform, 300ms - default choice)\n" +
            "  ✅ .transition-theme (colors only, 150ms - best for theme changes)\n" +
            "  Performance impact: transition-all ~10x slower than specific transitions\n" +
            "  See /docs/ai/design-system.md#animation-tokens",
        },
        // COMPREHENSIVE COLOR ENFORCEMENT: Catch ALL hardcoded Tailwind colors
        {
          selector:
            "Literal[value=/(bg-slate-|bg-gray-|bg-zinc-|bg-neutral-|bg-stone-|bg-red-|bg-orange-|bg-amber-|bg-yellow-|bg-lime-|bg-green-|bg-emerald-|bg-teal-|bg-cyan-|bg-sky-|bg-blue-|bg-indigo-|bg-violet-|bg-purple-|bg-fuchsia-|bg-pink-|bg-rose-|text-slate-|text-gray-|text-zinc-|text-neutral-|text-stone-|text-red-|text-orange-|text-amber-|text-yellow-|text-lime-|text-green-|text-emerald-|text-teal-|text-cyan-|text-sky-|text-blue-|text-indigo-|text-violet-|text-purple-|text-fuchsia-|text-pink-|text-rose-|border-slate-|border-gray-|border-zinc-|border-neutral-|border-stone-|border-red-|border-orange-|border-amber-|border-yellow-|border-lime-|border-green-|border-emerald-|border-teal-|border-cyan-|border-sky-|border-blue-|border-indigo-|border-violet-|border-purple-|border-fuchsia-|border-pink-|border-rose-)(50|100|200|300|400|500|600|700|800|900|950)/]",
          message:
            "❌ HARDCODED COLOR DETECTED. Use semantic design tokens instead:\n" +
            "\n" +
            "ALERT STATES (success/error/warning/info):\n" +
            "  - green-500/600 → text-success, text-success-light\n" +
            "  - red-500/600 → text-error, bg-error-subtle, border-error-light\n" +
            "  - amber-500/600, yellow-600 → text-warning, text-warning-light\n" +
            "  - blue-500/600 → text-info, text-info-dark\n" +
            "\n" +
            "NEUTRALS (typography/backgrounds/borders):\n" +
            "  - zinc-900/800/700 → text-foreground\n" +
            "  - zinc-600/500/400 → text-muted-foreground\n" +
            "  - zinc-300/200 → text-muted\n" +
            "  - zinc-700/50, gray-200, slate-800 → bg-muted, bg-card\n" +
            "  - zinc-300/200, gray-300 → border-border\n" +
            "\n" +
            "ACCENT COLORS (semantic visualization):\n" +
            "  - cyan-500 → text-semantic-cyan\n" +
            "  - purple-500 → text-semantic-purple\n" +
            "  - orange-500 → text-semantic-orange\n" +
            "\n" +
            "EXEMPTIONS (use eslint-disable-next-line with justification):\n" +
            "  ✅ Icon colors for semantic meaning (with comment)\n" +
            "  ✅ Chart/visualization colors (use SEMANTIC_COLORS.chart)\n" +
            "  ✅ External embed styling (data-embed attribute)\n" +
            "  ✅ Brand colors in hero CTAs (primary actions only)\n" +
            "\n" +
            "See: /docs/design/color-token-migration-plan.md\n" +
            "Tokens: /src/lib/design-tokens.ts → SEMANTIC_COLORS\n" +
            "CSS vars: /src/app/globals.css → --success, --error, --warning, etc.",
        },
        {
          selector:
            "Literal[value=/\\b(space-y-[5-9]|gap-[5-9]|p-[67]|px-[67]|py-[67])\\b/]",
          message:
            "Prohibited spacing pattern detected. Use design tokens from @/lib/design-tokens:\n" +
            "  - space-y-8 → SPACING.subsection\n" +
            "  - space-y-6 → SPACING.subsection or SPACING.content\n" +
            "  - gap-6/7/8/9 → Use gap-4 (standard)\n" +
            "  - p-6/7, px-6/7, py-6/7 → Use p-4/p-8, px-4/px-8, py-4/py-8\n" +
            "  See /docs/design/QUICK_START.md",
        },
        {
          selector:
            "TemplateLiteral[expressions.0.object.name='SPACING'][expressions.0.property]:not([quasis.0.value.cooked='']) > .expressions > .property",
          message:
            "Invalid SPACING token usage. SPACING tokens must be used directly (e.g., className={SPACING.section}), not in template literals (e.g., className={\`space-y-\${SPACING.compact}\`}). Common mistakes:\n" +
            "  ❌ \`gap-\${SPACING.compact}\` (SPACING has no 'compact' property)\n" +
            "  ❌ \`space-y-\${SPACING.tight}\` (SPACING has no 'tight' property)\n" +
            "  ✅ Use SPACING tokens directly: className={SPACING.section}\n" +
            '  ✅ Use numbers for gap/padding: className="flex gap-4"\n' +
            "  See /docs/ai/enforcement-rules.md#design-token-enforcement",
        },
      ],
    },
  },
  {
    // Exclude shadcn/ui components - they use their own design system
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  {
    // Exclude design token definitions - they define the patterns
    files: ["src/lib/design-tokens.ts"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  {
    // Exclude loading skeletons - they mirror component structure
    files: [
      "src/**/*loading.tsx",
      "src/**/*skeleton.tsx",
      "src/**/*Skeleton.tsx",
    ],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  {
    // Exclude coverage reports - auto-generated
    files: ["coverage/**/*.js"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  {
    // Barrel Export Enforcement
    // Prevents direct imports from component/lib directories
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    // Test Data Prevention Detection
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "ObjectExpression[properties.0.key.name='stars'][properties.0.value.value=/^(0|1|5|10|15|100)$/]",
          message:
            "⚠️  Suspicious hardcoded analytics value detected. This might be test/demo data. Ensure real data is used in production. See TEST_DATA_PREVENTION.md",
        },
        {
          selector:
            "ObjectExpression[properties.0.key.name='forks'][properties.0.value.value=0]",
          message:
            "⚠️  Suspicious zero value for 'forks'. This may be test data. Verify with real GitHub data. See TEST_DATA_PREVENTION.md",
        },
      ],
    },
  },
  {
    // Barrel Export Enforcement
    // RULE: Must import from barrel exports (@/components/*, @/lib/*)
    // This prevents deep imports that bypass re-exports
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/components/*/index",
                "@/components/*/index.ts",
                "@/components/*/index.tsx",
              ],
              message:
                "❌ WRONG: Don't import from explicit index files. Use barrel export shorthand.\n\n❌ import Component from '@/components/layouts/index';\n✅ import { PageLayout } from '@/components/layouts';\n\nWhy: Barrel exports (index.ts/tsx) handle re-exports. Import from the directory only.\nSee: docs/ai/component-patterns.md#barrel-exports",
            },
            {
              group: [
                "@/components/*/*",
                "!@/components/ui/*",
                "!@/components/*/client",
                "!@/components/*/server",
                "!@/components/*/layouts",
                "!@/components/common/filters",
                "!@/components/layouts/archive-hero",
              ],
              message:
                "❌ WRONG: Don't import from component subdirectories directly. Use barrel exports.\n\n❌ import PostCard from '@/components/blog/post-card';\n✅ import { PostCard } from '@/components/blog';\n\nWhy: Barrel exports maintain encapsulation and allow refactoring without breaking imports.\nSee: docs/ai/component-patterns.md#barrel-exports\n\nEXCEPTIONS:\n  - */client (client-only barrel exports) - allowed in client components\n  - */server (server-only barrel exports) - allowed in server components\n  - */layouts (layout-specific exports) - allowed for complex layouts\n  - common/filters (has own barrel export) - allowed for filter components\n  - layouts/archive-hero (specialized layout) - allowed for archive pages",
            },
            {
              group: ["@/lib/*/index", "@/lib/*/index.ts", "@/lib/*/index.tsx"],
              message:
                "❌ WRONG: Don't import from explicit index files. Use barrel export shorthand.\n\n❌ import { getMetadata } from '@/lib/metadata/index';\n✅ import { getMetadata } from '@/lib/metadata';\n\nWhy: Barrel exports (index.ts) handle re-exports. Import from the directory only.\nSee: docs/ai/component-patterns.md#barrel-exports",
            },
            {
              // Exclude server-only files from barrel enforcement
              group: [
                "@/lib/*/*",
                "!@/lib/*/server",
                "!@/lib/activity/helpers.server",
                "!@/lib/activity/heatmap-export",
                "!@/lib/*/search-config",
              ],
              message:
                "❌ WRONG: Don't import from lib subdirectories directly. Use barrel exports.\n\n❌ import { createPageMetadata } from '@/lib/metadata/create';\n✅ import { createPageMetadata } from '@/lib/metadata';\n\nWhy: Barrel exports maintain encapsulation and allow refactoring without breaking imports.\nSee: docs/ai/component-patterns.md#barrel-exports\n\nEXCEPTIONS:\n  - *.server.ts files (server-only code isolation) - allowed in server components only\n  - *-export.ts files (specialized utilities) - needed for specific features\n  - search-config.ts files (search configuration) - allowed for search implementations",
            },
          ],
        },
      ],
    },
  },
  {
    // PageLayout 90% Enforcement Rule
    // RULE: 90% of page components should use PageLayout wrapper
    // This ensures consistent layout, navigation, and metadata across pages
    files: ["src/app/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "JSXElement[openingElement.name.name!='PageLayout'][openingElement.name.object.name!='PageLayout']:not([parent.openingElement.name.name='PageLayout']) > JSXElement[openingElement.name.name='main'], JSXElement[openingElement.name.name!='PageLayout'][openingElement.name.object.name!='PageLayout']:not([parent.openingElement.name.name='PageLayout']) > JSXElement[openingElement.name.name='section']",
          message:
            "⚠️  PageLayout Enforcement Rule: 90% of pages should use PageLayout wrapper.\n\n❌ WRONG:\nexport default function Page() {\n  return (\n    <main>\n      <h1>Title</h1>\n    </main>\n  );\n}\n\n✅ RIGHT:\nexport default function Page() {\n  return (\n    <PageLayout title=\"Page Title\">\n      <h1>Title</h1>\n    </PageLayout>\n  );\n}\n\nWhy: PageLayout provides:\n  - Consistent page structure and spacing\n  - Integrated navigation and header\n  - Automatic metadata management\n  - Semantic <main> and <section> elements\n  - Mobile responsiveness\n  - Proper SEO optimization\n\nWhen to NOT use PageLayout (document exceptions):\n  - Custom layout pages (with eslint-disable comment)\n  - Admin/internal pages\n  - Specialized landing pages\n  - API routes and redirects\n\nSee: docs/ai/component-patterns.md#pagelayout-90-percent-rule\nGuidance: .github/agents/patterns/COMPONENT_PATTERNS.md#pagelayout-selection",
        },
      ],
    },
  },
];

export default eslintConfig;
