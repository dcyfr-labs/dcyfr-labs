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
          selector: "Literal[value=/transition-all.*hover:shadow-(sm|md|lg|xl|2xl)/]",
          message: "Use HOVER_EFFECTS tokens from @/lib/design-tokens instead of hardcoded hover effects. See /docs/design/QUICK_START.md",
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
    files: ["src/**/*loading.tsx", "src/**/*skeleton.tsx"],
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
