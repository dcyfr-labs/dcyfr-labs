import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS, CONTAINER_PADDING } from '@/lib/design-tokens';
import { createPageMetadata } from '@/lib/metadata';
import { PageLayout, PageHero } from '@/components/layouts';
import { PluginListWithTrustScores } from '@/components/plugins/PluginListWithTrustScores';
import type { PluginEntry } from '@/components/plugins/PluginListWithTrustScores';
import { TrustScoreBreakdown } from '@/components/plugins/TrustScoreBreakdown';
import { AuditDateTracker } from '@/components/plugins/AuditDateTracker';
import { IncidentTimeline } from '@/components/plugins/IncidentTimeline';
import { getReviewStore } from '@/lib/plugins/review-store';

const pageTitle = 'Plugin Security Dashboard';
const pageDescription =
  'Real-time security status for DCYFR plugins. Monitor trust scores, audit dates, TLP classifications, and security incidents across the plugin ecosystem.';

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/plugins/security',
});

const mockPlugins: PluginEntry[] = [
  {
    pluginId: 'dcyfr/secret-detector',
    name: 'Secret Detector',
    version: '1.2.0',
    trustScore: 98,
    dimensions: { security: 99, community: 97, maintenance: 98, transparency: 98 },
    auditDate: '2026-02-28',
    verified: true,
    downloads: 1205,
    incidents: [],
  },
  {
    pluginId: 'dcyfr/vulnerability-scanner',
    name: 'Vulnerability Scanner',
    version: '2.1.4',
    trustScore: 96,
    dimensions: { security: 98, community: 95, maintenance: 96, transparency: 95 },
    auditDate: '2026-02-20',
    verified: true,
    downloads: 983,
    incidents: [
      {
        id: 'inc-001',
        date: '2026-01-15',
        severity: 'low',
        title: 'Dependency update required (lodash)',
        status: 'resolved',
      },
    ],
  },
  {
    pluginId: 'dcyfr/code-quality-checker',
    name: 'Code Quality Checker',
    version: '1.0.8',
    trustScore: 95,
    dimensions: { security: 96, community: 94, maintenance: 95, transparency: 95 },
    auditDate: '2026-01-10',
    verified: true,
    downloads: 742,
    incidents: [],
  },
  {
    pluginId: 'dcyfr/dependency-auditor',
    name: 'Dependency Auditor',
    version: '1.3.2',
    trustScore: 94,
    dimensions: { security: 97, community: 92, maintenance: 93, transparency: 94 },
    auditDate: '2025-12-15',
    verified: true,
    downloads: 628,
    incidents: [
      {
        id: 'inc-002',
        date: '2025-12-01',
        severity: 'medium',
        title: 'False positive in SBOM parsing for monorepos',
        status: 'resolved',
      },
    ],
  },
  {
    pluginId: 'dcyfr/performance-budget',
    name: 'Performance Budget',
    version: '0.9.1',
    trustScore: 85,
    dimensions: { security: 88, community: 83, maintenance: 84, transparency: 85 },
    auditDate: '2025-08-20',
    verified: false,
    downloads: 211,
    incidents: [
      {
        id: 'inc-003',
        date: '2025-11-10',
        severity: 'high',
        title: 'Inaccurate budget calculation on Windows paths',
        status: 'open',
      },
    ],
  },
];

export default async function PluginSecurityDashboardPage() {
  // Get nonce from proxy for CSP (available for future structured data scripts)
  await headers();

  // Overlay live community scores from the review store onto mock plugin data.
  // If a plugin has no reviews yet, the mock dimension value is kept as-is.
  const reviewStore = await getReviewStore();
  const plugins: PluginEntry[] = mockPlugins.map((plugin) => {
    const liveScore = reviewStore.getCommunityScore(plugin.pluginId);
    if (liveScore === 0) return plugin;
    // Recompute overall trust score: Security 40% + Community 30% + Maintenance 20% + Transparency 10%
    const dims = {
      ...plugin.dimensions,
      community: liveScore,
    };
    const overallScore = Math.round(
      dims.security * 0.4 + dims.community * 0.3 + dims.maintenance * 0.2 + dims.transparency * 0.1
    );
    return { ...plugin, dimensions: dims, trustScore: overallScore };
  });

  const totalPlugins = plugins.length;
  const verifiedCount = plugins.filter((p) => p.verified).length;
  const openIncidents = plugins
    .flatMap((p) => p.incidents)
    .filter((i) => i.status === 'open').length;
  const avgTrustScore = Math.round(
    plugins.reduce((sum, p) => sum + p.trustScore, 0) / totalPlugins
  );

  return (
    <PageLayout>
      <PageHero title={pageTitle} description={pageDescription} variant="standard" align="center" />

      <article
        className={`mx-auto ${CONTAINER_WIDTHS.content} ${CONTAINER_PADDING} ${SPACING.section}`}
      >
        {/* Overview stats */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Security Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-border bg-muted/20 text-center">
              <div className={`${TYPOGRAPHY.display.stat} text-foreground`}>{totalPlugins}</div>
              <div className={TYPOGRAPHY.metadata}>Total Plugins</div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-muted/20 text-center">
              <div className={`${TYPOGRAPHY.display.stat} text-foreground`}>{avgTrustScore}</div>
              <div className={TYPOGRAPHY.metadata}>Avg Trust Score</div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-muted/20 text-center">
              <div className={`${TYPOGRAPHY.display.stat} text-foreground`}>{verifiedCount}</div>
              <div className={TYPOGRAPHY.metadata}>Verified Plugins</div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-muted/20 text-center">
              <div
                className={`${TYPOGRAPHY.display.stat} ${openIncidents > 0 ? 'text-red-600' : 'text-green-600'}`}
              >
                {openIncidents}
              </div>
              <div className={TYPOGRAPHY.metadata}>Open Incidents</div>
            </div>
          </div>
        </section>

        {/* Plugin trust scores table */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Plugin Trust Scores</h2>
          <p className={TYPOGRAPHY.metadata}>
            Trust scores are computed from four weighted dimensions: Security (40%), Community
            (30%), Maintenance (20%), and Transparency (10%).
          </p>
          <PluginListWithTrustScores plugins={plugins} />
        </section>

        {/* Trust score breakdown for top plugin */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Trust Score Breakdown</h2>
          <p className={TYPOGRAPHY.metadata}>Dimension breakdown for the highest-rated plugin.</p>
          <TrustScoreBreakdown
            pluginName={plugins[0].name}
            dimensions={plugins[0].dimensions}
            overall={plugins[0].trustScore}
          />
        </section>

        {/* Audit date tracker */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Audit Status</h2>
          <p className={TYPOGRAPHY.metadata}>
            Plugins are color-coded by audit date freshness. Audits older than 180 days require
            immediate attention.
          </p>
          <AuditDateTracker
            plugins={plugins.map((p) => ({
              pluginId: p.pluginId,
              name: p.name,
              auditDate: p.auditDate,
              trustScore: p.trustScore,
            }))}
          />
        </section>

        {/* Incident history */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Incident History</h2>
          <p className={TYPOGRAPHY.metadata}>
            Chronological record of all security incidents across the plugin ecosystem.
          </p>
          <IncidentTimeline plugins={plugins} />
        </section>
      </article>
    </PageLayout>
  );
}
