import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS, CONTAINER_PADDING } from '@/lib/design-tokens';
import { createPageMetadata } from '@/lib/metadata';
import { PageLayout, PageHero } from '@/components/layouts';
import { getJsonLdScriptProps, getContactPageSchema } from '@/lib/json-ld';

const pageTitle = 'Accessibility Statement';
const pageDescription =
  'DCYFR Labs is committed to digital accessibility for all users. Learn about our WCAG 2.1 AA compliance, accessibility features, and how to report issues.';

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/accessibility',
});

export default async function AccessibilityPage() {
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
      />

      <article
        className={`mx-auto ${CONTAINER_WIDTHS.prose} ${CONTAINER_PADDING} ${SPACING.section}`}
      >
        {/* Introduction */}
        <section className={SPACING.content}>
          <p className={TYPOGRAPHY.description}>
            DCYFR Labs is committed to ensuring digital accessibility for all users, including those
            with disabilities. We continuously work to improve the accessibility of our website and
            ensure it meets WCAG 2.1 Level AA standards.
          </p>
          <p className={TYPOGRAPHY.body}>
            <strong>Last Updated:</strong> {lastUpdated}
          </p>
        </section>

        {/* Conformance Status */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Conformance Status</h2>
          <p className={TYPOGRAPHY.body}>
            This website is <strong>fully conformant</strong> with the Web Content Accessibility
            Guidelines (WCAG) 2.1 Level AA.
          </p>
          <p className={TYPOGRAPHY.body}>
            <strong>Full conformance means:</strong>
          </p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>All accessibility requirements are met</li>
            <li className={TYPOGRAPHY.body}>No exceptions or partial compliance</li>
            <li className={TYPOGRAPHY.body}>Tested with automated and manual methods</li>
            <li className={TYPOGRAPHY.body}>Verified with real users and assistive technologies</li>
          </ul>
        </section>

        {/* Accessibility Features */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Accessibility Features</h2>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Keyboard Navigation</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Full Keyboard Support:</strong> Navigate using Tab, Enter, Escape, and Arrow
                keys
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Visible Focus Indicators:</strong> 2px outline on all interactive elements
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Logical Tab Order:</strong> Sequential navigation follows visual layout
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Skip to Content Link:</strong> Bypass navigation and jump to main content
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Command Palette:</strong> Quick access via Cmd/Ctrl+K keyboard shortcut
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Screen Reader Compatibility</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Semantic HTML:</strong> Proper heading hierarchy (h1 through h6)
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>ARIA Labels:</strong> Descriptive labels for all interactive elements
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Landmark Regions:</strong> Clear structure with header, nav, main, footer
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Alternative Text:</strong> All meaningful images have descriptive alt text
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Descriptive Links:</strong> No &quot;click here&quot; or &quot;read
                more&quot; without context
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Form Labels:</strong> All form inputs properly labeled and associated
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Visual Accessibility</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Color Contrast:</strong> Minimum 4.5:1 for text, 3:1 for large text
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Resizable Text:</strong> Zoom up to 200% without loss of content or
                functionality
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>No Color-Only Information:</strong> Information not conveyed by color alone
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Dark Mode Support:</strong> System preference-based dark mode for reduced
                eye strain
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Clear Typography:</strong> Readable fonts with adequate spacing and line
                height
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Consistent Layout:</strong> Predictable navigation and structure throughout
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Touch &amp; Mobile Accessibility</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Touch Targets:</strong> Minimum 44×44 CSS pixels for all interactive
                elements
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Responsive Design:</strong> Works on all screen sizes and orientations
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>No Hover-Only Content:</strong> All content accessible via touch
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Swipe Gestures:</strong> Natural navigation on mobile devices
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Mobile Screen Readers:</strong> Full support for VoiceOver and TalkBack
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Content Accessibility</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Plain Language:</strong> Clear, concise content without unnecessary jargon
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Descriptive Headings:</strong> Clear section headings that describe content
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Error Messages:</strong> Clear explanations with instructions to fix issues
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Sufficient Time:</strong> Adequate time to read and interact with content
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>No Auto-Play:</strong> No automatically playing audio or video
              </li>
            </ul>
          </div>
        </section>

        {/* Testing & Validation */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Testing &amp; Validation</h2>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Automated Testing</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Lighthouse CI:</strong> Automated accessibility audits (score: 100/100)
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>axe-core:</strong> Industry-leading accessibility engine
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>WAVE:</strong> Web Accessibility Evaluation Tool
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Regression Testing:</strong> Automated checks in CI/CD pipeline
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Manual Testing</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Keyboard-Only Navigation:</strong> Complete site navigation without mouse
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Screen Reader Testing:</strong> NVDA, JAWS, and VoiceOver
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Mobile Screen Readers:</strong> iOS VoiceOver and Android TalkBack
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>High Contrast Mode:</strong> Testing with system high contrast themes
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Zoom &amp; Magnification:</strong> Testing up to 200% zoom
              </li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>User Testing</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                Testing with users who rely on assistive technologies
              </li>
              <li className={TYPOGRAPHY.body}>Feedback loops for continuous improvement</li>
              <li className={TYPOGRAPHY.body}>Regular accessibility audits by external experts</li>
            </ul>
          </div>
        </section>

        {/* Known Issues */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Known Issues</h2>
          <p className={TYPOGRAPHY.body}>
            <strong>Current Status:</strong> No known accessibility issues.
          </p>
          <p className={TYPOGRAPHY.body}>
            We continuously monitor for accessibility issues and address them promptly. If you
            encounter any barriers, please let us know using the contact information below.
          </p>
        </section>

        {/* Feedback & Support */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Feedback &amp; Support</h2>
          <p className={TYPOGRAPHY.body}>
            We welcome feedback on the accessibility of our website. If you encounter any
            accessibility barriers:
          </p>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Contact Methods</h3>
            <ul className="space-y-2 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>Contact Form:</strong>{' '}
                <a href="/contact" className="text-primary hover:underline">
                  Submit feedback
                </a>{' '}
                - Subject: &quot;Accessibility Feedback&quot;
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>GitHub Issues:</strong>{' '}
                <a
                  href="https://github.com/dcyfr/dcyfr-labs/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Report accessibility issues
                </a>
              </li>
            </ul>
            <p className={TYPOGRAPHY.body}>
              <strong>Response Time:</strong> We aim to respond within 48 hours.
            </p>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>What to Include</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>Description of the accessibility barrier</li>
              <li className={TYPOGRAPHY.body}>Page or feature affected</li>
              <li className={TYPOGRAPHY.body}>
                Assistive technology you&apos;re using (if applicable)
              </li>
              <li className={TYPOGRAPHY.body}>Browser and operating system</li>
              <li className={TYPOGRAPHY.body}>Suggestions for improvement (if any)</li>
            </ul>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Technical Specifications</h2>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Supported Browsers</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>Chrome (latest 2 versions)</li>
              <li className={TYPOGRAPHY.body}>Firefox (latest 2 versions)</li>
              <li className={TYPOGRAPHY.body}>Safari (latest 2 versions)</li>
              <li className={TYPOGRAPHY.body}>Edge (latest 2 versions)</li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Supported Screen Readers</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>NVDA (Windows)</li>
              <li className={TYPOGRAPHY.body}>JAWS (Windows)</li>
              <li className={TYPOGRAPHY.body}>VoiceOver (macOS, iOS)</li>
              <li className={TYPOGRAPHY.body}>TalkBack (Android)</li>
            </ul>
          </div>

          <div className={SPACING.compact}>
            <h3 className={TYPOGRAPHY.h3.standard}>Technologies Used</h3>
            <ul className="space-y-1 list-disc pl-6">
              <li className={TYPOGRAPHY.body}>
                <strong>HTML5:</strong> Semantic markup for clear structure
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>CSS3:</strong> Responsive design with design tokens
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>TypeScript:</strong> Type-safe interactions
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>React 19:</strong> Accessible component library
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>Next.js 16:</strong> Server-side rendering for performance
              </li>
              <li className={TYPOGRAPHY.body}>
                <strong>ARIA 1.2:</strong> Accessible Rich Internet Applications
              </li>
            </ul>
          </div>
        </section>

        {/* Standards & Guidelines */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Standards &amp; Guidelines</h2>
          <p className={TYPOGRAPHY.body}>We follow these accessibility standards:</p>
          <ul className="space-y-2 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <strong>WCAG 2.1 Level AA:</strong> Web Content Accessibility Guidelines (primary
              standard)
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Section 508:</strong> U.S. federal accessibility standards
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>ARIA 1.2:</strong> Accessible Rich Internet Applications specification
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>EN 301 549:</strong> European accessibility standard
            </li>
          </ul>
        </section>

        {/* Continuous Improvement */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Continuous Improvement</h2>
          <p className={TYPOGRAPHY.body}>We regularly review and improve our accessibility:</p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <strong>Monthly:</strong> Automated accessibility audits via Lighthouse CI
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Quarterly:</strong> Manual testing with assistive technologies
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Annually:</strong> Full accessibility assessment by external auditors
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Ongoing:</strong> User feedback integration and issue resolution
            </li>
          </ul>
        </section>

        {/* Training & Awareness */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Training &amp; Awareness</h2>
          <p className={TYPOGRAPHY.body}>Our team is trained in accessibility best practices:</p>
          <ul className="space-y-1 list-disc pl-6">
            <li className={TYPOGRAPHY.body}>
              <strong>Developers:</strong> Follow WCAG 2.1 guidelines and use accessible design
              patterns
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Designers:</strong> Use accessible color palettes, typography, and layouts
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Content Creators:</strong> Write in plain language with clear structure
            </li>
            <li className={TYPOGRAPHY.body}>
              <strong>Quality Assurance:</strong> Test with assistive technologies and accessibility
              tools
            </li>
          </ul>
        </section>

        {/* Related Policies */}
        <section className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>Related Policies</h2>
          <ul className="space-y-1 list-disc pl-6">
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
              - Legal agreements
            </li>
            <li className={TYPOGRAPHY.body}>
              <a href="/security" className="text-primary hover:underline">
                Security Policy
              </a>{' '}
              - Our security measures
            </li>
            <li className={TYPOGRAPHY.body}>
              <a href="/contact" className="text-primary hover:underline">
                Contact Us
              </a>{' '}
              - Get in touch
            </li>
          </ul>
        </section>

        {/* Footer */}
        <footer className="mt-8 md:mt-10 lg:mt-14 pt-4 md:pt-5 lg:pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <strong>DCYFR Labs Accessibility Statement</strong>
            <br />
            Last Updated: {lastUpdated}
            <br />
            <br />
            We are committed to maintaining WCAG 2.1 AA compliance. Questions or accessibility
            concerns?{' '}
            <a href="/contact" className="text-primary hover:underline">
              Contact us
            </a>
            .
          </p>
        </footer>
      </article>
    </PageLayout>
  );
}
