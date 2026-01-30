import type { Metadata } from 'next';
import { PageLayout } from '@/components/layouts';
import { createPageMetadata } from '@/lib/metadata';
import { CONTAINER_WIDTHS, SPACING, TYPOGRAPHY } from '@/lib/design-tokens';
import { ReadingProgressBar, KeyTakeaway, TLDRSummary } from '@/components/blog';
import { assertDevOr404 } from '@/lib/dev-only';

export const metadata: Metadata = createPageMetadata({
  title: 'RIVET Components Demo',
  description: 'Interactive demonstration of RIVET framework components for blog modernization',
  path: '/dev/rivet-demo',
});

export default function RIVETDemoPage() {
  assertDevOr404();
  return (
    <PageLayout>
      {/* Reading Progress Bar (top of page) */}
      <ReadingProgressBar showPercentage />

      <div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>
        {/* Page Header */}
        <header className={`mb-${SPACING.section}`}>
          <h1 className={TYPOGRAPHY.h1.standard}>RIVET Components Demo</h1>
          <p className="text-muted-foreground mt-4">
            Interactive showcase of RIVET framework components built in Week 1. Scroll to see
            ReadingProgressBar in action.
          </p>
        </header>

        {/* TLDRSummary Component */}
        <TLDRSummary
          title="Component Overview"
          sections={[
            {
              title: 'Most Common',
              items: [
                'ReadingProgressBar - Scroll indicator with percentage',
                'KeyTakeaway - Callout boxes with variants',
                'TLDRSummary - Executive summary sections',
              ],
            },
            {
              title: 'Key Features',
              items: [
                'All components use design tokens (no hardcoded values)',
                'Full TypeScript strict mode compliance',
                '71 tests passing with ≥80% coverage',
              ],
            },
            {
              title: 'Technical Details',
              items: [
                'Framer Motion animations for smooth UX',
                'Accessibility features (WCAG AA compliant)',
                'Mobile-first responsive design',
              ],
            },
          ]}
          jumpLink="#components"
        />

        {/* Components Section */}
        <section id="components" className={`mt-${SPACING.section}`}>
          <h2 className={TYPOGRAPHY.h2.standard}>Component Showcase</h2>

          {/* ReadingProgressBar Info */}
          <div className={`mt-${SPACING.content}`}>
            <h3 className={TYPOGRAPHY.h3.standard}>1. ReadingProgressBar</h3>
            <p className="text-muted-foreground mt-2">
              The progress bar at the top of this page shows your reading progress (0-100%). It uses
              Framer Motion for smooth animation and supports multiple color variants.
            </p>

            <KeyTakeaway variant="insight" title="Key Features">
              <ul>
                <li>Scroll percentage calculation (passive listener)</li>
                <li>Optional percentage text display</li>
                <li>Position variants (top/bottom)</li>
                <li>Color variants (primary/secondary/accent)</li>
                <li>Fully accessible with ARIA attributes</li>
              </ul>
            </KeyTakeaway>

            <KeyTakeaway variant="insight">
              Use this for general important information that readers should remember. Perfect for
              &ldquo;aha!&rdquo; moments and key concepts.
            </KeyTakeaway>
          </div>

          {/* KeyTakeaway Variants */}
          <div className={`mt-${SPACING.section}`}>
            <h3 className={TYPOGRAPHY.h3.standard}>2. KeyTakeaway Variants</h3>
            <p className="text-muted-foreground mt-2">
              Four distinct variants for different content types. Each includes contextual icons
              from Lucide React.
            </p>

            <KeyTakeaway variant="insight" title="Insight Variant">
              Use this for general important information that readers should remember. Perfect for
              &ldquo;aha!&rdquo; moments and key concepts.
            </KeyTakeaway>

            <KeyTakeaway variant="security" title="Security Variant">
              Highlight security-related guidance, best practices, and critical security
              considerations. Always validate user input before processing.
            </KeyTakeaway>

            <KeyTakeaway variant="warning" title="Warning Variant">
              Call out potential issues, gotchas, or things to avoid. This variant draws attention
              to cautionary information that could prevent mistakes.
            </KeyTakeaway>

            <KeyTakeaway variant="tip" title="Tip Variant">
              Share helpful suggestions, pro tips, and optimization techniques. Great for actionable
              advice that improves outcomes.
            </KeyTakeaway>
          </div>

          {/* TLDRSummary Info */}
          <div className={`mt-${SPACING.section}`}>
            <h3 className={TYPOGRAPHY.h3.standard}>3. TLDRSummary Component</h3>
            <p className="text-muted-foreground mt-2">
              Executive summary boxes for top-of-post content. Features three-section format with
              gradient backgrounds and jump links.
            </p>

            <KeyTakeaway variant="tip" title="Best Practices">
              <ul>
                <li>
                  <strong>Most Common:</strong> Items readers encounter most frequently
                </li>
                <li>
                  <strong>Most Dangerous:</strong> Critical risks or high-impact issues
                </li>
                <li>
                  <strong>Hardest to Detect:</strong> Subtle problems requiring expertise
                </li>
                <li>Keep items concise (1-2 lines max) for scannability</li>
                <li>Use jump links to direct readers to detailed sections</li>
              </ul>
            </KeyTakeaway>
          </div>

          {/* Implementation Details */}
          <div className={`mt-${SPACING.section}`}>
            <h2 className={TYPOGRAPHY.h2.standard}>Implementation</h2>

            <div className={`mt-${SPACING.content}`}>
              <h3 className={TYPOGRAPHY.h3.standard}>Import Pattern</h3>
              <KeyTakeaway variant="insight">
                All components use barrel exports for clean imports:
                <pre className="mt-4 p-4 bg-muted rounded-md overflow-x-auto">
                  <code>{`import {
  ReadingProgressBar,
  KeyTakeaway,
  TLDRSummary,
} from "@/components/blog/rivet";`}</code>
                </pre>
              </KeyTakeaway>
            </div>

            <div className={`mt-${SPACING.content}`}>
              <h3 className={TYPOGRAPHY.h3.standard}>Quality Standards</h3>
              <KeyTakeaway variant="security" title="Mandatory Requirements">
                <ul>
                  <li>✅ Design tokens only (no hardcoded values)</li>
                  <li>✅ TypeScript strict mode clean</li>
                  <li>✅ WCAG AA accessibility compliance</li>
                  <li>✅ Unit tests ≥80% coverage</li>
                  <li>✅ ESLint passing (0 errors)</li>
                  <li>✅ Mobile-first responsive design</li>
                  <li>✅ JSDoc documentation with examples</li>
                </ul>
              </KeyTakeaway>
            </div>
          </div>

          {/* Testing Stats */}
          <div className={`mt-${SPACING.section}`}>
            <h2 className={TYPOGRAPHY.h2.standard}>Test Coverage</h2>
            <KeyTakeaway variant="tip" title="Week 1 Results">
              <ul>
                <li>
                  <strong>ReadingProgressBar:</strong> 18 tests passing (rendering, progress
                  calculation, variants, accessibility)
                </li>
                <li>
                  <strong>KeyTakeaway:</strong> 25 tests passing (variants, icons, titles,
                  accessibility)
                </li>
                <li>
                  <strong>TLDRSummary:</strong> 28 tests passing (sections, jump links, responsive
                  grid, accessibility)
                </li>
                <li>
                  <strong>Total:</strong> 71 tests passing in 172ms
                </li>
              </ul>
            </KeyTakeaway>
          </div>

          {/* Next Steps */}
          <div className={`mt-${SPACING.section}`}>
            <h2 className={TYPOGRAPHY.h2.standard}>Next Steps</h2>
            <KeyTakeaway variant="warning" title="Week 2 Plan">
              <ul>
                <li>Integrate P0 components into OWASP Top 10 Agentic AI post</li>
                <li>Add 10+ KeyTakeaway boxes strategically placed</li>
                <li>Add TLDRSummary at top with categorized risk highlights</li>
                <li>Enable ReadingProgressBar globally for all blog posts</li>
                <li>Build P1 components (GlossaryTooltip, RoleBasedCTA, SectionShare)</li>
                <li>Complete OWASP full RIVET implementation</li>
              </ul>
            </KeyTakeaway>
          </div>

          {/* Scroll Spacer */}
          <div className="h-screen flex items-center justify-center">
            <p className="text-muted-foreground">
              ↑ Scroll back up to see the ReadingProgressBar decrease ↑
            </p>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
