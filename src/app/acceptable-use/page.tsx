import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS, CONTAINER_PADDING } from '@/lib/design-tokens';
import { createPageMetadata } from '@/lib/metadata';
import { PageLayout, PageHero } from '@/components/layouts';
import { getJsonLdScriptProps, getContactPageSchema } from '@/lib/json-ld';

const pageTitle = 'Acceptable Use Policy';
const pageDescription =
  'Guidelines for appropriate use of DCYFR Labs services. Learn about permitted and prohibited uses, rate limits, and enforcement procedures.';

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/acceptable-use',
});

export default async function AcceptableUsePage() {
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
            This Acceptable Use Policy outlines guidelines for appropriate use of the DCYFR Labs
            website and services. By accessing or using our services, you agree to comply with this
            policy.
          </p>
          <p className={TYPOGRAPHY.body}>
            <strong>Last Updated:</strong> {lastUpdated}
          </p>
        </section>

        {/* Permitted Uses */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Permitted Uses</h2>
          <p className={TYPOGRAPHY.body}>You may use our services to:</p>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Content Consumption</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                Read blog posts, technical articles, and documentation
              </li>
              <li className={TYPOGRAPHY.body}>View project showcases and portfolio content</li>
              <li className={TYPOGRAPHY.body}>Bookmark content for personal reference</li>
              <li className={TYPOGRAPHY.body}>Share content via social media or direct links</li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Communication</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>Contact us via the provided contact form</li>
              <li className={TYPOGRAPHY.body}>Report bugs or accessibility issues</li>
              <li className={TYPOGRAPHY.body}>Request information about services or projects</li>
              <li className={TYPOGRAPHY.body}>Provide feedback on content or features</li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Educational Purposes</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>Learn from code examples and technical guides</li>
              <li className={TYPOGRAPHY.body}>
                Reference implementation patterns and best practices
              </li>
              <li className={TYPOGRAPHY.body}>Use as educational material for personal learning</li>
              <li className={TYPOGRAPHY.body}>Share knowledge with attribution</li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Research</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>Analyze public content for research purposes</li>
              <li className={TYPOGRAPHY.body}>Cite content with proper attribution</li>
              <li className={TYPOGRAPHY.body}>
                Use anonymized analytics data (if publicly available)
              </li>
            </ul>
          </div>
        </section>

        {/* Prohibited Uses */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Prohibited Uses</h2>
          <p className={TYPOGRAPHY.body}>
            You may <strong>not</strong> use our services to:
          </p>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Abusive Behavior</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Automated Scraping:</strong> Scrape content using bots, crawlers, or
                automated tools (except legitimate search engine bots)
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Rate Limit Abuse:</strong> Make excessive requests that overwhelm our
                infrastructure
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>DDoS Attacks:</strong> Launch denial-of-service or distributed
                denial-of-service attacks
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Resource Exhaustion:</strong> Deliberately consume excessive bandwidth or
                server resources
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Security Violations</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Hacking:</strong> Attempt to gain unauthorized access to systems or data
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Vulnerability Exploitation:</strong> Exploit security vulnerabilities
                without responsible disclosure
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Malware Distribution:</strong> Distribute viruses, malware, or malicious
                code
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Phishing:</strong> Impersonate DCYFR Labs or send deceptive communications
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Credential Stuffing:</strong> Use stolen credentials to access accounts
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Illegal Activities</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Copyright Infringement:</strong> Reproduce content without permission
                (beyond fair use)
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Trademark Violations:</strong> Use DCYFR Labs marks without authorization
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Fraud:</strong> Engage in fraudulent or deceptive practices
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Illegal Content:</strong> Post or transmit illegal content
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Privacy Violations:</strong> Collect or share personal data without consent
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Harmful Content</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Harassment:</strong> Harass, abuse, or threaten individuals
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Hate Speech:</strong> Post content promoting hate based on protected
                characteristics
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Violence:</strong> Promote or incite violence
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Misinformation:</strong> Deliberately spread false information
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Technical Abuse</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Reverse Engineering:</strong> Reverse engineer, decompile, or disassemble
                our software (except where legally permitted)
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Circumvention:</strong> Bypass security measures, rate limits, or access
                controls
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Monitoring:</strong> Monitor availability or performance without
                authorization
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Interference:</strong> Interfere with other users&apos; access or enjoyment
                of services
              </li>
            </ul>
          </div>
        </section>

        {/* Rate Limits */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Rate Limits</h2>
          <p className={TYPOGRAPHY.body}>
            To ensure fair use and protect our infrastructure, we enforce rate limits:
          </p>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Current Limits</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Contact Form:</strong> 5 submissions per hour per IP address
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>API Endpoints:</strong> 100 requests per minute per IP address (where
                applicable)
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Page Views:</strong> No strict limits on normal browsing
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Exceeding Rate Limits</h3>
            <p className={TYPOGRAPHY.body}>If you exceed rate limits:</p>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Automatic:</strong> You&apos;ll receive HTTP 429 (Too Many Requests)
                responses
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Temporary Block:</strong> Your IP may be temporarily blocked (15-60 minutes)
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Permanent Block:</strong> Persistent abuse may result in permanent IP
                blocking
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Requesting Higher Limits</h3>
            <p className={TYPOGRAPHY.body}>
              If you need higher rate limits for legitimate purposes:
            </p>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <a href="/contact" className="text-primary hover:underline">
                  Contact us
                </a>{' '}
                with your use case and requirements
              </li>
              <li className={TYPOGRAPHY.body}>
                Provide details about your project and expected traffic
              </li>
              <li className={TYPOGRAPHY.body}>
                We&apos;ll review and may grant exceptions on a case-by-case basis
              </li>
            </ul>
          </div>
        </section>

        {/* Enforcement */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Enforcement</h2>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Violation Response</h3>
            <p className={TYPOGRAPHY.body}>If we detect a violation of this policy:</p>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Warning:</strong> First-time minor violations may result in a warning
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Temporary Suspension:</strong> Moderate violations may result in temporary
                service suspension (24-72 hours)
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Permanent Ban:</strong> Severe or repeated violations will result in
                permanent IP blocking
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Legal Action:</strong> We may pursue legal remedies for serious violations
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Automated Detection</h3>
            <p className={TYPOGRAPHY.body}>We use automated systems to detect:</p>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>Unusual traffic patterns indicating abuse</li>
              <li className={TYPOGRAPHY.body}>Known malicious IP addresses or user agents</li>
              <li className={TYPOGRAPHY.body}>
                Security scan attempts (port scanning, vulnerability probing)
              </li>
              <li className={TYPOGRAPHY.body}>DDoS attacks or resource exhaustion</li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Appeals Process</h3>
            <p className={TYPOGRAPHY.body}>If you believe your access was restricted in error:</p>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <a href="/contact" className="text-primary hover:underline">
                  Contact us
                </a>{' '}
                with your IP address and details
              </li>
              <li className={TYPOGRAPHY.body}>We&apos;ll review your case within 24-48 hours</li>
              <li className={TYPOGRAPHY.body}>Provide evidence of legitimate use if applicable</li>
              <li className={TYPOGRAPHY.body}>
                Appeals for security violations require additional verification
              </li>
            </ul>
          </div>
        </section>

        {/* Reporting Violations */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Reporting Violations</h2>
          <p className={TYPOGRAPHY.body}>If you observe violations of this policy:</p>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>How to Report</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <a href="/contact" className="text-primary hover:underline">
                  Submit a report
                </a>{' '}
                via our contact form
              </li>
              <li className={TYPOGRAPHY.body}>
                Include &quot;AUP Violation Report&quot; in the subject line
              </li>
              <li className={TYPOGRAPHY.body}>Provide specific details about the violation</li>
              <li className={TYPOGRAPHY.body}>Include timestamps and URLs if applicable</li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>What to Include</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>Description of the violation</li>
              <li className={TYPOGRAPHY.body}>Evidence (screenshots, logs, URLs)</li>
              <li className={TYPOGRAPHY.body}>Your contact information (for follow-up)</li>
              <li className={TYPOGRAPHY.body}>Any relevant context or background</li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Response Timeline</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Acknowledgment:</strong> Within 24 hours
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Investigation:</strong> 2-5 business days
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Resolution:</strong> Varies based on severity (urgent security issues
                addressed immediately)
              </li>
            </ul>
          </div>
        </section>

        {/* Security Vulnerability Reporting Exception */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Security Vulnerability Reporting Exception</h2>
          <p className={TYPOGRAPHY.body}>
            <strong>Responsible Security Research is Encouraged</strong>
          </p>
          <p className={TYPOGRAPHY.body}>
            Security researchers following responsible disclosure guidelines are exempt from this
            policy when:
          </p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              Testing for security vulnerabilities in a non-destructive manner
            </li>
            <li className={TYPOGRAPHY.body}>
              Following our{' '}
              <a href="/security" className="text-primary hover:underline">
                Security Policy
              </a>{' '}
              for responsible disclosure
            </li>
            <li className={TYPOGRAPHY.body}>Not accessing, modifying, or deleting user data</li>
            <li className={TYPOGRAPHY.body}>Not causing service disruption or degradation</li>
            <li className={TYPOGRAPHY.body}>
              Reporting findings promptly via{' '}
              <a
                href="https://github.com/dcyfr/dcyfr-labs/security/advisories"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub Security Advisories
              </a>
            </li>
          </ul>
          <p className={TYPOGRAPHY.body}>
            See our{' '}
            <a href="/security" className="text-primary hover:underline">
              Security Policy
            </a>{' '}
            for full vulnerability reporting guidelines.
          </p>
        </section>

        {/* Changes to This Policy */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Changes to This Policy</h2>
          <p className={TYPOGRAPHY.body}>
            We may update this Acceptable Use Policy from time to time:
          </p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <strong>Notification:</strong> Material changes will be posted on this page
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Effective Date:</strong> Changes take effect immediately upon posting
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Continued Use:</strong> Continued use constitutes acceptance of changes
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Review:</strong> We recommend reviewing this policy periodically
            </li>
          </ul>
        </section>

        {/* Related Policies */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Related Policies</h2>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              - Legal agreements
            </li>
            <li className={TYPOGRAPHY.body}>
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>{' '}
              - How we protect your data
            </li>
            <li className={TYPOGRAPHY.body}>
              <a href="/security" className="text-primary hover:underline">
                Security Policy
              </a>{' '}
              - Security measures and vulnerability reporting
            </li>
            <li className={TYPOGRAPHY.body}>
              <a href="/accessibility" className="text-primary hover:underline">
                Accessibility Statement
              </a>{' '}
              - Accessibility commitment
            </li>
            <li className={TYPOGRAPHY.body}>
              <a href="/contact" className="text-primary hover:underline">
                Contact Us
              </a>{' '}
              - Get in touch
            </li>
          </ul>
        </section>

        {/* Contact Information */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Contact Information</h2>
          <p className={TYPOGRAPHY.body}>
            Questions about this Acceptable Use Policy?{' '}
            <a href="/contact" className="text-primary hover:underline">
              Contact us
            </a>
            .
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-8 md:mt-10 lg:mt-14 pt-4 md:pt-5 lg:pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <strong>DCYFR Labs Acceptable Use Policy</strong>
            <br />
            Last Updated: {lastUpdated}
            <br />
            <br />
            This policy applies to all users of DCYFR Labs services. Violations may result in
            service suspension or termination.{' '}
            <a href="/contact" className="text-primary hover:underline">
              Contact us
            </a>{' '}
            with questions.
          </p>
        </footer>
      </article>
    </PageLayout>
  );
}
