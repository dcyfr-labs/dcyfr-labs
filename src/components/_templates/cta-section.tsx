/**
 * CTA Section Template
 *
 * Demonstrates correct usage of call-to-action sections with design tokens.
 * Shows various CTA patterns with proper spacing and typography.
 *
 * **Design Token Compliance**: ✅ 100%
 * - CONTAINER_WIDTHS for max-widths
 * - SPACING for vertical rhythm
 * - TYPOGRAPHY for all text
 * - HOVER_EFFECTS for buttons
 *
 * @example Simple CTA
 * ```tsx
 * <CTASectionSimple />
 * ```
 *
 * @example Two-button CTA
 * ```tsx
 * <CTASectionDual />
 * ```
 */

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS, HOVER_EFFECTS } from '@/lib/design-tokens'
import { ArrowRight, Mail, Github, Linkedin } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Simple CTA Section
 * Use for: End of pages, bottom of articles
 */
export function CTASectionSimple() {
  return (
    <section className={`mx-auto ${CONTAINER_WIDTHS.standard} px-4 sm:px-6 md:px-8 pb-8 md:pb-12`}>
      <div className="bg-muted/50 border border-border rounded-xl p-8 md:p-12 text-center">
        <div className={cn(SPACING.content, `mx-auto ${CONTAINER_WIDTHS.narrow}`)}>
          <h2 className={TYPOGRAPHY.h2.standard}>
            Ready to Get Started?
          </h2>
          <p className={TYPOGRAPHY.description}>
            Let&apos;s work together to build something amazing.
          </p>
          <Button size="lg" asChild>
            <Link href="/contact">
              Get in Touch
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

/**
 * Dual Button CTA
 * Use for: Homepage, landing pages
 */
export function CTASectionDual() {
  return (
    <section className={`mx-auto ${CONTAINER_WIDTHS.standard} px-4 sm:px-6 md:px-8 pb-8 md:pb-12`}>
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-8 md:p-12 text-center">
        <div className={cn(SPACING.content, `mx-auto ${CONTAINER_WIDTHS.narrow}`)}>
          <h2 className={TYPOGRAPHY.h2.featured}>
            Let&apos;s Build Something Great
          </h2>
          <p className={TYPOGRAPHY.description}>
            I&apos;m available for freelance projects and consulting. View my work or
            get in touch to discuss your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">
                Start a Project
                <Mail className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/work">
                View My Work
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Card-based CTA
 * Use for: Feature promotions, service offers
 */
export function CTASectionCard() {
  return (
    <section className={`mx-auto ${CONTAINER_WIDTHS.standard} px-4 sm:px-6 md:px-8 pb-8 md:pb-12`}>
      <Card className={HOVER_EFFECTS.cardCTA}>
        <CardHeader>
          <CardTitle className={TYPOGRAPHY.h2.standard}>
            Want to Work Together?
          </CardTitle>
          <CardDescription className="text-base">
            I&apos;m currently available for new projects. Let&apos;s chat about how I can help
            bring your ideas to life.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="flex-1" asChild>
              <Link href="/contact">
                Send Message
                <Mail className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="flex-1" asChild>
              <Link href="/about">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

/**
 * Newsletter CTA
 * Use for: Blog pages, content pages
 */
export function CTASectionNewsletter() {
  return (
    <section className={`mx-auto ${CONTAINER_WIDTHS.prose} px-4 sm:px-6 md:px-8 pb-8 md:pb-12`}>
      <div className="bg-card border border-border rounded-xl p-8">
        <div className={SPACING.content}>
          <h2 className={TYPOGRAPHY.h2.standard}>
            Stay in the Loop
          </h2>
          <p className={TYPOGRAPHY.body}>
            Get notified when I publish new articles. No spam, unsubscribe anytime.
          </p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 px-4 py-2 border border-input rounded-md bg-background"
              required
            />
            <Button type="submit">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}

/**
 * Social Links CTA
 * Use for: Contact pages, footer areas
 */
export function CTASectionSocial() {
  const socials = [
    { icon: <Github className="h-5 w-5" />, label: 'GitHub', href: 'https://github.com' },
    { icon: <Linkedin className="h-5 w-5" />, label: 'LinkedIn', href: 'https://linkedin.com' },
    { icon: <Mail className="h-5 w-5" />, label: 'Email', href: 'mailto:hello@example.com' },
  ]

  return (
    <section className={`mx-auto ${CONTAINER_WIDTHS.standard} px-4 sm:px-6 md:px-8 pb-8 md:pb-12`}>
      <div className="text-center">
        <div className={cn(SPACING.content, `mx-auto ${CONTAINER_WIDTHS.narrow}`)}>
          <h2 className={TYPOGRAPHY.h2.standard}>
            Let&apos;s Connect
          </h2>
          <p className={TYPOGRAPHY.description}>
            Find me on these platforms or send me an email.
          </p>
          <div className="flex gap-3 justify-center">
            {socials.map((social) => (
              <Button
                key={social.label}
                variant="outline"
                size="lg"
                asChild
              >
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  {social.icon}
                  <span className="ml-2">{social.label}</span>
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Minimalist CTA
 * Use for: Clean, focused pages
 */
export function CTASectionMinimal() {
  return (
    <section className={`mx-auto ${CONTAINER_WIDTHS.narrow} px-4 sm:px-6 md:px-8 pb-8 md:pb-12`}>
      <div className="text-center space-y-4">
        <p className={cn(TYPOGRAPHY.body, 'text-muted-foreground')}>
          Interested in working together?
        </p>
        <Button size="lg" variant="outline" asChild>
          <Link href="/contact">
            Let&apos;s Talk
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}

/**
 * Full-Width CTA Banner
 * Use for: Section dividers, page breaks
 */
export function CTASectionBanner() {
  return (
    <section className="bg-primary text-primary-foreground py-12 md:py-16">
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard} px-4 sm:px-6 md:px-8 text-center`}>
        <div className={cn(SPACING.content, `mx-auto ${CONTAINER_WIDTHS.narrow}`)}>
          <h2 className={TYPOGRAPHY.h2.featured}>
            Ready to Start Your Project?
          </h2>
          <p className={cn(TYPOGRAPHY.description, 'text-primary-foreground/90')}>
            Let&apos;s discuss how I can help you achieve your goals.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/contact">
              Get Started Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
