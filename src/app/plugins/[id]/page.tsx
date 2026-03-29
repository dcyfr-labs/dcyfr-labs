import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS, CONTAINER_PADDING } from '@/lib/design-tokens';
import { createPageMetadata } from '@/lib/metadata';
import { PageLayout } from '@/components/layouts';
import { assertFeatureOr404 } from '@/lib/admin-guard';

// Plugin details type
interface PluginDetail {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  author: string;
  authorUrl: string;
  version: string;
  trustScore: number;
  trustDimensions: {
    codeQuality: number;
    security: number;
    maintenance: number;
    documentation: number;
  };
  downloads: number;
  category: string;
  certified: 'bronze' | 'silver' | 'gold' | null;
  certificationExpiry: string | null;
  repository: string;
  license: string;
  tlpClassification: 'CLEAR' | 'GREEN' | 'AMBER' | 'RED';
  lastAudit: string;
  createdAt: string;
  updatedAt: string;
  features: string[];
  requirements: string[];
  sbom: {
    dependencies: Array<{
      name: string;
      version: string;
      license: string;
      vulnerabilities: number;
    }>;
    lastScan: string;
    totalVulnerabilities: number;
  };
  auditHistory: Array<{
    date: string;
    type: string;
    result: 'pass' | 'fail' | 'warning';
    findings: number;
    auditor: string;
  }>;
}

// Mock plugin data - in production, this would come from the API
const MOCK_PLUGINS: Record<string, PluginDetail> = {
  'dcyfr/secret-detector': {
    id: 'dcyfr/secret-detector',
    name: 'Secret Detector',
    description:
      'Automatically detect and prevent secrets from being committed to your repository.',
    longDescription: `Secret Detector is a comprehensive security tool that scans your codebase for exposed secrets, API keys, credentials, and sensitive data patterns.

It provides real-time detection with 200+ built-in patterns for common secrets, custom rule support, pre-commit hooks, entropy analysis, and allowlisting for false positives.

Install the plugin via the DCYFR CLI, configure patterns in .secretdetector.json, run scans manually or enable automatic scanning, review and fix detected secrets, and add allowlist entries for false positives.`,
    author: 'DCYFR',
    authorUrl: 'https://dcyfr.ai',
    version: '1.2.0',
    trustScore: 98,
    trustDimensions: {
      codeQuality: 97,
      security: 99,
      maintenance: 98,
      documentation: 96,
    },
    downloads: 12500,
    category: 'security',
    certified: 'gold',
    certificationExpiry: '2027-02-15',
    repository: 'https://github.com/dcyfr/secret-detector',
    license: 'MIT',
    tlpClassification: 'CLEAR',
    lastAudit: '2026-02-10',
    createdAt: '2025-06-15',
    updatedAt: '2026-02-20',
    features: [
      'Real-time secret detection',
      '200+ built-in detection patterns',
      'Custom pattern support',
      'Git pre-commit integration',
      'Entropy analysis',
      'Allowlisting for false positives',
      'CI/CD pipeline integration',
      'Detailed reporting',
    ],
    requirements: [
      'DCYFR Agent v2.0+',
      'Node.js 18+ or Docker runtime',
      'Git (for pre-commit features)',
    ],
    sbom: {
      dependencies: [
        { name: 'fast-glob', version: '3.3.2', license: 'MIT', vulnerabilities: 0 },
        { name: 'micromatch', version: '4.0.5', license: 'MIT', vulnerabilities: 0 },
        { name: 'chalk', version: '5.3.0', license: 'MIT', vulnerabilities: 0 },
        { name: 'zod', version: '3.22.4', license: 'MIT', vulnerabilities: 0 },
      ],
      lastScan: '2026-02-28',
      totalVulnerabilities: 0,
    },
    auditHistory: [
      {
        date: '2026-02-10',
        type: 'Security Audit',
        result: 'pass',
        findings: 0,
        auditor: 'DCYFR Security Team',
      },
      {
        date: '2026-01-15',
        type: 'Code Review',
        result: 'pass',
        findings: 2,
        auditor: 'External Auditor',
      },
      {
        date: '2025-12-01',
        type: 'Certification Renewal',
        result: 'pass',
        findings: 0,
        auditor: 'DCYFR Cert Authority',
      },
      {
        date: '2025-09-20',
        type: 'Penetration Test',
        result: 'pass',
        findings: 1,
        auditor: 'SecureAudit Inc.',
      },
    ],
  },
};

// Get plugin by ID - in production, fetch from API
async function getPlugin(id: string): Promise<PluginDetail | null> {
  const decodedId = decodeURIComponent(id);
  return MOCK_PLUGINS[decodedId] ?? null;
}

// Generate metadata
type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const plugin = await getPlugin(id);

  if (!plugin) {
    return createPageMetadata({
      title: 'Plugin Not Found',
      description: 'The requested plugin could not be found.',
      path: `/plugins/${id}`,
    });
  }

  return createPageMetadata({
    title: `${plugin.name} - DCYFR Plugin`,
    description: plugin.description,
    path: `/plugins/${id}`,
  });
}

function getCertificationBadge(tier: 'bronze' | 'silver' | 'gold' | null) {
  if (!tier) return null;
  const badges = {
    bronze: { label: 'Bronze Certified', color: 'bg-amber-700 text-amber-100' },
    silver: { label: 'Silver Certified', color: 'bg-gray-400 text-gray-900' },
    gold: { label: 'Gold Certified', color: 'bg-yellow-500 text-yellow-900' },
  };
  return badges[tier];
}

function getTLPBadge(tlp: 'CLEAR' | 'GREEN' | 'AMBER' | 'RED') {
  const badges = {
    CLEAR: { label: 'TLP:CLEAR', color: 'bg-white text-gray-900 border border-gray-300' },
    GREEN: { label: 'TLP:GREEN', color: 'bg-green-600 text-white' },
    AMBER: { label: 'TLP:AMBER', color: 'bg-amber-500 text-white' },
    RED: { label: 'TLP:RED', color: 'bg-red-600 text-white' },
  };
  return badges[tlp];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDownloads(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

function TrustScoreMeter({ score, label }: { score: number; label: string }) {
  const color = score >= 90 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <span className={`${TYPOGRAPHY.metadata} w-28`}>{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-medium w-8 text-right">{score}</span>
    </div>
  );
}

export default async function PluginDetailPage({ params }: Props) {
  assertFeatureOr404('PLUGINS_ENABLED');
  const { id } = await params;
  const plugin = await getPlugin(id);

  if (!plugin) {
    notFound();
  }

  const certBadge = getCertificationBadge(plugin.certified);
  const tlpBadge = getTLPBadge(plugin.tlpClassification);

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav className={`mx-auto ${CONTAINER_WIDTHS.content} ${CONTAINER_PADDING} pt-8`}>
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link href="/plugins" className="text-muted-foreground hover:text-foreground">
              Plugins
            </Link>
          </li>
          <li className="text-muted-foreground">/</li>
          <li>
            <Link
              href={`/plugins?category=${plugin.category}`}
              className="text-muted-foreground hover:text-foreground capitalize"
            >
              {plugin.category.replace('-', ' ')}
            </Link>
          </li>
          <li className="text-muted-foreground">/</li>
          <li className="text-foreground font-medium">{plugin.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <header
        className={`mx-auto ${CONTAINER_WIDTHS.content} ${CONTAINER_PADDING} ${SPACING.section}`}
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className={TYPOGRAPHY.h1.standard}>{plugin.name}</h1>
              {certBadge && (
                <span className={`px-3 py-1 text-sm rounded-full ${certBadge.color}`}>
                  {certBadge.label}
                </span>
              )}
              <span className={`px-3 py-1 text-sm rounded-full ${tlpBadge.color}`}>
                {tlpBadge.label}
              </span>
            </div>
            <p className={`${TYPOGRAPHY.description} mb-4`}>{plugin.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                by{' '}
                <a
                  href={plugin.authorUrl}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {plugin.author}
                </a>
              </span>
              <span>v{plugin.version}</span>
              <span>{formatDownloads(plugin.downloads)} downloads</span>
              <span>Updated {formatDate(plugin.updatedAt)}</span>
            </div>
          </div>

          {/* Install CTA */}
          <div className="flex flex-col gap-3 min-w-50">
            <a
              href={`claude://install-plugin/${encodeURIComponent(plugin.id)}`}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground text-center hover:bg-primary/90 transition-colors"
            >
              Install Plugin
            </a>
            <a
              href={plugin.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg border border-border bg-background text-center hover:bg-muted transition-colors"
            >
              View Source
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`mx-auto ${CONTAINER_WIDTHS.content} ${CONTAINER_PADDING} pb-16`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About / Long Description */}
            <section className="p-6 rounded-lg border border-border bg-card">
              <h2 className={`${TYPOGRAPHY.h2.standard} mb-4`}>About</h2>
              <div className={TYPOGRAPHY.body}>
                {plugin.longDescription.split('\n').map((line, i) => {
                  if (line.trim() === '') return <br key={i} />;
                  return (
                    <p key={i} className="mb-2">
                      {line}
                    </p>
                  );
                })}
              </div>
            </section>

            {/* Features */}
            <section className="p-6 rounded-lg border border-border bg-card">
              <h2 className={`${TYPOGRAPHY.h2.standard} mb-4`}>Features</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {plugin.features.map((feature, i) => (
                  <li key={i} className={`flex items-start gap-2 ${TYPOGRAPHY.body}`}>
                    <svg
                      className="h-5 w-5 text-green-500 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </section>

            {/* SBOM Viewer */}
            <section className="p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className={TYPOGRAPHY.h2.standard}>Software Bill of Materials (SBOM)</h2>
                <span className={TYPOGRAPHY.metadata}>
                  Last scanned: {formatDate(plugin.sbom.lastScan)}
                </span>
              </div>

              {plugin.sbom.totalVulnerabilities === 0 ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 mb-4">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className={TYPOGRAPHY.body}>No vulnerabilities detected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-600 mb-4">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className={TYPOGRAPHY.body}>
                    {plugin.sbom.totalVulnerabilities} vulnerabilities found
                  </span>
                </div>
              )}

              <table className="w-full">
                <thead>
                  <tr className="text-sm text-muted-foreground border-b border-border">
                    <th className="text-left py-2">Package</th>
                    <th className="text-left py-2">Version</th>
                    <th className="text-left py-2">License</th>
                    <th className="text-right py-2">Vulnerabilities</th>
                  </tr>
                </thead>
                <tbody>
                  {plugin.sbom.dependencies.map((dep, i) => (
                    <tr key={i} className="text-sm border-b border-border last:border-0">
                      <td className="py-2 font-mono">{dep.name}</td>
                      <td className="py-2">{dep.version}</td>
                      <td className="py-2">{dep.license}</td>
                      <td
                        className={`py-2 text-right ${dep.vulnerabilities > 0 ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {dep.vulnerabilities}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Audit History */}
            <section className="p-6 rounded-lg border border-border bg-card">
              <h2 className={`${TYPOGRAPHY.h2.standard} mb-4`}>Audit History</h2>
              <div className="space-y-4">
                {plugin.auditHistory.map((audit, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        audit.result === 'pass'
                          ? 'bg-green-500'
                          : audit.result === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={TYPOGRAPHY.body}>{audit.type}</span>
                        <span className={TYPOGRAPHY.metadata}>{formatDate(audit.date)}</span>
                      </div>
                      <div className={`${TYPOGRAPHY.metadata} mt-1`}>
                        {audit.auditor} • {audit.findings} finding{audit.findings !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        audit.result === 'pass'
                          ? 'bg-green-500/10 text-green-600'
                          : audit.result === 'warning'
                            ? 'bg-yellow-500/10 text-yellow-600'
                            : 'bg-red-500/10 text-red-600'
                      }`}
                    >
                      {audit.result.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Trust Score */}
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className={TYPOGRAPHY.h3.standard}>Trust Score</h3>
                <span
                  className={`text-3xl font-bold ${
                    plugin.trustScore >= 90
                      ? 'text-green-600'
                      : plugin.trustScore >= 70
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {plugin.trustScore}
                </span>
              </div>
              <div className="space-y-3">
                <TrustScoreMeter score={plugin.trustDimensions.codeQuality} label="Code Quality" />
                <TrustScoreMeter score={plugin.trustDimensions.security} label="Security" />
                <TrustScoreMeter score={plugin.trustDimensions.maintenance} label="Maintenance" />
                <TrustScoreMeter
                  score={plugin.trustDimensions.documentation}
                  label="Documentation"
                />
              </div>
              <div className={`${TYPOGRAPHY.metadata} mt-4 pt-4 border-t border-border`}>
                Last audit: {formatDate(plugin.lastAudit)}
              </div>
            </div>

            {/* Requirements */}
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className={`${TYPOGRAPHY.h3.standard} mb-4`}>Requirements</h3>
              <ul className="space-y-2">
                {plugin.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg
                      className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4"
                      />
                    </svg>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Meta Info */}
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className={`${TYPOGRAPHY.h3.standard} mb-4`}>Info</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className={TYPOGRAPHY.metadata}>License</dt>
                  <dd className="text-sm">{plugin.license}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={TYPOGRAPHY.metadata}>Category</dt>
                  <dd className="text-sm capitalize">{plugin.category.replace('-', ' ')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={TYPOGRAPHY.metadata}>Created</dt>
                  <dd className="text-sm">{formatDate(plugin.createdAt)}</dd>
                </div>
                {plugin.certificationExpiry && (
                  <div className="flex justify-between">
                    <dt className={TYPOGRAPHY.metadata}>Cert Expires</dt>
                    <dd className="text-sm">{formatDate(plugin.certificationExpiry)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Report Issue */}
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className={`${TYPOGRAPHY.h3.standard} mb-2`}>Found an Issue?</h3>
              <p className={`${TYPOGRAPHY.metadata} mb-4`}>
                Report security vulnerabilities or bugs to help keep the community safe.
              </p>
              <a
                href={`mailto:security@dcyfr.ai?subject=Plugin%20Issue:%20${encodeURIComponent(plugin.name)}`}
                className="block w-full px-4 py-2 rounded-lg border border-border bg-background text-center hover:bg-muted transition-colors text-sm"
              >
                Report Issue
              </a>
            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
}
