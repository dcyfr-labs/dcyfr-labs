import type { Metadata } from 'next';
import Link from 'next/link';
import { assertDevOr404 } from '@/lib/dev-only';
import { createPageMetadata } from '@/lib/metadata';
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS } from '@/lib/design-tokens';

export const metadata: Metadata = createPageMetadata({
  title: 'Developer Tools',
  description: 'Internal developer tools and dashboards for dcyfr-labs',
  path: '/dev',
});

interface DevTool {
  name: string;
  path: string;
  description: string;
  category: 'Analytics' | 'Content' | 'Infrastructure' | 'AI';
}

const devTools: DevTool[] = [
  // Analytics
  {
    name: 'Analytics Dashboard',
    path: '/dev/analytics',
    description: 'Blog post metrics, views, and performance analytics',
    category: 'Analytics',
  },
  {
    name: 'API Costs',
    path: '/dev/api-costs',
    description: 'Track API usage and costs across services',
    category: 'Analytics',
  },
  {
    name: 'Unified AI Costs',
    path: '/dev/unified-ai-costs',
    description: 'Consolidated AI service cost tracking',
    category: 'Analytics',
  },

  // Infrastructure
  {
    name: 'MCP Health',
    path: '/dev/mcp-health',
    description: 'Model Context Protocol server health monitoring',
    category: 'Infrastructure',
  },
  {
    name: 'Maintenance Mode',
    path: '/dev/maintenance',
    description: 'Toggle site maintenance mode',
    category: 'Infrastructure',
  },

  // Content & Development
  {
    name: 'Font Showcase',
    path: '/dev/fonts',
    description: 'Typography and font testing',
    category: 'Content',
  },
  {
    name: 'Open Source Licenses',
    path: '/dev/licensing',
    description: 'Software Bill of Materials (SBOM) and license compliance',
    category: 'Content',
  },

  // AI & Automation
  {
    name: 'AI Agents',
    path: '/dev/agents',
    description: 'Manage and configure AI agents',
    category: 'AI',
  },
  {
    name: 'Rivet Demo',
    path: '/dev/rivet-demo',
    description: 'Visual AI workflow designer demonstrations',
    category: 'AI',
  },
];

const categories = Array.from(new Set(devTools.map((tool) => tool.category)));

export default function DevToolsPage() {
  assertDevOr404();

  return (
    <div className={CONTAINER_WIDTHS.dashboard}>
      {/* Header */}
      <section className={SPACING.section}>
        <h1 className={TYPOGRAPHY.h1.standard}>Developer Tools</h1>
        <p className={`${TYPOGRAPHY.body} text-muted-foreground max-w-3xl`}>
          Internal dashboards and utilities for development, monitoring, and operations.
          All pages under /dev/* are only accessible in development mode.
        </p>
      </section>

      {/* Tools Grid by Category */}
      {categories.map((category) => (
        <section key={category} className={SPACING.section}>
          <h2 className={TYPOGRAPHY.h2.standard}>{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devTools
              .filter((tool) => tool.category === category)
              .map((tool) => (
                <Link
                  key={tool.path}
                  href={tool.path}
                  className="group p-6 border border-muted-foreground/20 rounded-lg hover:border-muted-foreground/40 hover:bg-muted/50 transition-colors"
                >
                  <h3 className={`${TYPOGRAPHY.h3.standard} mb-2 group-hover:text-primary transition-colors`}>
                    {tool.name}
                  </h3>
                  <p className={`${TYPOGRAPHY.body} text-muted-foreground text-sm`}>
                    {tool.description}
                  </p>
                  <div className="mt-4 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </div>
                </Link>
              ))}
          </div>
        </section>
      ))}

      {/* Security Notice */}
      <section className={`${SPACING.section} p-6 border border-amber-500/20 bg-amber-500/5 rounded-lg`}>
        <h3 className={`${TYPOGRAPHY.h3.standard} text-amber-700 dark:text-amber-300`}>
          🔒 Security Notice
        </h3>
        <p className={`${TYPOGRAPHY.body} text-muted-foreground mt-2`}>
          All developer tools use <code className="px-1.5 py-0.5 bg-muted rounded text-sm">assertDevOr404()</code>
          {' '}and return 404 in preview/production environments. Access is restricted to{' '}
          <code className="px-1.5 py-0.5 bg-muted rounded text-sm">NODE_ENV=development</code> only.
        </p>
      </section>
    </div>
  );
}
