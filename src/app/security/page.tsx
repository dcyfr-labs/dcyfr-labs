import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS, CONTAINER_PADDING } from '@/lib/design-tokens';
import { createPageMetadata } from '@/lib/metadata';
import { PageLayout, PageHero } from '@/components/layouts';
import { getJsonLdScriptProps, getContactPageSchema } from '@/lib/json-ld';

const pageTitle = 'Security';
const pageDescription =
  'Learn about our security measures, vulnerability reporting process, and commitment to protecting your data. We prioritize security through transparency and proactive monitoring.';

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/security',
});

export default async function SecurityPage() {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get('x-nonce') || '';

  // JSON-LD structured data
  const jsonLd = getContactPageSchema(pageDescription);

  const lastUpdated = 'January 16, 2026';

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />

      <PageHero title={pageTitle} description={pageDescription} variant="standard" align="center" />

      <article
        className={`mx-auto ${CONTAINER_WIDTHS.prose} ${CONTAINER_PADDING} ${SPACING.section}`}
      >
        {/* Introduction */}
        <section className={SPACING.content}>
          <p className={TYPOGRAPHY.description}>
            At DCYFR Labs, security is fundamental to everything we build. This page outlines our
            security measures, vulnerability reporting process, and our commitment to transparency.
          </p>
          <p className={TYPOGRAPHY.body}>
            <strong>Last Updated:</strong> {lastUpdated}
          </p>
        </section>

        {/* Security Commitment */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Our Security Commitment</h2>
          <p className={TYPOGRAPHY.body}>
            We prioritize security across all our systems and processes through:
          </p>
          <ul className={`${SPACING.compact} list-disc pl-6`}>
            <li className={TYPOGRAPHY.body}>
              <strong>Privacy-First Approach:</strong> Minimal data collection by design
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Transparent Practices:</strong> Open about our security measures and incidents
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Proactive Monitoring:</strong> 24/7 automated security scanning and alerting
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Continuous Improvement:</strong> Regular audits and security updates
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Responsible Disclosure:</strong> Clear process for reporting vulnerabilities
            </li>
          </ul>
        </section>

        {/* Security Measures */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Security Measures</h2>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Infrastructure Security</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>HTTPS/TLS 1.3:</strong> All connections encrypted with the latest TLS
                protocol
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Content Security Policy (CSP):</strong> Nonce-based CSP Level 2+ preventing
                XSS attacks
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Subresource Integrity (SRI):</strong> External resources verified with
                cryptographic hashes
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>DDoS Protection:</strong> Vercel&apos;s edge network with built-in attack
                mitigation
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>HSTS:</strong> HTTP Strict Transport Security enforcing secure connections
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Security Headers:</strong> X-Frame-Options, X-Content-Type-Options, and more
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Application Security</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Input Validation:</strong> All user inputs validated and sanitized
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>SQL Injection Prevention:</strong> Parameterized queries and prepared
                statements
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>XSS Protection:</strong> CSP enforcement and automatic output escaping
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>CSRF Protection:</strong> Token-based CSRF protection on all state-changing
                operations
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Rate Limiting:</strong> API endpoints protected with adaptive rate limits
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Session Security:</strong> Encrypted sessions with AES-256-GCM, automatic
                expiration
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Data Security</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Encryption in Transit:</strong> TLS 1.3 for all data transmission
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Encryption at Rest:</strong> AES-256-GCM for session data and sensitive
                information
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Minimal Data Collection:</strong> Only essential data collected (see{' '}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
                )
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>No Persistent Tracking:</strong> No cookies, no cross-site tracking
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Automatic Data Deletion:</strong> Sessions (24-48h), logs (30d), errors
                (90d)
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Access Control:</strong> Strict authentication and authorization for all
                systems
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Monitoring &amp; Detection</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>24/7 Monitoring:</strong> Automated security monitoring via Sentry
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Real-Time Alerting:</strong> Immediate notifications for security events
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>CodeQL Scanning:</strong> Automated code analysis for vulnerabilities
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Dependabot:</strong> Automated security updates for dependencies
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Monthly Audits:</strong> Regular security assessments and penetration
                testing
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Incident Response:</strong> Documented procedures for security incidents
              </li>
            </ul>
          </div>
        </section>

        {/* Reporting Vulnerabilities */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Reporting Security Vulnerabilities</h2>
          <p className={TYPOGRAPHY.body}>
            If you discover a security vulnerability, please report it responsibly. We appreciate
            your efforts to improve our security.
          </p>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>How to Report</h3>
            <p className={TYPOGRAPHY.body}>
              <strong>DO NOT</strong> create a public GitHub issue for security vulnerabilities.
            </p>
            <p className={TYPOGRAPHY.body}>Instead, use one of these secure methods:</p>
            <ol className="space-y-2 list-decimal pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>GitHub Security Advisories</strong> (Preferred)
                <ul className="mt-1 space-y-1 list-disc pl-6">
                  <li className={TYPOGRAPHY.body}>
                    Visit{' '}
                    <a
                      href="https://github.com/dcyfr/dcyfr-labs/security/advisories"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Security Advisories
                    </a>
                  </li>
                  <li className={TYPOGRAPHY.body}>Click &quot;Report a vulnerability&quot;</li>
                  <li className={TYPOGRAPHY.body}>
                    Provide detailed information using the template
                  </li>
                </ul>
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Direct Contact</strong>
                <ul className="mt-1 space-y-1 list-disc pl-6">
                  <li className={TYPOGRAPHY.body}>
                    Use our{' '}
                    <a href="/contact" className="text-primary hover:underline">
                      contact form
                    </a>
                  </li>
                  <li className={TYPOGRAPHY.body}>
                    Include &quot;SECURITY VULNERABILITY&quot; in the subject line
                  </li>
                  <li className={TYPOGRAPHY.body}>Provide all details listed below</li>
                </ul>
              </li>
            </ol>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>What to Include</h3>
            <p className={TYPOGRAPHY.body}>When reporting a vulnerability, please include:</p>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Type of Issue:</strong> XSS, CSRF, injection, authentication bypass, etc.
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Location:</strong> File path, URL, or affected component
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Steps to Reproduce:</strong> Detailed, step-by-step instructions
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Impact Assessment:</strong> What an attacker could potentially do
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Suggested Fix:</strong> If you have one (optional but appreciated)
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Contact Information:</strong> For follow-up questions
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Response Timeline</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Initial Response:</strong> Within 48 hours
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Status Update:</strong> Within 5 business days
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Fix Timeline:</strong> Based on severity (see below)
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Severity Classification</h3>
            <ul className="space-y-2 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Critical (24-48 hours):</strong> Remote code execution, authentication
                bypass, data breach
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>High (1 week):</strong> XSS, CSRF, privilege escalation
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Medium (2 weeks):</strong> Information disclosure, DoS vulnerabilities
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Low (4 weeks):</strong> Minor information leaks, low-impact issues
              </li>
            </ul>
          </div>
        </section>

        {/* Security Best Practices */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Security Best Practices</h2>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>For Users</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>Keep your browser and operating system updated</li>
              <li className={TYPOGRAPHY.body}>
                Use strong, unique passwords (if authentication features are added)
              </li>
              <li className={TYPOGRAPHY.body}>Enable two-factor authentication (when available)</li>
              <li className={TYPOGRAPHY.body}>Report suspicious activity immediately</li>
              <li className={TYPOGRAPHY.body}>
                Verify you&apos;re on dcyfr.ai (check the URL and certificate)
              </li>
              <li className={TYPOGRAPHY.body}>
                Be cautious of phishing attempts impersonating DCYFR Labs
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>For Developers</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                Follow our security guidelines in{' '}
                <a
                  href="https://github.com/dcyfr/dcyfr-labs/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  CONTRIBUTING.md
                </a>
              </li>
              <li className={TYPOGRAPHY.body}>
                Never commit secrets, API keys, or credentials to the repository
              </li>
              <li className={TYPOGRAPHY.body}>
                Run security checks before submitting pull requests
              </li>
              <li className={TYPOGRAPHY.body}>
                Review our{' '}
                <a
                  href="https://github.com/dcyfr/dcyfr-labs/blob/main/SECURITY.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  SECURITY.md
                </a>{' '}
                in the repository
              </li>
              <li className={TYPOGRAPHY.body}>
                Use design tokens (prevents CSS injection vulnerabilities)
              </li>
              <li className={TYPOGRAPHY.body}>Validate all inputs, sanitize all outputs</li>
              <li className={TYPOGRAPHY.body}>Follow the principle of least privilege</li>
            </ul>
          </div>
        </section>

        {/* Certifications & Compliance */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Security Certifications &amp; Compliance</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <strong>GDPR Compliant:</strong> Privacy by design with minimal data collection
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>WCAG 2.1 AA Compliant:</strong> Accessibility standards reduce security risks
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>CSP Level 2+:</strong> Nonce-based content security policy preventing
              injection attacks
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Automated Scanning:</strong> CodeQL, Dependabot, and Lighthouse CI continuous
              monitoring
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Industry Standards:</strong> Following OWASP Top 10 and CWE/SANS Top 25
              guidelines
            </li>
          </ul>
        </section>

        {/* Third-Party Security */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Third-Party Security</h2>
          <p className={TYPOGRAPHY.body}>
            We rely on industry-leading providers with strong security certifications:
          </p>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Vercel (Hosting)</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>SOC 2 Type II certified</li>
              <li className={TYPOGRAPHY.body}>ISO 27001 certified</li>
              <li className={TYPOGRAPHY.body}>GDPR and CCPA compliant</li>
              <li className={TYPOGRAPHY.body}>
                <a
                  href="https://vercel.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Vercel Security
                </a>
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>GitHub (Code Repository)</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>SOC 1, SOC 2, and SOC 3 reports</li>
              <li className={TYPOGRAPHY.body}>ISO 27001 and ISO 27018 certified</li>
              <li className={TYPOGRAPHY.body}>
                Advanced security features (Dependabot, CodeQL, Secret Scanning)
              </li>
              <li className={TYPOGRAPHY.body}>
                <a
                  href="https://github.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub Security
                </a>
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Sentry (Error Monitoring)</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>SOC 2 Type II certified</li>
              <li className={TYPOGRAPHY.body}>GDPR compliant with PII scrubbing</li>
              <li className={TYPOGRAPHY.body}>Automatic data sanitization</li>
              <li className={TYPOGRAPHY.body}>
                <a
                  href="https://sentry.io/security/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Sentry Security
                </a>
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Inngest (Background Jobs)</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>SOC 2 Type II certified</li>
              <li className={TYPOGRAPHY.body}>GDPR compliant</li>
              <li className={TYPOGRAPHY.body}>Transient data processing (7-day retention)</li>
              <li className={TYPOGRAPHY.body}>
                <a
                  href="https://www.inngest.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Inngest Security
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* Security Resources */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Security Resources</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <a
                href="https://github.com/dcyfr/dcyfr-labs/blob/main/SECURITY.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Security Policy (GitHub)
              </a>{' '}
              - Detailed vulnerability reporting process
            </li>
            <li className={TYPOGRAPHY.body}>
              <a
                href="https://github.com/dcyfr/dcyfr-labs/security/advisories"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Security Advisories
              </a>{' '}
              - Published security notices
            </li>
            <li className={TYPOGRAPHY.body}>
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>{' '}
              - How we protect your data
            </li>
            <li className={TYPOGRAPHY.body}>
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              - Legal agreements and user responsibilities
            </li>
            <li className={TYPOGRAPHY.body}>
              <a href="/contact" className="text-primary hover:underline">
                Contact Us
              </a>{' '}
              - Report security concerns
            </li>
          </ul>
        </section>

        {/* Security Updates */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Security Updates</h2>
          <p className={TYPOGRAPHY.body}>
            We continuously update our security measures and respond promptly to new threats. This
            page was last updated: <strong>{lastUpdated}</strong>
          </p>
          <p className={TYPOGRAPHY.body}>For security notices and updates:</p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <a
                href="https://github.com/dcyfr/dcyfr-labs/security/advisories"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub Security Advisories
              </a>{' '}
              - Official security announcements
            </li>
            <li className={TYPOGRAPHY.body}>
              <a href="/activity" className="text-primary hover:underline">
                Activity Feed
              </a>{' '}
              - Real-time updates on security improvements
            </li>
          </ul>
        </section>

        {/* Footer */}
        <footer className="mt-8 md:mt-10 lg:mt-14 pt-4 md:pt-5 lg:pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <strong>DCYFR Labs Security Policy</strong>
            <br />
            Last Updated: {lastUpdated}
            <br />
            <br />
            Questions or security concerns?{' '}
            <a href="/contact" className="text-primary hover:underline">
              Contact us
            </a>{' '}
            or report vulnerabilities via{' '}
            <a
              href="https://github.com/dcyfr/dcyfr-labs/security/advisories"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub Security Advisories
            </a>
            .
          </p>
        </footer>
      </article>
    </PageLayout>
  );
}
