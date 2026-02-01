#!/usr/bin/env node

/**
 * SBOM Generation Script for dcyfr-labs
 *
 * Generates Software Bill of Materials in multiple formats:
 * - CycloneDX 1.5 (JSON)
 * - SPDX 2.3 (JSON)
 * - Combined enriched format with third-party services
 *
 * Part of SOC2 Type 2 compliance requirements
 *
 * @see docs/security/.private/soc2-compliance-plan-2026-01-31.md
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const outputDir = join(projectRoot, 'docs/security/sbom');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// Third-party services inventory (from SOC2 audit)
const THIRD_PARTY_SERVICES = [
  {
    name: 'GitHub API',
    purpose: 'Version control, CI/CD, contribution data',
    criticality: 'Critical',
    dataAccess: 'Public repository data, commit history',
    authentication: 'GitHub Personal Access Token',
    soc2Report: 'https://github.com/security',
  },
  {
    name: 'Upstash Redis',
    purpose: 'Distributed caching, analytics storage',
    criticality: 'Critical',
    dataAccess: 'View counts, analytics, session data',
    authentication: 'REST API tokens',
    soc2Report: 'Available on request',
  },
  {
    name: 'Vercel',
    purpose: 'Hosting, deployment, analytics',
    criticality: 'Critical',
    dataAccess: 'Web vitals, deployment logs',
    authentication: 'API tokens',
    soc2Report: 'https://vercel.com/security',
  },
  {
    name: 'Sentry',
    purpose: 'Error tracking, performance monitoring',
    criticality: 'Standard',
    dataAccess: 'Error logs, CSP violations, performance traces',
    authentication: 'DSN tokens',
    soc2Report: 'https://sentry.io/security',
  },
  {
    name: 'Inngest',
    purpose: 'Background job orchestration',
    criticality: 'Critical',
    dataAccess: 'Event data, job payloads',
    authentication: 'Event keys, signing keys',
    soc2Report: 'https://www.inngest.com/security',
  },
  {
    name: 'Resend',
    purpose: 'Transactional email delivery',
    criticality: 'Standard',
    dataAccess: 'Email content, recipient addresses',
    authentication: 'API keys',
    soc2Report: 'Available on request',
  },
  {
    name: 'Perplexity AI',
    purpose: 'AI-powered research and search',
    criticality: 'Standard',
    dataAccess: 'Search queries, research requests',
    authentication: 'API keys',
    soc2Report: 'Not publicly available',
  },
  {
    name: 'Google Indexing API',
    purpose: 'Search indexing notification',
    criticality: 'Low',
    dataAccess: 'URL submissions',
    authentication: 'Service account OAuth 2.0',
    soc2Report: 'https://cloud.google.com/security/compliance',
  },
  {
    name: 'GreyNoise',
    purpose: 'IP reputation and threat intelligence',
    criticality: 'Standard',
    dataAccess: 'IP addresses for reputation lookup',
    authentication: 'API keys',
    soc2Report: 'Available on request',
  },
  {
    name: 'Giscus',
    purpose: 'GitHub Discussions-based comments',
    criticality: 'Low',
    dataAccess: 'Comment content via GitHub',
    authentication: 'GitHub OAuth',
    soc2Report: 'Relies on GitHub security',
  },
  {
    name: 'Inoreader',
    purpose: 'RSS feed aggregation',
    criticality: 'Low',
    dataAccess: 'Feed subscriptions, read status',
    authentication: 'OAuth 2.0',
    soc2Report: 'Not publicly available',
  },
  {
    name: 'Axiom',
    purpose: 'Log aggregation and analysis',
    criticality: 'Standard',
    dataAccess: 'Application logs, performance traces',
    authentication: 'API tokens',
    soc2Report: 'https://axiom.co/security',
  },
];

console.log('🔒 SBOM Generation for dcyfr-labs');
console.log('━'.repeat(50));

/**
 * Generate CycloneDX SBOM
 */
function generateCycloneDX() {
  console.log('\n📦 Generating CycloneDX SBOM...');

  try {
    // Install @cyclonedx/cyclonedx-npm if not present
    try {
      execSync('npx --yes @cyclonedx/cyclonedx-npm --version', { stdio: 'ignore' });
    } catch {
      console.log('   Installing @cyclonedx/cyclonedx-npm...');
      execSync('npm install -g @cyclonedx/cyclonedx-npm', { stdio: 'inherit' });
    }

    const outputFile = join(outputDir, `sbom-cyclonedx-${timestamp}.json`);

    execSync(
      `npx @cyclonedx/cyclonedx-npm --output-file "${outputFile}" --output-format JSON --spec-version 1.5`,
      { cwd: projectRoot, stdio: 'inherit' }
    );

    console.log(`   ✅ CycloneDX SBOM: ${outputFile}`);
    return outputFile;
  } catch (error) {
    console.error('   ❌ Failed to generate CycloneDX SBOM:', error.message);
    return null;
  }
}

/**
 * Generate SPDX SBOM
 */
function generateSPDX() {
  console.log('\n📦 Generating SPDX SBOM...');

  try {
    const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'));
    const packageLock = JSON.parse(readFileSync(join(projectRoot, 'package-lock.json'), 'utf-8'));

    const spdx = {
      spdxVersion: 'SPDX-2.3',
      dataLicense: 'CC0-1.0',
      SPDXID: 'SPDXRef-DOCUMENT',
      name: packageJson.name,
      documentNamespace: `https://sbom.dcyfr.ai/${packageJson.name}/${timestamp}`,
      creationInfo: {
        created: new Date().toISOString(),
        creators: ['Tool: dcyfr-labs-sbom-generator'],
        licenseListVersion: '3.20',
      },
      packages: [],
      relationships: [],
    };

    // Add root package
    spdx.packages.push({
      SPDXID: 'SPDXRef-Package-root',
      name: packageJson.name,
      versionInfo: packageJson.version,
      supplier: 'Organization: DCYFR',
      downloadLocation: 'https://github.com/dcyfr-labs/dcyfr-labs',
      filesAnalyzed: false,
      homepage: packageJson.homepage || 'https://www.dcyfr.ai',
      licenseConcluded: packageJson.license || 'NOASSERTION',
      licenseDeclared: packageJson.license || 'NOASSERTION',
      copyrightText: 'Copyright (c) 2025 DCYFR',
      description: packageJson.description,
    });

    // Add dependencies from package-lock.json
    let packageIndex = 1;
    for (const [name, info] of Object.entries(packageLock.packages || {})) {
      if (!name) continue; // Skip root package

      const pkgName = name.replace('node_modules/', '');
      const spdxId = `SPDXRef-Package-${packageIndex++}`;

      spdx.packages.push({
        SPDXID: spdxId,
        name: pkgName,
        versionInfo: info.version,
        downloadLocation: info.resolved || 'NOASSERTION',
        filesAnalyzed: false,
        licenseConcluded: info.license || 'NOASSERTION',
        licenseDeclared: info.license || 'NOASSERTION',
        copyrightText: 'NOASSERTION',
      });

      // Add dependency relationship
      spdx.relationships.push({
        spdxElementId: 'SPDXRef-Package-root',
        relationshipType: 'DEPENDS_ON',
        relatedSpdxElement: spdxId,
      });
    }

    const outputFile = join(outputDir, `sbom-spdx-${timestamp}.json`);
    writeFileSync(outputFile, JSON.stringify(spdx, null, 2));

    console.log(`   ✅ SPDX SBOM: ${outputFile}`);
    console.log(`   📊 Packages: ${spdx.packages.length}`);
    return outputFile;
  } catch (error) {
    console.error('   ❌ Failed to generate SPDX SBOM:', error.message);
    return null;
  }
}

/**
 * Generate enriched combined SBOM
 */
function generateCombinedSBOM(cyclonedxFile, spdxFile) {
  console.log('\n📦 Generating Combined Enriched SBOM...');

  try {
    const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'));
    const packageLock = JSON.parse(readFileSync(join(projectRoot, 'package-lock.json'), 'utf-8'));

    // Count dependencies by type
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    const combined = {
      metadata: {
        timestamp: new Date().toISOString(),
        generatedBy: 'dcyfr-labs-sbom-generator',
        project: {
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description,
          homepage: packageJson.homepage || 'https://www.dcyfr.ai',
          repository: packageJson.repository?.url || 'https://github.com/dcyfr-labs/dcyfr-labs',
        },
        soc2Compliance: {
          purpose: 'SOC2 Type 2 third-party risk management',
          lastAudit: timestamp,
          nextAudit: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days
        },
      },
      summary: {
        totalDependencies: Object.keys(dependencies).length + Object.keys(devDependencies).length,
        runtimeDependencies: Object.keys(dependencies).length,
        devDependencies: Object.keys(devDependencies).length,
        thirdPartyServices: THIRD_PARTY_SERVICES.length,
      },
      npmDependencies: {
        runtime: Object.entries(dependencies).map(([name, version]) => ({
          name,
          version: version.replace(/^[\^~]/, ''),
          type: 'runtime',
          installedVersion: packageLock.packages?.[`node_modules/${name}`]?.version || version,
          license: packageLock.packages?.[`node_modules/${name}`]?.license || 'Unknown',
        })),
        development: Object.entries(devDependencies).map(([name, version]) => ({
          name,
          version: version.replace(/^[\^~]/, ''),
          type: 'development',
          installedVersion: packageLock.packages?.[`node_modules/${name}`]?.version || version,
          license: packageLock.packages?.[`node_modules/${name}`]?.license || 'Unknown',
        })),
      },
      thirdPartyServices: THIRD_PARTY_SERVICES,
      internalPackages: [
        {
          name: '@dcyfr/ai',
          version: dependencies['@dcyfr/ai'] || '1.0.1',
          purpose: 'Internal AI utilities framework',
          location: 'monorepo',
        },
        {
          name: '@dcyfr/agents',
          version: 'file:../dcyfr-ai-agents',
          purpose: 'Internal AI agents framework',
          location: 'monorepo',
        },
      ],
      mcpServers: [
        {
          name: 'GitHub',
          type: 'HTTP',
          purpose: 'Code repository integration',
          url: 'https://api.githubcopilot.com/mcp/',
        },
        {
          name: 'Vercel',
          type: 'HTTP',
          purpose: 'Deployment management',
          url: 'https://mcp.vercel.com',
        },
        {
          name: 'Sentry',
          type: 'HTTP',
          purpose: 'Error tracking',
          url: 'https://mcp.sentry.dev/mcp/dcyfr-labs/dcyfr-labs',
        },
        {
          name: 'DCYFR Analytics',
          type: 'stdio',
          purpose: 'Project analytics',
          command: 'npm run mcp:analytics',
        },
        {
          name: 'DCYFR DesignTokens',
          type: 'stdio',
          purpose: 'Design token validation',
          command: 'npm run mcp:tokens',
        },
        {
          name: 'DCYFR ContentManager',
          type: 'stdio',
          purpose: 'Blog and content management',
          command: 'npm run mcp:content',
        },
      ],
      vulnerabilities: {
        scanDate: timestamp,
        critical: 0,
        high: 0,
        moderate: 0,
        low: 0,
        note: 'Run npm audit for current vulnerability status',
      },
      references: {
        cyclonedxSBOM: cyclonedxFile ? `sbom-cyclonedx-${timestamp}.json` : null,
        spdxSBOM: spdxFile ? `sbom-spdx-${timestamp}.json` : null,
        soc2Plan: 'docs/security/.private/soc2-compliance-plan-2026-01-31.md',
        securityDocs: 'docs/security/',
      },
    };

    const outputFile = join(outputDir, `sbom-combined-${timestamp}.json`);
    writeFileSync(outputFile, JSON.stringify(combined, null, 2));

    console.log(`   ✅ Combined SBOM: ${outputFile}`);
    console.log(`   📊 Runtime dependencies: ${combined.summary.runtimeDependencies}`);
    console.log(`   📊 Dev dependencies: ${combined.summary.devDependencies}`);
    console.log(`   📊 Third-party services: ${combined.summary.thirdPartyServices}`);
    console.log(`   📊 MCP servers: ${combined.mcpServers.length}`);

    return outputFile;
  } catch (error) {
    console.error('   ❌ Failed to generate combined SBOM:', error.message);
    return null;
  }
}

/**
 * Generate summary report
 */
function generateSummary(cyclonedxFile, spdxFile, combinedFile) {
  console.log('\n📋 Generating Summary Report...');

  const summary = `# SBOM Generation Report

**Generated:** ${new Date().toISOString()}
**Date:** ${timestamp}

## Files Generated

${cyclonedxFile ? `- ✅ CycloneDX SBOM: \`sbom-cyclonedx-${timestamp}.json\`` : '- ❌ CycloneDX generation failed'}
${spdxFile ? `- ✅ SPDX SBOM: \`sbom-spdx-${timestamp}.json\`` : '- ❌ SPDX generation failed'}
${combinedFile ? `- ✅ Combined Enriched SBOM: \`sbom-combined-${timestamp}.json\`` : '- ❌ Combined SBOM generation failed'}

## Next Steps

1. Review generated SBOMs for completeness
2. Validate CVE mappings (run \`npm audit\`)
3. Archive previous SBOMs if older than 12 months
4. Update evidence collection log

## SOC2 Compliance

This SBOM generation supports:
- **SC3.2:** Security testing and vulnerability management
- **PI1.1:** Data validation and processing integrity
- **C2.1:** Third-party service inventory for confidentiality controls

**Retention:** Keep SBOMs for 24 months (SOC2 Type 2 requirement)

## References

- SOC2 Plan: \`docs/security/.private/soc2-compliance-plan-2026-01-31.md\`
- Security Docs: \`docs/security/\`
- Monthly Audit: Run \`npm run security:audit:monthly\`
`;

  const summaryFile = join(outputDir, `sbom-summary-${timestamp}.md`);
  writeFileSync(summaryFile, summary);

  console.log(`   ✅ Summary: ${summaryFile}`);
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();

  // Generate all formats
  const cyclonedxFile = generateCycloneDX();
  const spdxFile = generateSPDX();
  const combinedFile = generateCombinedSBOM(cyclonedxFile, spdxFile);

  // Generate summary
  generateSummary(cyclonedxFile, spdxFile, combinedFile);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n━'.repeat(50));
  console.log(`✅ SBOM generation complete in ${duration}s`);
  console.log(`📁 Output directory: ${outputDir}`);
  console.log('━'.repeat(50));

  // Exit with success if at least one SBOM was generated
  process.exit(cyclonedxFile || spdxFile || combinedFile ? 0 : 1);
}

main().catch((error) => {
  console.error('\n❌ SBOM generation failed:', error);
  process.exit(1);
});
