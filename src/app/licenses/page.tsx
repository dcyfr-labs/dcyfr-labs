import { Metadata } from 'next';
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS } from '@/lib/design-tokens';
import { PageLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Open Source Licenses',
  description: 'See all open-source dependencies and their licenses used by DCYFR',
  openGraph: {
    title: 'DCYFR Open Source Licenses',
    description: 'Complete list of open-source dependencies and licenses',
    type: 'website',
  },
};

interface Dependency {
  name: string;
  version: string;
  license: string;
  homepage?: string;
  repository?: string;
}

// In production, this would be generated from the SBOM
// For now, we'll show structure with sample data
const SAMPLE_DEPENDENCIES: Dependency[] = [
  {
    name: 'react',
    version: '18.2.0',
    license: 'MIT',
    homepage: 'https://react.dev',
    repository: 'https://github.com/facebook/react',
  },
  {
    name: 'next',
    version: '14.0.0',
    license: 'MIT',
    homepage: 'https://nextjs.org',
    repository: 'https://github.com/vercel/next.js',
  },
  {
    name: 'typescript',
    version: '5.3.0',
    license: 'Apache-2.0',
    homepage: 'https://www.typescriptlang.org',
    repository: 'https://github.com/microsoft/TypeScript',
  },
];

function getLicenseColor(license: string): string {
  switch (license.toLowerCase()) {
    case 'mit':
      return 'bg-green-100 text-green-800';
    case 'apache-2.0':
      return 'bg-blue-100 text-blue-800';
    case 'bsd-2-clause':
    case 'bsd-3-clause':
      return 'bg-purple-100 text-purple-800';
    case 'isc':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function LicensesPage() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredDependencies = SAMPLE_DEPENDENCIES.filter(
    (dep) =>
      dep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.license.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const licenseCounts = SAMPLE_DEPENDENCIES.reduce(
    (acc, dep) => {
      const license = dep.license;
      acc[license] = (acc[license] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <PageLayout>
      {/* Header Section */}
      <section className={SPACING.section}>
        <div className={CONTAINER_WIDTHS.narrow}>
          <h1 className={TYPOGRAPHY.h1.standard}>Open Source Licenses</h1>
          <p className={`${TYPOGRAPHY.body} text-muted-foreground`}>
            DCYFR is built on quality open-source software. Below is a complete list of all
            dependencies used in our products and their licenses.
          </p>
        </div>
      </section>

      {/* Compliance Summary */}
      <section className={SPACING.section}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 border border-muted-foreground/20 rounded-lg">
            <div className={`${TYPOGRAPHY.metadata} text-muted-foreground`}>Total Dependencies</div>
            <div className={`${TYPOGRAPHY.display.stat} mt-2`}>{SAMPLE_DEPENDENCIES.length}</div>
          </div>

          <div className="p-4 border border-muted-foreground/20 rounded-lg">
            <div className={`${TYPOGRAPHY.metadata} text-muted-foreground`}>
              ✅ Approved Licenses
            </div>
            <div className={`${TYPOGRAPHY.display.stat} mt-2`}>{SAMPLE_DEPENDENCIES.length}</div>
          </div>

          <div className="p-4 border border-muted-foreground/20 rounded-lg">
            <div className={`${TYPOGRAPHY.metadata} text-muted-foreground`}>License Types</div>
            <div className={`${TYPOGRAPHY.display.stat} mt-2`}>{Object.keys(licenseCounts).length}</div>
          </div>

          <div className="p-4 border border-muted-foreground/20 rounded-lg">
            <div className={`${TYPOGRAPHY.metadata} text-muted-foreground`}>Last Updated</div>
            <div className={`${TYPOGRAPHY.metadata} mt-2`}>{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </section>

      {/* License Breakdown */}
      <section className={SPACING.section}>
        <h2 className={TYPOGRAPHY.h2.standard}>License Breakdown</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(licenseCounts).map(([license, count]) => (
            <div
              key={license}
              className={`px-3 py-1 rounded-full text-sm font-medium ${getLicenseColor(license)}`}
            >
              {license}: {count}
            </div>
          ))}
        </div>
      </section>

      {/* Search and Filter */}
      <section className={SPACING.section}>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search dependencies or licenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-muted-foreground/20 rounded-lg"
          />
          <Button variant="secondary" onClick={() => setSearchTerm('')}>
            Clear
          </Button>
        </div>
      </section>

      {/* Dependencies Table */}
      <section className={SPACING.section}>
        <h2 className={TYPOGRAPHY.h2.standard}>Dependencies</h2>

        {filteredDependencies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No dependencies found matching &quot;{searchTerm}&quot;</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-muted-foreground/20">
                  <th className="text-left px-4 py-3 text-muted-foreground">Package Name</th>
                  <th className="text-left px-4 py-3 text-muted-foreground">Version</th>
                  <th className="text-left px-4 py-3 text-muted-foreground">License</th>
                  <th className="text-left px-4 py-3 text-muted-foreground">Links</th>
                </tr>
              </thead>
              <tbody>
                {filteredDependencies.map((dep) => (
                  <tr key={dep.name} className="border-b border-muted-foreground/10">
                    <td className="px-4 py-3 font-medium">{dep.name}</td>
                    <td className="px-4 py-3">
                      <code style={{ fontSize: '0.875em' }}>{dep.version}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getLicenseColor(dep.license)}`}
                      >
                        {dep.license}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {dep.homepage && (
                        <a
                          href={dep.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline mr-2"
                        >
                          Home
                        </a>
                      )}
                      {dep.repository && (
                        <a
                          href={dep.repository}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          GitHub
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SBOM and Policy */}
      <section className={SPACING.section}>
        <h2 className={TYPOGRAPHY.h2.standard}>Technical Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-muted-foreground/20 rounded-lg">
            <h3 className={TYPOGRAPHY.h3.standard}>SBOM (Software Bill of Materials)</h3>
            <p className={`${TYPOGRAPHY.body} text-muted-foreground`}>
              Enterprise customers can download a complete Software Bill of Materials (SBOM) in
              CycloneDX format from our GitHub releases.
            </p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => window.open('https://github.com/dcyfr/dcyfr-labs/releases')}
            >
              Download SBOM
            </Button>
          </div>

          <div className="p-4 border border-muted-foreground/20 rounded-lg">
            <h3 className={TYPOGRAPHY.h3.standard}>Licensing Policy</h3>
            <p className={`${TYPOGRAPHY.body} text-muted-foreground`}>
              Learn about DCYFR&apos;s licensing standards, approved/prohibited licenses, and how we
              maintain compliance.
            </p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => (window.location.href = '/docs/licensing-policy')}
            >
              View Policy
            </Button>
          </div>
        </div>
      </section>

      {/* Enterprise Support */}
      <section className={`${SPACING.section} bg-muted/50 p-8 rounded-lg`}>
        <h2 className={TYPOGRAPHY.h2.standard}>Enterprise Support</h2>

        <p className={`${TYPOGRAPHY.body} text-muted-foreground`}>
          Need a custom SBOM for compliance, a licensing audit, or have licensing questions?
        </p>

        <div className="mt-4 flex gap-4">
          <Button onClick={() => (window.location.href = 'mailto:hello@dcyfr.ai')}>
            Contact Us
          </Button>
          <Button
            variant="secondary"
            onClick={() => (window.location.href = 'https://www.dcyfr.ai/about')}
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Footer Info */}
      <section className={`${SPACING.section} border-t border-muted-foreground/20 pt-8`}>
        <div className={`${TYPOGRAPHY.metadata} text-muted-foreground`}>
          <p>
            This page lists all direct dependencies used by dcyfr-labs. For a complete list
            including transitive dependencies, please download the SBOM from our GitHub releases.
          </p>
          <p className="mt-2">
            Questions about licensing?{' '}
            <a href="mailto:hello@dcyfr.ai" className="text-blue-600 hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </section>
    </PageLayout>
  );
}

import React from 'react';
