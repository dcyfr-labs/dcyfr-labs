import type { Metadata } from 'next';
import { getContactPageSchema, getJsonLdScriptProps } from '@/lib/json-ld';
import { headers } from 'next/headers';
import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS } from '@/lib/design-tokens';
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
const pageDescription = 'Get in touch for inquiries, collaborations, or feedback.';

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
       <div className="space-y-4 md:space-y-12">
        {/* Hero Section */}
        <section id="hero">
          <PageHero
            title="Contact Us"
            description="Whether you have questions, feedback, or collaboration ideas, we're here to help. Choose your preferred way to connect."
            align="center"
          />
        </section>

        {/* Contact Form Section */}
        <section
          id="contact-form"
          className={cn('mx-auto', CONTAINER_WIDTHS.standard, 'px-4 sm:px-8 md:px-8')}
        >
          <ScrollReveal animation="fade-up" delay={1}>
            <div className="text-center mb-8">
              {/* hidden to limit repeating elements
              <h2 className={TYPOGRAPHY.h2.featured}>Send us a Message</h2>
              <p className={cn(TYPOGRAPHY.description, "mt-2")}>
                Fill out the form below and we&apos;ll get back to you as soon as possible
              </p> */}
            </div>
            <ContactFormErrorBoundary>
              <ContactForm />
            </ContactFormErrorBoundary>
          </ScrollReveal>
        </section>

        {/* Contact Methods Section */}
        <section
          id="contact-methods"
          className={cn('mx-auto', CONTAINER_WIDTHS.standard, 'px-4 sm:px-8 md:px-8')}
        >
          <ScrollReveal animation="fade-up" delay={0}>
            <ContactMethods />
          </ScrollReveal>
        </section>

        {/* Social Links Section */}
        <section
          id="social-links"
          className={cn('mx-auto', CONTAINER_WIDTHS.standard, 'px-4 sm:px-8 md:px-8')}
        >
          <ScrollReveal animation="fade-up" delay={2}>
            <ContactSocialLinks />
          </ScrollReveal>
        </section>
      </div>
    </PageLayout>
  );
}
