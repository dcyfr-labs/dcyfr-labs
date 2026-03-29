import type { Metadata } from 'next';
import Link from 'next/link';
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
import {
  Package,
  Search,
  Code,
  ArrowRight,
  ExternalLink,
  BookOpen,
  GitBranch,
  Zap,
  Shield,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const pageTitle = 'Documentation';
const pageDescription =
  'Documentation for DCYFR Labs tools and packages. Get started with @dcyfr/ai, explore the CLI, RAG library, and code generation toolkit.';

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/docs',
});

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  external?: boolean;
  links: { label: string; href: string; external?: boolean }[];
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: 'ai-framework',
    title: '@dcyfr/ai',
    description:
      'Portable TypeScript AI agent framework with plugin architecture, multi-provider LLM support, delegation v2, built-in telemetry, and quality gates.',
    icon: Zap,
    href: '/ai',
    links: [
      { label: 'Overview', href: '/ai' },
      { label: 'API Reference', href: 'https://deepwiki.com/dcyfr/dcyfr-ai', external: true },
      {
        label: 'GitHub',
        href: 'https://github.com/dcyfr/dcyfr-ai',
        external: true,
      },
      {
        label: 'npm',
        href: 'https://www.npmjs.com/package/@dcyfr/ai',
        external: true,
      },
    ],
  },
  {
    id: 'cli',
    title: '@dcyfr/ai-cli',
    description:
      'Command-line tools for AI-powered workflows. Config init, validation, and project scaffolding for teams building with @dcyfr/ai.',
    icon: Terminal,
    href: 'https://deepwiki.com/dcyfr/dcyfr-ai-cli',
    external: true,
    links: [
      { label: 'Docs', href: 'https://deepwiki.com/dcyfr/dcyfr-ai-cli', external: true },
      { label: 'npm', href: 'https://www.npmjs.com/package/@dcyfr/ai-cli', external: true },
      { label: 'GitHub', href: 'https://github.com/dcyfr/dcyfr-ai-cli', external: true },
    ],
  },
  {
    id: 'rag',
    title: '@dcyfr/ai-rag',
    description:
      'Retrieval-Augmented Generation library for semantic search and document grounding. Pluggable vector store adapters, plugs directly into the @dcyfr/ai plugin system.',
    icon: Search,
    href: 'https://deepwiki.com/dcyfr/dcyfr-ai-rag',
    external: true,
    links: [
      { label: 'Docs', href: 'https://deepwiki.com/dcyfr/dcyfr-ai-rag', external: true },
      { label: 'npm', href: 'https://www.npmjs.com/package/@dcyfr/ai-rag', external: true },
      { label: 'GitHub', href: 'https://github.com/dcyfr/dcyfr-ai-rag', external: true },
    ],
  },
  {
    id: 'code-gen',
    title: '@dcyfr/ai-code-gen',
    description:
      'Structured code generation with quality gates and Zod-validated output. Integrates with the @dcyfr/ai validation framework for guaranteed compliance.',
    icon: Code,
    href: 'https://deepwiki.com/dcyfr/dcyfr-ai-code-gen',
    external: true,
    links: [
      { label: 'Docs', href: 'https://deepwiki.com/dcyfr/dcyfr-ai-code-gen', external: true },
      { label: 'npm', href: 'https://www.npmjs.com/package/@dcyfr/ai-code-gen', external: true },
      { label: 'GitHub', href: 'https://github.com/dcyfr/dcyfr-ai-code-gen', external: true },
    ],
  },
];

const QUICK_LINKS = [
  {
    label: 'Open Source packages',
    href: '/open-source',
    description: 'All DCYFR npm packages with live stats',
    icon: Package,
  },
  {
    label: 'Blog',
    href: '/blog',
    description: 'Technical guides and deep dives',
    icon: BookOpen,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/dcyfr',
    description: 'Source code for all projects',
    icon: GitBranch,
    external: true,
  },
  {
    label: 'Security',
    href: '/security',
    description: 'Responsible disclosure and security policy',
    icon: Shield,
    external: false,
  },
];

export default async function DocsPage() {
  const nonce = (await headers()).get('x-nonce') || '';

  const breadcrumbJsonLd = createBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Documentation', url: `${SITE_URL}/docs` },
  ]);

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(breadcrumbJsonLd, nonce)} />

      <PageHero
        title="Documentation"
        description="Guides, references, and resources for DCYFR Labs tools and packages."
      />

      {/* Quick links strip */}
      <section className={cn('w-full border-y border-border/40 bg-muted/30', 'py-4')}>
        <div
          className={cn(
            CONTAINER_WIDTHS.standard,
            'mx-auto',
            CONTAINER_PADDING,
            'flex flex-wrap items-center justify-center gap-6 md:gap-12'
          )}
        >
          {QUICK_LINKS.map(({ label, href, description, icon: Icon, external }) => {
            const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
            return (
              <Link
                key={label}
                href={href}
                {...linkProps}
                className="group flex flex-col items-center gap-1 text-center"
              >
                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  {label}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:block">{description}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Package docs */}
      <Section id="packages">
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
            <div className={cn(SPACING.subsection)}>
              <div>
                <h2 className={cn(TYPOGRAPHY.h2.standard)}>Packages</h2>
                <p className={cn(TYPOGRAPHY.description, 'mt-2 text-muted-foreground')}>
                  All DCYFR Labs packages are published to npm under the{' '}
                  <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">@dcyfr</code>{' '}
                  scope and available on GitHub.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {DOC_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const titleLinkProps = section.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {};
                  return (
                    <div
                      key={section.id}
                      className="flex flex-col gap-4 rounded-lg border border-border/60 bg-card p-6 hover:border-border transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-md bg-primary/10 p-2 shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={section.href}
                            {...titleLinkProps}
                            className="group flex items-center gap-1.5"
                          >
                            <h3
                              className={cn(
                                TYPOGRAPHY.h3.standard,
                                'font-mono group-hover:text-primary transition-colors'
                              )}
                            >
                              {section.title}
                            </h3>
                            {section.external && (
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            )}
                          </Link>
                          <p className={cn(TYPOGRAPHY.body, 'mt-1 text-muted-foreground')}>
                            {section.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-border/40">
                        {section.links.map((link) => {
                          const props = link.external
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {};
                          return (
                            <Link
                              key={link.label}
                              href={link.href}
                              {...props}
                              className={cn(
                                'text-sm',
                                'flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors'
                              )}
                            >
                              {link.label}
                              {link.external ? (
                                <ExternalLink className="w-3 h-3" />
                              ) : (
                                <ArrowRight className="w-3 h-3" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick start */}
            <div className={cn(SPACING.subsection)}>
              <div>
                <h2 className={cn(TYPOGRAPHY.h2.standard)}>Quick start</h2>
                <p className={cn(TYPOGRAPHY.description, 'mt-2 text-muted-foreground')}>
                  Install the core framework and start building in minutes.
                </p>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/40 overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-border/40 bg-muted/60">
                  <span className="w-3 h-3 rounded-full bg-red-400/60" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <span className="w-3 h-3 rounded-full bg-green-400/60" />
                  <span className="ml-2 text-xs text-muted-foreground font-mono">
                    getting-started.ts
                  </span>
                </div>
                <pre
                  data-code-block-header="true"
                  className="text-sm font-mono p-5 overflow-x-auto leading-relaxed text-foreground/90"
                >
                  <code>{`import { AgentRuntime, ValidationFramework, loadConfig } from '@dcyfr/ai';

// Zero-config setup — auto-detects .dcyfr.yaml
const config = await loadConfig();

// Connect to any provider
const runtime = new AgentRuntime({
  provider: 'openai',     // or 'anthropic', 'ollama', 'copilot'
  model: 'gpt-4o',
});

const response = await runtime.chat({
  messages: [{ role: 'user', content: 'Explain this codebase' }],
});

// Run quality gates before shipping
const validation = new ValidationFramework({ gates: config.validation.gates });
const report = await validation.validate({ projectRoot: '.', config: config.agents });
console.log(\`Quality gates: \${report.valid ? '✓ PASS' : '✗ FAIL'}\`);`}</code>
                </pre>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/ai">
                    Explore the framework
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link
                    href="https://deepwiki.com/dcyfr/dcyfr-ai"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Full API reference
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}
