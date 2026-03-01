import type { Metadata } from 'next';
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS, CONTAINER_PADDING } from '@/lib/design-tokens';
import { createPageMetadata } from '@/lib/metadata';
import { PageLayout, PageHero } from '@/components/layouts';
import Link from 'next/link';

const pageTitle = 'DCYFR Plugin Marketplace';
const pageDescription =
  'Discover and install verified AI plugins for DCYFR. Browse security-audited, trust-scored plugins across categories including security, code quality, automation, and more.';

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/plugins',
});

// Plugin categories with icons and descriptions
const PLUGIN_CATEGORIES = [
  {
    id: 'security',
    name: 'Security',
    description: 'Vulnerability scanners, secret detection, SBOM generators',
    icon: '🛡️',
    count: 12,
  },
  {
    id: 'code-quality',
    name: 'Code Quality',
    description: 'Linting, formatting, style enforcement, code review',
    icon: '✨',
    count: 8,
  },
  {
    id: 'automation',
    name: 'Automation',
    description: 'CI/CD integration, workflow automation, deployment tools',
    icon: '⚡',
    count: 15,
  },
  {
    id: 'documentation',
    name: 'Documentation',
    description: 'API docs, README generators, changelog automation',
    icon: '📚',
    count: 6,
  },
  {
    id: 'testing',
    name: 'Testing',
    description: 'Test generation, coverage analysis, mutation testing',
    icon: '🧪',
    count: 9,
  },
  {
    id: 'ai-agents',
    name: 'AI Agents',
    description: 'Specialized AI agents for code review, debugging, refactoring',
    icon: '🤖',
    count: 11,
  },
];

// Featured plugins (verified, high trust score)
interface FeaturedPlugin {
  id: string;
  name: string;
  description: string;
  author: string;
  trustScore: number;
  downloads: number;
  category: string;
  certified: 'bronze' | 'silver' | 'gold' | null;
  version: string;
}

const FEATURED_PLUGINS: FeaturedPlugin[] = [
  {
    id: 'dcyfr/secret-detector',
    name: 'Secret Detector',
    description:
      'Automatically detect and prevent secrets from being committed to your repository.',
    author: 'DCYFR',
    trustScore: 98,
    downloads: 12500,
    category: 'security',
    certified: 'gold',
    version: '1.2.0',
  },
  {
    id: 'dcyfr/vulnerability-scanner',
    name: 'Vulnerability Scanner',
    description: 'Comprehensive dependency vulnerability scanning with SBOM generation.',
    author: 'DCYFR',
    trustScore: 96,
    downloads: 9800,
    category: 'security',
    certified: 'gold',
    version: '2.1.4',
  },
  {
    id: 'dcyfr/code-reviewer',
    name: 'AI Code Reviewer',
    description: 'AI-powered code review with inline suggestions and security analysis.',
    author: 'DCYFR',
    trustScore: 95,
    downloads: 8500,
    category: 'ai-agents',
    certified: 'silver',
    version: '1.0.8',
  },
  {
    id: 'dcyfr/test-generator',
    name: 'Test Generator',
    description: 'Automatically generate unit tests for TypeScript and JavaScript code.',
    author: 'DCYFR',
    trustScore: 94,
    downloads: 7200,
    category: 'testing',
    certified: 'silver',
    version: '1.3.2',
  },
  {
    id: 'dcyfr/doc-generator',
    name: 'Documentation Generator',
    description: 'Generate API documentation, READMEs, and changelogs from your codebase.',
    author: 'DCYFR',
    trustScore: 93,
    downloads: 6100,
    category: 'documentation',
    certified: 'bronze',
    version: '2.0.1',
  },
  {
    id: 'dcyfr/pipeline-optimizer',
    name: 'CI/CD Optimizer',
    description: 'Optimize your CI/CD pipelines for faster builds and deployments.',
    author: 'DCYFR',
    trustScore: 92,
    downloads: 5500,
    category: 'automation',
    certified: 'bronze',
    version: '1.1.0',
  },
];

function getCertificationBadge(tier: 'bronze' | 'silver' | 'gold' | null) {
  if (!tier) return null;
  const badges = {
    bronze: { label: 'Bronze', color: 'bg-amber-700 text-amber-100' },
    silver: { label: 'Silver', color: 'bg-gray-400 text-gray-900' },
    gold: { label: 'Gold', color: 'bg-yellow-500 text-yellow-900' },
  };
  return badges[tier];
}

function getTrustScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

function formatDownloads(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

export default function PluginsMarketplacePage() {
  return (
    <PageLayout>
      <PageHero
        title="Plugin Marketplace"
        description="Discover verified, security-audited AI plugins to extend DCYFR's capabilities"
      />

      {/* Search Section */}
      <section
        className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} ${SPACING.section}`}
      >
        <div className="relative">
          <input
            type="search"
            placeholder="Search plugins by name, category, or author..."
            className={`w-full px-4 py-3 pl-12 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${TYPOGRAPHY.body}`}
            aria-label="Search plugins"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Quick filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className={`${TYPOGRAPHY.label.small} text-muted-foreground`}>Quick filters:</span>
          <button className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            Verified
          </button>
          <button className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
            Gold Certified
          </button>
          <button className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
            Most Downloaded
          </button>
          <button className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
            Highest Trust Score
          </button>
        </div>
      </section>

      {/* Categories Grid */}
      <section
        className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} ${SPACING.section}`}
      >
        <h2 className={TYPOGRAPHY.h2.standard}>Browse by Category</h2>
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${SPACING.content}`}>
          {PLUGIN_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/plugins?category=${category.id}`}
              className="group p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {category.icon}
                </span>
                <div className="flex-1">
                  <h3
                    className={`${TYPOGRAPHY.h3.standard} group-hover:text-primary transition-colors`}
                  >
                    {category.name}
                  </h3>
                  <p className={`${TYPOGRAPHY.metadata} mt-1`}>{category.description}</p>
                  <span className="text-sm text-primary mt-2 inline-block">
                    {category.count} plugins
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Plugins */}
      <section
        className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} ${SPACING.section}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className={TYPOGRAPHY.h2.standard}>Featured Plugins</h2>
          <Link href="/plugins?sort=featured" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${SPACING.content}`}>
          {FEATURED_PLUGINS.map((plugin) => {
            const badge = getCertificationBadge(plugin.certified);
            const trustColor = getTrustScoreColor(plugin.trustScore);
            return (
              <Link
                key={plugin.id}
                href={`/plugins/${encodeURIComponent(plugin.id)}`}
                className="group flex flex-col p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3
                      className={`${TYPOGRAPHY.h3.standard} group-hover:text-primary transition-colors`}
                    >
                      {plugin.name}
                    </h3>
                    <span className={TYPOGRAPHY.metadata}>by {plugin.author}</span>
                  </div>
                  {badge && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className={`${TYPOGRAPHY.metadata} flex-1 mb-4`}>{plugin.description}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  {/* Trust Score */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${trustColor}`}>
                      {plugin.trustScore}
                    </span>
                    <span className={TYPOGRAPHY.metadata}>trust score</span>
                  </div>

                  {/* Downloads */}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span className={TYPOGRAPHY.metadata}>{formatDownloads(plugin.downloads)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} ${SPACING.section}`}
      >
        <div className="p-8 rounded-xl bg-linear-to-r from-primary/10 to-primary/5 border border-primary/20 text-center">
          <h2 className={`${TYPOGRAPHY.h2.standard} mb-4`}>Build Your Own Plugin</h2>
          <p className={`${TYPOGRAPHY.body} text-muted-foreground mb-6 max-w-2xl mx-auto`}>
            Create custom AI plugins for your team or the community. Our plugin framework supports
            multiple runtimes including Docker, gVisor, and WebAssembly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/docs/plugins/getting-started"
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/docs/plugins/certification"
              className="px-6 py-3 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
            >
              Certification Program
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} ${SPACING.section} pb-16`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className={`${TYPOGRAPHY.display.stat} text-primary block`}>61+</span>
            <span className={TYPOGRAPHY.metadata}>Total Plugins</span>
          </div>
          <div>
            <span className={`${TYPOGRAPHY.display.stat} text-primary block`}>98%</span>
            <span className={TYPOGRAPHY.metadata}>Avg Trust Score</span>
          </div>
          <div>
            <span className={`${TYPOGRAPHY.display.stat} text-primary block`}>50k+</span>
            <span className={TYPOGRAPHY.metadata}>Total Downloads</span>
          </div>
          <div>
            <span className={`${TYPOGRAPHY.display.stat} text-primary block`}>24</span>
            <span className={TYPOGRAPHY.metadata}>Certified Plugins</span>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
