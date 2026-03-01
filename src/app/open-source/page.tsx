import type { Metadata } from 'next';
import Link from 'next/link';
import { createPageMetadata, getJsonLdScriptProps, createBreadcrumbSchema } from '@/lib/metadata';
import { cn } from '@/lib/utils';
import { PageLayout, PageHero } from '@/components/layouts';
import { Section, SmoothScrollToHash } from '@/components/common';
import {
  TYPOGRAPHY,
  SPACING,
  CONTAINER_WIDTHS,
  CONTAINER_PADDING,
  CONTAINER_VERTICAL_PADDING,
} from '@/lib/design-tokens';
import { headers } from 'next/headers';
import { SITE_URL } from '@/lib/site-config';
import { ExternalLink, Package, Star, GitFork, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pageTitle = 'Open Source';
const pageDescription =
  'DCYFR Labs open source packages on npm. Build with our AI agent framework, CLI tools, RAG library, and code generation toolkit.';

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/open-source',
});

type PackageTier = 'core' | 'tooling' | 'specialty';

interface OpenSourcePackage {
  name: string;
  description: string;
  tagline: string;
  version: string;
  tier: PackageTier;
  tags: string[];
  npmHref: string;
  githubHref: string;
  docsHref?: string;
  highlight?: string;
  status: 'stable' | 'beta' | 'active';
}

const PACKAGES: OpenSourcePackage[] = [
  {
    name: '@dcyfr/ai',
    tagline: 'Core AI agent framework',
    description:
      'Portable AI agent framework with plugin architecture, multi-provider support (OpenAI, Anthropic, Ollama, Copilot), built-in telemetry, quality gates, and a security-hardened delegation system.',
    version: 'v2.1.x',
    tier: 'core',
    status: 'stable',
    tags: ['agents', 'plugins', 'telemetry', 'delegation', 'multi-provider'],
    npmHref: 'https://www.npmjs.com/package/@dcyfr/ai',
    githubHref: 'https://github.com/dcyfr/dcyfr-ai',
    docsHref: 'https://deepwiki.com/dcyfr/dcyfr-ai',
    highlight: '~200KB gzipped · TypeScript strict · 1,000+ tests',
  },
  {
    name: '@dcyfr/ai-cli',
    tagline: 'CLI toolkit for AI workflows',
    description:
      'Command-line tools for AI-powered workflows. Config init, validation, and project scaffolding for teams building with @dcyfr/ai.',
    version: 'v1.0.x',
    tier: 'tooling',
    status: 'stable',
    tags: ['cli', 'config', 'scaffolding', 'devtools'],
    npmHref: 'https://www.npmjs.com/package/@dcyfr/ai-cli',
    githubHref: 'https://github.com/dcyfr/dcyfr-ai-cli',
    highlight: 'npx @dcyfr/ai config:init',
  },
  {
    name: '@dcyfr/ai-rag',
    description:
      'Retrieval-Augmented Generation library for semantic search and document grounding. Plugs directly into the @dcyfr/ai plugin system.',
    tagline: 'RAG for semantic search',
    version: 'v1.0.x',
    tier: 'specialty',
    status: 'stable',
    tags: ['rag', 'semantic-search', 'embeddings', 'retrieval'],
    npmHref: 'https://www.npmjs.com/package/@dcyfr/ai-rag',
    githubHref: 'https://github.com/dcyfr/dcyfr-ai-rag',
    highlight: 'Pluggable vector store adapters',
  },
  {
    name: '@dcyfr/ai-code-gen',
    description:
      'Structured code generation with quality gates and output validation. Integrates with the @dcyfr/ai validation framework for guaranteed compliance.',
    tagline: 'Code generation with quality gates',
    version: 'v1.0.x',
    tier: 'specialty',
    status: 'stable',
    tags: ['code-gen', 'validation', 'quality-gates', 'structured-output'],
    npmHref: 'https://www.npmjs.com/package/@dcyfr/ai-code-gen',
    githubHref: 'https://github.com/dcyfr/dcyfr-ai-code-gen',
    highlight: 'Zod-validated structured output',
  },
];

const TIER_LABELS: Record<PackageTier, string> = {
  core: 'Core',
  tooling: 'Tooling',
  specialty: 'Specialty',
};

const TIER_STYLES: Record<PackageTier, string> = {
  core: 'bg-primary/10 text-primary',
  tooling: 'bg-violet-500/10 text-violet-500',
  specialty: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

const STATUS_STYLES: Record<string, string> = {
  stable: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  beta: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  active: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
};

export default async function OpenSourcePage() {
  const nonce = (await headers()).get('x-nonce') || '';

  const breadcrumbJsonLd = createBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Open Source', url: `${SITE_URL}/open-source` },
  ]);

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(breadcrumbJsonLd, nonce)} />
      <SmoothScrollToHash />

      <PageHero
        title="Open Source"
        description="All DCYFR Labs packages published to npm. Build AI-powered products on our framework or use individual packages for targeted needs."
      />

      {/* Stats strip */}
      <section className={cn('w-full border-y border-border/40 bg-muted/30', 'py-4')}>
        <div
          className={cn(
            CONTAINER_WIDTHS.standard,
            'mx-auto',
            CONTAINER_PADDING,
            'flex flex-wrap items-center justify-center gap-8 md:gap-14'
          )}
        >
          {[
            { label: 'Published packages', value: '4' },
            { label: 'Core framework', value: '@dcyfr/ai' },
            { label: 'Bundle size', value: '~200KB' },
            { label: 'License', value: 'MIT' },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 text-center">
              <span className={cn(TYPOGRAPHY.display.stat)}>{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Package list */}
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
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.name}
                  className="group rounded-xl border border-border/50 bg-card/60 hover:border-border transition-colors overflow-hidden"
                >
                  <div className="p-5 md:p-6 flex flex-col gap-4">
                    {/* Header row */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-semibold text-base text-foreground">
                            {pkg.name}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {pkg.version}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">{pkg.tagline}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            'text-xs font-medium px-2.5 py-1 rounded-full',
                            TIER_STYLES[pkg.tier]
                          )}
                        >
                          {TIER_LABELS[pkg.tier]}
                        </span>
                        <span
                          className={cn(
                            'text-xs font-medium px-2.5 py-1 rounded-full capitalize',
                            STATUS_STYLES[pkg.status]
                          )}
                        >
                          {pkg.status}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                      {pkg.description}
                    </p>

                    {/* Highlight */}
                    {pkg.highlight && (
                      <div className="inline-flex items-center gap-2 bg-muted/60 rounded-md px-3 py-1.5 self-start">
                        <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-mono text-xs text-foreground/80">
                          {pkg.highlight}
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-muted/80 text-muted-foreground px-2 py-0.5 rounded border border-border/40"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-3 pt-1 border-t border-border/30">
                      <Link
                        href={pkg.npmHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        npm
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </Link>
                      <Link
                        href={pkg.githubHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <GitFork className="h-3.5 w-3.5" />
                        GitHub
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </Link>
                      {pkg.docsHref && (
                        <Link
                          href={pkg.docsHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Star className="h-3.5 w-3.5" />
                          Docs
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Deep dive CTA */}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
              <div className="flex flex-col gap-1">
                <h3 className={cn(TYPOGRAPHY.h3.standard)}>Want the full framework overview?</h3>
                <p className="text-sm text-muted-foreground">
                  See feature comparisons, quick start code, and the delegation framework.
                </p>
              </div>
              <Button asChild size="sm" className="shrink-0">
                <Link href="/ai">
                  Explore @dcyfr/ai
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Contributing */}
      <Section id="contributing">
        <div
          className={cn(
            'w-full',
            CONTAINER_WIDTHS.standard,
            'mx-auto',
            CONTAINER_PADDING,
            'pb-14 md:pb-20'
          )}
        >
          <div className="rounded-xl border border-border/50 bg-card/60 p-6 md:p-8 flex flex-col gap-4 text-center items-center">
            <GitFork className="h-7 w-7 text-muted-foreground" />
            <h2 className={cn(TYPOGRAPHY.h2.standard)}>Contributing</h2>
            <p className={cn(TYPOGRAPHY.description, 'max-w-md')}>
              All packages are MIT-licensed and open to contributions. Read the contributing guide
              and open an issue or PR on GitHub.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link
                href="https://github.com/dcyfr/dcyfr-ai/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read contributing guide
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}
