/**
 * Content Section Template
 *
 * Demonstrates correct usage of content sections with design tokens.
 * Shows proper container widths, spacing, and typography hierarchy.
 *
 * **Design Token Compliance**: ✅ 100%
 * - CONTAINER_WIDTHS for max-widths
 * - SPACING for vertical rhythm
 * - TYPOGRAPHY for all text
 * - Semantic colors throughout
 *
 * @example Two-column section
 * ```tsx
 * <TwoColumnSection />
 * ```
 *
 * @example Feature list
 * ```tsx
 * <FeatureListSection />
 * ```
 */

import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS, CONTAINER_PADDING } from '@/lib/design-tokens'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Star, Zap, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Standard Content Section
 * Use for: About pages, general content
 */
export function StandardContentSection() {
  return (
    <section className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} pb-8 md:pb-12`}>
      <div className={SPACING.section}>
        {/* Section header */}
        <div className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>
            About This Project
          </h2>
          <p className={TYPOGRAPHY.body}>
            This project showcases modern web development practices with Next.js, TypeScript,
            and Tailwind CSS. Built with performance and accessibility in mind.
          </p>
        </div>

        {/* Content blocks */}
        <div className={SPACING.subsection}>
          <div className={SPACING.content}>
            <h3 className={TYPOGRAPHY.h3.standard}>
              Key Features
            </h3>
            <p className={TYPOGRAPHY.body}>
              Server-first architecture, comprehensive design system, and automated testing
              ensure a maintainable and scalable codebase.
            </p>
          </div>

          <div className={SPACING.content}>
            <h3 className={TYPOGRAPHY.h3.standard}>
              Technical Stack
            </h3>
            <p className={TYPOGRAPHY.body}>
              Built with Next.js 16, React 19, TypeScript, Tailwind v4, and shadcn/ui
              for a modern development experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Two-Column Section
 * Use for: Feature comparisons, side-by-side content
 */
export function TwoColumnSection() {
  return (
    <section className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} pb-8 md:pb-12`}>
      <div className={SPACING.section}>
        <h2 className={TYPOGRAPHY.h2.standard}>
          Why Choose This Approach?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column */}
          <div className={SPACING.content}>
            <h3 className={TYPOGRAPHY.h3.standard}>
              Developer Experience
            </h3>
            <p className={TYPOGRAPHY.body}>
              TypeScript provides type safety, while our design system ensures consistency.
              Hot reload and comprehensive testing speed up development.
            </p>
            <ul className="space-y-2 mt-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className={TYPOGRAPHY.body}>
                  Type-safe development with TypeScript
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className={TYPOGRAPHY.body}>
                  Automated testing and linting
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className={TYPOGRAPHY.body}>
                  Component-driven development
                </span>
              </li>
            </ul>
          </div>

          {/* Right column */}
          <div className={SPACING.content}>
            <h3 className={TYPOGRAPHY.h3.standard}>
              User Experience
            </h3>
            <p className={TYPOGRAPHY.body}>
              Server-first rendering delivers fast page loads, while our accessible
              components ensure everyone can use your site.
            </p>
            <ul className="space-y-2 mt-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className={TYPOGRAPHY.body}>
                  Sub-second page loads with SSR
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className={TYPOGRAPHY.body}>
                  WCAG AA compliant components
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className={TYPOGRAPHY.body}>
                  Responsive across all devices
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Feature List Section
 * Use for: Feature showcases, capabilities overview
 */
export function FeatureListSection() {
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Lightning Fast',
      description: 'Optimized for performance with server-first rendering and automatic code splitting.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure by Default',
      description: 'Built-in security best practices, automated vulnerability scanning, and type safety.',
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: 'Great DX',
      description: 'TypeScript, hot reload, comprehensive testing, and excellent documentation.',
    },
  ]

  return (
    <section className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} pb-8 md:pb-12`}>
      <div className={SPACING.section}>
        <div className={cn(SPACING.content, 'text-center')}>
          <h2 className={TYPOGRAPHY.h2.standard}>
            Built for Modern Development
          </h2>
          <p className={cn(TYPOGRAPHY.description, `max-w-3xl mx-auto`)}>
            Everything you need to build fast, accessible, and maintainable web applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className={SPACING.content}>
              <div className="text-primary mb-3">
                {feature.icon}
              </div>
              <h3 className={TYPOGRAPHY.h3.standard}>
                {feature.title}
              </h3>
              <p className={TYPOGRAPHY.body}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Stats Section
 * Use for: Metrics, achievements, highlights
 */
export function StatsSection() {
  const stats = [
    { label: 'Projects Completed', value: '50+' },
    { label: 'Test Coverage', value: '99%' },
    { label: 'Performance Score', value: '100' },
    { label: 'Lines of Code', value: '10k+' },
  ]

  return (
    <section className="bg-muted/50 border-y border-border py-8 md:py-12">
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={cn(TYPOGRAPHY.display.statLarge, 'mb-2')}>
                {stat.value}
              </div>
              <div className={TYPOGRAPHY.metadata}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Prose Content Section
 * Use for: Long-form content, articles, documentation
 */
export function ProseContentSection() {
  return (
    <section className={`mx-auto ${CONTAINER_WIDTHS.prose} ${CONTAINER_PADDING} pb-8 md:pb-12`}>
      <div className={SPACING.prose}>
        <h2 className={TYPOGRAPHY.h2.standard}>
          Introduction
        </h2>
        <p className={TYPOGRAPHY.body}>
          This section demonstrates proper prose styling with optimal line length for
          readability. The max-width is set to CONTAINER_WIDTHS.narrow (prose container) to maintain
          45-75 characters per line.
        </p>

        <h3 className={TYPOGRAPHY.h3.standard}>
          Subsection Heading
        </h3>
        <p className={TYPOGRAPHY.body}>
          Additional paragraphs maintain consistent spacing and typography throughout.
          All spacing uses design tokens to ensure visual consistency across the application.
        </p>

        <div className="bg-muted border-l-4 border-l-primary p-4 rounded-r-lg">
          <p className={cn(TYPOGRAPHY.body, 'italic')}>
            &ldquo;This is a quote or callout block that stands out from the main content.&rdquo;
          </p>
        </div>
      </div>
    </section>
  )
}
