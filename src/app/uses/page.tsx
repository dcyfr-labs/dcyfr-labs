/**
 * /uses — Developer setup and tooling
 *
 * Gated behind USES_ENABLED=true until content is confirmed.
 * Enable by setting USES_ENABLED=true in your environment.
 */
import type { Metadata } from 'next';
import { createPageMetadata, getJsonLdScriptProps, createBreadcrumbSchema } from '@/lib/metadata';
import { cn } from '@/lib/utils';
import { PageLayout, PageHero } from '@/components/layouts';
import { Section } from '@/components/common';
import {
  TYPOGRAPHY,
  SPACING,
  CONTAINER_WIDTHS,
  CONTAINER_PADDING,
  CONTAINER_VERTICAL_PADDING,
} from '@/lib/design-tokens';
import { headers } from 'next/headers';
import { SITE_URL } from '@/lib/site-config';
import { assertFeatureOr404 } from '@/lib/admin-guard';

const pageTitle = 'Uses';
const pageDescription =
  'The hardware, software, and services that power my development workflow. Everything I use daily to build DCYFR Labs.';

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/uses',
});

interface UseItem {
  name: string;
  description: string;
  href?: string;
}

interface UseCategory {
  id: string;
  title: string;
  items: UseItem[];
}

const USE_CATEGORIES: UseCategory[] = [
  {
    id: 'hardware',
    title: 'Hardware',
    items: [
      {
        name: 'Workbench — Ubuntu 24.04',
        description:
          'Primary development machine running Ubuntu 24.04 LTS. Used for all heavy AI workloads, builds, and long-running automation.',
      },
      {
        name: 'MacBook — macOS',
        description:
          'Laptop for mobile development, design work, and fallback sessions when away from the workbench.',
      },
    ],
  },
  {
    id: 'editor',
    title: 'Editor & terminal',
    items: [
      {
        name: 'VS Code',
        description:
          'Primary editor with the Claude Code extension. Full IntelliSense, integrated debugging, and deep GitHub Copilot integration.',
        href: 'https://code.visualstudio.com',
      },
      {
        name: 'Claude Code',
        description:
          'AI-native CLI and VS Code extension by Anthropic. Primary AI pair-programming tool — handles architecture, refactoring, and autonomous multi-step tasks.',
        href: 'https://claude.ai/claude-code',
      },
      {
        name: 'GitHub Copilot',
        description:
          'Inline code completions and chat for rapid editing. Complements Claude Code for quick, in-editor suggestions.',
        href: 'https://github.com/features/copilot',
      },
      {
        name: 'OpenCode.ai',
        description:
          'Multi-provider AI coding tool (75+ providers). Used as fallback when Claude rate limits hit, and for cost-optimized long sessions via Groq or local Ollama models.',
        href: 'https://opencode.ai',
      },
    ],
  },
  {
    id: 'stack',
    title: 'Core stack',
    items: [
      {
        name: 'Next.js + React',
        description:
          'Full-stack React framework. App Router, server components, and ISR power all DCYFR Labs production surfaces.',
        href: 'https://nextjs.org',
      },
      {
        name: 'TypeScript',
        description:
          'Strict TypeScript across every package. Non-negotiable for any production code.',
        href: 'https://www.typescriptlang.org',
      },
      {
        name: 'Tailwind CSS v4',
        description:
          'Utility-first CSS with design token enforcement. All spacing, typography, and color values flow through a central token system.',
        href: 'https://tailwindcss.com',
      },
      {
        name: 'shadcn/ui',
        description: 'Accessible, composable component library built on Radix UI primitives.',
        href: 'https://ui.shadcn.com',
      },
      {
        name: 'MDX',
        description:
          'Markdown + JSX for all blog and long-form content. Supports interactive components inline with prose.',
        href: 'https://mdxjs.com',
      },
    ],
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure & services',
    items: [
      {
        name: 'Vercel',
        description:
          'Deployment and edge hosting for DCYFR Labs. Preview deployments on every PR, automatic ISR revalidation.',
        href: 'https://vercel.com',
      },
      {
        name: 'Upstash Redis',
        description:
          'Serverless Redis for rate limiting, analytics, and caching. Separate instances for production and preview environments.',
        href: 'https://upstash.com',
      },
      {
        name: 'Axiom',
        description:
          'Log analytics and structured event ingestion. Powers the real-time activity feed and usage dashboards.',
        href: 'https://axiom.co',
      },
      {
        name: 'Sentry',
        description: 'Error monitoring, tracing, and performance insights across all surfaces.',
        href: 'https://sentry.io',
      },
      {
        name: 'Inngest',
        description:
          "Durable background jobs and event-driven workflows. Handles async tasks that can't block a request.",
        href: 'https://inngest.com',
      },
    ],
  },
  {
    id: 'ai-services',
    title: 'AI & models',
    items: [
      {
        name: 'Anthropic (Claude)',
        description:
          'Primary LLM provider. Claude Sonnet and Opus power the @dcyfr/ai framework and all autonomous agent workflows.',
        href: 'https://anthropic.com',
      },
      {
        name: 'OpenAI',
        description:
          'Secondary provider used via @dcyfr/ai multi-provider support for embeddings and specific generation tasks.',
        href: 'https://openai.com',
      },
      {
        name: 'Ollama',
        description:
          'Local model serving for offline development and cost-optimized batch tasks. Runs on the Ubuntu workbench.',
        href: 'https://ollama.com',
      },
    ],
  },
  {
    id: 'dev-tools',
    title: 'Dev tools',
    items: [
      {
        name: 'Vitest',
        description:
          'Fast unit and integration testing powered by Vite. 3,000+ tests across the workspace with near-instant feedback.',
        href: 'https://vitest.dev',
      },
      {
        name: 'Playwright',
        description: 'End-to-end browser testing. 24 E2E specs covering all critical user paths.',
        href: 'https://playwright.dev',
      },
      {
        name: 'ESLint + Prettier',
        description:
          'Automated lint and format enforcement on every commit via pre-commit hooks and CI.',
      },
      {
        name: 'GitHub Actions',
        description:
          'CI/CD pipeline: tests, TypeScript checks, Lighthouse CI, CodeQL security scanning, and Dependabot auto-merge.',
        href: 'https://github.com/features/actions',
      },
    ],
  },
];

export default async function UsesPage() {
  assertFeatureOr404('USES_ENABLED');

  const nonce = (await headers()).get('x-nonce') || '';

  const breadcrumbJsonLd = createBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Uses', url: `${SITE_URL}/uses` },
  ]);

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(breadcrumbJsonLd, nonce)} />

      <PageHero
        title="Uses"
        description="The hardware, software, and services that power my development workflow."
      />

      <Section id="uses">
        <div
          className={cn(
            'w-full',
            CONTAINER_WIDTHS.standard,
            'mx-auto',
            CONTAINER_PADDING,
            CONTAINER_VERTICAL_PADDING
          )}
        >
          <div className={cn(SPACING.section)}>
            {USE_CATEGORIES.map((category) => (
              <div key={category.id} className={cn(SPACING.subsection)}>
                <h2 className={cn(TYPOGRAPHY.h2.standard)}>{category.title}</h2>

                <div className="flex flex-col gap-4">
                  {category.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6 py-4 border-b border-border/40 last:border-0"
                    >
                      <div className="sm:w-48 shrink-0">
                        {item.href ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              TYPOGRAPHY.body,
                              'font-medium hover:text-primary transition-colors'
                            )}
                          >
                            {item.name}
                          </a>
                        ) : (
                          <span className={cn(TYPOGRAPHY.body, 'font-medium')}>{item.name}</span>
                        )}
                      </div>
                      <p className={cn(TYPOGRAPHY.body, 'text-muted-foreground')}>
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}
