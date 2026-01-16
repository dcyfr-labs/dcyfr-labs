import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS, CONTAINER_PADDING } from '@/lib/design-tokens';
import { createPageMetadata } from '@/lib/metadata';
import { PageLayout, PageHero } from '@/components/layouts';
import { getJsonLdScriptProps, getContactPageSchema } from '@/lib/json-ld';

const pageTitle = 'Terms of Service';
const pageDescription =
  'Terms and conditions for using the DCYFR Labs website. By accessing our site, you agree to these terms and our commitment to transparency.';

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/terms',
});

export default async function TermsPage() {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get('x-nonce') || '';

  // JSON-LD structured data
  const jsonLd = getContactPageSchema(pageDescription);

  const lastUpdated = 'January 16, 2026';

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />

      <PageHero
        title={pageTitle}
        description={pageDescription}
        variant="standard"
        align="center"
        className={CONTAINER_WIDTHS.prose}
      />

      <article
        className={`mx-auto ${CONTAINER_WIDTHS.prose} ${CONTAINER_PADDING} ${SPACING.section}`}
      >
        {/* Introduction */}
        <section className={SPACING.content}>
          <p className={TYPOGRAPHY.description}>
            Welcome to DCYFR Labs. These Terms of Service govern your use of our website and
            services. By accessing or using our website, you agree to be bound by these terms.
          </p>
          <p className={TYPOGRAPHY.body}>
            <strong>Last Updated:</strong> {lastUpdated}
          </p>
        </section>

        {/* 1. Acceptance of Terms */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>1. Acceptance of Terms</h2>
          <p className={TYPOGRAPHY.body}>
            By accessing and using the DCYFR Labs website (dcyfr.ai), you accept and agree to be
            bound by these Terms of Service and our{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            . If you do not agree to these terms, please do not use our website.
          </p>
          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Agreement to Terms</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                You must be at least 13 years old to use this website
              </li>
              <li className={TYPOGRAPHY.body}>
                You agree to use the website in compliance with all applicable laws
              </li>
              <li className={TYPOGRAPHY.body}>
                You understand that we may modify these terms at any time
              </li>
              <li className={TYPOGRAPHY.body}>
                Continued use after modifications constitutes acceptance of new terms
              </li>
            </ul>
          </div>
        </section>

        {/* 2. Use License */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>2. Use License</h2>
          <p className={TYPOGRAPHY.body}>
            We grant you a limited, non-exclusive, non-transferable license to access and use our
            website for personal, non-commercial purposes.
          </p>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Permitted Uses</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Browsing:</strong> Reading blog posts, articles, and portfolio content
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Learning:</strong> Using our content for educational purposes with proper
                attribution
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Sharing:</strong> Sharing links to our content on social media and other
                platforms
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Contact:</strong> Using our contact form for legitimate inquiries
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Personal Use:</strong> Saving bookmarks and likes (stored locally in your
                browser)
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Prohibited Uses</h3>
            <p className={TYPOGRAPHY.body}>You may not:</p>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Scrape or Copy:</strong> Use automated tools to scrape, copy, or download
                content in bulk
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Republish:</strong> Republish our content without explicit written
                permission
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Modify:</strong> Modify, adapt, or create derivative works without
                permission
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Commercial Use:</strong> Use our content for commercial purposes without a
                license
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Abuse:</strong> Spam our contact forms, attempt denial of service attacks,
                or abuse our systems
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Circumvent:</strong> Bypass security measures, rate limits, or access
                controls
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Impersonate:</strong> Impersonate DCYFR Labs or any team member
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Illegal Activity:</strong> Use the website for any unlawful purpose
              </li>
            </ul>
          </div>
        </section>

        {/* 3. Intellectual Property */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>3. Intellectual Property</h2>
          <p className={TYPOGRAPHY.body}>
            All content on this website, including but not limited to text, graphics, logos, images,
            code, and design, is owned by DCYFR Labs or our licensors and is protected by copyright,
            trademark, and other intellectual property laws.
          </p>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Content Ownership</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Original Content:</strong> Blog posts, articles, and portfolio projects are
                owned by DCYFR Labs
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Code Samples:</strong> Code snippets in blog posts may be used with
                attribution unless otherwise specified
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Third-Party Content:</strong> Some content may be sourced from third parties
                with proper attribution
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Open Source:</strong> Our website code is{' '}
                <a
                  href="https://github.com/dcyfr/dcyfr-labs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  open source on GitHub
                </a>{' '}
                under the MIT License
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Attribution Requirements</h3>
            <p className={TYPOGRAPHY.body}>When sharing or referencing our content:</p>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>Provide clear attribution to DCYFR Labs</li>
              <li className={TYPOGRAPHY.body}>Link back to the original article or page</li>
              <li className={TYPOGRAPHY.body}>Do not present our content as your own</li>
              <li className={TYPOGRAPHY.body}>
                Respect any specific license terms noted on individual content
              </li>
            </ul>
          </div>
        </section>

        {/* 4. User Content */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>4. User Content</h2>
          <p className={TYPOGRAPHY.body}>
            When you submit content through our contact form or interact with our website, you grant
            us certain rights to use that content.
          </p>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Contact Form Submissions</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Ownership:</strong> You retain ownership of any content you submit
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>License:</strong> You grant us a non-exclusive license to use your
                submission to respond to your inquiry
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Privacy:</strong> We handle your data according to our{' '}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>No Permanent Storage:</strong> Contact form data is processed transiently
                and not permanently stored
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Client-Side Data (Bookmarks, Likes)</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>Stored locally in your browser (localStorage)</li>
              <li className={TYPOGRAPHY.body}>
                Not shared with our servers unless you authenticate
              </li>
              <li className={TYPOGRAPHY.body}>
                You can clear this data at any time via browser settings
              </li>
            </ul>
          </div>
        </section>

        {/* 5. Third-Party Services */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>5. Third-Party Services</h2>
          <p className={TYPOGRAPHY.body}>
            Our website uses third-party services for hosting, analytics, and functionality. Your
            use of these services is subject to their own terms:
          </p>
          <ul className="space-y-2 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <strong>Vercel:</strong>{' '}
              <a
                href="https://vercel.com/legal/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Vercel Terms of Service
              </a>
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>GitHub:</strong>{' '}
              <a
                href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub Terms of Service
              </a>
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Inngest:</strong>{' '}
              <a
                href="https://www.inngest.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Inngest Terms of Service
              </a>
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Sentry:</strong>{' '}
              <a
                href="https://sentry.io/terms/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Sentry Terms of Service
              </a>
            </li>
          </ul>
        </section>

        {/* 6. Service Availability */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>6. Service Availability</h2>
          <p className={TYPOGRAPHY.body}>
            We strive to keep our website available 24/7, but we make no guarantees about uptime or
            availability.
          </p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <strong>Maintenance:</strong> We may perform scheduled or emergency maintenance that
              temporarily interrupts service
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Modifications:</strong> We reserve the right to modify, suspend, or
              discontinue any feature at any time
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>No Warranty:</strong> The website is provided &quot;as is&quot; without
              warranties of any kind
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Best Effort:</strong> We use industry-standard hosting (Vercel) and monitoring
              to maximize uptime
            </li>
          </ul>
        </section>

        {/* 7. Disclaimer of Warranties */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>7. Disclaimer of Warranties</h2>
          <p className={TYPOGRAPHY.body}>
            THIS WEBSITE AND ALL CONTENT ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
            WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
          </p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              Warranties of merchantability or fitness for a particular purpose
            </li>
            <li className={TYPOGRAPHY.body}>
              Warranties that the website will be uninterrupted, timely, secure, or error-free
            </li>
            <li className={TYPOGRAPHY.body}>
              Warranties regarding the accuracy, reliability, or completeness of content
            </li>
            <li className={TYPOGRAPHY.body}>Warranties that defects will be corrected</li>
          </ul>
          <p className={TYPOGRAPHY.body}>
            Some jurisdictions do not allow the exclusion of implied warranties, so some of these
            exclusions may not apply to you.
          </p>
        </section>

        {/* 8. Limitation of Liability */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>8. Limitation of Liability</h2>
          <p className={TYPOGRAPHY.body}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, DCYFR LABS SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
            REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL,
            OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
          </p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              Your access to or use of or inability to access or use the website
            </li>
            <li className={TYPOGRAPHY.body}>
              Any conduct or content of any third party on the website
            </li>
            <li className={TYPOGRAPHY.body}>Any content obtained from the website</li>
            <li className={TYPOGRAPHY.body}>
              Unauthorized access, use, or alteration of your transmissions or content
            </li>
          </ul>
          <p className={TYPOGRAPHY.body}>
            IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED ONE HUNDRED DOLLARS ($100) OR THE AMOUNT
            YOU PAID US IN THE LAST TWELVE MONTHS, WHICHEVER IS GREATER.
          </p>
        </section>

        {/* 9. Indemnification */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>9. Indemnification</h2>
          <p className={TYPOGRAPHY.body}>
            You agree to indemnify, defend, and hold harmless DCYFR Labs, its officers, directors,
            employees, and agents from any claims, liabilities, damages, losses, and expenses,
            including reasonable attorney fees, arising out of or in any way connected with:
          </p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>Your access to or use of the website</li>
            <li className={TYPOGRAPHY.body}>Your violation of these Terms of Service</li>
            <li className={TYPOGRAPHY.body}>
              Your violation of any third-party rights, including intellectual property rights
            </li>
            <li className={TYPOGRAPHY.body}>Any content you submit through our contact form</li>
          </ul>
        </section>

        {/* 10. Governing Law */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>10. Governing Law</h2>
          <p className={TYPOGRAPHY.body}>
            These Terms of Service shall be governed by and construed in accordance with the laws of
            the United States and the State of California, without regard to its conflict of law
            provisions.
          </p>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Dispute Resolution</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Informal Resolution:</strong> We encourage you to contact us first to
                resolve any disputes informally
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Jurisdiction:</strong> Any legal action arising out of these terms shall be
                filed in the courts of California
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Arbitration:</strong> We may require binding arbitration for certain
                disputes
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Class Action Waiver:</strong> You agree to resolve disputes on an individual
                basis, not as part of a class action
              </li>
            </ul>
          </div>
        </section>

        {/* 11. Severability */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>11. Severability</h2>
          <p className={TYPOGRAPHY.body}>
            If any provision of these Terms of Service is found to be unenforceable or invalid, that
            provision will be limited or eliminated to the minimum extent necessary so that the
            remaining terms will remain in full force and effect.
          </p>
        </section>

        {/* 12. Changes to Terms */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>12. Changes to These Terms</h2>
          <p className={TYPOGRAPHY.body}>
            We reserve the right to modify these Terms of Service at any time. When we do:
          </p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              We will update the &quot;Last Updated&quot; date at the top of this page
            </li>
            <li className={TYPOGRAPHY.body}>
              For significant changes, we will provide prominent notice on our website
            </li>
            <li className={TYPOGRAPHY.body}>
              Your continued use of the website after changes constitutes acceptance of the new
              terms
            </li>
            <li className={TYPOGRAPHY.body}>We encourage you to review this page periodically</li>
          </ul>
        </section>

        {/* 13. Contact Information */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>13. Contact Information</h2>
          <p className={TYPOGRAPHY.body}>
            If you have questions, concerns, or disputes regarding these Terms of Service, please{' '}
            <a href="/contact" className="text-primary hover:underline">
              contact us
            </a>
            . We aim to respond within 48 hours.
          </p>
          <p className={TYPOGRAPHY.body}>
            For legal notices, please include &quot;LEGAL NOTICE&quot; in the subject line.
          </p>
        </section>

        {/* 14. Entire Agreement */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>14. Entire Agreement</h2>
          <p className={TYPOGRAPHY.body}>
            These Terms of Service, together with our{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            , constitute the entire agreement between you and DCYFR Labs regarding your use of the
            website and supersede all prior agreements and understandings.
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-8 md:mt-10 lg:mt-14 pt-4 md:pt-5 lg:pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <strong>DCYFR Labs Terms of Service</strong>
            <br />
            Last Updated: {lastUpdated}
            <br />
            <br />
            By using this website, you agree to these terms and our{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </footer>
      </article>
    </PageLayout>
  );
}
