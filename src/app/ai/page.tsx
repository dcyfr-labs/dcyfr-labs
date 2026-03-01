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
import {
  Package,
  Plug,
  Zap,
  Shield,
  BarChart3,
  Terminal,
  ArrowRight,
  ExternalLink,
  GitFork,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const pageTitle = '@dcyfr/ai — AI Agent Framework';
const pageDescription =
  'Portable AI agent framework with plugin architecture for multi-provider integration, telemetry tracking, and quality validation. ~200KB gzipped, TypeScript-strict, zero config.';

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/ai',
});

const FEATURES = [
  {
    icon: Plug,
    title: 'Plugin Architecture',
    description:
      'Extensible validation system with custom agents and a secured marketplace. Rate plugins, audit scores, TLP classification.',
  },
  {
    icon: Zap,
    title: 'Multi-Provider Support',
    description:
      'OpenAI, Anthropic, Ollama, Msty Vibe CLI Proxy, and GitHub Copilot — unified API, zero vendor lock-in.',
  },
  {
    icon: BarChart3,
    title: 'Built-in Telemetry',
    description:
      'Track usage, costs, quality metrics, and performance automatically. No additional setup required.',
  },
  {
    icon: Shield,
    title: 'Quality Gates',
    description:
      'Parallel and serial validation gates to enforce standards before code ships. Design token, test, and security checks.',
  },
  {
    icon: Package,
    title: 'Lightweight',
    description:
      '~200KB gzipped with full tree shaking. Compare that to LangChain at 2.3MB or Vercel AI SDK at 450KB.',
  },
  {
    icon: Terminal,
    title: 'CLI Tools',
    description:
      'Config init and validation via `npx @dcyfr/ai config:init`. Bring your own YAML, JSON, or package.json config.',
  },
] as const;

const PACKAGES = [
  {
    name: '@dcyfr/ai',
    description: 'Core AI agent framework — plugin system, multi-provider, telemetry, delegation.',
    version: 'v2.1.x',
    npmHref: 'https://www.npmjs.com/package/@dcyfr/ai',
    githubHref: 'https://github.com/dcyfr/dcyfr-ai',
    badge: 'Core',
  },
  {
    name: '@dcyfr/ai-cli',
    description: 'CLI toolkit for AI workflows — config validation, init, and project scaffolding.',
    version: 'v1.0.x',
    npmHref: 'https://www.npmjs.com/package/@dcyfr/ai-cli',
    githubHref: 'https://github.com/dcyfr/dcyfr-ai-cli',
    badge: 'CLI',
  },
  {
    name: '@dcyfr/ai-rag',
    description: 'RAG library for semantic search and retrieval-augmented generation workflows.',
    version: 'v1.0.x',
    npmHref: 'https://www.npmjs.com/package/@dcyfr/ai-rag',
    githubHref: 'https://github.com/dcyfr/dcyfr-ai-rag',
    badge: 'RAG',
  },
  {
    name: '@dcyfr/ai-code-gen',
    description: 'Code generation toolkit with quality gates and structured output validation.',
    version: 'v1.0.x',
    npmHref: 'https://www.npmjs.com/package/@dcyfr/ai-code-gen',
    githubHref: 'https://github.com/dcyfr/dcyfr-ai-code-gen',
    badge: 'CodeGen',
  },
] as const;

const COMPARISON = [
  { feature: 'Multi-Provider', dcyfr: true, langchain: true, vercel: true, autogpt: false },
  { feature: 'Plugin System', dcyfr: true, langchain: 'Complex', vercel: false, autogpt: false },
  { feature: 'Built-in Telemetry', dcyfr: true, langchain: false, vercel: false, autogpt: false },
  { feature: 'Quality Gates', dcyfr: true, langchain: false, vercel: false, autogpt: false },
  { feature: 'Zero Config', dcyfr: true, langchain: false, vercel: true, autogpt: false },
  {
    feature: 'Bundle Size',
    dcyfr: '~200KB',
    langchain: '~2.3MB',
    vercel: '~450KB',
    autogpt: 'N/A',
  },
  { feature: 'TypeScript Strict', dcyfr: true, langchain: 'Partial', vercel: true, autogpt: false },
  { feature: 'Delegation System', dcyfr: true, langchain: false, vercel: false, autogpt: false },
] as const;

function ComparisonCell({ value }: Readonly<{ value: boolean | string }>) {
  if (value === true) return <span className="text-emerald-500 font-semibold text-sm">✓</span>;
  if (value === false) return <span className="text-muted-foreground/50 text-sm">—</span>;
  return <span className="text-sm text-foreground/80">{value}</span>;
}

export default async function AiFrameworkPage() {
  const nonce = (await headers()).get('x-nonce') || '';

  const breadcrumbJsonLd = createBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: '@dcyfr/ai Framework', url: `${SITE_URL}/ai` },
  ]);

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(breadcrumbJsonLd, nonce)} />
      <SmoothScrollToHash />

      {/* Hero */}
      <PageHero
        title="@dcyfr/ai"
        description="Portable AI agent framework with plugin architecture, multi-provider support, and built-in telemetry. TypeScript-strict. ~200KB gzipped."
      />

      {/* Install + CTAs */}
      <section
        className={cn(
          'w-full',
          CONTAINER_WIDTHS.standard,
          'mx-auto',
          CONTAINER_PADDING,
          CONTAINER_VERTICAL_PADDING
        )}
      >
        <div className={cn(SPACING.section, 'flex flex-col items-center text-center gap-6')}>
          {/* Install command */}
          <div className="flex items-center gap-3 bg-muted/60 rounded-lg px-5 py-3 font-mono text-sm border border-border/40 w-full max-w-md justify-between">
            <span className="text-muted-foreground select-none">$</span>
            <span className="text-foreground flex-1 text-left">npm install @dcyfr/ai</span>
            <kbd className="text-xs text-muted-foreground bg-background/60 px-2 py-0.5 rounded border border-border/40">
              copy
            </kbd>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="sm">
              <Link
                href="https://www.npmjs.com/package/@dcyfr/ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on npm
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link
                href="https://github.com/dcyfr/dcyfr-ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitFork className="mr-1.5 h-3.5 w-3.5" />
                GitHub
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link
                href="https://deepwiki.com/dcyfr/dcyfr-ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                DeepWiki Docs
              </Link>
            </Button>
          </div>

          {/* npm badges */}
          <div className="flex flex-wrap gap-3 justify-center opacity-90">
            {/* eslint-disable @next/next/no-img-element */}
            <img
              src="https://img.shields.io/npm/v/@dcyfr/ai?style=flat-square&logo=npm&logoColor=white"
              alt="npm version"
              height={20}
            />
            <img
              src="https://img.shields.io/npm/dm/@dcyfr/ai?style=flat-square&logo=npm&logoColor=white"
              alt="npm downloads"
              height={20}
            />
            <img
              src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white"
              alt="TypeScript strict"
              height={20}
            />
            <img
              src="https://img.shields.io/badge/Bundle%20Size-~200KB%20gzipped-28a745?style=flat-square"
              alt="Bundle size"
              height={20}
            />
            {/* eslint-enable @next/next/no-img-element */}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <Section id="features">
        <div
          className={cn(
            'w-full',
            CONTAINER_WIDTHS.standard,
            'mx-auto',
            CONTAINER_PADDING,
            'pb-10 md:pb-14'
          )}
        >
          <div className={cn(SPACING.subsection)}>
            <h2 className={cn(TYPOGRAPHY.h2.standard)}>What&apos;s included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-border/50 bg-card/60 p-5 flex flex-col gap-3 hover:border-border transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className={cn(TYPOGRAPHY.h3.standard)}>{title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Quick start */}
      <Section id="quickstart">
        <div
          className={cn(
            'w-full',
            CONTAINER_WIDTHS.standard,
            'mx-auto',
            CONTAINER_PADDING,
            'pb-10 md:pb-14'
          )}
        >
          <div className={cn(SPACING.subsection)}>
            <h2 className={cn(TYPOGRAPHY.h2.standard)}>Quick start</h2>
            <div className="rounded-xl border border-border/50 bg-muted/40 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border/40 bg-muted/60">
                <span className="w-3 h-3 rounded-full bg-red-400/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <span className="w-3 h-3 rounded-full bg-green-400/60" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">
                  getting-started.ts
                </span>
              </div>
              <pre className="text-sm font-mono p-5 overflow-x-auto leading-relaxed text-foreground/90">
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
          </div>
        </div>
      </Section>

      {/* Delegation framework callout */}
      <Section id="delegation">
        <div
          className={cn(
            'w-full',
            CONTAINER_WIDTHS.standard,
            'mx-auto',
            CONTAINER_PADDING,
            'pb-10 md:pb-14'
          )}
        >
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-start">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
              <Zap className="h-5 w-5" />
            </span>
            <div className="flex flex-col gap-2">
              <h3 className={cn(TYPOGRAPHY.h3.standard)}>Delegation Framework — v2.0</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Route tasks automatically to the right agent using capability manifests, reputation
                scoring, and contract-based SLAs. Built-in security hardening with 8 CS-scenario
                mitigations, rate limiting, and TLP clearance enforcement.
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  'Reputation Engine',
                  'SLA Contracts',
                  'TLP Clearance',
                  'Rate Limiting',
                  'HMAC Auth',
                  'Chain Depth Guard',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-muted px-2.5 py-1 rounded-full border border-border/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Package ecosystem */}
      <Section id="packages">
        <div
          className={cn(
            'w-full',
            CONTAINER_WIDTHS.standard,
            'mx-auto',
            CONTAINER_PADDING,
            'pb-10 md:pb-14'
          )}
        >
          <div className={cn(SPACING.subsection)}>
            <h2 className={cn(TYPOGRAPHY.h2.standard)}>Package ecosystem</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PACKAGES.map(({ name, description, version, npmHref, githubHref, badge }) => (
                <div
                  key={name}
                  className="rounded-xl border border-border/50 bg-card/60 p-5 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {name}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{version}</span>
                    </div>
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full shrink-0">
                      {badge}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  <div className="flex gap-3 mt-auto pt-1">
                    <Link
                      href={npmHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      npm
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <Link
                      href={githubHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      GitHub
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              See all packages at{' '}
              <Link
                href="/open-source"
                className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
              >
                /open-source
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      {/* Comparison table */}
      <Section id="comparison">
        <div
          className={cn(
            'w-full',
            CONTAINER_WIDTHS.standard,
            'mx-auto',
            CONTAINER_PADDING,
            'pb-10 md:pb-14'
          )}
        >
          <div className={cn(SPACING.subsection)}>
            <h2 className={cn(TYPOGRAPHY.h2.standard)}>How it compares</h2>
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-sm min-w-130">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Feature
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-primary">@dcyfr/ai</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                      LangChain
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                      Vercel AI SDK
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                      AutoGPT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map(({ feature, dcyfr, langchain, vercel, autogpt }, i) => (
                    <tr
                      key={feature}
                      className={cn(
                        'border-b border-border/30 last:border-0',
                        i % 2 === 0 ? 'bg-card/30' : ''
                      )}
                    >
                      <td className="px-4 py-3 text-foreground/80">{feature}</td>
                      <td className="px-4 py-3 text-center">
                        <ComparisonCell value={dcyfr} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ComparisonCell value={langchain} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ComparisonCell value={vercel} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ComparisonCell value={autogpt} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>

      {/* Docs CTA */}
      <Section id="docs">
        <div
          className={cn(
            'w-full',
            CONTAINER_WIDTHS.standard,
            'mx-auto',
            CONTAINER_PADDING,
            'pb-14 md:pb-20'
          )}
        >
          <div className="rounded-xl border border-border/50 bg-card/60 p-6 md:p-10 flex flex-col items-center text-center gap-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
            <h2 className={cn(TYPOGRAPHY.h2.standard)}>Documentation</h2>
            <p className={cn(TYPOGRAPHY.description, 'max-w-lg')}>
              Full documentation is live on DeepWiki. A dedicated docs site is coming soon at{' '}
              <span className="font-mono text-foreground">docs.dcyfr.ai</span>.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="sm">
                <Link
                  href="https://deepwiki.com/dcyfr/dcyfr-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read docs on DeepWiki
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link
                  href="https://github.com/dcyfr/dcyfr-ai#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  README on GitHub
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <ul className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-2 text-sm text-muted-foreground">
              {[
                'Plugin marketplace',
                'Migration guides (LangChain, Vercel AI SDK)',
                'MCP server integration',
                'Delegation patterns',
              ].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}
