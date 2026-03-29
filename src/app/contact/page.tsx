import type { Metadata } from 'next';
import { getContactPageSchema, getJsonLdScriptProps } from '@/lib/json-ld';
import { headers } from 'next/headers';
import {
  SPACING,
  TYPOGRAPHY,
  CONTAINER_WIDTHS,
  CONTAINER_PADDING,
  HOVER_EFFECTS,
} from '@/lib/design-tokens';
import { createPageMetadata } from '@/lib/metadata';
import dynamic from 'next/dynamic';
import { PageLayout } from '@/components/layouts';
import { PageHero } from '@/components/layouts';
import { ContactForm, ContactFormErrorBoundary, SmoothScrollToHash } from '@/components/common';
import { ContactMethods, ContactSocialLinks } from '@/components/contact';
import { cn } from '@/lib/utils';

const ScrollReveal = dynamic(
  () =>
    import('@/components/features/scroll-reveal').then((mod) => ({
      default: mod.ScrollReveal,
    })),
  {
    loading: () => <div className="contents" />,
    ssr: true,
  }
);

const pageTitle = 'Contact';
const pageDescription =
  'Get in touch with DCYFR Labs — reach out about @dcyfr/ai, security architecture, collaboration, or open-source contributions.';

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/contact',
});

export default async function ContactPage() {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get('x-nonce') || '';

  // JSON-LD structured data for contact page
  const jsonLd = getContactPageSchema(pageDescription);

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      <SmoothScrollToHash />
      <div className={SPACING.section}>
        {/* Hero Section */}
        <PageHero
          title="Contact Us"
          description="Whether you have questions, feedback, or collaboration ideas, we're here to help. Choose your preferred way to connect."
          align="center"
        />

        {/* Engagement Context Section */}
        <section className={cn('mx-auto', CONTAINER_WIDTHS.standard, CONTAINER_PADDING)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Architecture Advisory',
                description:
                  'Security architecture reviews for cloud, network, and application layers.',
              },
              {
                label: 'Security Review',
                description: 'Threat modelling, OWASP assessments, and secure design guidance.',
              },
              {
                label: 'Speaking & Writing',
                description:
                  'Conference talks, guest posts, and podcast appearances on AI and security.',
              },
              {
                label: 'Open-Source Collaboration',
                description: 'Contributing to or building on @dcyfr/ai and related tooling.',
              },
            ].map(({ label, description }) => (
              <div
                key={label}
                className={cn('rounded-xl border border-border/50 p-4', HOVER_EFFECTS.card)}
              >
                <p className={cn(TYPOGRAPHY.label.small, 'mb-1')}>{label}</p>
                <p className={cn(TYPOGRAPHY.metadata, 'opacity-60 leading-relaxed')}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form Section */}
        <section
          id="contact-form"
          className={cn('mx-auto', CONTAINER_WIDTHS.standard, CONTAINER_PADDING)}
        >
          <ScrollReveal animation="fade-up" delay={1}>
            <ContactFormErrorBoundary>
              <ContactForm />
            </ContactFormErrorBoundary>
          </ScrollReveal>
        </section>

        {/* Contact Methods Section */}
        <section
          id="contact-methods"
          className={cn('mx-auto', CONTAINER_WIDTHS.standard, CONTAINER_PADDING)}
        >
          <ScrollReveal animation="fade-up" delay={0}>
            <ContactMethods />
          </ScrollReveal>
        </section>

        {/* Social Links Section */}
        <section
          id="social-links"
          className={cn('mx-auto', CONTAINER_WIDTHS.standard, CONTAINER_PADDING)}
        >
          <ScrollReveal animation="fade-up" delay={2}>
            <ContactSocialLinks />
          </ScrollReveal>
        </section>
      </div>
    </PageLayout>
  );
}
