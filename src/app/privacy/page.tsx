import type { Metadata } from "next";
import { headers } from "next/headers";
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS } from "@/lib/design-tokens";
import { createPageMetadata } from "@/lib/metadata";
import { PageLayout, PageHero } from "@/components/layouts";
import { getJsonLdScriptProps, getContactPageSchema } from "@/lib/json-ld";

const pageTitle = "Privacy Policy";
const pageDescription =
  "Learn how DCYFR Labs collects, uses, and protects your information. We prioritize privacy with minimal data collection and no tracking.";

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/privacy",
});

export default async function PrivacyPage() {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";

  // JSON-LD structured data
  const jsonLd = getContactPageSchema(pageDescription);

  const lastUpdated = "December 28, 2025";

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />

      <PageHero
        title={pageTitle}
        description={pageDescription}
        variant="standard"
        align="center"
      />

      <article
        className={`mx-auto ${CONTAINER_WIDTHS.prose} ${SPACING.section}`}
      >
        {/* Introduction */}
        <section className={SPACING.content}>
          <p className={TYPOGRAPHY.description}>
            At DCYFR Labs, we believe in transparency and privacy by design.
            This policy explains how we collect, use, and protect your
            information when you visit our website.
          </p>
          <p className={TYPOGRAPHY.body}>
            <strong>Last Updated:</strong> {lastUpdated}
          </p>
        </section>

        {/* Key Principles */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Our Privacy Principles</h2>
          <ul className={`${SPACING.compact} list-disc pl-6`}>
            <li className={TYPOGRAPHY.body}>
              <strong>Minimal Data Collection:</strong> We only collect
              what&apos;s absolutely necessary
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>No Tracking:</strong> We don&apos;t use cookies,
              analytics, or third-party trackers
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Transparent Processing:</strong> You know exactly what
              data we handle and why
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Secure Storage:</strong> All data is encrypted and
              protected
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Your Control:</strong> You can request deletion of your
              data at any time
            </li>
          </ul>
        </section>

        {/* What We Collect */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Information We Collect</h2>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>
              1. Contact Form Submissions
            </h3>
            <p className={TYPOGRAPHY.body}>
              When you submit our contact form, we collect:
            </p>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>Your name</li>
              <li className={TYPOGRAPHY.body}>Email address</li>
              <li className={TYPOGRAPHY.body}>Message content</li>
            </ul>
            <p className={TYPOGRAPHY.body}>
              <strong>Purpose:</strong> To respond to your inquiries and provide
              support.
              <br />
              <strong>Storage:</strong> Contact form data is processed via
              Inngest and not permanently stored. We only retain your email in
              our inbox for correspondence purposes.
            </p>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>
              2. Browser Data (localStorage)
            </h3>
            <p className={TYPOGRAPHY.body}>
              We store preferences locally in your browser to enhance your
              experience:
            </p>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Search History:</strong> Recent searches in command
                palette
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Bookmarks:</strong> Saved blog posts and pages
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Likes:</strong> Activity engagement (blog posts,
                projects)
              </li>
            </ul>
            <p className={TYPOGRAPHY.body}>
              <strong>Purpose:</strong> Personalize your experience with saved
              preferences.
              <br />
              <strong>Storage:</strong> Client-side only (not shared with server
              unless you log in).
              <br />
              <strong>Control:</strong> Clear via browser settings or our UI.
            </p>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>3. Session Data</h3>
            <p className={TYPOGRAPHY.body}>
              For certain interactive features, we create temporary encrypted
              sessions:
            </p>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                Session identifier (randomly generated)
              </li>
              <li className={TYPOGRAPHY.body}>Temporary preferences</li>
            </ul>
            <p className={TYPOGRAPHY.body}>
              <strong>Purpose:</strong> To maintain state for interactive
              features.
              <br />
              <strong>Storage:</strong> Encrypted in Redis with automatic
              expiration (24-48 hours).
              <br />
              <strong>Security:</strong> All session data is encrypted using
              industry-standard encryption (AES-256-GCM).
            </p>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>4. Server Logs</h3>
            <p className={TYPOGRAPHY.body}>
              Our hosting provider (Vercel) automatically collects:
            </p>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>IP address (anonymized)</li>
              <li className={TYPOGRAPHY.body}>Browser type and version</li>
              <li className={TYPOGRAPHY.body}>Pages visited</li>
              <li className={TYPOGRAPHY.body}>Timestamps</li>
            </ul>
            <p className={TYPOGRAPHY.body}>
              <strong>Purpose:</strong> Security monitoring, error detection,
              and performance optimization.
              <br />
              <strong>Retention:</strong> Automatically deleted after 30 days
              (Vercel&apos;s standard retention).
            </p>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>5. Public Data (GitHub)</h3>
            <p className={TYPOGRAPHY.body}>
              We display publicly available data from GitHub:
            </p>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>Repository stars and forks</li>
              <li className={TYPOGRAPHY.body}>Public activity feed</li>
            </ul>
            <p className={TYPOGRAPHY.body}>
              <strong>Source:</strong> GitHub&apos;s public API.
              <br />
              <strong>Note:</strong> This data is already publicly accessible on
              GitHub.
            </p>
          </div>
        </section>

        {/* What We Don't Collect */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>What We Don&apos;t Collect</h2>
          <p className={TYPOGRAPHY.body}>
            We explicitly <strong>do not</strong> collect or use:
          </p>
          <ul className="space-y-2 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <strong>Cookies:</strong> We don&apos;t use any cookies
              (first-party or third-party)
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Invasive Analytics:</strong> No Google Analytics, Facebook
              Pixel, or similar user tracking
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Advertising Data:</strong> No ad networks or retargeting
              pixels
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Social Media Tracking:</strong> No social media plugins
              that track you
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Fingerprinting:</strong> We don&apos;t create browser
              fingerprints
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Personal Information:</strong> No sensitive data like SSN,
              payment info, or health records
            </li>
          </ul>
        </section>

        {/* Analytics (Privacy-First) */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Analytics (Privacy-First)</h2>
          <p className={TYPOGRAPHY.body}>
            We use <strong>Vercel Analytics</strong> and{" "}
            <strong>Speed Insights</strong> to understand how our website
            performs. Unlike traditional analytics platforms, these are
            privacy-first services:
          </p>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>What We Collect</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Page Views:</strong> Aggregated visitor counts (no
                individual tracking)
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Performance Metrics:</strong> Page load times, Core Web
                Vitals
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Geographic Data:</strong> Country-level location (no
                precise location)
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Referrer Data:</strong> Where visitors come from
                (aggregated)
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Privacy Protections</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>No Cookies:</strong> Vercel Analytics does not use
                cookies
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>No User Tracking:</strong> Does not track individuals
                across sessions or websites
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>No User Profiles:</strong> Does not create profiles or
                behavioral data
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>GDPR Compliant:</strong> Fully compliant with GDPR and
                privacy regulations
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Aggregated Only:</strong> All data is anonymized and
                aggregated
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>
              How This Differs from Traditional Analytics
            </h3>
            <p className={TYPOGRAPHY.body}>
              Vercel Analytics is fundamentally different from Google Analytics,
              Facebook Pixel, and similar platforms:
            </p>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                Does <strong>not</strong> track individual users or create
                identifiers
              </li>
              <li className={TYPOGRAPHY.body}>
                Does <strong>not</strong> share data with advertisers or third
                parties
              </li>
              <li className={TYPOGRAPHY.body}>
                Does <strong>not</strong> use cookies or persistent storage
              </li>
              <li className={TYPOGRAPHY.body}>
                Does <strong>not</strong> follow users across different websites
              </li>
              <li className={TYPOGRAPHY.body}>
                Uses edge computing to aggregate data before storage
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Data Retention & Control</h3>
            <p className={TYPOGRAPHY.body}>
              <strong>Retention:</strong> Analytics data is retained for 30 days
              (Vercel&apos;s standard retention).
              <br />
              <strong>Opt-out:</strong> You can opt out by enabling &quot;Do Not
              Track&quot; in your browser settings.
              <br />
              <strong>Learn More:</strong>{" "}
              <a
                href="https://vercel.com/docs/analytics/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Vercel Analytics Privacy Policy
              </a>
            </p>
          </div>
        </section>

        {/* Third-Party Services */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Third-Party Services</h2>
          <p className={TYPOGRAPHY.body}>
            We use the following trusted third-party services to operate our
            website:
          </p>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>
              Vercel (Hosting & Infrastructure)
            </h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Purpose:</strong> Website hosting, content delivery, and
                performance optimization
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Data Processed:</strong> Server logs (IP addresses, user
                agents, page visits)
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Privacy Policy:</strong>{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Vercel Privacy Policy
                </a>
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Location:</strong> Data centers in the United States
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>
              Inngest (Background Jobs)
            </h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Purpose:</strong> Processing contact form submissions
                and scheduled tasks
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Data Processed:</strong> Contact form data (name, email,
                message) - transient only
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Privacy Policy:</strong>{" "}
                <a
                  href="https://www.inngest.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Inngest Privacy Policy
                </a>
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Retention:</strong> Job data deleted after 7 days
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>
              Sentry (Error Monitoring)
            </h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Purpose:</strong> Error tracking, performance
                monitoring, and uptime monitoring
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Data Processed:</strong> Error messages, stack traces,
                anonymized user context
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Privacy Policy:</strong>{" "}
                <a
                  href="https://sentry.io/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Sentry Privacy Policy
                </a>
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>PII Scrubbing:</strong> Automatically removes sensitive
                information from error reports
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>GitHub (Public Data)</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Purpose:</strong> Displaying public repository activity
                and project information
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Data Accessed:</strong> Public repository data only
                (stars, forks, activity feed)
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Privacy Policy:</strong>{" "}
                <a
                  href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub Privacy Statement
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>
            How We Use Your Information
          </h2>
          <p className={TYPOGRAPHY.body}>
            We use the minimal data we collect only for these purposes:
          </p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <strong>Communication:</strong> To respond to your contact form
              inquiries
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Security:</strong> To protect against abuse, spam, and
              malicious activity
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Performance:</strong> To optimize website performance and
              fix errors
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Legal Compliance:</strong> To comply with applicable laws
              and regulations
            </li>
          </ul>
          <p className={TYPOGRAPHY.body}>
            We <strong>never</strong> sell, rent, or share your personal
            information with third parties for marketing purposes.
          </p>
        </section>

        {/* Data Security */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Data Security</h2>
          <p className={TYPOGRAPHY.body}>
            We implement industry-standard security measures to protect your
            information:
          </p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <strong>Encryption in Transit:</strong> All data transmitted via
              HTTPS/TLS 1.3
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Encryption at Rest:</strong> Session data encrypted using
              AES-256-GCM
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Access Control:</strong> Strict authentication and
              authorization for all systems
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Security Monitoring:</strong> 24/7 automated security
              scanning and alerts
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Regular Audits:</strong> Monthly security audits and
              vulnerability scanning
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Incident Response:</strong> Documented procedures for
              security incidents
            </li>
          </ul>
        </section>

        {/* Data Retention */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Data Retention</h2>
          <p className={TYPOGRAPHY.body}>
            We retain data only as long as necessary:
          </p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <strong>Contact Form Data:</strong> Not stored (transient
              processing only)
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Session Data:</strong> Automatically deleted after 24-48
              hours
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Server Logs:</strong> Deleted after 30 days (Vercel
              retention policy)
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Error Logs:</strong> Retained for 90 days for debugging
              (Sentry)
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Email Correspondence:</strong> Retained in inbox until
              conversation complete
            </li>
          </ul>
        </section>

        {/* Your Rights */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Your Privacy Rights</h2>
          <p className={TYPOGRAPHY.body}>
            You have the following rights regarding your personal information:
          </p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <strong>Right to Access:</strong> Request a copy of the data we
              have about you
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Right to Deletion:</strong> Request deletion of your data
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Right to Correction:</strong> Request correction of
              inaccurate data
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Right to Object:</strong> Object to processing of your
              data
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Right to Portability:</strong> Request your data in a
              portable format
            </li>
          </ul>
          <p className={TYPOGRAPHY.body}>
            To exercise these rights,{" "}
            <a href="/contact" className="text-primary hover:underline">
              contact us
            </a>
            .
          </p>
        </section>

        {/* International Users */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>International Users</h2>
          <p className={TYPOGRAPHY.body}>
            DCYFR Labs operates from the United States. If you access our
            website from outside the United States, please be aware that:
          </p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              Your information may be transferred to and stored in the United
              States
            </li>
            <li className={TYPOGRAPHY.body}>
              U.S. data protection laws may differ from those in your country
            </li>
            <li className={TYPOGRAPHY.body}>
              By using our website, you consent to this transfer and processing
            </li>
          </ul>
          <p className={TYPOGRAPHY.body}>
            For users in the European Economic Area (EEA), we comply with GDPR
            requirements through our minimal data collection practices and
            transparent processing.
          </p>
        </section>

        {/* Children's Privacy */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Children&apos;s Privacy</h2>
          <p className={TYPOGRAPHY.body}>
            Our website is not directed to children under 13 years of age. We do
            not knowingly collect personal information from children. If you
            believe we have inadvertently collected information from a child,
            please contact us immediately and we will delete it.
          </p>
        </section>

        {/* Changes to This Policy */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>
            Changes to This Privacy Policy
          </h2>
          <p className={TYPOGRAPHY.body}>
            We may update this privacy policy from time to time. When we do:
          </p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              We will update the &quot;Last Updated&quot; date at the top of
              this page
            </li>
            <li className={TYPOGRAPHY.body}>
              For significant changes, we will provide prominent notice on our
              website
            </li>
            <li className={TYPOGRAPHY.body}>
              We encourage you to review this policy periodically
            </li>
          </ul>
        </section>

        {/* Contact Us */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Contact Us</h2>
          <p className={TYPOGRAPHY.body}>
            If you have questions, concerns, or requests regarding this privacy
            policy or our data practices, please{" "}
            <a href="/contact" className="text-primary hover:underline">
              contact us
            </a>
            . We aim to respond within 48 hours.
          </p>
        </section>

        {/* Legal Basis */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>
            Legal Basis for Processing (GDPR)
          </h2>
          <p className={TYPOGRAPHY.body}>
            For users in the EEA, our legal basis for processing personal data
            is:
          </p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <strong>Consent:</strong> When you submit a contact form or engage
              with interactive features
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Legitimate Interests:</strong> To operate our website,
              improve performance, and ensure security
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Legal Obligation:</strong> To comply with applicable laws
              and regulations
            </li>
          </ul>
        </section>

        {/* Footer */}
        <footer className="mt-8 md:mt-10 lg:mt-14 pt-4 md:pt-5 lg:pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <strong>DCYFR Labs Privacy Policy</strong>
            <br />
            Last Updated: {lastUpdated}
            <br />
            Effective Date: {lastUpdated}
          </p>
        </footer>
      </article>
    </PageLayout>
  );
}
