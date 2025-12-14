import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
      "next-env.d.ts",
    ],
  },
  {
    // Design System Enforcement Rules
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      // Warn about hardcoded container widths - should use getContainerClasses()
      // Excludes single max-w-* values (which are typically in cn() calls after refactoring)
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/^(?!.*\\bmax-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|prose)$).*\\bmax-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|prose)\\b/]",
          message: "Use getContainerClasses() from @/lib/design-tokens instead of hardcoded max-w-* classes for page containers. See /docs/design/QUICK_START.md",
        },
        {
          selector: "Literal[value=/^(?!.*\\b(text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)|font-(bold|semibold|medium))$).*\\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl).*font-(bold|semibold|medium)\\b/]",
          message: "Use TYPOGRAPHY tokens from @/lib/design-tokens instead of hardcoded font classes for headings. See /docs/design/QUICK_START.md",
        },
        {
          selector: "Literal[value=/^(?!.*\\[&[^\\]]*\\]).*\\b(text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl))\\s+(font-(bold|semibold|medium|normal))\\b/]",
          message: "Use TYPOGRAPHY tokens from @/lib/design-tokens instead of combining text-* and font-* classes. Examples:\n" +
                   "  ❌ \"text-3xl font-semibold\" → ✅ {TYPOGRAPHY.h1.standard}\n" +
                   "  ❌ \"text-2xl font-semibold\" → ✅ {TYPOGRAPHY.h2.standard}\n" +
                   "  ❌ \"text-sm font-medium\" → ✅ {TYPOGRAPHY.label.small}\n" +
                   "  EXCLUDES: CSS selectors like [&>strong]:font-semibold (these are valid)\n" +
                   "  See /docs/ai/design-system.md#typography-tokens",
        },
        {
          selector: "Literal[value=/\\b(duration|transition)-(75|100|150|200|300|500|700|1000)\\b/]",
          message: "Use ANIMATION.duration tokens from @/lib/design-tokens instead of hardcoded duration-* classes. Examples:\n" +
                   "  ❌ \"duration-150\" → ✅ {ANIMATION.duration.fast}\n" +
                   "  ❌ \"duration-300\" → ✅ {ANIMATION.duration.normal}\n" +
                   "  ❌ \"duration-500\" → ✅ {ANIMATION.duration.slow}\n" +
                   "  Or use transition utilities: .transition-movement, .transition-appearance, .transition-theme\n" +
                   "  See /docs/ai/design-system.md#animation-tokens",
        },
        {
          selector: "Literal[value=/transition-all.*hover:shadow-(sm|md|lg|xl|2xl)/]",
          message: "Use HOVER_EFFECTS tokens from @/lib/design-tokens instead of hardcoded hover effects. See /docs/design/QUICK_START.md",
        },
        {
          selector: "Literal[value=/\\btransition-all\\b/]",
          message: "Avoid transition-all (expensive, animates all properties). Use specific transitions from @/lib/design-tokens:\n" +
                   "  ✅ .transition-movement (transform only, 150ms - best for hover/interactive)\n" +
                   "  ✅ .transition-appearance (opacity + transform, 300ms - best for reveals)\n" +
                   "  ✅ .transition-base (opacity + transform, 300ms - default choice)\n" +
                   "  ✅ .transition-theme (colors only, 150ms - best for theme changes)\n" +
                   "  Performance impact: transition-all ~10x slower than specific transitions\n" +
                   "  See /docs/ai/design-system.md#animation-tokens",
        },
        {
          selector: "Literal[value=/(bg-green-|bg-yellow-|bg-red-|bg-blue-|bg-amber-|bg-orange-|text-green-|text-yellow-|text-red-|text-blue-|text-amber-|text-orange-)\\d{3,}/]",
          message: "Hardcoded color detected. Use SEMANTIC_COLORS tokens from @/lib/design-tokens:\n" +
                   "  - Alert states → SEMANTIC_COLORS.alert.{critical|warning|info|success}\n" +
                   "  - Status badges → SEMANTIC_COLORS.status.{success|warning|info|inProgress|neutral}\n" +
                   "  - Interactive states → SEMANTIC_COLORS.interactive.{hover|active|focus|disabled}\n" +
                   "  - Highlighting → SEMANTIC_COLORS.highlight.{primary|mark|muted}\n" +
                   "  EXCLUDES: Icon colors (text-*-500), accent colors in CTA, chart colors\n" +
                   "  See /docs/ai/design-system.md#semantic-colors",
        },
        {
          selector: "Literal[value=/\\b(space-y-[5-9]|gap-[5-9]|p-[67]|px-[67]|py-[67])\\b/]",
          message: "Prohibited spacing pattern detected. Use design tokens from @/lib/design-tokens:\n" +
                   "  - space-y-8 → SPACING.subsection\n" +
                   "  - space-y-6 → SPACING.subsection or SPACING.content\n" +
                   "  - gap-6/7/8/9 → Use gap-4 (standard)\n" +
                   "  - p-6/7, px-6/7, py-6/7 → Use p-4/p-8, px-4/px-8, py-4/py-8\n" +
                   "  See /docs/design/QUICK_START.md",
        },
        {
          selector: "TemplateLiteral[expressions.0.object.name='SPACING'][expressions.0.property]:not([quasis.0.value.cooked='']) > .expressions > .property",
          message: "Invalid SPACING token usage. SPACING tokens must be used directly (e.g., className={SPACING.section}), not in template literals (e.g., className={\`space-y-\${SPACING.compact}\`}). Common mistakes:\n" +
                   "  ❌ \`gap-\${SPACING.compact}\` (SPACING has no 'compact' property)\n" +
                   "  ❌ \`space-y-\${SPACING.tight}\` (SPACING has no 'tight' property)\n" +
                   "  ✅ Use SPACING tokens directly: className={SPACING.section}\n" +
                   "  ✅ Use numbers for gap/padding: className=\"flex gap-4\"\n" +
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
    files: ["src/**/*loading.tsx", "src/**/*skeleton.tsx", "src/**/*Skeleton.tsx"],
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
];

export default eslintConfig;
